import { describe, it } from 'mocha'
import { assert } from 'chai'
import { FEATURE_NAME_TEST } from './constants'
import {
  setFeatureTrackingProcessing,
  SET_FEATURE_TRACKING_PROCESSING,
  setFeatureTrackingData,
  SET_FEATURE_TRACKING_DATA,
  setFeatureTrackingCount,
  SET_FEATURE_TRACKING_COUNT,
  incrementFeatureImpressionCount,
  INCREMENT_FEATURE_IMPRESSION_COUNT,
  resetFeatureImpressionCount,
  RESET_FEATURE_IMPRESSION_COUNT,
} from './actions'

describe('service feature-tracking actions', () => {
  describe('Function: setFeatureTrackingProcessing()', () => {
    it('should create an action', () => {
      const action = {
        type: SET_FEATURE_TRACKING_PROCESSING,
        payload: true,
      }
      assert.deepEqual(setFeatureTrackingProcessing(true), action)
    })
  })
  describe('Function: setFeatureTrackingData()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_FEATURE_TRACKING_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(setFeatureTrackingData(data, processing), action)
    })
  })
  describe('Function: setFeatureTrackingCount()', () => {
    it('should create and action', () => {
      const data = FEATURE_NAME_TEST
      const action = {
        type: SET_FEATURE_TRACKING_COUNT,
        payload: { data },
      }
      assert.deepEqual(setFeatureTrackingCount(data), action)
    })
  })
  describe('Function: incrementFeatureImpressionCount()', () => {
    it('should create and action', () => {
      const featureName = FEATURE_NAME_TEST
      const action = {
        type: INCREMENT_FEATURE_IMPRESSION_COUNT,
        payload: { featureName },
      }
      assert.deepEqual(incrementFeatureImpressionCount(featureName), action)
    })
  })
  describe('Function: resetFeatureImpressionCount()', () => {
    it('should create and action', () => {
      const featureName = FEATURE_NAME_TEST
      const action = {
        type: RESET_FEATURE_IMPRESSION_COUNT,
        payload: { featureName },
      }
      assert.deepEqual(resetFeatureImpressionCount(featureName), action)
    })
  })
})
