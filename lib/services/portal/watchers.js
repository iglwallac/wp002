import _map from 'lodash/map'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _reduce from 'lodash/reduce'
import { List, Map, fromJS } from 'immutable'
import { getUserPublic } from 'services/user'
import { setPageSeo } from 'services/page/actions'
import { addToasty } from 'services/toasty/actions'
import { setShareData } from 'services/share/actions'
import { getShelfData } from 'services/shelf/actions'
import { getPmScreen } from 'services/pm-screen/actions'
import { pushHistory } from 'services/navigation/actions'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { RESOLVER_TYPE_PORTAL } from 'services/resolver/types'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import {
  updatePlaylistItemPosition,
  PLAYLIST_TYPES,
  getUserPlaylist,
  getRecentlyWatchedPlaylist,
} from 'services/playlist'
import { searchContent } from 'services/search'
import { all as BluebirdAll } from 'bluebird'
import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'
import { setInboundTrackingRfd, setInboundTracking } from 'services/inbound-tracking/actions'
import {
  PLAYLIST_UPDATED_ITEM,
  reorderedPlaylistItem,
  PLAYLIST_REORDER_ITEM,
  PLAYLIST_REORDERED_ITEM,
  updatePlaylistItem,
} from 'services/playlist/actions'
import { SET_USER_DATA, SET_USER_DATA_LANGUAGE, SET_USER_PROFILE_IMAGES_DELETE } from 'services/user/actions'
import { BOOTSTRAP_PHASE_INIT } from 'services/app'
import * as actions from './actions'
import * as api from '.'

function isPortalPage ({ state }) {
  const { resolver } = state
  return resolver.getIn(['data', 'type'])
    === RESOLVER_TYPE_PORTAL
}

/**
 * watches for PORTAL_V2_UPDATE and sends PUT to update user portal properties.
 * @param {object} action - redux action
 * @param {string} action.type - redux action type
 * @param {Map} action.payload - map of properties to update
 */
export function updatePortal ({ takeFirst }) {
  return takeFirst(actions.PORTAL_V2_UPDATE, async ({ action, state }) => {
    const { auth, portal } = state
    const { payload: data } = action
    // const keys = data.keySeq().toArray()
    const editor = portal.get('editor', Map())
    let tags = data.get('tags', undefined)
    let urls = data.get('userPortalUrls', undefined)
    let body = data
    if (tags) {
      tags = data.get('tags', List()).map(t => (
        t.get('tagId') || t.get('id')))
      body = body.set('tags', tags)
    }
    if (urls) {
      urls = data.get('userPortalUrls', List()).map(u => ({
        type: u.get('type'), url: u.get('url') }))
      body = body.set('userPortalUrls', urls)
    }
    const result = await api.updatePortal({
      data: body.toJS(),
      auth,
    })
    const { error } = result
    return {
      type: actions.PORTAL_V2_APPLY_UPDATES,
      payload: { changes: data, editor, result, error },
    }
  })
}

// -----------------------------------
// Lifecycle Watchers
// -----------------------------------
export function onPortalMountAndUpdate ({ after }) {
  return after(SET_RESOLVER_DATA, async ({ dispatch, state }) => {
    const { user, auth, resolver, inboundTracking } = state
    const isOwner = user.getIn(['data', 'portal', 'url'], '') === resolver.getIn(['data', 'params', 'portal'])
    dispatch({ type: actions.PORTAL_GET_RESOURCES })
    const data = await api.getUserPortalResources({
      language: user.getIn(['data', 'language', 0], 'en'),
      url: resolver.getIn(['data', 'params', 'portal']),
      viewerUuid: auth.get('uuid'),
      isOwner,
      auth,
    })
    // only set RFD if one doesn't already exist
    const existingRfd = ['PORTAL', 'SHARE'].includes(inboundTracking.getIn(['data', 'source']))
    if (!existingRfd) {
      dispatch(setInboundTrackingRfd({
        rfd: _get(data, ['data', 'userReferralId']),
        sourceId: _get(data, ['data', 'id']),
        source: 'PORTAL',
        auth,
      }))
    }
    dispatch(getPmScreen('portal', user.getIn(['data', 'language', 0], 'en')))
    // Or operator here because null technically evaluates to a value from a get
    // which then visually renders null in the browser tab meta data
    const title = _get(data, ['data', 'title']) || _get(data, ['data', 'username'])
    const description = _get(data, ['data', 'description']) || ''
    const image = _get(data, ['data', 'profilePicture']) || ''
    dispatch(setPageSeo({
      twitterDescription: description,
      ogDescription: description,
      twitterTitle: title,
      twitterImage: image,
      noFollow: false,
      ogTitle: title,
      ogImage: image,
      noIndex: true,
      description,
      location,
      title,
    }))
    dispatch({
      type: actions.PORTAL_SET_RESOURCES,
      payload: { data },
    })
  })
    .when(isPortalPage)
}

