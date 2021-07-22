import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import {
  getReqAuthToken,
  getReqAuthUid,
  getReqUserLanguage,
  getPathname,
  setResNoCache,
  sendRes503RetryAfter,
  hydrateReq,
  isReqForwardedProtoHttps,
} from './common'

describe('server-common', () => {
  describe('Function: getReqAuthToken()', () => {
    it('should return undefined if there is no auth', () => {
      const req = {}
      assert.isUndefined(getReqAuthToken(req))
    })
    it('should return the jwt if it exists', () => {
      const jwt = 'TOKEN'
      const req = {
        hydrate: {
          auth: { jwt },
        },
      }
      assert.equal(jwt, getReqAuthToken(req))
    })
  })
  describe('Function: getReqAuthUid()', () => {
    it('should return undefined if there is no uid', () => {
      const req = {}
      assert.isUndefined(getReqAuthUid(req))
    })
    it('should return the jwt if it exists', () => {
      const uid = 1234
      const req = {
        hydrate: {
          auth: { uid },
        },
      }
      assert.equal(uid, getReqAuthUid(req))
    })
  })
  describe('Function: getReqUserLanguage()', () => {
    it('should return undefined if there is no language query', () => {
      const req = {}
      assert.isUndefined(getReqUserLanguage(req))
    })
    it('should return an array if the language query is a string', () => {
      const language = 'es'
      const req = {
        hydrate: {
          user: {
            data: { language: [language] },
          },
        },
      }
      assert.equal(language, getReqUserLanguage(req))
    })
  })
  describe('Function: getPathname()', () => {
    it('should return path part of a originalUrl from the req', () => {
      const pathname = '/some-url/test'
      const search = '?test=1'
      const req = {
        originalUrl: `${pathname}${search}`,
      }
      assert.equal(pathname, getPathname(req))
    })
  })
  describe('Function: setResNoCache()', () => {
    it('should set no caching and expires header on res', () => {
      const req = {
        setHeader: td.function(),
      }
      setResNoCache(req)
      td.verify(req.setHeader(
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
      ))
      td.verify(req.setHeader(
        'Expires',
        new Date('1970-01-01 00:00:00').toUTCString(),
      ))
    })
  })
  describe('Function: sendRes503RetryAfter()', () => {
    it('should set no caching and expires header on res', () => {
      const retryAfter = 300
      const req = {
        status: td.function(),
        setHeader: td.function(),
      }
      sendRes503RetryAfter(req, retryAfter)
      td.verify(req.status(503))
      td.verify(req.setHeader('Retry-After', retryAfter))
    })
  })
  describe('Function: hydrateReq()', () => {
    it('should hydrate value on req', () => {
      const data = { auth: { jwt: 'TEST_JWT' } }
      const req = {}
      hydrateReq(req, data)
      assert.deepEqual(req.hydrate, data)
    })
  })
  describe('Function: isReqForwardedProtoHttps()', () => {
    it('should return true when X-Forwarded-Proto is https', () => {
      const req = {
        get: (value) => {
          if (value === 'X-Forwarded-Proto') {
            return 'https'
          }
          return null
        },
      }
      assert.isTrue(isReqForwardedProtoHttps(req))
    })
    it('should return true when X-Forwarded-Proto is not https', () => {
      const req = {
        get: () => null,
      }
      assert.isFalse(isReqForwardedProtoHttps(req))
    })
  })
})
