import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import reducers, { initialState } from './reducers'
import {
  setCookieCanSetCookie,
} from './actions'

chai.use(chaiImmutable)
const { assert } = chai

describe('service gift reducers', () => {
  describe('Reducer SET_GIFT_CHEKOUT_STEP', () => {
    it('should set [\'canSetCookie\'] true in state', () => {
      const value = true
      const state = reducers(
        initialState,
        setCookieCanSetCookie(value),
      )
      assert.equal(value, state.get('canSetCookie'))
    })
  })
})
