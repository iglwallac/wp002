import { Map, List, fromJS } from 'immutable'
import { PLAYLIST_EDIT_COMPLETE } from 'services/playlist'
import * as actions from './actions'

function setQueueItem (state, action) {
  return state.withMutations(_state => _state.updateIn(
    [action.storeKey, 'queue'],
    List(),
    queue => queue.update(
      action.payload.index,
      Map(),
      item => (Map.isMap(item) ? item : Map())
        .set('id', action.payload.id)
        .set('playlist', action.payload.playlist),
    ),
  ))
}

function playlistSetItem (state, action) {
  const { payload } = action
  const { contentId, componentId, error, data } = payload
  const componentKey = ['items', contentId, 'components']

  if (error) {
    return state.setIn(
      ['items', contentId, 'error'], true)
  }

  const components = state.getIn(componentKey, List())
  const existing = components.find(id => id === componentId)
  const updated = existing ? components : components.push(componentId)
  const nextState = state.setIn(componentKey, updated)

  if (data) {
    return nextState.setIn(
      ['items', contentId, 'data'], fromJS(data))
      .setIn(
        ['items', contentId, 'error'], undefined)
  }
  return nextState
}

function playlistRemoveItem (state, action) {
  const { payload } = action
  const { contentId, componentId } = payload
  const key = ['items', contentId, 'components']
  const existing = state.getIn(key, List())
  const updated = existing.filter(id => id !== componentId)
  if (updated.size > 0) {
    return state.setIn(key, updated)
  }
  return state.deleteIn(['items', contentId])
}

function playlistUpdatedItem (state, action) {
  const { payload } = action
  const { contentId, error, type, add } = payload

  if (error) {
    return state.setIn(
      ['items', contentId, 'error'], true)
  }

  const playlists = state.getIn(
    ['items', contentId, 'data', 'playlists'], List())

  const updated = add
    ? playlists.push(Map({ playlistType: type }))
    : playlists.filter(pl => pl.get('playlistType') !== type)

  return state.setIn(['items', contentId, 'data'], Map({
    inPlaylist: updated.size > 0,
    playlists: updated,
  }))
}

function playlistReorderedItem (state, action) {
  const { payload } = action
  const { contentId, error, type, add } = payload

  if (error) {
    return state.setIn(
      ['items', contentId, 'error'], true)
  }

  const playlists = state.getIn(
    ['items', contentId, 'data', 'playlists'], List())

  const updated = add
    ? playlists.push(Map({ playlistType: type }))
    : playlists.filter(pl => pl.get('playlistType') !== type)

  return state.setIn(['items', contentId, 'data'], Map({
    inPlaylist: updated.size > 0,
    playlists: updated,
  }))
}

/**
 * Filter the payload.playlists to just the custom playlists (user-*)
 *
 * @param {object} state
 * @param {object} action
 */
function userMultiplePlaylists (state, action) {
  const { payload } = action
  const playlistItems = payload ? fromJS(payload.playlists) : List()
  let customPlaylists = List()

  if (playlistItems.size) {
    customPlaylists = playlistItems
      .filter(pl => pl.get('type').startsWith('user-'))
      .sort((pl, nextPl) =>
        pl.get('name', '').localeCompare(nextPl.get('name', '')),
      )
  }

  return state
    .setIn(['userPlaylists', 'data'], customPlaylists)
    .setIn(['userPlaylists', 'processing'], false)
}

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    // ------------------------
    // NEW reducers
    // ------------------------
    case actions.PLAYLIST_SET_ITEM:
      return playlistSetItem(state, action)
    case actions.PLAYLIST_REMOVE_ITEM:
      return playlistRemoveItem(state, action)
    case actions.PLAYLIST_UPDATED_ITEM:
      return playlistUpdatedItem(state, action)
    case actions.PLAYLIST_REORDERED_ITEM:
      return playlistReorderedItem(state, action)
    // ----------------------------
    // OLD reducers for PlaylistPage
    // -----------------------------
    case actions.SET_PLAYLIST_HEADER_STICKY:
      return state.setIn([action.storeKey, 'headerSticky'], action.payload)
    case actions.SET_PLAYLIST_EDIT_MODE:
      return state.setIn([action.storeKey, 'editMode'], action.payload)
    case actions.TOGGLE_PLAYLIST_EDIT_MODE:
      return state.setIn(
        [action.storeKey, 'editMode'],
        !state.getIn([action.storeKey, 'editMode'], false),
      )
    case actions.SET_PLAYLIST_QUEUE_ITEM:
      return setQueueItem(state, action)
    case actions.SET_PLAYLIST_PROCESSING:
      return state.setIn([action.storeKey, 'processing'], action.payload)
    case actions.DELETE_PLAYLIST_QUEUE:
      return state.deleteIn([action.storeKey, 'queue'])
    case actions.SET_PLAYLIST_EDIT_LOCAL_COMPLETE:
      return state.setIn(
        [action.storeKey, PLAYLIST_EDIT_COMPLETE],
        action.payload,
      )
    case actions.PLAYLIST_ADD_STATUS:
      return state.setIn([action.storekey, actions.PLAYLIST_STATUS_KEY], action.payload)
    case actions.SET_USER_PLAYLISTS_PROCESSING:
      return state.setIn(['userPlaylists', 'processing'], action.payload)
    case actions.SET_USER_PLAYLISTS:
      return userMultiplePlaylists(state, action)
    case actions.RESET_USER_PLAYLISTS:
      return state.deleteIn(['userPlaylists', 'data'])
        .deleteIn(['userPlaylists', 'activePlaylist'])
    case actions.SET_ACTIVE_USER_PLAYLIST:
      return state.setIn(['userPlaylists', 'activePlaylist'], fromJS(action.payload))
    case actions.CREATE_NEW_USER_PLAYLIST:
      return state.setIn(['userPlaylists', 'new', 'processing'], true)
        .setIn(['userPlaylists', 'new', 'error'], null)
    case actions.CREATE_NEW_USER_PLAYLIST_SUCCESS:
      return state.setIn(['userPlaylists', 'new', 'processing'], false)
    case actions.SET_NEW_USER_PLAYLIST_ERROR:
      return state.setIn(['userPlaylists', 'new', 'processing'], false)
        .setIn(['userPlaylists', 'new', 'error'], action.payload)
    case actions.RESET_NEW_USER_PLAYLIST_ERROR:
      return state.removeIn(['userPlaylists', 'new', 'error'])
    case actions.RENAME_USER_PLAYLIST:
      return state.setIn(['userPlaylists', 'rename', 'processing'], true)
        .setIn(['userPlaylists', 'rename', 'error'], null)
    case actions.RENAME_USER_PLAYLIST_SUCCESS:
      return state.setIn(['userPlaylists', 'rename', 'processing'], false)
        .setIn(['userPlaylists', 'activePlaylist'], fromJS(action.payload))
    case actions.SET_RENAME_USER_PLAYLIST_ERROR:
      return state.setIn(['userPlaylists', 'rename', 'processing'], false)
        .setIn(['userPlaylists', 'rename', 'error'], action.payload)
    case actions.RESET_RENAME_USER_PLAYLIST_ERROR:
      return state.removeIn(['userPlaylists', 'rename', 'error'])
    default:
      return state
  }
}
