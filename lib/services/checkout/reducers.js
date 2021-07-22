import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_CHECKOUT_ACCOUNT_VALID:
      return state.set('accountValid', action.payload)
    case actions.SET_CHECKOUT_USER_DATA:
      return state.set('account', fromJS(action.payload))
    case actions.SET_CHECKOUT_USER_VALID:
      return state.set('userValid', action.payload)
    case actions.SET_CHECKOUT_PAYPAL_TOKEN_PROCESSING:
      return state.set('paypalTokenProcessing', action.payload)
    case actions.SET_CHECKOUT_PAYPAL_TOKEN:
      return state.withMutations(mutateState => mutateState
        .set('paypalToken', action.payload)
        .delete('paypalTokenProcessing'))
    case actions.SET_CHECKOUT_PAYPAL_NONCE:
      return state.withMutations((mutateState) => {
        // We are deleting the paypal data so reset the information.
        if (!action.payload) {
          return mutateState
            .delete('paymentType')
            .delete('paypalPaymentInfo')
            .set('billingValid', false)
        }
        return mutateState
          .set('paymentType', 'paypal')
          .set('paypalPaymentInfo', fromJS(action.payload))
          .set('billingValid', true)
      })
    case actions.SET_CHECKOUT_BRAIN_TREE_PROCESSING:
      return state.set('brianTreeProcessing', action.payload)
    case actions.SET_CHECKOUT_BRAIN_TREE_READY:
      return state.withMutations(mutateState => mutateState
        .set('brianTreeReady', action.payload.ready)
        .set('brianTreeProcessing', action.payload.processing))
    case actions.SET_CHECKOUT_ORDER_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_CHECKOUT_ORDER_ERROR:
      return state.withMutations(mutateState => mutateState
        .set('orderError', action.payload)
        .delete('processing'))
    case actions.SET_CHECKOUT_ORDER_DATA:
      return state.set('orderData', fromJS(action.payload))
    case actions.SET_CHECKOUT_ORDER_COMPLETE:
      return state.withMutations(mutateState => (mutateState
        .set('orderComplete', action.payload)
        // Clean up
        .delete('paymentType')
        .delete('paypalPaymentInfo')
        .delete('brianTreeProcessing')
        .delete('brianTreeReady')
        .delete('account')
        .delete('billing')
        .delete('billingValid')
        .delete('accountValid')))
    case actions.SET_CHECKOUT_EMAIL_CAPTURE_STATUS:
      return state.withMutations(mutateState => mutateState
        .set('emailCaptureSuccess', action.payload.status)
        .set('emailCaptureErrorCode', action.payload.errorCode))
    case actions.RESET_CHECKOUT_EMAIL_CAPTURE_STATUS:
      return state.withMutations(mutateState => mutateState
        .delete('emailCaptureSuccess')
        .delete('emailCaptureErrorCode'))
    case actions.SET_CHECKOUT_STEP:
      return state.set('step', action.payload)
    case actions.SET_CHECKOUT_EVENT_STEP:
      return state.set('eventStep', action.payload)
    case actions.RESET_CHECKOUT:
      return state.withMutations(mutateState => (mutateState
        .delete('step')
        .delete('eventStep')
        .delete('orderComplete')
        .delete('processing')
        .delete('paymentType')
        .delete('paypalPaymentInfo')
        .delete('brianTreeProcessing')
        .delete('brianTreeReady')
        .delete('account')
        .delete('billing')
        .delete('billingValid')
        .delete('orderError')
        .delete('orderData')
        .delete('accountValid')))
    default:
      return state
  }
}
