import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  setMenuDataProcessing,
  SET_MENU_DATA_PROCESSING,
  setMenuData,
  SET_MENU_DATA,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service checkout reducers', () => {
  describe(`Reducer ${SET_MENU_DATA_PROCESSING}`, () => {
    it('should set accountValid in state', () => {
      const processing = true
      const state = reducers(initialState, setMenuDataProcessing(processing))
      assert.equal(state.get('processing'), processing)
    })
  })
  describe(`Reducer ${SET_MENU_DATA}`, () => {
    it('should set validationsCcProcessing in state', () => {
      const processing = true
      const data = Map({
        test: true,
      })
      const state = reducers(initialState, setMenuData(data, processing))
      assert.equal(state.get('processing'), processing)
      assert.equal(data, state.get('data'))
    })
  })
})
