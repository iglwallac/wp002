import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setCompUserSubscriptionProcessing,
  setCompUserSubscriptionData,
  setCompUserSubscriptionError,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service subscription reducers', () => {
  describe('Reducer COMP_USER_SUBSCRIPTION_PROCESSING', () => {
    it('should set processing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setCompUserSubscriptionProcessing(true),
      )
      assert.equal(state.get('processing'), value)
    })
  })
  describe('Reducer COMP_USER_SUBSCRIPTION_DATA', () => {
    it('should set successful comp data in state', () => {
      const args = {
        success: true,
        processing: false,
        compId: 'e65570fa-dbff-4e83-9009-fc1c0d06fda4',
      }
      const expected = Map()
        .set('success', true)
        .set('processing', false)
        .set('compId', 'e65570fa-dbff-4e83-9009-fc1c0d06fda4')
      const state = reducers(
        initialState,
        setCompUserSubscriptionData(args),
      )
      assert.equal(state, expected)
    })
  })
  describe('Reducer COMP_USER_SUBSCRIPTION_ERROR', () => {
    it('should set error in state', () => {
      const errors = [
        {
          code: 'bad-request',
          detail: 'User has already been comped for reason: Extra Month for Not Cancelling',
          status: '400',
          title: 'Bad Request',
        },
      ]
      const expected = Map()
        .set('errors', errors)
        .set('processing', false)
      const state = reducers(
        initialState,
        setCompUserSubscriptionError(errors),
      )
      assert.deepEqual(state.toJS(), expected.toJS())
    })
  })
})
