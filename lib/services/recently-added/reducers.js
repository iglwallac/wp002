import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_RECENTLY_ADDED_DATA:
      return state.set('data', fromJS(action.payload.data))
    case actions.RESET_RECENTLY_ADDED_DATA:
      return initialState
    default:
      return state
  }
}
