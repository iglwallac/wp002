import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING,
  setZuoraIframeSignatureTokenProcessing,
  SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA,
  setZuoraIframeSignatureTokenData,
  SET_ZUORA_IFRAME_SCRIPT_LOADED,
  setZuoraIframeScriptLoaded,
  SET_ZUORA_IFRAME_CLIENT_READY,
  setZuoraIframeClientReady,
  SET_ZUORA_PAYMENT_TOKEN_PROCESSING,
  setZuoraPaymentTokenProcessing,
  SET_ZUORA_PAYMENT_TOKEN_DATA,
  setZuoraPaymentTokenData,
  SET_ZUORA_PAYMENT_TOKEN_ERROR,
  setZuoraPaymentTokenError,
  SET_ZUORA_IFRAME_CAPTCHA_VALID,
  setZuoraIframeCaptchaValid,
  SET_ZUORA_IFRAME_RENDER_COMPLETE,
  setZuoraIframeRenderComplete,
} from './actions'

describe('services zuora actions', () => {
  describe('Function: setZuoraIframeSignatureTokenProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING,
        payload: processing,
      }
      assert.deepEqual(
        action,
        setZuoraIframeSignatureTokenProcessing(processing),
      )
    })
  })
  describe('Function: setZuoraIframeSignatureTokenData()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setZuoraIframeSignatureTokenData(data, processing),
      )
    })
  })
  describe('Function: setZuoraIframeScriptLoaded()', () => {
    it('should create an action', () => {
      const complete = true
      const action = {
        type: SET_ZUORA_IFRAME_SCRIPT_LOADED,
        payload: complete,
      }
      assert.deepEqual(
        action,
        setZuoraIframeScriptLoaded(complete),
      )
    })
  })
  describe('Function: setZuoraIframeClientReady()', () => {
    it('should create an action', () => {
      const ready = true
      const action = {
        type: SET_ZUORA_IFRAME_CLIENT_READY,
        payload: ready,
      }
      assert.deepEqual(
        action,
        setZuoraIframeClientReady(ready),
      )
    })
  })
  describe('Function: setZuoraPaymentTokenProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_ZUORA_PAYMENT_TOKEN_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(
        action,
        setZuoraPaymentTokenProcessing(processing),
      )
    })
  })
  describe('Function: setZuoraPaymentTokenData()', () => {
    it('should create an action', () => {
      const token = 'fakeToken'
      const refId = 'fakeRefId'
      const data = {
        token,
        refId,
      }
      const action = {
        type: SET_ZUORA_PAYMENT_TOKEN_DATA,
        payload: data,
      }
      assert.deepEqual(
        action,
        setZuoraPaymentTokenData(data),
      )
    })
  })
  describe('Function: setZuoraPaymentTokenError()', () => {
    it('should create an action', () => {
      const error = 'fakeError'
      const action = {
        type: SET_ZUORA_PAYMENT_TOKEN_ERROR,
        payload: error,
      }
      assert.deepEqual(
        action,
        setZuoraPaymentTokenError(error),
      )
    })
  })
  describe('Function: setZuoraIframeCaptchaValid()', () => {
    it('should create an action', () => {
      const valid = true
      const action = {
        type: SET_ZUORA_IFRAME_CAPTCHA_VALID,
        payload: valid,
      }
      assert.deepEqual(
        action,
        setZuoraIframeCaptchaValid(valid),
      )
    })
  })
  describe('Function: setZuoraIframeRenderComplete()', () => {
    it('should create an action', () => {
      const complete = true
      const action = {
        type: SET_ZUORA_IFRAME_RENDER_COMPLETE,
        payload: complete,
      }
      assert.deepEqual(
        action,
        setZuoraIframeRenderComplete(complete),
      )
    })
  })
})
