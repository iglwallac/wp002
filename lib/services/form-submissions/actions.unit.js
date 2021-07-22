import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  SET_FORM_SUBMISSIONS_CONFIRMED_DATA,
  setFormSubmissionsConfirmedData,
  SET_FORM_SUBMISSIONS_PROCESSING,
  setFormSubmissionsProcessing,
  RESET_FORM_SUBMISSIONS_DATA,
  resetFormSubmissionsData,
} from './actions'

describe('service form-submissions actions', () => {
  describe('Function: resetFormSubmissionsData()', () => {
    it('should create an action', () => {
      const action = {
        type: RESET_FORM_SUBMISSIONS_DATA,
      }
      assert.deepEqual(
        action,
        resetFormSubmissionsData(),
      )
    })
  })
  describe('Function: setFormSubmissionsConfirmedData()', () => {
    it('should create an action', () => {
      const data = {
        uuid: '1f2e5c8c-0dbe-11e8-b85e-7200002a6b80',
      }
      const processing = false
      const action = {
        type: SET_FORM_SUBMISSIONS_CONFIRMED_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(
        action,
        setFormSubmissionsConfirmedData(data),
      )
    })
  })
  describe('Function: setFormSubmissionsProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_FORM_SUBMISSIONS_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(action, setFormSubmissionsProcessing(processing))
    })
  })
})
