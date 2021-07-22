export const GET_ZUORA_IFRAME_SIGNATURE_TOKEN = 'GET_ZUORA_IFRAME_SIGNATURE_TOKEN'
export const SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING = 'SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING'
export const SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA = 'SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA'
export const SET_ZUORA_IFRAME_SCRIPT_LOADED = 'SET_ZUORA_IFRAME_SCRIPT_LOADED'
export const SET_ZUORA_IFRAME_CLIENT_READY = 'SET_ZUORA_IFRAME_CLIENT_READY'
export const SET_ZUORA_PAYMENT_TOKEN_PROCESSING = 'SET_ZUORA_PAYMENT_TOKEN_PROCESSING'
export const SET_ZUORA_PAYMENT_TOKEN_DATA = 'SET_ZUORA_PAYMENT_TOKEN_DATA'
export const SET_ZUORA_PAYMENT_TOKEN_ERROR = 'SET_ZUORA_PAYMENT_TOKEN_ERROR'
export const SET_ZUORA_IFRAME_CAPTCHA_VALID = 'SET_ZUORA_IFRAME_CAPTCHA_VALID'
export const SET_ZUORA_IFRAME_RENDER_COMPLETE = 'SET_ZUORA_IFRAME_RENDER_COMPLETE'
export const RESET_ZUORA_DATA = 'RESET_ZUORA_DATA'

export function getZuoraIframeSignatureToken () {
  return {
    type: GET_ZUORA_IFRAME_SIGNATURE_TOKEN,
  }
}

export function setZuoraIframeSignatureTokenProcessing (value) {
  return {
    type: SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING,
    payload: value,
  }
}

export function setZuoraIframeSignatureTokenData (data, processing = false) {
  return {
    type: SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA,
    payload: { data, processing },
  }
}

export function setZuoraIframeScriptLoaded (value) {
  return {
    type: SET_ZUORA_IFRAME_SCRIPT_LOADED,
    payload: value,
  }
}

export function setZuoraIframeClientReady (value) {
  return {
    type: SET_ZUORA_IFRAME_CLIENT_READY,
    payload: value,
  }
}

export function setZuoraPaymentTokenProcessing (processing) {
  return {
    type: SET_ZUORA_PAYMENT_TOKEN_PROCESSING,
    payload: processing,
  }
}

export function setZuoraPaymentTokenData (data) {
  return {
    type: SET_ZUORA_PAYMENT_TOKEN_DATA,
    payload: data,
  }
}

export function setZuoraPaymentTokenError (error) {
  return {
    type: SET_ZUORA_PAYMENT_TOKEN_ERROR,
    payload: error,
  }
}

export function setZuoraIframeCaptchaValid (valid) {
  return {
    type: SET_ZUORA_IFRAME_CAPTCHA_VALID,
    payload: valid,
  }
}

export function setZuoraIframeRenderComplete (value) {
  return {
    type: SET_ZUORA_IFRAME_RENDER_COMPLETE,
    payload: value,
  }
}

export function resetZuoraData () {
  return {
    type: RESET_ZUORA_DATA,
  }
}
