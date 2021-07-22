import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_OFFLINE_MEDIA:
      return state.set('data', fromJS(action.payload.data))
    default:
      return state
  }
}