export function checkForTagOptions ({ after }) {
  return after(actions.PORTAL_SET_RESOURCES, async ({ dispatch, state }) => {
    const { portal } = state

    if (!portal.get('tags')) {
      dispatch(actions.getTagOptions())
    }
  })
}

export function onPortalUnmount ({ before }) {
  return before(SET_RESOLVER_DATA, async ({ dispatch, action }) => {
    const { payload = {} } = action
    const { data = {} } = payload
    const { type } = data
    if (type !== RESOLVER_TYPE_PORTAL) {
      dispatch({ type: actions.PORTAL_UNMOUNT })
    }
  })
    .when(isPortalPage)
}

// -----------------------------------
// Set RFD and get pmScreen when portal is hydrated via server
// -----------------------------------
export function onPortalHydrationComplete ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state }) => {
    const { portal, auth, user, app, inboundTracking } = state
    // only set RFD if one doesn't already exist
    const existingRfd = ['PORTAL', 'SHARE'].includes(inboundTracking.getIn(['data', 'source']))
    const phase = app.get('bootstrapPhase')

    if (phase === BOOTSTRAP_PHASE_INIT) {
      dispatch(setInboundTracking({ utm_source: 'portal' }))
    }

    if (app.get('bootstrapComplete') && !existingRfd) {
      dispatch(setInboundTrackingRfd({
        rfd: portal.getIn(['data', 'userReferralId']),
        sourceId: portal.getIn(['data', 'id']),
        source: 'PORTAL',
        auth,
      }))
    }
    if (portal.get('isPortalOwner')) {
      dispatch(actions.getTagOptions())
    }
    dispatch(getPmScreen('portal', user.getIn(['data', 'language', 0], 'en')))
  })
    .when(isPortalPage)
}

// -----------------------------------
// Watcher when user changes profiles or logs in
// -----------------------------------
export function verifyUserAccess ({ after }) {
  return after(SET_USER_DATA, async ({ dispatch, state }) => {
    const { portal, auth, user, resolver } = state
    if (portal.get('error', false)) return
    const language = user.getIn(['data', 'language', 0], 'en')
    const privacySetting = portal.getIn(['data', 'privacySetting'])
    const portalUuid = portal.getIn(['data', 'uuid'])
    const viewerUuid = auth.get('uuid')
    const allowAccess = privacySetting === api.PRIVACY_OPTIONS.PRIVATE
      ? viewerUuid === portalUuid
      : true
    const isPortalOwner = viewerUuid === portalUuid
    if (isPortalOwner) dispatch(actions.getTagOptions())
    dispatch({
      type: actions.PORTAL_SET_USER_ACCESS,
      payload: { allowAccess, isPortalOwner },
    })
    const portalPlaylistData = await api.getUserPortalPlaylist({
      language,
      isOwner: user.getIn(['data', 'portal', 'url'], '')
        === resolver.getIn(['data', 'params', 'portal']),
      uuid: portal.getIn(['data', 'uuid']),
      auth,
    })
    dispatch({
      type: actions.RESET_PORTAL_PLAYLIST_DATA,
      payload: { data: portalPlaylistData },
    })
    if (!isPortalOwner) {
      dispatch({
        type: actions.PORTAL_V2_SET_MODE,
        payload: api.MODES.DEFAULT,
      })
    }
  })
    .when(isPortalPage)
}

