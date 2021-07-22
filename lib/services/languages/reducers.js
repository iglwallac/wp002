import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_LANGUAGES:
      return state.set('data', action.payload.data)
    default:
      return state
  }
}
