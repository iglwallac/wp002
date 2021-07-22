import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS } from 'immutable'
import _parseInt from 'lodash/parseInt'
import reducers, { initialState } from './reducers'
import { createUserNodeDrupal6Nock } from './test.unit'
import USER_NODE_DRUPAL_6_DATA from './test/user-node-drupal-6.json'
import {
  GET_USER_VIDEO_DATA,
  getUserVideoData,
  SET_USER_VIDEO_DATA,
  setUserVideoData,
  SET_USER_VIDEO_ID_PATH,
  setUserVideoIdPath,
  SET_USER_VIDEO_PROCESSING,
  setUserVideoProcessing,
  SET_USER_VIDEO_DATA_FEATURE_POSITION,
  setUserVideoDataFeaturePosition,
  RESET_USER_VIDEO,
  resetUserVideo,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service user-video reducers', () => {
  describe(`Reducer ${SET_USER_VIDEO_DATA}`, () => {
    it('should set data and processing in state', () => {
      const data = { test: true }
      const processing = true
      const state = reducers(initialState, setUserVideoData(data, processing))
      assert.equal(processing, state.get('processing'))
      assert.equal(fromJS(data), state.get('data'))
    })
  })
  describe(`Reducer ${SET_USER_VIDEO_ID_PATH}`, () => {
    it('should set id, path and processing in state', () => {
      const id = 123
      const path = '/test'
      const processing = true
      const state = reducers(initialState, setUserVideoIdPath({ id, path, processing }))
      assert.equal(id, state.get('id'))
      assert.equal(path, state.get('path'))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe(`Reducer ${SET_USER_VIDEO_PROCESSING}`, () => {
    it('should set processing in state', () => {
      const processing = true
      const state = reducers(initialState, setUserVideoProcessing(processing))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe(`Reducer ${SET_USER_VIDEO_DATA_FEATURE_POSITION}`, () => {
    it('should set data featurePosition in state', () => {
      const value = 12345678
      const state = reducers(initialState, setUserVideoDataFeaturePosition(value))
      assert.equal(value, state.getIn(['data', 'featurePosition']))
    })
  })
  describe(`Reducer ${RESET_USER_VIDEO}`, () => {
    it('should set data featurePosition in state', () => {
      const state = reducers(initialState.set('test', true), resetUserVideo())
      assert.equal(initialState, state)
    })
  })
  describe(`Reducer ${GET_USER_VIDEO_DATA}`, () => {
    it('should set data in state', async () => {
      const id = 123
      const path = '/test'
      const auth = 'TEST_JWT'
      const scope = createUserNodeDrupal6Nock({ id, auth })
      const thunk = getUserVideoData(id, path, auth)
      let state = initialState
      await thunk((action) => {
        state = reducers(state, action)
      })
      const expected = fromJS({
        id,
        _dataError: undefined,
        featurePosition: _parseInt(USER_NODE_DRUPAL_6_DATA.featurePosition),
        playlist: USER_NODE_DRUPAL_6_DATA.playlist,
      })
      assert.equal(id, state.get('id'))
      assert.isFalse(state.get('processing'))
      assert.equal(expected, state.get('data'))
      scope.isDone()
    })
  })
})
