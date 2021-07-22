import { describe, it } from 'mocha'
import td from 'testdouble'
import middleware from './middleware'

describe('service user-account middleware', () => {
  describe('Function: middleare()', () => {
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
  })
})
