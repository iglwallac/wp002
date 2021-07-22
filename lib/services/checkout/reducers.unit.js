import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setCheckoutAccountValid,
  setCheckoutUserData,
  setCheckoutOrderProcessing,
  setCheckoutOrderComplete,
  setCheckoutOrderError,
  setCheckoutBrainTreeProcessing,
  setCheckoutBrainTreeReady,
  setCheckoutStep,
  setCheckoutEventStep,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service checkout reducers', () => {
  describe('Reducer SET_CHECKOUT_ACCOUNT_VALID', () => {
    it('should set accountValid in state', () => {
      const value = true
      const state = reducers(initialState, setCheckoutAccountValid(value))
      assert.equal(state.get('accountValid'), value)
    })
  })
  describe('Reducer SET_CHECKOUT_USER_DATA', () => {
    it('should set account in state', () => {
      const data = Map({
        firstName: 'testFirst',
        lastName: 'testLast',
      })
      const state = reducers(initialState, setCheckoutUserData(data.toJS()))
      assert.equal(state.get('account'), data)
    })
  })
  describe('Reducer SET_CHECKOUT_ORDER_PROCESSING', () => {
    it('should set processing in state', () => {
      const value = true
      const state = reducers(initialState, setCheckoutOrderProcessing(value))
      assert.equal(state.get('processing'), value)
    })
  })
  describe('Reducer SET_CHECKOUT_ORDER_COMPLETE', () => {
    it('should set orderComplete in state and cleans up', () => {
      const value = true
      const cleanUp = Map({
        paymentType: true,
        paypalPaymentInfo: true,
        brianTreeProcessing: true,
        brianTreeReady: true,
        account: true,
        billing: true,
        billingValid: true,
        accountValid: true,
      })
      const testState = initialState.merge(cleanUp)
      const state = reducers(testState, setCheckoutOrderComplete(value))
      assert.equal(state.get('orderComplete'), value)
      // Make sure none of the cleanup keys exist
      cleanUp.forEach((_value, key) => assert.isFalse(state.has(key)))
    })
  })
  describe('Reducer SET_CHECKOUT_ORDER_ERROR', () => {
    it('should set orderError and delete processing in state', () => {
      const value = 'This is an order error.'
      const cleanUp = Map({
        processing: true,
      })
      const testState = initialState.merge(cleanUp)
      const state = reducers(testState, setCheckoutOrderError(value))
      assert.equal(state.get('orderError'), value)
      // Make sure none of the cleanup keys exist
      cleanUp.forEach((_value, key) => assert.isFalse(state.has(key)))
    })
  })
  describe('Reducer SET_CHECKOUT_BRAIN_TREE_PROCESSING', () => {
    it('should set brianTreeProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setCheckoutBrainTreeProcessing(value),
      )
      assert.equal(state.get('brianTreeProcessing'), value)
    })
  })
  describe('Reducer SET_CHECKOUT_BRAIN_TREE_READY', () => {
    it('should set brianTreeReady in state', () => {
      const ready = true
      const processing = true
      const state = reducers(
        initialState,
        setCheckoutBrainTreeReady(ready, processing),
      )
      assert.equal(state.get('brianTreeReady'), ready)
      assert.equal(state.get('brianTreeProcessing'), processing)
    })
  })
  describe('Reducer SET_CHECKOUT_STEP', () => {
    it('should set step in state', () => {
      const step = 1
      const state = reducers(
        initialState,
        setCheckoutStep(step),
      )
      assert.equal(state.get('step'), step)
    })
  })
  describe('Reducer SET_CHECKOUT_EVENT_STEP', () => {
    it('should set eventStep in state', () => {
      const eventStep = 1
      const state = reducers(
        initialState,
        setCheckoutEventStep(eventStep),
      )
      assert.equal(state.get('eventStep'), eventStep)
    })
  })
})
