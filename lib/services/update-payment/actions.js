import _get from 'lodash/get'
import {
  getPaypalToken,
  updateZuoraPaymentMethod,
} from './index'

export const SET_UPDATE_PAYMENT_ORDER_PROCESSING = 'SET_UPDATE_PAYMENT_ORDER_PROCESSING'
export const SET_UPDATE_PAYMENT_ORDER_DATA = 'SET_UPDATE_PAYMENT_ORDER_DATA'
export const SET_UPDATE_PAYMENT_ORDER_COMPLETE = 'SET_UPDATE_PAYMENT_ORDER_COMPLETE'
export const SET_UPDATE_PAYMENT_ORDER_ERROR = 'SET_UPDATE_PAYMENT_ORDER_ERROR'
export const SET_UPDATE_PAYMENT_PAYPAL_TOKEN = 'SET_UPDATE_PAYMENT_PAYPAL_TOKEN'
export const SET_UPDATE_PAYMENT_PAYPAL_TOKEN_PROCESSING =
  'SET_UPDATE_PAYMENT_PAYPAL_TOKEN_PROCESSING'
export const SET_UPDATE_PAYMENT_PAYPAL_NONCE = 'SET_UPDATE_PAYMENT_PAYPAL_NONCE'
export const SET_UPDATE_PAYMENT_BRAIN_TREE_PROCESSING =
  'SET_UPDATE_PAYMENT_BRAIN_TREE_PROCESSING'
export const SET_UPDATE_PAYMENT_BRAIN_TREE_READY = 'SET_UPDATE_PAYMENT_BRAIN_TREE_READY'
export const SET_UPDATE_PAYMENT_PAYMENT_TYPE = 'SET_UPDATE_PAYMENT_PAYMENT_TYPE'

export function processPaymentMethodUpdate (options) {
  return async function processPaymentMethodUpdateThunk (dispatch) {
    dispatch(setUpdatePaymentOrderProcessing(true))
    try {
      const update = await updateZuoraPaymentMethod(options)
      if (_get(update, 'success')) {
        dispatch(setUpdatePaymentOrderData(update))
      } else {
        dispatch(setUpdatePaymentOrderError(true))
      }
    } catch (e) {
      dispatch(setUpdatePaymentOrderError(true))
      throw e
    }
  }
}

export function getUpdatePaymentPayPalCredentials () {
  return async function getUpdatePaymentPayPalCredentialsThunk (dispatch) {
    try {
      dispatch(setUpdatePaymentPaypalTokenProcessing(true))
      const res = await getPaypalToken()
      dispatch(setUpdatePaymentPaypalToken(res.token))
    } catch (e) {
      dispatch(setUpdatePaymentPaypalTokenProcessing(false))
    }
  }
}

export function setUpdatePaymentOrderError (data) {
  return {
    type: SET_UPDATE_PAYMENT_ORDER_ERROR,
    payload: data,
  }
}

export function setUpdatePaymentOrderData (data) {
  return {
    type: SET_UPDATE_PAYMENT_ORDER_DATA,
    payload: data,
  }
}

export function setUpdatePaymentOrderProcessing (data) {
  return {
    type: SET_UPDATE_PAYMENT_ORDER_PROCESSING,
    payload: data,
  }
}

export function setUpdatePaymentOrderComplete (data) {
  return {
    type: SET_UPDATE_PAYMENT_ORDER_COMPLETE,
    payload: data,
  }
}

export function setUpdatePaymentPaypalTokenProcessing (value) {
  return {
    type: SET_UPDATE_PAYMENT_PAYPAL_TOKEN_PROCESSING,
    payload: value,
  }
}

export function setUpdatePaymentPaypalToken (data) {
  return {
    type: SET_UPDATE_PAYMENT_PAYPAL_TOKEN,
    payload: data,
  }
}

export function setUpdatePaymentPayPalNonce (data) {
  return {
    type: SET_UPDATE_PAYMENT_PAYPAL_NONCE,
    payload: data,
  }
}

export function setUpdatePaymentBrainTreeProcessing (value) {
  return {
    type: SET_UPDATE_PAYMENT_BRAIN_TREE_PROCESSING,
    payload: value,
  }
}

export function setUpdatePaymentBrainTreeReady (ready, processing = false) {
  return {
    type: SET_UPDATE_PAYMENT_BRAIN_TREE_READY,
    payload: { ready, processing },
  }
}

export function setUpdatePaymentPaymentType (value) {
  return {
    type: SET_UPDATE_PAYMENT_PAYMENT_TYPE,
    payload: value,
  }
}
