import { describe, it } from 'mocha'
import td from 'testdouble'
import middleware from './middleware'

describe('service dialog middleware', () => {
  describe('Function: middleware()', () => {
    it('should call next with the current action', () => {
      const action = {
        type: 'SET_TEST',
        payload: {},
      }
      const next = td.function()
      middleware()(next)(action)
      td.verify(next(action))
    })
  })
})
