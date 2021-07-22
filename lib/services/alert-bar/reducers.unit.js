import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS, Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  SET_ALERT_BAR_VISIBLE,
  setAlertBarVisible,
  SET_ALERT_BAR_DATA,
  setAlertBarData,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service alert-bar reducers', () => {
  describe(`Reducer ${SET_ALERT_BAR_VISIBLE}`, () => {
    it('should set visible under the storeKey in state', () => {
      const value = true
      const data = fromJS({
        visible: value,
      })
      const state = reducers(
        initialState,
        setAlertBarVisible(value),
      )
      assert.equal(
        data.get('visible'),
        state.get('visible'),
      )
    })
  })
  describe(`Reducer ${SET_ALERT_BAR_DATA}`, () => {
    it('should set closed under the storeKey in state', () => {
      const data = Map({ test: true })
      const state = reducers(
        initialState,
        setAlertBarData(data),
      )
      assert.equal(
        data,
        state.get('data'),
      )
    })
  })
})
