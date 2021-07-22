import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.RESET_FORM_SUBMISSIONS_DATA:
      return state.delete('data')
    case actions.SET_FORM_SUBMISSIONS_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_FORM_SUBMISSIONS_CONFIRMED_DATA:
      return state.withMutations(mutateState => mutateState
        .set('data', fromJS(action.payload.data))
        .set('processing', action.payload.processing))
    default:
      return state
  }
}
