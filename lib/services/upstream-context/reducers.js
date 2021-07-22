import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

/**
 * This reducer sets position data for video tiles on a given page
 * - When users click on tile/banner links, we want to track the position
 *   of the tile/banner that the video/series was promoted in
 */
export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_UPSTREAM_CONTEXT:
      return state.set('data', action.payload)
    case actions.CLEAR_UPSTREAM_CONTEXT:
      return initialState
    default:
      return state
  }
}
