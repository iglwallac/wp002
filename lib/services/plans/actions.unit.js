import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  resetPlansData,
  RESET_PLANS_DATA,
  setPlansLocalizedProccesing,
  SET_PLANS_LOCALIZED_PROCESSING,
  setPlansData,
  SET_PLANS_DATA,
  setPlansSelection,
  SET_PLANS_SELECTION,
  setPlansProccesing,
  SET_PLANS_PROCESSING,
  setPlansError,
  SET_PLANS_ERROR,
  setPlanChangeSelected,
  SET_PLAN_CHANGE_SELECTED,
} from './actions'

describe('service plans actions', () => {
  describe('Function: resetPlansData()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_PLANS_DATA,
      }
      assert.deepEqual(resetPlansData(), action)
    })
  })
  describe('Function: setPlansLocalizedProccesing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_PLANS_LOCALIZED_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(setPlansLocalizedProccesing(processing), action)
    })
  })
  describe('Function: setPlansData()', () => {
    it('should create an action', () => {
      const processing = true
      const data = { test: true }
      const action = {
        type: SET_PLANS_DATA,
        payload: {
          data,
          processing,
        },
      }
      assert.deepEqual(setPlansData(data, processing), action)
    })
  })
  describe('Function: setPlanChangeSelected()', () => {
    it('should create an action', () => {
      const data = 'test'
      const action = {
        type: SET_PLAN_CHANGE_SELECTED,
        payload: data,
      }
      assert.deepEqual(setPlanChangeSelected(data), action)
    })
  })
  describe('Function: setPlansSelection()', () => {
    it('should create an action', () => {
      const processing = true
      const data = { test: true }
      const action = {
        type: SET_PLANS_SELECTION,
        payload: {
          data,
          processing,
        },
      }
      assert.deepEqual(setPlansSelection(data, processing), action)
    })
  })
  describe('Function: setPlansSelection()', () => {
    it('should create an action', () => {
      const processing = true
      const data = { test: true }
      const action = {
        type: SET_PLANS_SELECTION,
        payload: {
          data,
          processing,
        },
      }
      assert.deepEqual(setPlansSelection(data, processing), action)
    })
  })
  describe('Function: setPlansProccesing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_PLANS_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(setPlansProccesing(processing), action)
    })
  })
  describe('Function: setPlansError()', () => {
    it('should create an action', () => {
      const processing = true
      const error = true
      const action = {
        type: SET_PLANS_ERROR,
        payload: {
          error,
          processing,
        },
      }
      assert.deepEqual(setPlansError(error, processing), action)
    })
  })
})
