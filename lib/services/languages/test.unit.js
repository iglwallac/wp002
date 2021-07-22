import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS, List } from 'immutable'
import { isDefault, getPrimary, get } from './'
import LANGUAGES_DATA from './languages.json'
import { EN, ES } from './constants'

chai.use(chaiImmutable)
const { assert } = chai

describe('service languages', () => {
  describe('Function: getPrimary()', () => {
    it('should get the primary language from a string', () => {
      assert.equal(EN, getPrimary(EN))
    })
    it('should get the primary language from an array', () => {
      const languages = [EN]
      assert.equal(EN, getPrimary(languages))
    })
    it('should get the primary language from a List', () => {
      const languages = List([EN])
      assert.equal(EN, getPrimary(languages))
    })
  })
  describe('Function: isDefault()', () => {
    it('should return true for the en string', () => {
      assert.isTrue(isDefault(EN))
    })
    it('should return true for an array where en is first', () => {
      const languages = [EN]
      assert.isTrue(isDefault(languages))
    })
    it('should return true for a List where en is first', () => {
      const languages = List([EN])
      assert.isTrue(isDefault(languages))
    })
    it('should return false for the es string', () => {
      assert.isFalse(isDefault(ES))
    })
    it('should return false for an array where en is second', () => {
      const languages = [ES, EN]
      assert.isFalse(isDefault(languages))
    })
  })
  describe('Function: get()', () => {
    it('should get the language data', (done) => {
      get()
        .then((languages) => {
          assert.equal(fromJS(LANGUAGES_DATA), languages)
          done()
        })
        .catch(done)
    })
  })
})
