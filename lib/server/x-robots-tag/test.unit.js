import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import _isFunction from 'lodash/isFunction'
import middleware from './middleware'

describe('server middleware x-robots-tag', () => {
  describe('Function middleware()', () => {
    it('should return a function when called', () => {
      assert.isTrue(_isFunction(middleware()))
    })

    it('should call setHeader with noindex and next', () => {
      const req = {}
      const res = { setHeader: td.function() }
      const next = td.function()
      middleware({ noindex: true })(req, res, next)
      td.verify(res.setHeader('X-Robots-Tag', 'noindex'))
      td.verify(next())
    })

    it('should call setHeader with nofollow and next', () => {
      const req = {}
      const res = { setHeader: td.function() }
      const next = td.function()
      middleware({ nofollow: true })(req, res, next)
      td.verify(res.setHeader('X-Robots-Tag', 'nofollow'))
      td.verify(next())
    })

    it('should call setHeader with noindex, nofollow and next', () => {
      const req = {}
      const res = { setHeader: td.function() }
      const next = td.function()
      middleware({ nofollow: true, noindex: true })(req, res, next)
      td.verify(res.setHeader('X-Robots-Tag', 'noindex, nofollow'))
      td.verify(next())
    })
  })
})
