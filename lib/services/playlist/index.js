import _get from 'lodash/get'
import isString from 'lodash/isString'
import strictUriEncode from 'strict-uri-encode'
import { List, fromJS } from 'immutable'
import {
  post as apiPost,
  get as apiGet,
  put as apiPut,
  del as apiDelete,
  TYPE_BROOKLYN_JSON,
} from 'api-client'
import { ICON_TYPES } from 'components/Icon.v2'
import {
  URL_PLAYLIST_FAVORITES,
  URL_PLAYLIST_WATCH_HISTORY,
  URL_PLAYLIST_WATCH_LATER,
} from 'services/url/constants'
import {
  STORE_KEY_PLAYLIST_DEFAULT,
  STORE_KEY_PLAYLIST_FAVORITES,
  STORE_KEY_WATCH_HISTORY,
  STORE_KEY_PLAYLIST_USER,
} from 'services/store-keys'

export const PLAYLIST_EDIT_COMPLETE = 'playlistEditComplete'

export const PLAYLIST_TYPE_DEFAULT = 'default'
export const PLAYLIST_TYPE_FAVORITES = 'favorites'
export const PLAYLIST_TYPE_HISTORY = 'watch-history'
export const PLAYLIST_TYPE_USER = 'user'
export const PLAYLIST_TYPE_PORTAL = 'portal'
export const PLAYLIST_ERROR_EXISTING = 'existing'
export const PLAYLIST_PORTAL_LIMIT = 15

// ===============================================
// Used in portal playlist selection dropdown
// TODO: Rename after multiple playlist work is done
// ===============================================
export const PLAYLIST_TYPES = {
  RECENTLY_WATCHED: 'recent',
  USER: 'user',
}

export const PLAYLIST_DROPDOWN_OPTIONS = [
  {
    label: 'Recently Watched',
    value: PLAYLIST_TYPES.RECENTLY_WATCHED,
  },
  {
    label: 'My Playlist',
    value: PLAYLIST_TYPES.USER,
  },
  {
    label: 'Choose Playlist',
    value: 'default',
  },
]

export async function getPlaylistItem ({ auth, contentId }) {
  const url = `v1/playlists/content/${contentId}`
  const result = await apiGet(url, null, { auth }, TYPE_BROOKLYN_JSON)
  return _get(result, ['body'], {})
}

export async function updatePlaylist ({ auth, type, name }) {
  const url = `v2/playlists/${type}`
  const result = await apiPut(url, { name }, { auth }, TYPE_BROOKLYN_JSON)
  return _get(result, ['body'], {})
}

export async function updatePlaylistItem ({ auth, contentId, type, add }) {
  const action = add ? 'add' : 'remove'
  const url = `v2/playlists/${type}/${action}/${strictUriEncode(contentId)}`
  const result = await apiPost(url, null, { auth }, TYPE_BROOKLYN_JSON)
  const handledRes = handleInPlaylistResponse(result)
  return handledRes ? _get(result, ['body'], {}) : {}
}

export async function updatePlaylistItemPosition ({
  auth,
  contentId,
  playlistId,
  playlistPosition,
}) {
  const url = `v3/playlists/content/${strictUriEncode(contentId)}`

  const result = await apiPut(
    url,
    {
      playlistId,
      playlistPosition,
      playlistType: 'portal',
    },
    {
      auth,
    }, TYPE_BROOKLYN_JSON)
  return _get(result, ['body'], {})
}

// ------------------------------------
// OLD functions used on PlaylistPage
// ------------------------------------

export function handleInPlaylistResponse (res) {
  const success = _get(res, ['body', 'success'])
  if (!success) {
    throw new Error('The playlist information failed to save. Please try again.')
  }
  return success
}

export function setInPlaylist (options) {
  const { id, inPlaylist, auth } = options
  // if inPlaylist is true, add to playlist, otherwise remove
  const action = inPlaylist ? 'add' : 'remove'
  const url = `v2/playlists/default/${action}/${strictUriEncode(id)}`
  return apiPost(url, null, { auth }, TYPE_BROOKLYN_JSON)
    .then((res) => {
      return handleInPlaylistResponse(res)
    })
}

// ------------------------------------
// Fetch Portal Playlists Dropdown
// ------------------------------------
export async function getUserPlaylist ({ auth, page = 1, limit }) {
  // Endpoint pagination returns 0 as the first page by default.
  // We do not want user's to see this so we control the offset here
  const offsetPage = page - 1

  const res = await apiGet('/v2/playlists/default',
    { p: offsetPage, pp: limit },
    { auth },
    TYPE_BROOKLYN_JSON,
  )

  const body = _get(res, 'body', {})
  const results = {
    ...body,
    currentPage: _get(body, 'currentPage') + 1,
  }
  return results
}

export async function getRecentlyWatchedPlaylist ({ auth, page = 1, limit }) {
  // Endpoint pagination returns 0 as the first page by default.
  // We do not want user's to see this so we control the offset here
  const offsetPage = page - 1

  const res = await apiGet('/v2/user/recently-watched',
    { p: offsetPage, pp: limit },
    { auth },
    TYPE_BROOKLYN_JSON,
  )

  const body = _get(res, 'body', {})
  const results = {
    ...body,
    currentPage: _get(body, 'currentPage') + 1,
  }
  return results
}

