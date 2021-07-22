import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import {
  setPaytrackProcessing,
  SET_PAYTRACK_DATA_PROCESSING,
  setPaytrackDataLastTransaction,
  SET_PAYTRACK_DATA_LAST_TRANSACTION,
} from './actions'

describe('paytrack actions', () => {
  describe('Function: setPaytrackProcessing()', () => {
    it('should create an action', () => {
      const action = {
        type: SET_PAYTRACK_DATA_PROCESSING,
        processing: true,
      }
      assert.deepEqual(
        action,
        setPaytrackProcessing(true),
      )
    })
  })
  describe('Function: setPaytrackDataLastTransaction()', () => {
    it('should create an action', () => {
      const payload = {
        test: true,
      }
      const action = {
        type: SET_PAYTRACK_DATA_LAST_TRANSACTION,
        payload: {
          test: true,
        },
      }

      assert.deepEqual(
        action,
        setPaytrackDataLastTransaction(payload),
      )
    })
    it('should pass a Map() as default value for payload', () => {
      const payload = undefined
      const action = {
        type: SET_PAYTRACK_DATA_LAST_TRANSACTION,
        payload: Map(),
      }
      assert.deepEqual(
        action,
        setPaytrackDataLastTransaction(payload),
      )
    })
  })
})
