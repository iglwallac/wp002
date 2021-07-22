import _map from 'lodash/map'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _assign from 'lodash/assign'
import { fromJS, Map } from 'immutable'
import { join as joinPromise } from 'bluebird'
import { getAuthIsLoggedIn } from 'services/auth'
import { createModel as createTileModel } from 'services/tile'
import { getUserSubscriptions, getSubscriptionSubscribers } from 'services/notifications'

import {
  REQUEST_TYPE_APPLICATION_JSON,
  RESPONSE_ERROR_TYPE_RANGE_400,
  post as apiPost,
  put as apiPut,
  get as apiGet,
  TYPE_BROOKLYN,
} from 'api-client'

const REGEX_URL = /^(?=.*[a-zA-Z])[a-z0-9-]+$/i
const REGEX_USERNAME = /^[a-z0-9-_.@]+$/i
const REGEX_DISPLAYNAME = /^[a-z0-9-_.@\s]+$/i
const ERROR_STATUS = {
  success: false,
  error: true,
}

export const COMMUNITY_PAGINATION_LIMIT = 25

export const DRAGGABLE_TYPE = {
  PLAYLIST_ITEM: 'PLAYLIST_ITEM',
}

export const PORTAL_PLAYLIST_KIND = {
  RECOMMENDED: 'recommended playlist',
  POPULAR: 'popular on gaia',
}

export const MODES = {
  RECOMMENDED_PLAYLIST: 'RECOMMENDED_PLAYLIST',
  POPULAR_PLAYLIST: 'POPULAR_PLAYLIST',
  UNSAVED_CHANGES: 'UNSAVED_CHANGES',
  PLAYLIST_EDIT: 'PLAYLIST_EDIT',
  PROFILE_EDIT: 'PROFILE_EDIT',
  COVER_EDIT: 'COVER_EDIT',
  TAGS_EDIT: 'TAGS_EDIT',
  FOLLOWERS: 'FOLLOWERS',
  FOLLOWING: 'FOLLOWING',
  DEFAULT: 'DEFAULT',
}

export const REGEXP_VALID_MEDIA = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
  '((([a-z_\\d]([a-z_\\d-]*[a-z_\\d])*)\\.)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))?' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', 'i',
)

export const MEDIA_OPTIONS = [
  { type: 'website', url: 'http://', regex: REGEXP_VALID_MEDIA },
  { type: 'instagram', url: 'http://www.instagram.com/' },
  { type: 'facebook', url: 'http://www.facebook.com/' },
  { type: 'twitter', url: 'http://www.twitter.com/' },
  { type: 'youtube', url: 'http://www.youtube.com/' },
]

export const VALIDATIONS_DISPLAYNAME = {
  matchRegexp: REGEX_DISPLAYNAME,
  maxLength: 25,
  minLength: 1,
}

// used for Portal v1
export const VALIDATIONS_USERNAME = {
  matchRegexp: REGEX_USERNAME,
  maxLength: 25,
  minLength: 1,
}

export const VALIDATIONS_SOCIAL = {
  matchRegexp: REGEXP_VALID_MEDIA,
}

export const VALIDATIONS_TAGLINE = {
  maxLength: 64,
}

export const PRIVACY_OPTIONS = {
  PRIVATE: 'private',
  PUBLIC: 'public',
}

export const VALIDATIONS_URL = {
  matchRegexp: REGEX_URL,
  maxLength: 25,
  minLength: 1,
}

export const CHAR_LIMIT = {
  USERNAME: 25,
  TAGLINE: 64,
  BIO: 750,
  URL: 25,
}

export const TAG_LIMIT = 5

// ----------------------------------------
// General/Data
// -----------------------------------------
export async function updatePortal ({ auth, data }) {
  try {
    const body = _omit(data, ['tier', 'verifiedAuthentic', 'username'])
    const res = await apiPut('v1/user-portals', body, {
      responseErrorType: RESPONSE_ERROR_TYPE_RANGE_400,
      reqType: REQUEST_TYPE_APPLICATION_JSON,
      auth,
    }, TYPE_BROOKLYN)
    return {
      data: _get(res, 'body', {}),
      error: false,
    }
  } catch (e) {
    return ERROR_STATUS
  }
}

export async function getUserPortalData ({ portal, isOwner = false }) {
  try {
    const res = await apiGet(`v1/user-portals/url/${portal}${isOwner ? `?cacheBust=${Date.now()}` : ''}`, null, {
      responseErrorType: RESPONSE_ERROR_TYPE_RANGE_400,
    }, TYPE_BROOKLYN)
    return _get(res, 'body', {})
  } catch (e) {
    return ERROR_STATUS
  }
}

export async function getUserPortalMetaData ({ auth }) {
  try {
    const res = await apiGet('v1/user-portals', null, {
      reqType: REQUEST_TYPE_APPLICATION_JSON,
      auth,
    }, TYPE_BROOKLYN)
    return _get(res, 'body')
  } catch (e) {
    return {}
  }
}

