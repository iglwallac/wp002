import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS } from 'immutable'
import reducers, { initialState } from './reducers'
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

chai.use(chaiImmutable)
const { assert } = chai

describe('services zuora reducers', () => {
  describe(`Reducer ${SET_ZUORA_IFRAME_SIGNATURE_TOKEN_PROKESSING}`, () => {
    it('should set iframeSignatureTokenProcessing in state', () => {
      const processing = true
      const state = reducers(
        initialState,
        setZuoraIframeSignatureTokenProcessing(processing),
      )
      assert.equal(processing, state.get('iframeSignatureTokenProcessing'))
    })
  })
  describe(`Reducer ${SET_ZUORA_IFRAME_SIGNATURE_TOKEN_DATA}`, () => {
    it('should set data.iframe and iframeSignatureTokenProcessing in state', () => {
      const data = fromJS({ test: true })
      const processing = false
      const state = reducers(
        initialState,
        setZuoraIframeSignatureTokenData(data, processing),
      )
      assert.equal(
        data,
        state.getIn(['data', 'iframe', 'rsa']),
      )
      assert.equal(processing, state.get('iframeSignatureTokenProcessing'))
    })
  })
  describe(`Reducer ${SET_ZUORA_IFRAME_SCRIPT_LOADED}`, () => {
    it('should set data.iframe.scriptLoaded in state', () => {
      const complete = true
      const state = reducers(
        initialState,
        setZuoraIframeScriptLoaded(complete),
      )
      assert.equal(complete, state.getIn(['data', 'iframe', 'scriptLoaded']))
    })
  })
  describe(`Reducer ${SET_ZUORA_IFRAME_CLIENT_READY}`, () => {
    it('should set data.iframe.clientReady in state', () => {
      const ready = true
      const state = reducers(
        initialState,
        setZuoraIframeClientReady(ready),
      )
      assert.equal(ready, state.getIn(['data', 'iframe', 'clientReady']))
    })
  })
  describe(`Reducer ${SET_ZUORA_PAYMENT_TOKEN_PROCESSING}`, () => {
    it('should set iframeSignatureTokenProcessing in state', () => {
      const processing = true
      const state = reducers(
        initialState,
        setZuoraPaymentTokenProcessing(processing),
      )
      assert.equal(processing, state.get('iframePaymentTokenProcessing'))
    })
  })
  describe(`Reducer ${SET_ZUORA_PAYMENT_TOKEN_DATA}`, () => {
    it('should set data.paymentToken data in state', () => {
      const refId = 'testRefId'
      const token = 'testToken'
      const data = fromJS({
        success: true,
        data: {
          refId,
          token,
        },
        error: null,
      })
      const state = reducers(
        initialState,
        setZuoraPaymentTokenData({ refId, token }),
      )
      assert.equal(
        data,
        state.getIn(['data', 'paymentToken']),
      )
    })
  })
  describe(`Reducer ${SET_ZUORA_PAYMENT_TOKEN_ERROR}`, () => {
    it('should set data.paymentToken error in state', () => {
      const error = 'testError'
      const data = fromJS({
        success: false,
        data: {},
        error,
      })
      const state = reducers(
        initialState,
        setZuoraPaymentTokenError(error),
      )
      assert.equal(
        data,
        state.getIn(['data', 'paymentToken']),
      )
    })
  })
  describe(`Reducer ${SET_ZUORA_IFRAME_CAPTCHA_VALID}`, () => {
    it('should set data.captcha.valid in state', () => {
      const valid = true
      const state = reducers(
        initialState,
        setZuoraIframeCaptchaValid(valid),
      )
      assert.equal(valid, state.getIn(['data', 'captcha', 'valid']))
    })
  })
  describe(`Reducer ${SET_ZUORA_IFRAME_RENDER_COMPLETE}`, () => {
    it('should set data.iframe.renderComplete in state', () => {
      const complete = true
      const state = reducers(
        initialState,
        setZuoraIframeRenderComplete(complete),
      )
      assert.equal(complete, state.getIn(['data', 'iframe', 'renderComplete']))
    })
  })
})
