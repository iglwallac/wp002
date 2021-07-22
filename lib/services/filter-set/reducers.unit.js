import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setFilterSetData,
  setFilterSetProcessing,
  setFilterSetExpanded,
  setFilterSetVisible,
} from './actions'

describe('service filter-set reducers', () => {
  describe('Reducer SET_FILTER_SET_DATA', () => {
    it('should set data and processing under filterSet in state', () => {
      const filterSet = 'test'
      const data = Map({ test: true })
      const processing = true
      const state = reducers(
        initialState,
        setFilterSetData(filterSet, data, processing),
      )
      assert.deepEqual(state.getIn([filterSet, 'data']), data)
      assert.deepEqual(state.getIn([filterSet, 'processing']), processing)
    })
  })
  describe('Reducer SET_FILTER_SET_PROCESSING', () => {
    it('should set processing under filterSet in state', () => {
      const filterSet = 'test'
      const processing = true
      const state = reducers(
        initialState,
        setFilterSetProcessing(filterSet, processing),
      )
      assert.equal(state.getIn([filterSet, 'processing']), processing)
    })
  })
  describe('Reducer SET_FILTER_SET_EXPANDED', () => {
    it('should set expanded in state', () => {
      const state = reducers(initialState, setFilterSetExpanded(true))
      assert.equal(state.get('expanded'), true)
    })
  })
  describe('Reducer SET_FILTER_SET_VISIBLE', () => {
    it('should set visible in state', () => {
      const state = reducers(initialState, setFilterSetVisible(true))
      assert.equal(state.get('visible'), true)
    })
  })
})