// -----------------------------------
// Watcher when user changes languages on the portal
// -----------------------------------
export function portalLanguageChange ({ after }) {
  return after(SET_USER_DATA_LANGUAGE, async ({ state, dispatch }) => {
    const { user, auth, resolver, portal } = state
    if (portal.get('error', false)) return
    const language = user.getIn(['data', 'language', 0], 'en')
    const portalPlaylistData = await api.getUserPortalPlaylist({
      language,
      isOwner: user.getIn(['data', 'portal', 'url'], '')
        === resolver.getIn(['data', 'params', 'portal']),
      uuid: portal.getIn(['data', 'uuid']),
      auth,
    })
    dispatch({
      type: actions.RESET_PORTAL_PLAYLIST_DATA,
      payload: { data: portalPlaylistData },
    })
    dispatch(getPmScreen('portal', language))
  })
    .when(isPortalPage)
}

// ----------------------------------------
// Mode - Controls which component/screen to show - may eventually be swapped in favor of routes
// ----------------------------------------
export function setMode ({ before }) {
  return before(actions.PORTAL_V2_SET_MODE, ({ dispatch, action, state }) => {
    const { portal } = state
    const { payload: nextMode } = action
    const prevMode = portal.get('mode', api.MODES.DEFAULT)
    dispatch({
      type: actions.PORTAL_V2_SET_PREV_MODE,
      payload: prevMode,
    })

    if (!api.isEditorMode(prevMode)
      && nextMode === api.MODES.PROFILE_EDIT) {
      dispatch({ type: actions.PORTAL_V2_CREATE_EDITOR })
    } else if (api.isEditorMode(prevMode)
      && nextMode === api.MODES.DEFAULT) {
      dispatch({ type: actions.PORTAL_V2_REMOVE_EDITOR })
    }
  })
}

// -----------------------------------
// Watcher when user updates any type of data
// -----------------------------------
export function portalCreateToasty ({ after }) {
  return after([
    actions.SET_PORTAL_PLAYLIST_DATA,
    actions.PORTAL_V2_APPLY_UPDATES,
  ], async ({ dispatch, state, action }) => {
    const { staticText } = state
    const { payload } = action
    const { error } = payload
    const message = error
      ? staticText.getIn(['data', 'portalV2', 'data', 'toastyUpdateError'])
      : staticText.getIn(['data', 'portalV2', 'data', 'toastyUpdateSuccess'])
    dispatch(addToasty(message))
  })
}

// -----------------------------------
// Watcher for fetching all possible tag options
// -----------------------------------
export function getTagOptions ({ takeMaybe }) {
  return takeMaybe(actions.PORTAL_GET_TAG_OPTIONS, ({ action, state }) => {
    const { portal, user } = state
    const lang = user.getIn(['data', 'language', 0])
    const processing = portal.getIn(['tags', 'processing'], false)
    if (!processing) {
      return async () => {
        const { payload } = action
        const { data: auth } = payload
        const data = await api.getTagOptions({ auth, lang })
        return {
          type: actions.PORTAL_SET_TAG_OPTIONS,
          payload: { data },
        }
      }
    }
    return null
  })
}

// -----------------------------------
// Watcher for creating and loading a sharable piece of content
// -----------------------------------
export function getPortalShare ({ after }) {
  return after(actions.PORTAL_GET_SHARE, async ({ action, dispatch, state }) => {
    const { auth, portal, user } = state
    const { payload } = action
    const { data } = payload
    const { contentId } = data
    const language = user.getIn(['data', 'language', 0], 'en')
    const share = await api.getPortalShare({ contentId, auth, portal })
    const { contentId: id } = share
    const contentType = 'video'
    dispatch(setShareData(fromJS(share)))
    dispatch(getShelfData({ contentType, language, id }))
    dispatch({
      type: actions.PORTAL_SET_SHARE,
      payload: { data: share },
    })
  })
}

// -----------------------------------
// Watcher for redirecting sharable piece of content from portal
// -----------------------------------
export function redirectPortalShare ({ after }) {
  return after(actions.PORTAL_SET_SHARE, async ({ action, dispatch }) => {
    const { payload } = action
    const { data } = payload
    const share = fromJS(data)
    if (share && share.size) {
      const token = share.get('token')
      if (token) {
        dispatch(pushHistory({
          url: `/share/${token}?utm_source_portal`,
        }))
      }
    }
  })
}

