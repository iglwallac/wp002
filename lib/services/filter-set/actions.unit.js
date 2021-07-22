import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import {
  setFilterSetData,
  setFilterSetProcessing,
  setFilterSetExpanded,
  setFilterSetVisible,
  SET_FILTER_SET_DATA,
  SET_FILTER_SET_PROCESSING,
  SET_FILTER_SET_EXPANDED,
  SET_FILTER_SET_VISIBLE,
} from './actions'

describe('service filter-set actions', () => {
  describe('Function: setFilterSetData()', () => {
    it('should create an action', () => {
      const filterSet = 'test'
      const data = Map({ test: true })
      const processing = true
      const action = {
        type: SET_FILTER_SET_DATA,
        payload: { filterSet, data, processing },
      }
      assert.deepEqual(setFilterSetData(filterSet, data, processing), action)
    })
  })
  describe('Function: setFilterSetProcessing()', () => {
    it('should create an action', () => {
      const filterSet = 'test'
      const value = true
      const action = {
        type: SET_FILTER_SET_PROCESSING,
        payload: { filterSet, value },
      }
      assert.deepEqual(setFilterSetProcessing(filterSet, value), action)
    })
  })
  describe('Function: setFilterSetExpanded()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_FILTER_SET_EXPANDED,
        payload: value,
      }
      assert.deepEqual(setFilterSetExpanded(value), action)
    })
  })
  describe('Function: setFilterSetVisible()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_FILTER_SET_VISIBLE,
        payload: value,
      }
      assert.deepEqual(setFilterSetVisible(value), action)
    })
  })
})
