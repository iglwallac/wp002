import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import {
  formatPayment,
  formatZuoraPaymentMethod,
} from './index'

chai.use(chaiImmutable)
const { assert } = chai


// const paypalInfo = {
//   paymentType: 'paypal',
//   nonce: 'TEST_NONCE',
//   currencyIso,
// }

const updatePaymentInfo = {
  type: 'creditCard',
  cardholderName: 'Card Holder',
  expirationMonth: '01',
  expirationYear: '2020',
  cardNumber: '5454545454545454',
  cvv: '123',
  postalCode: '80220',
  countryIso: 'US',
}

const currencyIso = 'USD'

const zuoraUpdatePaymentCCInfo = {
  country: 'USA',
  postalCode: '80027',
  paymentMethodId: 'fake_payment_method_id',
}

const zuoraUpdatePaymentPaypalInfo = {
  country: 'US',
  postalCode: '80027',
  payPalNonce: 'fake_payment_paypal_nonce',
  state: 'CO',
}

describe('service updatePayment', () => {
  describe('Function: formatPayment()', () => {
    it('should format a credit card order correctly', () => {
      const paymentInfo = updatePaymentInfo
      const payment = formatPayment({ paymentInfo, currencyIso })
      assert.equal(payment.creditCard.type, paymentInfo.type)
      assert.equal(payment.creditCard.cardHolder, paymentInfo.cardholderName)
      assert.equal(payment.creditCard.expMonth, paymentInfo.expirationMonth)
      assert.equal(payment.creditCard.expYear, paymentInfo.expirationYear)
      assert.equal(payment.creditCard.number, paymentInfo.cardNumber)
      assert.equal(payment.creditCard.cvv, paymentInfo.cvv)
      assert.equal(payment.creditCard.billingLocation.postalCode, paymentInfo.postalCode)
      assert.deepEqual(payment.creditCard.billingLocation.countryIso, paymentInfo.countryIso)
      assert.equal(payment.creditCard.currencyIso, currencyIso)
    })
    it('should format a zuora credit card update payment correctly', () => {
      const paymentInfo = zuoraUpdatePaymentCCInfo
      const payment = formatZuoraPaymentMethod(zuoraUpdatePaymentCCInfo)
      assert.equal(payment.creditCard.paymentMethodId, paymentInfo.paymentMethodId)
      assert.equal(payment.country, paymentInfo.country)
      assert.equal(payment.postalCode, paymentInfo.postalCode)
    })
    it('should format a zuora paypal update payment correctly', () => {
      const paymentInfo = zuoraUpdatePaymentPaypalInfo
      const payment = formatZuoraPaymentMethod(zuoraUpdatePaymentPaypalInfo)
      assert.equal(payment.payPal.payPalNonce, paymentInfo.payPalNonce)
      assert.equal(payment.country, paymentInfo.country)
      assert.equal(payment.postalCode, paymentInfo.postalCode)
      assert.equal(payment.state, paymentInfo.state)
    })
  })
})