// -----------------------------------
// Profile Picture
// -----------------------------------
export function updateProfilePicture ({ after }) {
  return after(SET_USER_DATA, async ({ dispatch, action, state }) => {
    const { payload } = action
    const { data } = payload
    const { auth, portal } = state
    const portalUuid = portal.getIn(['data', 'uuid'], null)
    const uuid = auth.get('uuid', null)
    const profileOwner = portalUuid === uuid
    const profilePicture = fromJS(data).getIn(['profile', 'picture', 'hdtv_190x266'])
    if (profileOwner && profilePicture) {
      const { setUserPortalProfilePicture, updateEditor } = actions
      dispatch(setUserPortalProfilePicture({ profilePicture }))
      dispatch(updateEditor('profilePicture', profilePicture))
    }
  })
}

export function removeProfilePicture ({ after }) {
  return after(SET_USER_PROFILE_IMAGES_DELETE, async ({ dispatch, action, state }) => {
    const { payload } = action
    const { data } = payload
    const { success } = data
    const { auth, portal } = state
    const portalUuid = portal.getIn(['data', 'uuid'], null)
    const uuid = auth.get('uuid', null)
    const profileOwner = portalUuid === uuid
    const profilePicture = ''
    if (success && profileOwner) {
      const { setUserPortalProfilePicture, updateEditor } = actions
      dispatch(setUserPortalProfilePicture({ profilePicture }))
      dispatch(updateEditor('profilePicture', profilePicture))
    }
  })
}

// -----------------------------------
// Playlist Fetching
// -----------------------------------
export function getPlaylist ({ after }) {
  return after([
    PLAYLIST_UPDATED_ITEM,
    PLAYLIST_REORDERED_ITEM,
    actions.PORTAL_V2_SET_MODE,
  ], async ({ state, action, prevState, dispatch }) => {
    const { auth } = state

    if (action.type === actions.PORTAL_V2_SET_MODE && prevState.portal.get('mode') !== api.MODES.PLAYLIST_EDIT) {
      // only refetch if coming from playlist edit
      return null
    }

    const res = await apiGet('/v3/playlists/portal',
      { },
      { auth },
      TYPE_BROOKLYN_JSON,
    )
    const data = _get(res, 'body', {})

    dispatch({
      type: actions.PORTAL_V2_SET_PLAYLIST,
      payload: { data },
    })

    return null
  })
    .when(isPortalPage)
}

// -----------------------------------
// Playlist Editing
// -----------------------------------
export function playlistReorderItem ({ before }) {
  return before(PLAYLIST_REORDER_ITEM, async ({ action, state, dispatch }) => {
    const { auth } = state
    const { payload } = action
    const { contentId, playlistId, playlistPosition } = payload
    const result = await updatePlaylistItemPosition({
      playlistPosition,
      playlistId,
      contentId,
      auth,
    })

    dispatch({
      type: PLAYLIST_REORDERED_ITEM,
      payload: result,
    })

    return {
      type: actions.SET_PORTAL_PLAYLIST_DATA,
      payload: { data: result },
    }
  })
    .catch(({ action, dispatch }) => {
      const { payload } = action
      const { contentId } = payload
      dispatch(reorderedPlaylistItem({
        error: true,
        contentId,
      }))
    })
    .when(isPortalPage)
}

export function removePortalPlaylistItem ({ after }) {
  return after(PLAYLIST_UPDATED_ITEM, async ({ action, dispatch }) => {
    const { payload } = action
    const { type, contentId, add } = payload
    if (type === 'portal' && add === false) {
      dispatch(actions.setRemovePortalPlaylistItem(contentId))
    }
  })
}

export function addVideoToPlaylist ({ takeLatest }) {
  return takeLatest(actions.PORTAL_V2_ADD_VIDEO_TO_PLAYLIST, ({ action }) => {
    const { payload: { contentId } } = action

    return updatePlaylistItem({
      type: 'portal',
      add: true,
      contentId,
    })
  })
}

export function removeVideoFromPlaylist ({ takeLatest }) {
  return takeLatest(actions.PORTAL_V2_REMOVE_VIDEO_FROM_PLAYLIST, ({ action }) => {
    const { payload: { contentId } } = action

    return updatePlaylistItem({
      type: 'portal',
      add: false,
      contentId,
    })
  })
}

