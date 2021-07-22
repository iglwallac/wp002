import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { Map } from 'immutable'
import reducers, { initialState } from './reducers'
import {
  SET_STATIC_TEXT_PROCESSING,
  setStaticTextProcessing,
  SET_STATIC_TEXT_DATA,
  setStaticTextData,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service web-app static-text reducers', () => {
  describe(`Reducer ${SET_STATIC_TEXT_PROCESSING}`, () => {
    it('sets staticText processing in state', () => {
      const processing = true
      const state = reducers(initialState, setStaticTextProcessing(processing))
      assert.equal(state.get('processing'), processing)
    })
  })
  describe(`Reducer ${SET_STATIC_TEXT_DATA}`, () => {
    it('sets staticText data and processing in state', () => {
      const data = Map({ test: true })
      const processing = true
      const state = reducers(initialState, setStaticTextData(data, processing))
      assert.equal(state.get('data'), data)
      assert.equal(state.get('processing'), processing)
    })
  })
})
