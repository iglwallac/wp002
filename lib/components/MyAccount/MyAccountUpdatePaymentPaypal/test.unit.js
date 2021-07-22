import { describe, it } from 'mocha'
import { assert } from 'chai'
import { USD, EUR } from 'services/currency'
import { isCurrencyIsoSupprted } from '.'

describe('web-app components CartPaypal', () => {
  describe('Function: isCurrencyIsoSupprted()', () => {
    it('should return true if no currency is provided', () => {
      assert.isTrue(isCurrencyIsoSupprted())
    })
    it(`should return true if currency is ${USD}`, () => {
      assert.isTrue(isCurrencyIsoSupprted(USD))
    })
    it(`should return false if currency ${EUR}`, () => {
      assert.isFalse(isCurrencyIsoSupprted(EUR))
    })
  })
})
