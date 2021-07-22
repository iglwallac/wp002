import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import {
  setUpdatePaymentOrderProcessing,
  SET_UPDATE_PAYMENT_ORDER_PROCESSING,
  setUpdatePaymentOrderComplete,
  SET_UPDATE_PAYMENT_ORDER_COMPLETE,
  setUpdatePaymentOrderError,
  SET_UPDATE_PAYMENT_ORDER_ERROR,
  setUpdatePaymentBrainTreeProcessing,
  SET_UPDATE_PAYMENT_BRAIN_TREE_PROCESSING,
  setUpdatePaymentBrainTreeReady,
  SET_UPDATE_PAYMENT_BRAIN_TREE_READY,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service updatePayment actions', () => {
  describe('Function: setUpdatePaymentOrderProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_UPDATE_PAYMENT_ORDER_PROCESSING,
        payload: value,
      }
      assert.deepEqual(setUpdatePaymentOrderProcessing(value), action)
    })
  })
  describe('Function: setUpdatePaymentOrderComplete()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_UPDATE_PAYMENT_ORDER_COMPLETE,
        payload: value,
      }
      assert.deepEqual(setUpdatePaymentOrderComplete(value), action)
    })
  })
  describe('Function: setUpdatePaymentOrderError()', () => {
    it('should create an action', () => {
      const value = 'This is an error.'
      const action = {
        type: SET_UPDATE_PAYMENT_ORDER_ERROR,
        payload: value,
      }
      assert.deepEqual(setUpdatePaymentOrderError(value), action)
    })
  })
  describe('Function: setUpdatePaymentBrainTreeProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_UPDATE_PAYMENT_BRAIN_TREE_PROCESSING,
        payload: value,
      }
      assert.deepEqual(setUpdatePaymentBrainTreeProcessing(value), action)
    })
  })
  describe('Function: setUpdatePaymentBrainTreeReady()', () => {
    it('should create an action', () => {
      const ready = true
      const processing = true
      const action = {
        type: SET_UPDATE_PAYMENT_BRAIN_TREE_READY,
        payload: { ready, processing },
      }
      assert.deepEqual(setUpdatePaymentBrainTreeReady(ready, processing), action)
    })
  })
})
