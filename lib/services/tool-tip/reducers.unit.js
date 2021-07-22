import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
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

const { assert } = chai.use(chaiImmutable)

describe('service tool-tip reducers', () => {
  const storeKey = 'test'
  describe(`Reducer ${RESET_TOOL_TIP}`, () => {
    it('should reset the state to the initial state', () => {
      const mutatedState = initialState.set('test', true)
      const state = reducers(mutatedState, resetToolTip())
      assert.equal(initialState, state)
    })
  })
  describe(`Reducer ${SET_TOOL_TIP_VISIBLE}`, () => {
    it('should set storeKey visible in state', () => {
      const visible = true
      const state = reducers(initialState, setToolTipVisible(storeKey, visible))
      assert.equal(visible, state.getIn([storeKey, 'visible']))
    })
  })
  describe(`Reducer ${TOGGLE_TOOL_TIP_VISIBLE}`, () => {
    it('should toggle storeKey visible in state', () => {
      const state = reducers(initialState.setIn([storeKey, 'visible'], false), toggleToolTipVisible(storeKey))
      assert.isTrue(state.getIn([storeKey, 'visible']))
    })
  })
  describe(`Reducer ${SET_TOOL_TIP_PROCESSING}`, () => {
    it('should set processing in state', () => {
      const processing = true
      const state = reducers(initialState, setToolTipProcessing(processing))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe(`Reducer ${INIT_TOOL_TIP}`, () => {
    it('should merge data with processing and initializedLocalStorage in state', () => {
      const processing = true
      const data = Map({ test: 'testing' })
      const state = reducers(initialState, initToolTip(data, processing))
      assert.equal(processing, state.get('processing'))
      assert.equal(data.get('test'), state.get('test'))
      assert.isTrue(state.get('initializedLocalStorage'))
    })
  })
  describe(`Reducer ${INIT_TOOL_TIP_FEATURE_TRACKING}`, () => {
    it('should merge data with processing and initializedLocalStorage in state', () => {
      const processing = true
      const data = Map({ test: 'testing' })
      const state = reducers(initialState, initToolTipFeatureTracking(data, processing))
      assert.equal(processing, state.get('processing'))
      assert.equal(data.get('test'), state.get('test'))
      assert.isTrue(state.get('initializedFeatureTracking'))
    })
  })
})
