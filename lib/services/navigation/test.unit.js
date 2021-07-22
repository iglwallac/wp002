import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import { Map, List } from 'immutable'
import { EN, ES } from 'services/languages/constants'
import {
  historyRedirect,
  createUrl,
  createLanguageQueryParam,
} from '.'

describe('service navigation', () => {
  describe('Function: historyRedirect()', () => {
    it('should preform a history push with the provided url', (done) => {
      const history = { push: td.function() }
      const url = 'http://www.gaia.com'
      const timeout = 0
      historyRedirect({ history, url, timeout }, () => {
        td.verify(history.push(url))
        done()
      })
    })
    it('should preform a history push with the provided url and not include language becuase there is a jwt', (done) => {
      const history = { push: td.function() }
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      const language = List([ES])
      const url = 'http://www.gaia.com'
      const timeout = 0
      historyRedirect({ history, url, auth, language, timeout }, () => {
        td.verify(history.push(url))
        done()
      })
    })
    it('should preform a history push with the provided url and include language', (done) => {
      const history = { push: td.function() }
      const auth = Map()
      const language = List([ES])
      const url = 'http://www.gaia.com?language[]=es'
      const timeout = 0
      historyRedirect({ history, url, auth, language, timeout }, () => {
        td.verify(history.push(url))
        done()
      })
    })
    it('should preform a history push with the provided url when the user language exists, but the language is not provided', (done) => {
      const history = { push: td.function() }
      const auth = Map()
      const user = Map({ data: Map({ language: List([ES]) }) })
      const url = 'http://www.gaia.com?language[]=es'
      const timeout = 0
      historyRedirect({ history, url, auth, user, timeout }, () => {
        td.verify(history.push(url))
        done()
      })
    })
    it('should preform a history push with the language provided url when the language and user language exists', (done) => {
      const history = { push: td.function() }
      const auth = Map()
      const language = List([EN])
      const user = Map({ data: Map({ language: List([ES]) }) })
      const url = 'http://www.gaia.com?language[]=en'
      const timeout = 0
      historyRedirect({ history, url, auth, user, language, timeout }, () => {
        td.verify(history.push(url))
        done()
      })
    })
  })
  describe('Function: createLanguageQueryParam()', () => {
    it('should return an array if the language is a string', () => {
      const language = ES
      assert.deepEqual([language], createLanguageQueryParam(language))
    })
    it('should return an array if the language is an array', () => {
      const language = ES
      assert.deepEqual([language], createLanguageQueryParam([language]))
    })
  })
  describe('Function: createUrl()', () => {
    it('should just return the url if the language parameter is not present', () => {
      const url = 'http://www.gaia.com'
      assert.equal(createUrl(url), url)
    })
    it('should just return the url with a language if the language parameter is present and it is not on the url', () => {
      const url = 'http://www.gaia.com'
      const language = ES
      assert.equal(createUrl(url, language), `${url}/?language[]=${language}`)
    })
    it('should just return the url if the language parameter is present and it is on the url', () => {
      const url = 'http://www.gaia.com?language%5B%5D=de'
      const language = ES
      assert.equal(createUrl(url, language), url)
    })
  })
})
