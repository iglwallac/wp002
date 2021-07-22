import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setUpstreamContext,
  clearUpstreamContext,
} from './actions'

const destId = 98723
const payload = Map({
  contextType: 'test-context-type',
  rowType: 'test-rowtype',
  rowIndex: 0,
  itemIndex: 0,
  destId,
  destType: 'test-dest-type',
})
const hydratedState = Map().set('data', payload)

describe('service upstream-context reducers', () => {
  describe('Reducer SET_UPSTREAM_CONTEXT', () => {
    it('should set the upstream context in the store', () => {
      const state = reducers(
        initialState,
        setUpstreamContext(payload),
      )

      assert.equal(state.getIn(['data', 'destId']), destId)
    })
  })
  describe('Reducer CLEAR_UPSTREAM_CONTEXT', () => {
    it('should clear upstream context from store', () => {
      const state = reducers(
        hydratedState,
        clearUpstreamContext(),
      )
      assert.equal(state.get('data'), undefined)
    })
  })
})
