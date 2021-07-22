import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
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

describe('service user-video actions', () => {
  describe('Function: setUserVideoData()', () => {
    it('should create an action', () => {
      const data = { test: true }
      const processing = true
      const action = {
        type: SET_USER_VIDEO_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setUserVideoData(data, processing),
      )
    })
  })
  describe('Function: setUserVideoIdPath()', () => {
    it('should create an action', () => {
      const id = 123
      const path = '/test'
      const processing = true
      const action = {
        type: SET_USER_VIDEO_ID_PATH,
        payload: { id, path, processing },
      }
      assert.deepEqual(
        action,
        setUserVideoIdPath({ id, path, processing }),
      )
    })
  })
  describe('Function: setUserVideoProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_USER_VIDEO_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(
        action,
        setUserVideoProcessing(processing),
      )
    })
  })
  describe('Function: setUserVideoDataFeaturePosition()', () => {
    it('should create an action', () => {
      const value = 12345678
      const action = {
        type: SET_USER_VIDEO_DATA_FEATURE_POSITION,
        payload: value,
      }
      assert.deepEqual(
        action,
        setUserVideoDataFeaturePosition(value),
      )
    })
  })
  describe('Function: resetUserVideo()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_USER_VIDEO,
      }
      assert.deepEqual(
        action,
        resetUserVideo(),
      )
    })
  })
})
