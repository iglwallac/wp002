import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import {
  COMP_USER_SUBSCRIPTION_PROCESSING,
  COMP_USER_SUBSCRIPTION_DATA,
  COMP_USER_SUBSCRIPTION_ERROR,
  setCompUserSubscriptionProcessing,
  setCompUserSubscriptionData,
  setCompUserSubscriptionError,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service checkout actions', () => {
  describe('Function: setCompUserSubscriptionProcessing()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: COMP_USER_SUBSCRIPTION_PROCESSING,
        processing: value,
      }
      assert.deepEqual(setCompUserSubscriptionProcessing(value), action)
    })
  })
  describe('Function: setCompUserSubscriptionData()', () => {
    it('should create an action', () => {
      const value = {
        success: true,
        processing: false,
        compId: 'test-uuid',
      }
      const action = {
        type: COMP_USER_SUBSCRIPTION_DATA,
        processing: false,
        payload: value,
      }
      assert.deepEqual(setCompUserSubscriptionData(value), action)
    })
  })
  describe('Function: setCompUserSubscriptionError()', () => {
    it('should create an action', () => {
      const errors = [
        {
          code: 'bad-request',
          detail: 'User has already been comped for reaso: Extra Month for Not Cancelling',
          status: '400',
          title: 'Bad Request',
        },
      ]
      const action = {
        type: COMP_USER_SUBSCRIPTION_ERROR,
        processing: false,
        errors,
      }
      assert.deepEqual(setCompUserSubscriptionError(errors), action)
    })
  })
})
