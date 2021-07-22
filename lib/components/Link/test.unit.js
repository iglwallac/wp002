import { describe, it } from 'mocha'
import { assert } from 'chai'
import _first from 'lodash/first'
import { Map, List } from 'immutable'
import { EN, ES } from 'services/languages/constants'
import {
  getHashFromPath,
  getHashFromTo,
  createSearch,
} from './index'

describe('components Link', () => {
  describe('Function: getHashFromPath()', () => {
    it('should return the string test for the hash', () => {
      const hash = 'test'
      assert.equal(hash, getHashFromPath(`/some-path#${hash}`))
    })
    it('should return undefined is the hash is not present', () => {
      assert.isUndefined(getHashFromPath('/some-path'))
    })
  })
  describe('Function: getHashFromTo()', () => {
    it('should return the string test for the hash from a string', () => {
      const hash = 'test'
      assert.equal(hash, getHashFromTo(`/some-path#${hash}`))
    })
    it('should return undefined is the hash is not present on a string', () => {
      assert.isUndefined(getHashFromTo('/some-path'))
    })
    it('should return the string test for the hash from an object with a hash property', () => {
      const hash = 'test'
      assert.equal(hash, getHashFromTo({ hash }))
    })
    it('should return the string test for the hash from an object with a pathname property and no hash', () => {
      const hash = 'test'
      assert.equal(hash, getHashFromTo({ pathname: `/some-path#${hash}` }))
    })
    it('should return undefined is the hash and path is not present on a object', () => {
      assert.isUndefined(getHashFromTo({}))
    })
  })
  describe('Function: createSearch()', () => {
    it('should return an empty string', () => {
      const search = ''
      assert.equal(search, createSearch({}))
    })
    it('should return a query with out the default language of english', () => {
      const language = [EN]
      const search = '?test=1'
      assert.equal(search, createSearch({}, { language, test: 1 }))
    })
    it('should return a query with the current query language', () => {
      const language = [ES]
      const search = `?language[]=${_first(language)}`
      assert.equal(search, createSearch({}, { language }))
    })
    it('should return a query with the current query language and not the user language', () => {
      const language = [ES]
      const user = Map({
        data: Map({
          language: List([EN]),
        }),
      })
      const search = `?language[]=${_first(language)}`
      assert.equal(search, createSearch({ user }, { language }))
    })
    it('should return a query without the user language if it is english', () => {
      const language = [EN]
      const user = Map({
        data: Map({
          language: List(language),
        }),
      })
      const search = '?test=1'
      assert.equal(search, createSearch({ user }, { test: 1 }))
    })
    it('should return a query with the user language', () => {
      const language = [ES]
      const userLanguage = List(language)
      const search = `?language[]=${_first(language)}`
      assert.equal(search, createSearch({ userLanguage }, {}))
    })
    it('should return a query with the user language and the current query', () => {
      const language = [ES]
      const query = {
        test: 1,
      }
      const userLanguage = List(language)
      const search = `?language[]=${_first(language)}&test=1`
      assert.equal(search, createSearch({ userLanguage }, query))
    })
  })
})
