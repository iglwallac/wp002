import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_TILE_ROWS_ACTIVE_ID:
      return state.setIn(
        [action.payload.storeKey, 'activeId'],
        action.payload.activeId,
      )
    case actions.SET_TILE_ROWS_ROW_ACTIVE_ID:
      return state.setIn(
        [action.payload.storeKey, 'rowActiveId'],
        action.payload.rowActiveId,
      )
    case actions.RESET_TILE_ROWS_ACTIVE_ID:
      return state.deleteIn([action.payload.storeKey, 'activeId'])
    case actions.RESET_TILE_ROWS_ROW_ACTIVE_ID:
      return state.deleteIn([action.payload.storeKey, 'rowActiveId'])
    case actions.RESET_TILE_ROWS_ACTIVE_ROW:
      return state.withMutations(mutateState => mutateState
        .deleteIn([action.payload.storeKey, 'activeId'])
        .deleteIn([action.payload.storeKey, 'rowActiveId']))
    default:
      return state
  }
}
