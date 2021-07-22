import { Map, fromJS, List } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_USER_ACCOUNT_PAUSE:
      return state
        .setIn(['manageSubscription', 'data', 'accountPauseProcessing'], false)
        .setIn(['manageSubscription', 'data'], fromJS(action.payload))
    case actions.RESET_USER_ACCOUNT_PAUSE_ERRORS:
      return state
        .deleteIn(['manageSubscription', 'data', 'errors'])
    case actions.UPDATE_USER_ACCOUNT_PAUSE:
      return state
        .setIn(['manageSubscription', 'data', 'accountPauseProcessing'], true)
    case actions.UPDATE_USER_ACCOUNT_RESUME:
      return state
        .setIn(['manageSubscription', 'data', 'accountResumeProcessing'], true)
    case actions.SET_USER_ACCOUNT_RESUME:
      return state
        .setIn(['manageSubscription', 'data'], fromJS(action.payload))
    case actions.SET_USER_ACCOUNT_CANCEL_REASON:
      return state
        .setIn(['manageSubscription', 'data', 'cancelReason'], action.payload)
    case actions.SET_USER_ACCOUNT_SUBSCRIPTION_MANAGE_TYPE:
      return state
        .setIn(['manageSubscription', 'data', 'type'], action.payload)
    case actions.SET_USER_ACCOUNT_CANCEL_FORM_DATA:
      return state
        .setIn(['manageSubscription', 'data', 'formData'], fromJS(action.payload))
    case actions.RESET_USER_ACCOUNT_CANCEL_FORM_DATA:
      return state
        .deleteIn(['manageSubscription', 'data', 'formData'])
    case actions.RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA:
      return state
        .deleteIn(['manageSubscription', 'data'])
    case actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING:
      return state.setIn(['manageSubscription', 'data', 'cancelConfirmProcessing'], action.payload)
    case actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA:
      return state.withMutations(mutateState => mutateState
        .setIn(
          ['manageSubscription', 'data', 'cancelConfirmData'],
          fromJS(action.payload.data),
        )
        .setIn(['manageSubscription', 'data', 'cancelConfirmProcessing'], action.payload.processing))
    case actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_ANSWER:
      return state
        .setIn(['manageSubscription', 'data', 'cancelConfirmAnswer'], fromJS(action.payload))
    case actions.SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING:
      return state.set('billingSubscriptionsProcessing', action.payload)
    case actions.SET_USER_ACCOUNT_PAUSE_LENGTH:
      return state.setIn(['manageSubscription', 'data', 'pauseLength'], action.payload)
    case actions.SET_USER_ACCOUNT_PAUSE_DATA:
      return state
        .setIn(['manageSubscription', 'data'], fromJS(action.payload))
    case actions.SET_USER_ACCOUNT_PAUSE_FORM_DATA:
      return state
        .setIn(['manageSubscription', 'data', 'formData'], fromJS(action.payload))
    case actions.SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS:
      return state.withMutations(mutateState => mutateState
        .setIn(
          ['data', 'billing', 'subscriptions'],
          action.payload.data.get('subscriptions', List()),
        )
        .set('billingSubscriptionsProcessing', action.payload.processing))

    case actions.SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS:
      return state.withMutations(mutateState => mutateState
        .setIn(
          ['details', 'data', 'billing', 'subscriptions'],
          action.payload.data.get('subscriptions', List()),
        )
        .set('billingSubscriptionsProcessing', action.payload.processing))
    case actions.CHANGE_USER_ACCOUNT_CHANGE_PLAN_TYPE_PROCESSING:
      return state.set('billingSubscriptionsProcessing', action.payload)
    case actions.CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA:
      return state.withMutations(mutateState => mutateState
        .setIn(
          ['data', 'billing', 'planChange'],
          action.payload,
        )
        .set('billingSubscriptionsProcessing', action.payload.processing))
    case actions.RESET_ACCOUNT_CHANGE_PLAN_DATA:
      return state
        .deleteIn(['data', 'billing', 'planChange'])
    case actions.CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS:
      return state
        .deleteIn(['details'])
    case actions.SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING:
      return state.set('billingSubscriptionPaymentsProcessing', action.payload)
    case actions.SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA:
      return state.updateIn(['details', 'data', 'billing'], Map(), payments => (
        payments.set('payments', fromJS(action.payload.data))
      )).set('billingSubscriptionPaymentsProcessing', action.payload.processing)
    case actions.UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN:
      return state
        .setIn(['manageSubscription', 'data', 'offerShown'], action.payload)
    default:
      return state
  }
}
