import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING:
      return state
        .set('iframeSignatureTokenProcessing', action.payload)
    case actions.SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA:
      return state
        .setIn(['data', 'iframe', 'rsa'], fromJS(action.payload.data))
        .set('iframeSignatureTokenProcessing', action.payload.processing)
    case actions.SET_ZUORA_IFRAME_SCRIPT_LOADED:
      return state
        .setIn(['data', 'iframe', 'scriptLoaded'], action.payload)
    case actions.SET_ZUORA_IFRAME_CLIENT_READY:
      return state
        .setIn(['data', 'iframe', 'clientReady'], action.payload)
    case actions.SET_ZUORA_PAYMENT_TOKEN_PROCESSING:
      return state
        .set('iframePaymentTokenProcessing', action.payload)
    case actions.SET_ZUORA_PAYMENT_TOKEN_DATA:
      return state.updateIn(['data', 'paymentToken'], Map(), (value) => {
        return value.merge(fromJS({
          success: true,
          data: action.payload,
          error: null,
        }))
      })
    case actions.SET_ZUORA_PAYMENT_TOKEN_ERROR:
      return state.updateIn(['data', 'paymentToken'], Map(), (value) => {
        return value.merge(fromJS({
          success: false,
          data: {},
          error: action.payload,
        }))
      })
    case actions.SET_ZUORA_IFRAME_CAPTCHA_VALID:
      return state
        .setIn(['data', 'captcha', 'valid'], action.payload)
    case actions.SET_ZUORA_IFRAME_RENDER_COMPLETE:
      return state
        .setIn(['data', 'iframe', 'renderComplete'], action.payload)
    case actions.RESET_ZUORA_DATA:
      return state
        .delete('data')
        .delete('iframeSignatureTokenProcessing')
    default:
      return state
  }
}
