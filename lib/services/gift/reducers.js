import { Map, List, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  /* eslint-disable no-param-reassign */
  switch (action.type) {
    case actions.SET_GIFT_CHEKOUT_STEP:
      return state
        .setIn(['step', 'active'], action.payload)
    case actions.SET_GIFT_CHEKOUT_STEP_COMPLETE:
      return state.withMutations(mutateState => mutateState
        .updateIn(['step', 'complete'], List(), (
          steps,
        ) => {
          // Find matching records
          const index = steps.findIndex(
            val => val === action.payload,
          )
          // Remove any matching records
          if (index !== -1) {
            steps = steps.delete(index)
          }

          // push step onto the completed stack
          steps = steps.push(action.payload)

          return steps.sort()
        }),
      )
    case actions.SET_GIFT_CHECKOUT_THEME:
      return state
        .setIn(['theme', 'selected'], action.payload)
    case actions.SET_GIFT_CHECKOUT_GIVER_DATA_ITEM:
      return state
        .setIn(['checkout', 'data', 'giver', action.payload.key], action.payload.value)
    case actions.SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM:
      return state
        .setIn(['checkout', 'data', 'recipient', action.payload.key], action.payload.value)
    case actions.SET_GIFT_CHECKOUT_RECIPIENT_DATE_ERROR:
      return state
        .setIn(['checkout', 'data', 'recipient', 'dateError'], action.payload)
    case actions.SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING:
      return state.set('subscriptionStatusProcessing', action.payload)
    case actions.SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_DATA:
      return state
        .setIn(['checkout', 'data', 'recipient', 'subscriptionStatus'], fromJS(action.payload.data))
        .set('subscriptionStatusProcessing', action.payload.processing)
    case actions.SET_GIFT_CHECKOUT_GIVER_PAYMENT_TYPE:
      return state
        .setIn(['checkout', 'data', 'paymentType'], action.payload)
    default:
      return state
  }
  /* eslint-enable no-param-reassign */
}
