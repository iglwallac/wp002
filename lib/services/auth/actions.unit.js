import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  resetAuthData,
  RESET_AUTH_DATA,
  setAuthData,
  SET_AUTH_DATA,
  incrementAuthRenewalCount,
  INCREMENT_AUTH_RENEWAL_COUNT,
  setAuthLoginSuccess,
  SET_AUTH_LOGIN_SUCCESS,
  resetAuthRenewalCount,
  RESET_AUTH_RENEWAL_COUNT,
} from './actions'

describe('service auth actions', () => {
  describe('Function: resetAuthData()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_AUTH_DATA,
      }
      assert.deepEqual(resetAuthData(), action)
    })
  })
  describe('Function: setAuthData()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_AUTH_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(setAuthData(data, processing), action)
    })
  })
  describe('Function: incrementAuthRenewalCount()', () => {
    it('should create an action', () => {
      const processing = true
      const processingRenew = true
      const action = {
        type: INCREMENT_AUTH_RENEWAL_COUNT,
        payload: { processing, processingRenew },
      }
      assert.deepEqual(incrementAuthRenewalCount({ processing, processingRenew }), action)
    })
  })
  describe('Function: setAuthLoginSuccess()', () => {
    it('should create an action', () => {
      const success = true
      const action = {
        type: SET_AUTH_LOGIN_SUCCESS,
        payload: success,
      }
      assert.deepEqual(setAuthLoginSuccess(success), action)
    })
  })
  describe('Function: resetAuthRenewalCount()', () => {
    it('should create an action', () => {
      const processing = true
      const processingRenew = true
      const action = {
        type: RESET_AUTH_RENEWAL_COUNT,
        payload: { processing, processingRenew },
      }
      assert.deepEqual(resetAuthRenewalCount({ processing, processingRenew }), action)
    })
  })
})
