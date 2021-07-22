import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import {
  setMenuDataProcessing,
  SET_MENU_DATA_PROCESSING,
  setMenuData,
  SET_MENU_DATA,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service menu actions', () => {
  describe('Function: setMenuDataProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_MENU_DATA_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(action, setMenuDataProcessing(processing))
    })
  })
  describe('Function: setMenuData()', () => {
    it('should create an action', () => {
      const processing = true
      const data = Map({
        test: true,
      })
      const action = {
        type: SET_MENU_DATA,
        payload: {
          data,
          processing,
        },
      }
      assert.deepEqual(action, setMenuData(data, processing))
    })
  })
})
