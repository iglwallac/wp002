import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import {
  SET_UPSTREAM_CONTEXT,
  CLEAR_UPSTREAM_CONTEXT,
  setUpstreamContext,
  clearUpstreamContext,
} from './actions'

describe('service upstream-context actions', () => {
  describe('Function: setUpstreamContext()', () => {
    it('should create an action', () => {
      const destId = 98723
      const payload = Map({
        rowType: 'test-rowtype',
        rowIndex: 0,
        itemIndex: 0,
        destId,
        destType: 'test-dest-type',
      })
      const action = setUpstreamContext(payload)

      assert.equal(action.type, SET_UPSTREAM_CONTEXT)
      assert.equal(action.payload.get('destId'), destId)
    })
  })
  describe('Function: clearUpstreamContext()', () => {
    it('should create an action', () => {
      const action = clearUpstreamContext()
      assert.equal(action.type, CLEAR_UPSTREAM_CONTEXT)
    })
  })
})
