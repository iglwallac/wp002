import { describe, it, after } from 'mocha'
import td from 'testdouble'
import { SET_AUTH_DATA } from 'services/auth/actions'
import middleware from './middleware'

describe('service auth middleware', () => {
  describe('Function: middleware()', () => {
    it('should call next with the action provided', () => {
      const store = {}
      const action = { type: 'TEST', test: true }
      const next = td.function()
      middleware(store)(next)(action)
      td.verify(next(action))
    })
    it('should call next with the action provided if browser === false', () => {
      const store = {}
      const action = { type: 'TEST', test: true }
      const next = td.function()
      middleware(store, { browser: false })(next)(action)
      td.verify(next(action))
    })
    it('should handle SET_AUTH_DATA and call global function auth.setAuthCookie', () => {
      after(() => { global.auth = undefined })
      global.auth = { setAuthCookie: td.function() }
      const store = {}
      const jwt = 'theJWT'
      const action = { type: SET_AUTH_DATA, payload: { data: { jwt } } }
      const next = td.function()
      middleware(store, { browser: true })(next)(action)
      td.verify(global.auth.setAuthCookie())
      td.verify(next(action))
    })
    it('should handle SET_AUTH_DATA without global function auth.setAuthCookie', () => {
      const store = {}
      const jwt = 'theJWT'
      const action = { type: SET_AUTH_DATA, payload: { data: { jwt } } }
      const next = td.function()
      middleware(store, { browser: true })(next)(action)
      td.verify(next(action))
    })
  })
})
