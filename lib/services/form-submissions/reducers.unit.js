import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  SET_FORM_SUBMISSIONS_CONFIRMED_DATA,
  setFormSubmissionsConfirmedData,
  SET_FORM_SUBMISSIONS_PROCESSING,
  setFormSubmissionsProcessing,
  RESET_FORM_SUBMISSIONS_DATA,
  resetFormSubmissionsData,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service user-account reducers', () => {
  describe(`Reducer ${RESET_FORM_SUBMISSIONS_DATA}`, () => {
    it('should reset user account cancel data in state', () => {
      const state = reducers(initialState, resetFormSubmissionsData())
      assert.equal(state.get('data'), undefined)
    })
  })
  describe(`Reducer ${SET_FORM_SUBMISSIONS_CONFIRMED_DATA}`, () => {
    it('should set cancel confirm data in state', () => {
      const data = fromJS({
        uuid: '1f2e5c8c-0dbe-11e8-b85e-7200002a6b80',
      })
      const processing = false
      const state = reducers(
        initialState,
        setFormSubmissionsConfirmedData(data),
      )
      assert.equal(
        data,
        state.get('data'),
      )
      assert.equal(processing, state.get('processing'))
    })
  })
  describe(`Reducer ${SET_FORM_SUBMISSIONS_PROCESSING}`, () => {
    it('should set setFormSubmissionsProcessing in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setFormSubmissionsProcessing(value),
      )
      assert.equal(value, state.get('processing'))
    })
  })
})
