import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    //
    case actions.SET_ONBOARDING_PROCESSING:
      return state.set('processing', action.payload)

    case actions.SET_ONBOARDING_CHOICES:
      return state.withMutations(mutateState => mutateState
        .set('choiceData', fromJS(action.payload.choices))
        .set('initialized', action.payload.initialized)
        .set('processing', action.payload.processing))

    case actions.SET_ONBOARDING_SELECTION:
      return state.set('selection', action.payload.selection)

    case actions.SET_V5_ONBOARDING_DATA:
      return state.set('v5Data', action.payload)

    case actions.SET_V5_ONBOARDING_DATA_ERROR:
      return state.set('error', action.payload)

    case actions.SET_V14_ONBOARDING_DATA:
      return state.set('v14Data', action.payload)

    case actions.SET_SELECTED_USER_CHOICES:
      return state.set('userSelection', action.payload)

    case actions.SET_V14_SELECTED_USER_CHOICES_CLEAR:
      return state.set('v14DataSelectedChoicesEditCompleted', false)

    case actions.SET_V14_SELECTED_USER_CHOICES_COMPLETED:
      return state.set('v14DataSelectedChoicesEditCompleted', true)

    case actions.SET_V14_ONBOARDING_DATA_ERROR:
      return state.set('error', action.payload)

    case actions.INCREMENT_ONBOARDING_RECOMMENDER_STATUS_ATTEMPTS:
      return state
        .update('recommenderAttempts', recommenderAttempts => (recommenderAttempts || 0) + 1)

    case actions.SET_ONBOARDING_RECOMMENDER_STATUS_COMPLETE:
      return state
        .set('recommenderComplete', action.payload.complete)
        .set('recommenderAttempts', action.payload.attempts)

    case actions.SET_ONBOARDING_CHOICE_PROCESSED:
      return state.setIn(['choiceData', 'choiceProcessed'], action.payload)

    case actions.SET_ONBOARDING_COMPLETED:
      return state.withMutations(mutateState => mutateState
        .set('completed', action.payload.completed)
        .set('processing', action.payload.processing)
        .set('onboardVersion', action.payload.onboardVersion))

    case actions.SET_RECOMMENDER_STATUS:
      return state.set('recommenderReady', action.payload)

    case actions.RESET_ONBOARDING:
      return initialState

    default:
      return state
  }
}
