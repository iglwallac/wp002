import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  FEATURE_NAME_TEST,
  FEATURE_NAME_TEST2,
} from './constants'
import {
  setFeatureTrackingProcessing,
  setFeatureTrackingData,
  setFeatureTrackingCount,
} from './actions'

describe('service feature-tracking reducers', () => {
  describe('Reducer SET_FEATURE_TRACKING_PROCESSING', () => {
    it('should set processing in state', () => {
      const state = reducers(initialState, setFeatureTrackingProcessing(true))
      assert.equal(state.get('processing'), true)
    })
  })
  describe('Reducer SET_FEATURE_TRACKING_DATA', () => {
    it('should set data and processing in state', () => {
      const data = Map({ test: true })
      const state = reducers(initialState, setFeatureTrackingData(data, true))
      assert.isTrue(state.get('data', Map()).equals(data))
      assert.equal(state.get('processing'), true)
    })
  })
  describe('Reducer SET_FEATURE_TRACKING_COUNT', () => {
    it('should set data in state', () => {
      const count = 1
      const data = Map({ featureImpressions: { [FEATURE_NAME_TEST]: count } })
      const state = reducers(initialState, setFeatureTrackingCount(data))
      assert.isTrue(state.get('data', Map()).equals(data))
    })
    it('should set data in state (merge)', () => {
      const oldCount = 1
      const newCount = 2
      const otherOldCount = 5
      const previousState = Map({
        data: Map({
          featureImpressions: Map({
            [FEATURE_NAME_TEST]: oldCount,
            [FEATURE_NAME_TEST2]: otherOldCount,
          }),
        }),
      })
      const data = Map({ featureImpressions: Map({ [FEATURE_NAME_TEST]: newCount }) })
      const state = reducers(previousState, setFeatureTrackingCount(data))
      const jsState = state.get('data', Map()).toJS()
      assert.nestedPropertyVal(jsState, 'featureImpressions.test', newCount)
      assert.nestedPropertyVal(jsState, 'featureImpressions.test2', otherOldCount)
    })
  })
})
