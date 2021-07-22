import { before, afterEach, describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import { Map } from 'immutable'
import nock from 'nock'
import { get as getConfig } from 'config'
import BILLING_SUBSCRIPTION_PAYMENTS from './test/billing-subscription-payments.json'
import {
  checkUserSubscriptionStatus,
  getUserSubscriptionPayments,
} from './index'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

const config = getConfig()
const billingAccountId = '2c92c0fb71c65de20171d0c9f4cd1f50'
const billingAccountNumber = 'A00031454'

function createUserSubscriptionStatusCheckNock () {
  return nock(config.servers.brooklyn)
    .post('/v1/user/subscription/check')
    .reply(200, { activeSubscription: true })
}

function createUserSubscriptionPaymentsNock () {
  return nock(config.servers.brooklyn)
    .get('/v1/payments')
    .query({ accountId: billingAccountId, accountNumber: billingAccountNumber })
    .reply(200, BILLING_SUBSCRIPTION_PAYMENTS)
}

describe('service user-account', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  describe('Function: checkUserSubscriptionStatus()', () => {
    it('should get the user subscription status', () => {
      const expected = { _dataError: undefined, activeSubscription: true }
      const email = 'dansmith@example.com'
      const scope = createUserSubscriptionStatusCheckNock()

      return assert.isFulfilled(checkUserSubscriptionStatus({ email })
        .then((data) => {
          assert.isTrue(scope.isDone(), 'brooklyn api subscription status check endpoint called')
          assert.deepEqual(data, expected)
        }))
    })
  })
  describe('Function: getUserSubscriptionPayments()', () => {
    it('should get the user subscription payments', () => {
      const expected = {
        success: true,
        error: undefined,
        data: BILLING_SUBSCRIPTION_PAYMENTS,
      }
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      const scope = createUserSubscriptionPaymentsNock()

      return assert.isFulfilled(getUserSubscriptionPayments(
        { auth, accountNumber: billingAccountNumber, accountId: billingAccountId },
      )
        .then((data) => {
          assert.isTrue(scope.isDone(), 'brooklyn api subscription payments endpoint called')
          assert.deepEqual(data, expected)
        }))
    })
  })
})
