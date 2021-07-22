import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function subscriptionReducer (state = initialState, action) {
  switch (action.type) {
    case actions.COMP_USER_SUBSCRIPTION_PROCESSING:
      return state.set('processing', action.processing)
    case actions.COMP_USER_SUBSCRIPTION_DATA:
      return state
        .set('success', action.payload.success)
        .set('processing', false)
        .set('compId', action.payload.compId)
    case actions.COMP_USER_SUBSCRIPTION_ERROR:
      return state
        .set('errors', action.errors)
        .set('processing', false)
    case actions.RESET_USER_COMP:
      return state
        .delete('success')
        .delete('processing')
        .delete('compId')
        .delete('errors')
    default:
      return state
  }
}
