import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.RESET_PLANS_DATA:
      return initialState
    case actions.SET_PLANS_LOCALIZED_PROCESSING:
      return state.set('processingLocalized', action.payload)
    case actions.SET_PLANS_DATA:
      return state.withMutations(mutateState => mutateState
        .set('data', fromJS(action.payload.data))
        .set('processing', action.payload.processing))
    case actions.SET_PLANS_ERROR:
      return state.withMutations(mutateState => mutateState
        .set('planError', action.payload.error)
        .set('processingLocalized', action.payload.processing))
    case actions.SET_PLANS_SELECTION:
      return state.withMutations(mutateState => mutateState
        .set('selection', fromJS(action.payload.data))
        .set('processingLocalized', action.payload.processing)
        .delete('planError'))
    case actions.SET_PLANS_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_PLAN_CHANGE_SELECTED:
      return state.setIn(['changePlanData', 'selectedPlan'], fromJS(action.payload))
    default:
      return state
  }
}