// ----------------------------------------
// Mode - User to determine which screen to show
// -----------------------------------------
export function isEditorMode (state) {
  return state === MODES.PROFILE_EDIT
    || state === MODES.UNSAVED_CHANGES
    || state === MODES.COVER_EDIT
    || state === MODES.TAGS_EDIT
}

// ----------------------------------------
// Tags
// -----------------------------------------
export async function getTagOptions (options) {
  const { auth, lang } = options
  const res = await apiGet('v1/user-tags/options', { language: lang }, {
    reqType: REQUEST_TYPE_APPLICATION_JSON,
    languageShouldBeString: true,
    auth,
  },
  TYPE_BROOKLYN)
  return _get(res, 'body', {})
}

// ----------------------------------------
// Sharing
// ----------------------------------------
export async function getPortalShare (options) {
  try {
    const { auth, portal, contentId } = options
    const userReferralId = portal.getIn(['data', 'userReferralId'])
    const userAccountId = portal.getIn(['data', 'userAccountId'])
    const url = portal.getIn(['data', 'url'])
    const res = await apiPost(`v1/user-portals/share/${url}`, {
      userAccountId,
      userReferralId,
      contentId,
    },
    {
      reqType: REQUEST_TYPE_APPLICATION_JSON,
      auth,
    },
    TYPE_BROOKLYN)
    return _get(res, 'body', {})
  } catch (e) {
    return {}
  }
}

// ----------------------------------------
// Resources
// ----------------------------------------
export async function getUserPortalResources (options) {
  try {
    const { auth, url, viewerUuid, language, isOwner = false } = options
    const data = await getUserPortalData({ portal: url, isOwner })
    const privacySetting = _get(data, 'privacySetting')
    const error = _get(data, 'error')
    const uuid = _get(data, 'uuid')
    if (error) {
      throw new Error('Error retrieving portal data')
    }
    return joinPromise(
      getUserSubscriptions({ language, pp: 12, uuid, viewerUuid }),
      getSubscriptionSubscribers({ type: 'MEMBER', language, contentId: uuid, pp: 12, viewerUuid }),
      getUserPortalPlaylist({ auth, uuid, language, isOwner }),
      (following, followers, playlists) => ({
        allowAccess: privacySetting !== PRIVACY_OPTIONS.PRIVATE || uuid === viewerUuid,
        subscriptions: _get(following, 'data', {}),
        subscribers: _get(followers, 'data', {}),
        ugcEnabled: _get(data, 'tier', 1) > 1,
        isPortalOwner: uuid === viewerUuid,
        playlists,
        data,
      }),
    )
  } catch (e) {
    return ERROR_STATUS
  }
}

// ----------------------------------------
// Playlist
// ----------------------------------------
export async function getUserPortalPlaylist (options) {
  try {
    const { auth, language, uuid, isOwner, p = 0, pp = 20 } = options
    const res = await apiGet(`v1/playlists/public/portal/${uuid}${isOwner ? `?cacheBust=${Date.now()}` : ''}`, { language, p, pp }, {
      reqType: REQUEST_TYPE_APPLICATION_JSON,
      auth,
    },
    TYPE_BROOKLYN)
    const videos = _get(res, ['body', 'videos'])
    const siteSegment = _get(videos, '0.site_segment.id', -1)
    let transformedVideos = fromJS(_map(videos, (v) => {
      const playlistPosition = _get(v, 'playlistPosition')
      return _assign(createTileModel(v), { playlistPosition })
    }))
    const firstVideo = transformedVideos.get(0, Map())
    const isFree = firstVideo && !getAuthIsLoggedIn(auth)
    if (firstVideo.size && isFree) {
      transformedVideos = transformedVideos.setIn([0, 'isFree'], true)
    }
    if (firstVideo.size) {
      transformedVideos = transformedVideos.setIn([0, 'relativeSiteSegment'], siteSegment)
    }
    const body = _assign(_get(res, 'body', {}), { videos: transformedVideos })
    return body
  } catch (e) {
    return {}
  }
}

// ----------------------------------------
// Community - (Followers/Following)
// ----------------------------------------
export async function getUserPortalSubscribers (options) {
  try {
    const { auth, uuid, p = 1, pp = 25, returnOriginalShape } = options
    const data = await getSubscriptionSubscribers({ contentId: uuid, type: 'MEMBER', auth, pp, p, returnOriginalShape })
    return data
  } catch (e) {
    return ERROR_STATUS
  }
}

export async function getUserPortalSubscriptions ({ uuid, p = 1, pp = 25, returnOriginalShape }) {
  try {
    const data = await getUserSubscriptions({ uuid, pp, p, returnOriginalShape })
    return data
  } catch (e) {
    return ERROR_STATUS
  }
}