export function getPlaylistEditFilter ({ takeLatest }) {
  return takeLatest(actions.PORTAL_V2_PL_EDIT_GET_PLAYLIST, async ({ state, action }) => {
    const { payload } = action
    const { playlistType } = payload
    const { auth } = state

    const getPlaylistData = {
      [PLAYLIST_TYPES.USER]: getUserPlaylist,
      [PLAYLIST_TYPES.RECENTLY_WATCHED]: getRecentlyWatchedPlaylist,
    }

    const data = await getPlaylistData[playlistType]({
      ...payload,
      auth,
    })
    return {
      type: actions.PORTAL_V2_PL_EDIT_SET_PLAYLIST,
      payload: { data, playlistType },
    }
  })
}

export function getPlaylistEditSearch ({ takeLatest }) {
  return takeLatest(actions.PORTAL_V2_PL_EDIT_GET_SEARCH, async ({ state, action }) => {
    const { payload } = action
    const { user } = state

    const data = await searchContent({
      ...payload,
      user,
    })

    return {
      type: actions.PORTAL_V2_PL_EDIT_SET_SEARCH,
      payload: data,
    }
  })
}

export function updatePlaylistEditPagination ({ takeLatest }) {
  return takeLatest(actions.PORTAL_V2_PL_EDIT_SET_PAGINATION, async ({ state, action }) => {
    const { payload: { page, limit } } = action
    const { portal } = state
    const currentFilter = portal.getIn(['playlistEditor', 'filterType'])


    if (currentFilter === 'search') {
      const searchTerm = portal.getIn(['playlistEditor', 'searchTerm'])
      return {
        type: actions.PORTAL_V2_PL_EDIT_GET_SEARCH,
        payload: {
          page,
          limit,
          searchTerm,
        },
      }
    }

    return {
      type: actions.PORTAL_V2_PL_EDIT_GET_PLAYLIST,
      payload: {
        page,
        limit,
        playlistType: currentFilter,
      },
    }
  })
}

// -----------------------------------
// Community - (Followers/Following)
// -----------------------------------
export function getPortalCommunityPm ({ takeEvery }) {
  return takeEvery(actions.PORTAL_COMMUNITY_PM_GET, async ({ action }) => {
    const { payload } = action
    const { data: uuids } = payload
    const promiseArr = _map(uuids, uuid => getUserPublic(uuid))
    const portals = await BluebirdAll(promiseArr)
    const data = _reduce(uuids, (acc, uuid) => {
      acc[uuid] = _find(portals, p => p.id === uuid)
      return acc
    }, {})
    return {
      type: actions.PORTAL_COMMUNITY_PM_SET,
      payload: { data },
    }
  })
}

const fetchPortalCommunityItems = async ({ mode, uuid, auth, p = 1, pp = 25 } = {}) => {
  let payload
  if (mode === api.MODES.FOLLOWING) {
    const results = await api.getUserPortalSubscriptions({
      returnOriginalShape: true,
      uuid,
      pp,
      p,
    })
    payload = {
      ...results,
      items: _get(results, 'subscriptions'),
    }
    delete payload.subscriptions
  }
  if (mode === api.MODES.FOLLOWERS) {
    const results = await api.getUserPortalSubscribers({
      returnOriginalShape: true,
      uuid,
      auth,
      pp,
      p,
    })
    payload = {
      ...results,
      items: _get(results, 'subscribers'),
    }
    delete payload.subscribers
  }
  return payload
}

export function getUserPortalPaginatedSubscribers ({ before }) {
  return before(actions.PORTAL_V2_SET_MODE, async ({ dispatch, action, state }) => {
    const { payload: mode } = action
    const { auth, portal } = state
    const uuid = portal.getIn(['data', 'uuid'])
    const items = await fetchPortalCommunityItems({ mode, uuid, auth })
    dispatch({
      type: actions.PORTAL_V2_SET_VIEWALL,
      payload: fromJS(items),
    })
  })
    .when(({ action: { payload } }) => {
      return payload === api.MODES.FOLLOWERS || payload === api.MODES.FOLLOWING
    })
}

export function updatePortalViewallPagination ({ takeLatest }) {
  return takeLatest(actions.PORTAL_V2_UPDATE_VIEWALL_PAGINATION, async ({ state, action }) => {
    const { payload } = action
    const { page: p } = payload
    const { auth, portal } = state
    const uuid = portal.getIn(['data', 'uuid'])
    const mode = portal.get('mode')
    const result = await fetchPortalCommunityItems({
      mode,
      uuid,
      auth,
      p,
    })
    return {
      type: actions.PORTAL_V2_SET_VIEWALL,
      payload: fromJS(result),
    }
  })
}
