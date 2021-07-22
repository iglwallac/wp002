import { describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import { fromJS } from 'immutable'

import {
  formatOrder,
  formatBilling,
  formatTracking,
} from './index'


chai.use(chaiImmutable)
const { assert } = chai

const firstName = 'Bob'
const lastName = 'Smith'
const email = 'test@gaia.com'
const utm = 'fake_utm'
const linkshare = 'fake_linkshare'
const chan = 'fake_chan'
const cid = 'fake_cid'
const siteID = 'fake_site_id'
const timestamp = 1547837389

const userInfo = {
  firstName,
  lastName,
  emailOptIn: true,
  email,
}

const currencyIso = 'USD'
const tracking = {
  utm,
  linkshare,
  chan,
  cid,
}
const inboundTracking = fromJS({
  data: {
    linkshare: {
      siteID,
      timestamp,
    },
    strings: {
      utm,
    },
    chan,
    cid,
  },
})
const productRatePlanId = 'test_rate_plan_id'
const paymentMethodId = 'test_credit_card_method_id'
const creditCardCountry = 'USA'
const postalCode = '80027'
const zuoraPaymentInfo = {
  currencyIso,
  productRatePlanId,
  creditCard: {
    paymentMethodId,
  },
  country: creditCardCountry,
  postalCode,
}

describe('service checkout', () => {
  describe('Function: formatOrder()', () => {
    it('should format an Zuora order create correctly', () => {
      const language = ['en']
      const payment = formatOrder({
        userInfo,
        paymentInfo: zuoraPaymentInfo,
        tracking,
        language,
      })

      assert.isTrue(payment.user.emailOptIn)
      assert.isTrue(payment.user.sendWelcomeEmail)
      assert.deepEqual(language, payment.user.language)
      assert.equal(payment.user.firstName, firstName)
      assert.equal(payment.user.lastName, lastName)
      assert.equal(payment.user.email, email)
      assert.equal(payment.billing.productRatePlanId, productRatePlanId)
      assert.equal(payment.billing.creditCard.paymentMethodId, paymentMethodId)
      assert.equal(payment.billing.currency, currencyIso)
    })
  })

  describe('Function: formatBilling()', () => {
    it('should format billing data correctly', () => {
      const billing = formatBilling({
        currencyIso,
        productRatePlanId,
        country: creditCardCountry,
        postalCode,
        creditCard: {
          paymentMethodId,
        },
      })

      assert.equal(billing.productRatePlanId, productRatePlanId, 'productRatePlanIds do not match')
      assert.equal(billing.creditCard.paymentMethodId, paymentMethodId, 'paymentMethodIds do not match')
      assert.equal(billing.currency, currencyIso, 'currencyIsos do not match')
      assert.equal(billing.country, creditCardCountry, 'Country codes do not match')
      assert.equal(billing.postalCode, postalCode, 'Postal codes do not match')
    })
  })
  describe('Function: formatTracking()', () => {
    it('should format billing tracking data correctly', () => {
      const trackingInfo = formatTracking(inboundTracking)
      assert.equal(trackingInfo.utm, utm)
      assert.equal(trackingInfo.linkshare.siteID, siteID)
      assert.equal(trackingInfo.linkshare.timestamp, timestamp)
      assert.equal(trackingInfo.chan, chan)
      assert.equal(trackingInfo.cid, cid)
    })
  })
})
