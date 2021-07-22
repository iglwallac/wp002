import { all as allPromise } from 'bluebird'
import { setInPlaylist as apiSetInPlaylist, PLAYLIST_EDIT_COMPLETE } from 'services/playlist'
import {
  getLocalPreferences,
  setLocalPreferences,
} from 'services/local-preferences'

// OLD action types
// Once the playlist page has been redone (its very old)
// we can remove these in favor of the NEW actions
export const ADD_IDS_TO_PLAYLIST = 'ADD_IDS_TO_PLAYLIST'
export const PLAYLIST_ADD_STATUS = 'PLAYLIST_ADD_STATUS'
export const PLAYLIST_STATUS_KEY = 'status'
export const SET_PLAYLIST_HEADER_STICKY = 'SET_PLAYLIST_HEADER_STICKY'
export const SET_PLAYLIST_EDIT_MODE = 'SET_PLAYLIST_EDIT_MODE'
export const SET_PLAYLIST_QUEUE_ITEM = 'SET_PLAYLIST_QUEUE_ITEM'
export const TOGGLE_PLAYLIST_EDIT_MODE = 'TOGGLE_PLAYLIST_EDIT_MODE'
export const DELETE_PLAYLIST_QUEUE = 'DELETE_PLAYLIST_QUEUE'
export const SET_PLAYLIST_PROCESSING = 'SET_PLAYLIST_PROCESSING'
export const SET_PLAYLIST_EDIT_LOCAL_COMPLETE =
  'SET_PLAYLIST_EDIT_LOCAL_COMPLETE'

// NEW action types for the AddRemovePlaylist component
// once we update the Playlist page we can remove the OLD actions and types
export const PLAYLIST_GET_ITEM = 'PLAYLIST_GET_ITEM'
export const PLAYLIST_SET_ITEM = 'PLAYLIST_SET_ITEM'
export const PLAYLIST_REMOVE_ITEM = 'PLAYLIST_REMOVE_ITEM'
export const PLAYLIST_UPDATE_ITEM = 'PLAYLIST_UPDATE_ITEM'
export const PLAYLIST_BATCH_UPDATE = 'PLAYLIST_BATCH_UPDATE'
export const PLAYLIST_UPDATED_ITEM = 'PLAYLIST_UPDATED_ITEM'
export const PLAYLIST_REORDER_ITEM = 'PLAYLIST_REORDER_ITEM'
export const PLAYLIST_REORDERED_ITEM = 'PLAYLIST_REORDERED_ITEM'
export const PLAYLIST_UPDATE = 'PLAYLIST_UPDATE'

// NEW action types for multiple playlists
export const SET_USER_PLAYLISTS_PROCESSING = 'SET_USER_PLAYLISTS_PROCESSING'
export const SET_USER_PLAYLISTS = 'SET_USER_PLAYLISTS'
export const RESET_USER_PLAYLISTS = 'RESET_USER_PLAYLISTS'
export const SET_ACTIVE_USER_PLAYLIST = 'SET_ACTIVE_USER_PLAYLIST'
export const CREATE_NEW_USER_PLAYLIST = 'CREATE_NEW_USER_PLAYLIST'
export const CREATE_NEW_USER_PLAYLIST_SUCCESS = 'CREATE_NEW_USER_PLAYLIST_SUCCESS'
export const CREATE_NEW_USER_PLAYLIST_AND_ATTACH_ITEM = 'CREATE_NEW_USER_PLAYLIST_AND_ATTACH_ITEM'
export const SET_NEW_USER_PLAYLIST_ERROR = 'SET_NEW_USER_PLAYLIST_ERROR'
export const RESET_NEW_USER_PLAYLIST_ERROR = 'RESET_NEW_USER_PLAYLIST_ERROR'
export const GET_USER_PLAYLISTS_TILE_DATA_LOAD_MORE = 'GET_USER_PLAYLISTS_TILE_DATA_LOAD_MORE'
export const DELETE_USER_PLAYLIST = 'DELETE_USER_PLAYLIST'
export const DELETE_USER_PLAYLIST_SUCCESS = 'DELETE_USER_PLAYLIST_SUCCESS'
export const RENAME_USER_PLAYLIST = 'RENAME_USER_PLAYLIST'
export const RENAME_USER_PLAYLIST_SUCCESS = 'RENAME_USER_PLAYLIST_SUCCESS'
export const SET_RENAME_USER_PLAYLIST_ERROR = 'SET_RENAME_USER_PLAYLIST_ERROR'
export const RESET_RENAME_USER_PLAYLIST_ERROR = 'RESET_RENAME_USER_PLAYLIST_ERROR'

// -------------------------------------
// NEW ACTIONS
// We've only adde what we need for the new AddRemovePlaylist component
// -------------------------------------
export function getPlaylistItem (payload) {
  return { type: PLAYLIST_GET_ITEM, payload }
}

export function updatePlaylist (payload) {
  return { type: PLAYLIST_UPDATE, payload }
}

export function reorderPlaylistItem (payload) {
  return { type: PLAYLIST_REORDER_ITEM, payload }
}

export function reorderedPlaylistItem (payload) {
  return { type: PLAYLIST_REORDERED_ITEM, payload }
}

export function setPlaylistItem (payload) {
  return { type: PLAYLIST_SET_ITEM, payload }
}

export function removePlaylistItem (payload) {
  return { type: PLAYLIST_REMOVE_ITEM, payload }
}

export function updatePlaylistItem (payload) {
  return { type: PLAYLIST_UPDATE_ITEM, payload }
}

export function updatedPlaylistItem (payload) {
  return { type: PLAYLIST_UPDATED_ITEM, payload }
}

