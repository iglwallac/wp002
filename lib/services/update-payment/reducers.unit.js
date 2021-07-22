import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setUpdatePaymentOrderProcessing,
  setUpdatePaymentOrderComplete,
  setUpdatePaymentOrderError,
  setUpdatePaymentBrainTreeProcessing,
  setUpdatePaymentBrainTreeReady,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service updatePayment reducers', () => {
  describe('Reducer SET_UPDATE_PAYMENT_ORDER_PROCESSING', () => {
    it('should set processing in state', () => {
      const value = true
      const state = reducers(initialState, setUpdatePaymentOrderProcessing(value))
      assert.equal(state.get('processing'), value)
    })
  })
  describe('Reducer SET_UPDATE_PAYMENT_ORDER_COMPLETE', () => {
    it('should set orderComplete in state and cleans up', () => {
      const value = true
      const cleanUp = Map({
        paymentType: true,
        paypalPaymentInfo: true,
        brianTreeProcessing: true,
        brianTreeReady: true,
      })
      const testState = initialState.merge(cleanUp)
      const state = reducers(testState, setUpdatePaymentOrderComplete(value))
      assert.equal(state.get('orderComplete'), value)
      // Make sure none of the cleanup keys exist
      cleanUp.forEach((_value, key) => assert.isFalse(state.has(key)))
    })
  })
  describe('Reducer SET_UPDATE_PAYMENT_ORDER_ERROR', () => {
    it('should set orderError and delete processing in state', () => {
      const value = 'This is an order error.'
      const cleanUp = Map({
        processing: true,
      })
      const testState = initialState.merge(cleanUp)
      const state = reducers(testState, setUpdatePaymentOrderError(value))
      assert.equal(state.get('orderError'), value)
      // Make sure none of the cleanup keys exist
      cleanUp.forEach((_value, key) => assert.isFalse(state.has(key)))
    })
  })
  describe('Reducer SET_UPDATE_PAYMENT_BRAIN_TREE_PROCESSING', () => {
    it('should set brianTreeProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setUpdatePaymentBrainTreeProcessing(value),
      )
      assert.equal(state.get('brianTreeProcessing'), value)
    })
  })
  describe('Reducer SET_UPDATE_PAYMENT_BRAIN_TREE_READY', () => {
    it('should set brianTreeReady in state', () => {
      const ready = true
      const processing = true
      const state = reducers(
        initialState,
        setUpdatePaymentBrainTreeReady(ready, processing),
      )
      assert.equal(state.get('brianTreeReady'), ready)
      assert.equal(state.get('brianTreeProcessing'), processing)
    })
  })
})
