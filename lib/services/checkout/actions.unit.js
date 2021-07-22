import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import {
  setCheckoutAccountValid,
  SET_CHECKOUT_ACCOUNT_VALID,
  setCheckoutUserData,
  SET_CHECKOUT_USER_DATA,
  setCheckoutOrderProcessing,
  SET_CHECKOUT_ORDER_PROCESSING,
  setCheckoutOrderComplete,
  SET_CHECKOUT_ORDER_COMPLETE,
  setCheckoutOrderError,
  SET_CHECKOUT_ORDER_ERROR,
  setCheckoutBrainTreeProcessing,
  SET_CHECKOUT_BRAIN_TREE_PROCESSING,
  setCheckoutBrainTreeReady,
  SET_CHECKOUT_BRAIN_TREE_READY,
  setCheckoutStep,
  SET_CHECKOUT_STEP,
  setCheckoutEventStep,
  SET_CHECKOUT_EVENT_STEP,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service checkout actions', () => {
  describe('Function: setCheckoutAccountValid()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_CHECKOUT_ACCOUNT_VALID,
        payload: value,
      }
      assert.deepEqual(setCheckoutAccountValid(value), action)
    })
  })
  describe('Function: setCheckoutUserData()', () => {
    it('should create an action', () => {
      const data = {
        firstName: 'testFirst',
        lastName: 'testLast',
      }
      const action = {
        type: SET_CHECKOUT_USER_DATA,
        payload: data,
      }
      assert.deepEqual(setCheckoutUserData(data), action)
    })
  })
  describe('Function: setCheckoutOrderProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_CHECKOUT_ORDER_PROCESSING,
        payload: value,
      }
      assert.deepEqual(setCheckoutOrderProcessing(value), action)
    })
  })
  describe('Function: setCheckoutOrderComplete()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_CHECKOUT_ORDER_COMPLETE,
        payload: value,
      }
      assert.deepEqual(setCheckoutOrderComplete(value), action)
    })
  })
  describe('Function: setCheckoutOrderError()', () => {
    it('should create an action', () => {
      const value = 'This is an error.'
      const action = {
        type: SET_CHECKOUT_ORDER_ERROR,
        payload: value,
      }
      assert.deepEqual(setCheckoutOrderError(value), action)
    })
  })
  describe('Function: setCheckoutBrainTreeProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_CHECKOUT_BRAIN_TREE_PROCESSING,
        payload: value,
      }
      assert.deepEqual(setCheckoutBrainTreeProcessing(value), action)
    })
  })
  describe('Function: setCheckoutBrainTreeReady()', () => {
    it('should create an action', () => {
      const ready = true
      const processing = true
      const action = {
        type: SET_CHECKOUT_BRAIN_TREE_READY,
        payload: { ready, processing },
      }
      assert.deepEqual(setCheckoutBrainTreeReady(ready, processing), action)
    })
  })
  describe('Function: setCheckoutStep()', () => {
    it('should create an action', () => {
      const step = 1
      const action = {
        type: SET_CHECKOUT_STEP,
        payload: step,
      }
      assert.deepEqual(setCheckoutStep(step), action)
    })
  })
  describe('Function: setCheckoutEventStep()', () => {
    it('should create an action', () => {
      const eventStep = 1
      const action = {
        type: SET_CHECKOUT_EVENT_STEP,
        payload: eventStep,
      }
      assert.deepEqual(setCheckoutEventStep(eventStep), action)
    })
  })
})
