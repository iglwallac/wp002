import _get from 'lodash/get'
import {
  createOrder,
  createRenewOrder,
  getPaypalToken,
  captureEmail,
  CHECKOUT_ORDER_ERROR_TYPE_UNKNOWN,
} from './index'

export const SET_CHECKOUT_ACCOUNT_VALID = 'SET_CHECKOUT_ACCOUNT_VALID'
export const SET_CHECKOUT_USER_DATA = 'SET_CHECKOUT_USER_DATA'
export const SET_CHECKOUT_ORDER_PROCESSING = 'SET_CHECKOUT_ORDER_PROCESSING'
export const SET_CHECKOUT_ORDER_DATA = 'SET_CHECKOUT_ORDER_DATA'
export const SET_CHECKOUT_ORDER_COMPLETE = 'SET_CHECKOUT_ORDER_COMPLETE'
export const SET_CHECKOUT_ORDER_ERROR = 'SET_CHECKOUT_ORDER_ERROR'
export const SET_CHECKOUT_PAYPAL_TOKEN = 'SET_CHECKOUT_PAYPAL_TOKEN'
export const SET_CHECKOUT_EMAIL_CAPTURE_STATUS =
  'SET_CHECKOUT_EMAIL_CAPTURE_STATUS'
export const RESET_CHECKOUT_EMAIL_CAPTURE_STATUS =
  'RESET_CHECKOUT_EMAIL_CAPTURE_STATUS'
export const SET_CHECKOUT_PAYPAL_TOKEN_PROCESSING =
  'SET_CHECKOUT_PAYPAL_TOKEN_PROCESSING'
export const SET_CHECKOUT_PAYPAL_NONCE = 'SET_CHECKOUT_PAYPAL_NONCE'
export const SET_CHECKOUT_BRAIN_TREE_PROCESSING =
  'SET_CHECKOUT_BRAIN_TREE_PROCESSING'
export const SET_CHECKOUT_BRAIN_TREE_READY = 'SET_CHECKOUT_BRAIN_TREE_READY'
export const SET_CHECKOUT_STEP = 'SET_CHECKOUT_STEP'
export const SET_CHECKOUT_EVENT_STEP = 'SET_CHECKOUT_EVENT_STEP'
export const RESET_CHECKOUT = 'RESET_CHECKOUT'

export function processCheckoutOrder (options) {
  const { userInfo, paymentInfo, tracking, language } = options
  return async function processCheckoutOrderThunk (dispatch) {
    dispatch(setCheckoutOrderProcessing(true))
    try {
      const order = await createOrder({
        userInfo: userInfo.toJS(),
        paymentInfo,
        tracking,
        language,
      })
      const orderErrorCode = _get(order, 'errorCode') ? _get(order, 'errorCode') : CHECKOUT_ORDER_ERROR_TYPE_UNKNOWN
      if (_get(order, 'success')) {
        dispatch(setCheckoutOrderData(order))
      } else {
        dispatch(setCheckoutOrderError(orderErrorCode))
      }
    } catch (e) {
      dispatch(setCheckoutOrderError(CHECKOUT_ORDER_ERROR_TYPE_UNKNOWN))
      throw e
    }
  }
}

export function processRenewOrder (options) {
  const { paymentInfo, auth, startDateOverrideInfo } = options
  return async function processRenewOrderThunk (dispatch) {
    dispatch(setCheckoutOrderProcessing(true))
    try {
      const order = await createRenewOrder({
        paymentInfo,
        auth,
        startDateOverrideInfo,
      })
      const orderErrorCode = _get(order, 'errorCode') ? _get(order, 'errorCode') : CHECKOUT_ORDER_ERROR_TYPE_UNKNOWN
      if (_get(order, 'success')) {
        dispatch(setCheckoutOrderData(order))
      } else {
        dispatch(setCheckoutOrderError(orderErrorCode))
      }
    } catch (e) {
      dispatch(setCheckoutOrderError(CHECKOUT_ORDER_ERROR_TYPE_UNKNOWN))
      throw e
    }
  }
}

export function captureCheckoutEmail (options) {
  return async function captureCheckoutEmailThunk (dispatch) {
    try {
      const res = await captureEmail(options)
      const { success, errorCode } = res
      dispatch(setCheckoutEmailCaptureStatus(success, errorCode))
    } catch (e) {
      dispatch(setCheckoutEmailCaptureStatus(false, null))
    }
  }
}

export function getCheckoutPayPalCredentials () {
  return async function getCheckoutPayPalCredentialsThunk (dispatch) {
    try {
      dispatch(setCheckoutPaypalTokenProcessing(true))
      const res = await getPaypalToken()
      dispatch(setCheckoutPaypalToken(res.token))
    } catch (e) {
      dispatch(setCheckoutPaypalTokenProcessing(false))
    }
  }
}

export function setCheckoutAccountValid (value) {
  return {
    type: SET_CHECKOUT_ACCOUNT_VALID,
    payload: value,
  }
}

export function setCheckoutOrderError (data) {
  return {
    type: SET_CHECKOUT_ORDER_ERROR,
    payload: data,
  }
}

export function setCheckoutUserData (data) {
  return {
    type: SET_CHECKOUT_USER_DATA,
    payload: data,
  }
}

export function setCheckoutOrderData (data) {
  return {
    type: SET_CHECKOUT_ORDER_DATA,
    payload: data,
  }
}

export function setCheckoutOrderProcessing (data) {
  return {
    type: SET_CHECKOUT_ORDER_PROCESSING,
    payload: data,
  }
}

export function setCheckoutOrderComplete (data) {
  return {
    type: SET_CHECKOUT_ORDER_COMPLETE,
    payload: data,
  }
}

export function setCheckoutPaypalTokenProcessing (value) {
  return {
    type: SET_CHECKOUT_PAYPAL_TOKEN_PROCESSING,
    payload: value,
  }
}

export function setCheckoutPaypalToken (data) {
  return {
    type: SET_CHECKOUT_PAYPAL_TOKEN,
    payload: data,
  }
}

export function setCheckoutPayPalNonce (data) {
  return {
    type: SET_CHECKOUT_PAYPAL_NONCE,
    payload: data,
  }
}

export function setCheckoutBrainTreeProcessing (value) {
  return {
    type: SET_CHECKOUT_BRAIN_TREE_PROCESSING,
    payload: value,
  }
}

export function setCheckoutBrainTreeReady (ready, processing = false) {
  return {
    type: SET_CHECKOUT_BRAIN_TREE_READY,
    payload: { ready, processing },
  }
}

export function setCheckoutEmailCaptureStatus (status, errorCode) {
  return {
    type: SET_CHECKOUT_EMAIL_CAPTURE_STATUS,
    payload: { status, errorCode },
  }
}

export function resetCheckoutEmailCaptureStatus () {
  return {
    type: RESET_CHECKOUT_EMAIL_CAPTURE_STATUS,
  }
}

export function setCheckoutStep (value) {
  return {
    type: SET_CHECKOUT_STEP,
    payload: value,
  }
}

export function setCheckoutEventStep (value) {
  return {
    type: SET_CHECKOUT_EVENT_STEP,
    payload: value,
  }
}

export function resetCheckout () {
  return {
    type: RESET_CHECKOUT,
  }
}
