import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Map } from 'immutable'
import {
  SET_ALERT_BAR_VISIBLE,
  setAlertBarVisible,
  SET_ALERT_BAR_DATA,
  setAlertBarData,
} from './actions'

describe('service alert-bar actions', () => {
  describe('Function: setAlertBarVisible()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_ALERT_BAR_VISIBLE,
        payload: value,
      }
      assert.deepEqual(
        action,
        setAlertBarVisible(value),
      )
    })
  })
  describe('Function: setAlertBarData()', () => {
    it('should create an action', () => {
      const data = Map({ test: true })
      const action = {
        type: SET_ALERT_BAR_DATA,
        payload: { data },
      }
      assert.deepEqual(
        action,
        setAlertBarData(data),
      )
    })
  })
})
