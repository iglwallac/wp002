import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_PAYTRACK_DATA_PROCESSING:
      return state.set('processing', action.processing)
    case actions.SET_PAYTRACK_DATA_LAST_TRANSACTION:
      return state
        .set('lastTransaction', action.payload.get('lastTransaction', {}))
        .set('processing', false)
    default:
      return state
  }
}
