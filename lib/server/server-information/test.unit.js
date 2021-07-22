import { describe, it } from 'mocha'
import td from 'testdouble'
import strictUriEncode from 'strict-uri-encode'
import middleware from './middleware'

describe('server-information', () => {
  describe('express middleware', () => {
    it('should call status with 501 and json', () => {
      const name = 'test'
      const version = '1234'
      const req = {}
      const setHeader = td.function()
      const res = { setHeader }
      const next = td.function()
      middleware({ name, version })(req, res, next)
      td.verify(setHeader(
        'Server',
        `${strictUriEncode(name)}/${strictUriEncode(version)}`,
      ))
      td.verify(next())
    })
  })
})
