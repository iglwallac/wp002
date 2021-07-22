import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_VIDEO_PLAYER_META_VISIBLE:
      return state.set('visible', action.payload)
    case actions.TOGGLE_VIDEO_PLAYER_META_MORE_VISIBLE:
      return state.set('moreVisible', !state.get('moreVisible'))
    case actions.SET_VIDEO_PLAYER_META_MORE_VISIBLE:
      return state.set('moreVisible', action.payload)
    case actions.SET_VIDEO_PLAYER_META_AUTO_HIDE:
      return state.set('autoHide', action.payload)
    default:
      return state
  }
}
