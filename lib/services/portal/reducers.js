import _assign from 'lodash/assign'
import _get from 'lodash/get'
import { Map, List, fromJS } from 'immutable'
import { createModel as createTileModel } from 'services/tile'
import * as ACTIONS from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    // -----------------------------------
    // Lifecycle
    // -----------------------------------
    case ACTIONS.PORTAL_UNMOUNT: {
      return Map()
    }
    // -----------------------------------
    // General - Data - Resources
    // -----------------------------------
    case ACTIONS.PORTAL_SET_USER_ACCESS: {
      const { payload } = action
      const { allowAccess, isPortalOwner } = payload
      return state.set('allowAccess', allowAccess)
        .set('isPortalOwner', isPortalOwner)
    }
    case ACTIONS.PORTAL_GET_RESOURCES: {
      return state.set('processing', true)
    }
    case ACTIONS.PORTAL_SET_RESOURCES: {
      const { payload } = action
      const { data } = payload
      const nextState = fromJS(data)
      return nextState.set('processing', false)
    }
    // -----------------------------------
    // Editor/Editing
    // -----------------------------------
    case ACTIONS.PORTAL_V2_CREATE_EDITOR:
      return state.set('editor', Map({
        data: state.get('data', Map()),
        processing: false,
        successful: false,
      }))
    case ACTIONS.PORTAL_V2_UPDATE_EDITOR: {
      const { payload } = action
      const { key, value } = payload
      return state.setIn(['editor', 'data', key], value)
    }
    case ACTIONS.PORTAL_V2_REMOVE_EDITOR:
      return state.delete('editor')
    case ACTIONS.PORTAL_V2_APPLY_UPDATES: {
      const { payload } = action
      const { changes, editor, result: { data }, error } = payload
      const changedEditorData = editor.get('data').merge(changes)
      const next = fromJS(data)
      return error
        ? state
        : state.set('data', next)
          .set('editor', Map({
            processing: false,
            successful: true,
            data: changedEditorData,
          }))
    }
    case ACTIONS.PORTAL_V2_UPDATE:
      return state.setIn(['editor', 'processing'], true)
    // -----------------------------------
    // Mode
    // -----------------------------------
    case ACTIONS.PORTAL_V2_SET_MODE:
      return state.set('mode', action.payload)
    case ACTIONS.PORTAL_V2_SET_PREV_MODE:
      return state.set('prevMode', action.payload)
    // -----------------------------------
    // Playlist
    // -----------------------------------
    case ACTIONS.PORTAL_V2_SET_PLAYLIST: {
      const { payload } = action
      const { data } = payload

      const next = fromJS({
        ...data,
        videos: data.videos.map(v => _assign(
          createTileModel(v),
          { playlistPosition: _get(v, 'playlistPosition') },
        ),
        ),
      })

      return state.set('playlists', next)
    }
    case ACTIONS.PORTAL_V2_PL_EDIT_SET_PLAYLIST: {
      const { payload } = action

      const titles = _get(payload, ['data', 'titles'])
        ? _get(payload, ['data', 'titles'], [])
        : _get(payload, ['data', 'videos'], [])

      const data = fromJS({
        ..._get(payload, 'data'),
        titles: titles.map(t => createTileModel(t)),
      })

      return state
        .setIn(['playlistEditor', 'filterType'], _get(payload, 'playlistType'))
        .setIn(['playlistEditor', 'data'], data)
        .setIn(['playlistEditor', 'processing'], false)
        .setIn(['playlistEditor', 'searchTerm'], null)
    }
    case ACTIONS.PORTAL_V2_PL_EDIT_SET_SEARCH: {
      const { payload } = action

      return state
        .setIn(['playlistEditor', 'filterType'], 'search')
        .setIn(['playlistEditor', 'data'], fromJS(payload.data))
        .setIn(['playlistEditor', 'processing'], false)
        .setIn(['playlistEditor', 'searchTerm'], payload.searchTerm)
    }
    case ACTIONS.PORTAL_V2_PL_EDIT_GET_SEARCH:
    case ACTIONS.PORTAL_V2_PL_EDIT_GET_PLAYLIST:
      return state
        .setIn(['playlistEditor', 'processing'], true)
    case ACTIONS.SET_PORTAL_PLAYLIST_DATA:
    case ACTIONS.RESET_PORTAL_PLAYLIST_DATA: {
      const { payload } = action
      const { data } = payload
      return state.withMutations(s => s
        .update('playlists', List(), d => d.merge(data))
        .set('processing', false))
    }
    // -----------------------------------
    // Page Manager
    // -----------------------------------
    case ACTIONS.PORTAL_SET_PM_PLAYLIST: {
      const { payload } = action
      const { data } = payload
      return state.withMutations(s => s
        .set('pmPlaylist', data))
    }
    case ACTIONS.PORTAL_REMOVE_PM_PLAYLIST: {
      return state.withMutations(s => s
        .set('pmPlaylist', Map()))
    }
    case ACTIONS.PORTAL_COMMUNITY_PM_SET: {
      const { payload } = action
      const { data } = payload
      const community = state.get('community', Map()).merge(fromJS(data))
      return state.set('community', community)
    }
    // -----------------------------------
    // Sharing
    // -----------------------------------
    case ACTIONS.PORTAL_SET_SHARE: {
      const { payload } = action
      const { data } = payload
      return state.withMutations(s => s
        .update('share', Map(), d => d.merge(data))
        .set('processing', false))
    }
    // -----------------------------------
    // Profile
    // -----------------------------------
    case ACTIONS.SET_USER_PORTAL_PROFILE_PICTURE: {
      const { payload } = action
      const { data } = payload
      const { profilePicture } = data
      const nextState = state.setIn(['data', 'profilePicture'], profilePicture)
      return nextState
    }
    case ACTIONS.PORTAL_GET_TAG_OPTIONS: {
      return state.withMutations(s => s
        .setIn(['tags', 'processing'], true))
    }
    case ACTIONS.PORTAL_SET_TAG_OPTIONS: {
      const { payload } = action
      const { data } = payload
      return state.withMutations(s => s
        .setIn(['tags', 'userTagsOptions'], fromJS(data)))
        .setIn(['tags', 'processing'], false)
    }
    case ACTIONS.PORTAL_V2_SET_VIEWALL: {
      const { payload } = action
      return state.set('viewAll', payload, Map())
    }
    default:
      return state
  }
}