// ------------------------------------
// Specify the standard playlists that all users must have
// ------------------------------------
export const BASE_PLAYLISTS = [
  {
    id: 'watch-later',
    type: PLAYLIST_TYPE_DEFAULT,
    staticTextKey: 'watchLater',
    tileStoreKey: STORE_KEY_PLAYLIST_DEFAULT,
    url: URL_PLAYLIST_WATCH_LATER,
    iconType: ICON_TYPES.CLOCK_FILL,
  },
  {
    id: 'favorites',
    type: PLAYLIST_TYPE_FAVORITES,
    staticTextKey: 'favorites',
    tileStoreKey: STORE_KEY_PLAYLIST_FAVORITES,
    url: URL_PLAYLIST_FAVORITES,
    iconType: ICON_TYPES.STAR_FILL,
  },
  {
    id: 'watch-history',
    type: PLAYLIST_TYPE_HISTORY,
    staticTextKey: 'watchHistory',
    tileStoreKey: STORE_KEY_WATCH_HISTORY,
    url: URL_PLAYLIST_WATCH_HISTORY,
    iconType: ICON_TYPES.HOURGLASS,
  },
]

export const PORTAL_PLAYLIST = {
  id: 'portal',
  name: 'Portal',
  type: PLAYLIST_TYPE_PORTAL,
}

/**
 * Get the base playlists as a List from Immutable.js
 *
 * @param {boolean} includePortal
 * @returns {object}
 */
export function getImmutableBasePlaylists (includePortal = false) {
  const playlists = BASE_PLAYLISTS.filter(pl => pl.type !== PLAYLIST_TYPE_HISTORY)
  if (includePortal) {
    playlists.push(PORTAL_PLAYLIST)
  }
  return fromJS(playlists)
}

// ------------------------------------
// Fetch Playlists (default + custom)
// ------------------------------------
export async function getAllUserPlaylists ({ auth }) {
  const res = await apiGet('/v2/playlists',
    null,
    { auth },
    TYPE_BROOKLYN_JSON,
  )

  const body = _get(res, 'body', {})
  const results = {
    ...body,
  }
  return results
}

// Return the store key where tiles are located by playlistType
export const getPlaylistTileStoreKey = (playlistType) => {
  if (playlistType.startsWith('user-')) {
    return STORE_KEY_PLAYLIST_USER
  }

  return _get(BASE_PLAYLISTS.find(pl => pl.type === playlistType), 'tileStoreKey', '')
}

export async function createUserPlaylist ({ auth, params }) {
  const baseParams = { type: 'user' }

  const res = await apiPost('/v2/playlists/create',
    { ...params, ...baseParams },
    { auth },
    TYPE_BROOKLYN_JSON,
  )

  if (!res.ok) { // Status 404, 500, etc
    throw new Error(`${res.statusCode} Failed to create `)
  }

  if (res.statusCode === 200) { // Existing
    return {
      existing: true,
    }
  }

  const body = _get(res, 'body', {})
  const results = {
    existing: null,
    data: { ...body },
  }
  return results
}

// Fetch delete quese ids - used when editing a playlist
export function getDeleteQueueIds (playlistStoreKey, playlist) {
  return playlist
    .getIn([playlistStoreKey, 'queue'], List())
    .reduce((reduction, v) => {
      if (v !== undefined && v.get('playlist') === false) {
        // eslint-disable-next-line no-param-reassign
        reduction = reduction.push(v.get('id'))
      }
      return reduction
    }, List())
}

// Delete playlist items
export async function deleteItemsFromPlaylist ({
  deleteIds,
  playlistType,
  auth,
} = {}) {
  await deleteIds.map((id) => {
    const url = `/v2/playlists/${playlistType}/remove/${strictUriEncode(id)}`
    return apiPost(url, null, { auth }, TYPE_BROOKLYN_JSON)
  })
}


// Delete playlist
export async function deletePlaylist ({ auth, playlistType }) {
  const res = await apiDelete(`/v2/playlists/${strictUriEncode(playlistType)}`,
    null,
    { auth },
    TYPE_BROOKLYN_JSON,
  )

  if (!res.ok) { // Status 404, 500, etc.
    throw new Error(`${res.statusCode} Failed to delete `)
  }
}

// Rename playlist
export async function renamePlaylist ({ auth, playlistType, playlistName }) {
  const res = await apiPut(`/v2/playlists/${strictUriEncode(playlistType)}`,
    {
      name: playlistName,
    },
    { auth },
    TYPE_BROOKLYN_JSON,
  )

  // Playlist name already exists
  if (res.statusCode === 400 || res.statusCode === 409) {
    return {
      existing: true,
    }
  }

  // Status 404, 500, etc
  if (!res.ok) {
    throw new Error(`${res.statusCode} Failed to update `)
  }

  const body = _get(res, 'body', {})
  const results = {
    existing: null,
    data: { ...body },
  }
  return results
}

/**
 * Format the maxlength string error
 * @param {String} errorMessage
 * @param {String} value
 * @returns {String}
 */
export function formatPlaylistInputErrors (errorMessage, value) {
  if (isString(errorMessage) && isString(value)) {
    return errorMessage.replace(/\$\{ playlistNameLength \}/, value.length)
  }
  return errorMessage
}
