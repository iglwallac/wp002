import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_UPDATE_PAYMENT_PAYPAL_TOKEN_PROCESSING:
      return state.set('paypalTokenProcessing', action.payload)
    case actions.SET_UPDATE_PAYMENT_PAYPAL_TOKEN:
      return state.withMutations(mutateState => mutateState
        .set('paypalToken', action.payload)
        .delete('paypalTokenProcessing'))
    case actions.SET_UPDATE_PAYMENT_PAYMENT_TYPE:
      return state.set('paymentType', action.payload)
    case actions.SET_UPDATE_PAYMENT_PAYPAL_NONCE:
      return state.withMutations((mutateState) => {
        // We are deleting the paypal data so reset the information.
        if (!action.payload) {
          return mutateState
            .delete('paymentType')
            .delete('paypalPaymentInfo')
        }
        return mutateState
          .set('paymentType', 'paypal')
          .set('paypalPaymentInfo', fromJS(action.payload))
      })

    case actions.SET_UPDATE_PAYMENT_BRAIN_TREE_PROCESSING:
      return state.set('brianTreeProcessing', action.payload)
    case actions.SET_UPDATE_PAYMENT_BRAIN_TREE_READY:
      return state.withMutations(mutateState => mutateState
        .set('brianTreeReady', action.payload.ready)
        .set('brianTreeProcessing', action.payload.processing))
    case actions.SET_UPDATE_PAYMENT_ORDER_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_UPDATE_PAYMENT_ORDER_ERROR:
      return state.withMutations(mutateState => mutateState
        .set('orderError', action.payload)
        .delete('processing'))
    case actions.SET_UPDATE_PAYMENT_ORDER_DATA:
      return state.set('orderData', fromJS(action.payload))
    case actions.SET_UPDATE_PAYMENT_ORDER_COMPLETE:
      return state.withMutations(mutateState => (mutateState
        .set('orderComplete', action.payload)
        // Clean up
        .delete('paymentType')
        .delete('paypalPaymentInfo')
        .delete('brianTreeProcessing')
        .delete('brianTreeReady')
        .delete('paypalToken')
        .delete('orderData')
        .delete('orderError')
      ))
    default:
      return state
  }
}
