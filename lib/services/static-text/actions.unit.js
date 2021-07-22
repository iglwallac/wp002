import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  setStaticTextProcessing,
  setStaticTextData,
  SET_STATIC_TEXT_PROCESSING,
  SET_STATIC_TEXT_DATA,
} from './actions'

describe('service web-app static text', () => {
  describe('Function: setStaticTextProcessing()', () => {
    it('should create an action', () => {
      const action = {
        type: SET_STATIC_TEXT_PROCESSING,
        payload: true,
      }
      assert.deepEqual(setStaticTextProcessing(true), action)
    })
  })
  describe('Function: setStaticTextData()', () => {
    it('creates correct action', () => {
      const action = {
        type: SET_STATIC_TEXT_DATA,
        payload: { data: SET_STATIC_TEXT_DATA, processing: false },
      }
      assert.deepEqual(setStaticTextData(SET_STATIC_TEXT_DATA), action)
    })
  })
})
