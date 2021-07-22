import { describe, it } from 'mocha'
import { assert } from 'chai'
import {
  getLanguageFromReq,
  createReqRedirectUrlWithoutLanguage,
} from './middleware'

describe('server-hydrate-user-feature-tracking', () => {
  describe('Function: getLanguageFromReq()', () => {
    it('should return undefined if there is no language query', () => {
      assert.isUndefined(getLanguageFromReq({}))
    })
    it('should return any array if the language query is a string', () => {
      const language = 'es'
      assert.deepEqual([language], getLanguageFromReq({ query: { language } }))
    })
    it('should return any array if the language query is an array', () => {
      const language = 'es'
      assert.deepEqual(
        [language],
        getLanguageFromReq({ query: { language: [language] } }),
      )
    })
  })
  describe('Function: createReqRedirectUrlWithoutLanguage()', () => {
    it('should return req.path if there is no query', () => {
      const req = {
        path: '/test-path',
      }
      assert.equal(req.path, createReqRedirectUrlWithoutLanguage(req))
    })
    it('should return req.path and a query without language', () => {
      const req = {
        path: '/test-path',
        query: {
          language: ['es'],
          test: 1,
        },
      }
      assert.equal(
        `${req.path}?test=1`,
        createReqRedirectUrlWithoutLanguage(req),
      )
    })
  })
})
