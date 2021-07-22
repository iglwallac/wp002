import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  setCookieCanSetCookie,
  SET_COOKIE_CAN_SET_COOKIE,
  setCookieBannerAccepted,
  SET_COOKIE_BANNER_ACCEPTED,
} from './actions'

describe('service cookie actions', () => {
  describe('Function: setCookieCanSetCookie()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_COOKIE_CAN_SET_COOKIE,
        payload: value,
      }
      assert.deepEqual(action, setCookieCanSetCookie(value))
    })
  })
  describe('Function: setCookieBannerAccepted()', () => {
    it('should create an action', () => {
      const value = true
      const action = {
        type: SET_COOKIE_BANNER_ACCEPTED,
        payload: value,
      }
      assert.deepEqual(action, setCookieBannerAccepted(value))
    })
  })
})