export function batchPlaylistItems (payload) {
  return { type: PLAYLIST_BATCH_UPDATE, payload }
}

// -------------------------------------
// OLD actions
// The PlaylistPage still uses these
// -------------------------------------
export function playlistAddStatus (value, storekey) {
  return {
    type: PLAYLIST_ADD_STATUS,
    payload: value,
    storekey,
  }
}

export function setPlaylistHeaderSticky (storeKey, value) {
  return {
    type: SET_PLAYLIST_HEADER_STICKY,
    payload: value,
    storeKey,
  }
}

export function setPlaylistEditMode (storeKey, value) {
  return {
    type: SET_PLAYLIST_EDIT_MODE,
    payload: value,
    storeKey,
  }
}

export function togglePlaylistEditMode (storeKey) {
  return {
    type: TOGGLE_PLAYLIST_EDIT_MODE,
    storeKey,
  }
}

export function setPlaylistQueueItem (storeKey, index, id, playlist) {
  return {
    type: SET_PLAYLIST_QUEUE_ITEM,
    payload: {
      index,
      id,
      playlist,
    },
    storeKey,
  }
}

export function deletePlaylistQueue (storeKey) {
  return {
    type: DELETE_PLAYLIST_QUEUE,
    storeKey,
  }
}

export function setPlaylistProcessing (storeKey, value) {
  return {
    type: SET_PLAYLIST_PROCESSING,
    playload: value,
    storeKey,
  }
}

export function deletePlaylistIds (storeKey, ids, auth, uid) {
  return function setPlaylistInPlaylistThunk (dispatch) {
    dispatch(setPlaylistProcessing(storeKey, true))
    dispatch(deletePlaylistQueue(storeKey))
    dispatch(setPlaylistLocalPref(storeKey, uid, PLAYLIST_EDIT_COMPLETE, true, auth))
    const promises = ids
      .map(id => apiSetInPlaylist({ id, inPlaylist: false, auth: auth.get('jwt') }))
      .toJS()
    return allPromise(promises)
      .catch(() => {
        // Can't do anything so just return
        return undefined
      })
      .finally(() => {
        dispatch(setPlaylistProcessing(storeKey, false))
      })
  }
}

export function setInPlaylist (id, inPlaylist, auth) {
  return function setInDefaultPlaylistThunk () {
    // dispatch(setShelfUserInfoProcessing(true))
    // dispatch(setShelfUserPlaylist(inPlaylist))
    return apiSetInPlaylist({ id, inPlaylist, auth })
      .catch(() => {})
      .finally(() => {})
  }
}

export function getPlaylistLocalPref (storeKey, uid, key) {
  const value = getLocalPreferences(uid, key)
  return {
    type: SET_PLAYLIST_EDIT_LOCAL_COMPLETE,
    payload: value === undefined ? null : value,
    storeKey,
  }
}

export function setPlaylistLocalPref (storeKey, uid, key, value, auth) {
  setLocalPreferences(uid, key, value, auth)

  return {
    type: SET_PLAYLIST_EDIT_LOCAL_COMPLETE,
    payload: value,
    storeKey,
  }
}

export function setUserPlaylistsProcessing (processing) {
  return {
    type: SET_USER_PLAYLISTS_PROCESSING,
    payload: processing,
  }
}

export function setUserPlaylists (items) {
  return {
    type: SET_USER_PLAYLISTS,
    payload: items,
  }
}

export function resetUserPlaylists () {
  return {
    type: RESET_USER_PLAYLISTS,
  }
}

export function setActiveUserPlaylist (playlist) {
  return {
    type: SET_ACTIVE_USER_PLAYLIST,
    payload: playlist,
  }
}

export function createUserPlaylist (playlistName, successMessage) {
  return {
    type: CREATE_NEW_USER_PLAYLIST,
    payload: {
      playlistName,
      successMessage,
    },
  }
}

export function createUserPlaylistAndAttachItem (playlistName, contentId, successMessage) {
  return {
    type: CREATE_NEW_USER_PLAYLIST_AND_ATTACH_ITEM,
    payload: {
      playlistName,
      contentId,
      successMessage,
    },
  }
}

export function createUserPlaylistSuccess () {
  return {
    type: CREATE_NEW_USER_PLAYLIST_SUCCESS,
  }
}

export function setNewUserPlaylistError (error) {
  return {
    type: SET_NEW_USER_PLAYLIST_ERROR,
    payload: error,
  }
}

export function resetNewUserPlaylistError () {
  return {
    type: RESET_NEW_USER_PLAYLIST_ERROR,
  }
}

export function getPlaylistTilesLoadMore (playlistType) {
  return {
    type: GET_USER_PLAYLISTS_TILE_DATA_LOAD_MORE,
    payload: playlistType,
  }
}

export function deleteUserPlaylist (playlistType) {
  return {
    type: DELETE_USER_PLAYLIST,
    payload: playlistType,
  }
}

export function deleteUserPlaylistSuccess () {
  return {
    type: DELETE_USER_PLAYLIST_SUCCESS,
  }
}

export function renameUserPlaylist (playlistType, playlistName, successMessage) {
  return {
    type: RENAME_USER_PLAYLIST,
    payload: {
      playlistType,
      playlistName,
      successMessage,
    },
  }
}

export function renameUserPlaylistSuccess (name, type) {
  return {
    type: RENAME_USER_PLAYLIST_SUCCESS,
    payload: {
      name,
      type,
    },
  }
}

export function setRenameUserPlaylistError (error) {
  return {
    type: SET_RENAME_USER_PLAYLIST_ERROR,
    payload: error,
  }
}

export function resetRenameUserPlaylistError () {
  return {
    type: RESET_RENAME_USER_PLAYLIST_ERROR,
  }
}
