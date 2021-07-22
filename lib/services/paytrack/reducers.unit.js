import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setPaytrackProcessing,
  setPaytrackDataLastTransaction,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('paytrack service reducers', () => {
  describe('Reducer SET_PAYTRACK_DATA_PROCESSING', () => {
    it('should set processing in state', () => {
      const processing = true
      const state = reducers(
        initialState,
        setPaytrackProcessing(processing),
      )
      assert.equal(processing, state.get('processing'))
    })
  })
  describe('Reducer SET_PAYTRACK_DATA_LAST_TRANSACTION', () => {
    it('should set last transaction in state', () => {
      const data = fromJS({
        lastTransaction: {
          test: true,
        },
      })
      const state = reducers(
        initialState,
        setPaytrackDataLastTransaction(data),
      )
      assert.deepEqual(data.get('lastTransaction'), state.get('lastTransaction'))
    })
  })
})
