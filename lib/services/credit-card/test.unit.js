import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import _range from 'lodash/range'
import _forEach from 'lodash/forEach'
import {
  validateCc,
  validateExpMonth,
  validateExpYear,
  validateCvv,
  formatCardType,
} from './index'

chai.use(chaiImmutable)
const { assert } = chai

const NUMBER_MASTERCARD = '5454545454545454'
const NUMBER_VISA = '4111111111111111'
const NUMBER_AMEX = '378282246310005'
const NUMBER_DISCOVER = '6011111111111117'

describe('service credit card', () => {
  describe('Function: validateCc()', () => {
    it('should validate MasterCard', (done) => {
      validateCc(NUMBER_MASTERCARD)
        .then((cardData) => {
          assert.equal(cardData.get('isValid'), true)
          assert.equal(cardData.get('isPotentiallyValid'), true)
          assert.equal(cardData.getIn(['card', 'niceType']), 'MasterCard')
          done()
        })
        .catch(done)
    })
    it('should validate Visa', (done) => {
      validateCc(NUMBER_VISA)
        .then((cardData) => {
          assert.equal(cardData.get('isValid'), true)
          assert.equal(cardData.get('isPotentiallyValid'), true)
          assert.equal(cardData.getIn(['card', 'niceType']), 'Visa')
          done()
        })
        .catch(done)
    })
    it('should validate American Express', (done) => {
      validateCc(NUMBER_AMEX)
        .then((cardData) => {
          assert.equal(cardData.get('isValid'), true)
          assert.equal(cardData.get('isPotentiallyValid'), true)
          assert.equal(cardData.getIn(['card', 'niceType']), 'American Express')
          done()
        })
        .catch(done)
    })
    it('should validate Discover', (done) => {
      validateCc(NUMBER_DISCOVER)
        .then((cardData) => {
          assert.equal(cardData.get('isValid'), true)
          assert.equal(cardData.get('isPotentiallyValid'), true)
          assert.equal(cardData.getIn(['card', 'niceType']), 'Discover')
          done()
        })
        .catch(done)
    })
  })
  describe('Function: validateExpMonth()', () => {
    _forEach(_range(1, 13), (month) => {
      // eslint-disable-next-line no-param-reassign
      month = month < 10 ? `0${month}` : `${month}`
      it(`should validate ${month} as valid`, (done) => {
        validateExpMonth(month)
          .then((expData) => {
            assert.equal(expData.get('isValid'), true)
            assert.equal(expData.get('isPotentiallyValid'), true)
            done()
          })
          .catch(done)
      })
    })
  })
  describe('Function: validateExpYear()', () => {
    const date = new Date()
    _forEach(_range(date.getFullYear(), date.getFullYear() + 10), (year) => {
      // eslint-disable-next-line no-param-reassign
      year = year.toString()
      it(`should validate ${year} as valid`, (done) => {
        validateExpYear(year)
          .then((expData) => {
            assert.equal(expData.get('isValid'), true)
            assert.equal(expData.get('isPotentiallyValid'), true)
            done()
          })
          .catch(done)
      })
    })
  })
  describe('Function: validateCvv()', () => {
    it('should validate a correct cvv with leading zero for Visa', (
      done,
    ) => {
      validateCc(NUMBER_VISA)
        .then((cardData) => {
          const size = cardData.getIn(['card', 'code', 'size'])
          assert.equal(size, 3)
          validateCvv('059', size)
            .then((cvvData) => {
              assert.equal(cvvData.get('isValid'), true)
              assert.equal(cvvData.get('isPotentiallyValid'), true)
              done()
            })
            .catch(done)
        })
        .catch(done)
    })
    it('should validate a correct cvv without leading zero for Visa', (
      done,
    ) => {
      validateCc(NUMBER_VISA)
        .then((cardData) => {
          const size = cardData.getIn(['card', 'code', 'size'])
          assert.equal(size, 3)
          validateCvv('123', size)
            .then((cvvData) => {
              assert.equal(cvvData.get('isValid'), true)
              assert.equal(cvvData.get('isPotentiallyValid'), true)
              done()
            })
            .catch(done)
        })
        .catch(done)
    })
    it('should validate a correct cvv with leading zero for American Express', (
      done,
    ) => {
      validateCc(NUMBER_AMEX)
        .then((cardData) => {
          const size = cardData.getIn(['card', 'code', 'size'])
          assert.equal(size, 4)
          validateCvv('0379', size)
            .then((cvvData) => {
              assert.equal(cvvData.get('isValid'), true)
              assert.equal(cvvData.get('isPotentiallyValid'), true)
              done()
            })
            .catch(done)
        })
        .catch(done)
    })
    it('should validate a correct cvv without leading zero for American Express', (
      done,
    ) => {
      validateCc(NUMBER_AMEX)
        .then((cardData) => {
          const size = cardData.getIn(['card', 'code', 'size'])
          assert.equal(size, 4)
          validateCvv('1234', size)
            .then((cvvData) => {
              assert.equal(cvvData.get('isValid'), true)
              assert.equal(cvvData.get('isPotentiallyValid'), true)
              done()
            })
            .catch(done)
        })
        .catch(done)
    })
  })
  describe('Function: formatCardType()', () => {
    it('should format American Express correctly', () => {
      assert.equal(formatCardType('American Express'), 'AMEX')
    })
    it('should format MasterCard correctly', () => {
      assert.equal(formatCardType('MasterCard'), 'Mastercard')
    })
    it('should format anything else correctly', () => {
      assert.equal(formatCardType('Test'), 'Test')
    })
  })
})
