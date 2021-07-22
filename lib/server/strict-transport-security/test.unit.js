import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import _isFunction from 'lodash/isFunction'
import stsMiddleware from './middleware'

describe('server middleware strict-transport-security', () => {
  describe('Function stsMiddleware()', () => {
    it('returns a function when called', () => {
      assert.isTrue(_isFunction(stsMiddleware()))
    })

    it('http request: route calls next and NOT setHeader', () => {
      const req = { get: () => null }
      const res = { setHeader: td.function() }
      const next = td.function()
      stsMiddleware({ 'max-age': 60 })(req, res, next)
      td.verify(next())
      td.verify(res.setHeader(), { times: 0 })
    })

    it('https request: route calls next and setHeader', () => {
      const req = { get: () => 'https' }
      const res = { setHeader: td.function() }
      const next = td.function()
      stsMiddleware({ 'max-age': 60 })(req, res, next)
      td.verify(next())
      td.verify(res.setHeader('Strict-Transport-Security', 'max-age=60'))
    })
  })
})
