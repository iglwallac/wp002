import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  resetToolTip,
  RESET_TOOL_TIP,
  setToolTipVisible,
  SET_TOOL_TIP_VISIBLE,
  toggleToolTipVisible,
  TOGGLE_TOOL_TIP_VISIBLE,
  setToolTipProcessing,
  SET_TOOL_TIP_PROCESSING,
  initToolTip,
  INIT_TOOL_TIP,
  initToolTipFeatureTracking,
  INIT_TOOL_TIP_FEATURE_TRACKING,
} from './actions'

describe('service tool-tip actions', () => {
  const storeKey = 'test'
  describe('Function: resetToolTip()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_TOOL_TIP,
      }
      assert.deepEqual(resetToolTip(), action)
    })
  })
  describe('Function: setToolTipVisible()', () => {
    it('should create an action', () => {
      const visible = true
      const action = {
        type: SET_TOOL_TIP_VISIBLE,
        payload: { storeKey, visible },
      }
      assert.deepEqual(setToolTipVisible(storeKey, visible), action)
    })
  })
  describe('Function: toggleToolTipVisible()', () => {
    it('should create an action', () => {
      const action = {
        type: TOGGLE_TOOL_TIP_VISIBLE,
        payload: { storeKey },
      }
      assert.deepEqual(toggleToolTipVisible(storeKey), action)
    })
  })
  describe('Function: setToolTipProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_TOOL_TIP_PROCESSING,
        payload: { processing },
      }
      assert.deepEqual(setToolTipProcessing(processing), action)
    })
  })
  describe('Function: initToolTip()', () => {
    it('should create an action', () => {
      const processing = true
      const data = { test: true }
      const action = {
        type: INIT_TOOL_TIP,
        payload: { data, processing },
      }
      assert.deepEqual(initToolTip(data, processing), action)
    })
  })
  describe('Function: initToolTipFeatureTracking()', () => {
    it('should create an action', () => {
      const processing = true
      const data = { test: true }
      const action = {
        type: INIT_TOOL_TIP_FEATURE_TRACKING,
        payload: { data, processing },
      }
      assert.deepEqual(initToolTipFeatureTracking(data, processing), action)
    })
  })
})
