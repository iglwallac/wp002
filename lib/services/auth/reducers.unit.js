import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  resetAuthData,
  setAuthData,
  incrementAuthRenewalCount,
  SET_AUTH_LOGIN_SUCCESS,
  setAuthLoginSuccess,
  resetAuthRenewalCount,
  RESET_AUTH_RENEWAL_COUNT,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service auth reducers', () => {
  describe('Reducer RESET_AUTH_DATA', () => {
    it('should reset state', () => {
      const state = reducers(initialState, resetAuthData())
      assert.equal(state, initialState)
    })
  })
  describe('Reducer SET_AUTH_DATA', () => {
    it('should set state', () => {
      const data = Map({
        test: true,
      })
      const processing = true
      const testState = initialState.merge(
        Map({
          renewTimes: true,
          renewalCount: 1,
        }),
      )
      const state = reducers(testState, setAuthData(data.toJS(), processing))
      assert.equal(state.get('test'), data.get('test'))
      assert.equal(state.get('renewTimes'), data.get('test'))
      assert.equal(state.get('renewTimes'), data.get('test'))
      assert.equal(state.get('processing'), processing)
    })
  })
  describe('Reducer INCREMENT_AUTH_RENEWAL_COUNT', () => {
    it('should increment renewalCount and set processing in state', () => {
      const processing = true
      const processingRenew = true
      const state = reducers(
        initialState,
        incrementAuthRenewalCount({ processing, processingRenew }),
      )
      assert.equal(state.get('processing'), processing)
      assert.equal(state.get('processingRenew'), processingRenew)
      assert.equal(state.get('renewalCount'), 1)
    })
  })
  describe(`Reducer ${SET_AUTH_LOGIN_SUCCESS}`, () => {
    it('should set loginSuccess in state', () => {
      const loginSuccess = true
      const state = reducers(initialState, setAuthLoginSuccess(loginSuccess))
      assert.equal(state.get('loginSuccess'), loginSuccess)
    })
  })
  describe(`Reducer ${RESET_AUTH_RENEWAL_COUNT}`, () => {
    it('should set renewalCount to zero in state', () => {
      const processing = false
      const processingRenew = false
      const state = reducers(initialState, resetAuthRenewalCount({ processing, processingRenew }))
      assert.equal(state.get('processing'), processing)
      assert.equal(state.get('processingRenew'), processingRenew)
      assert.equal(state.get('renewalCount'), 0)
    })
  })
})
