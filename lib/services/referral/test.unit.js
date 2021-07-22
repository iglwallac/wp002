import { before, afterEach, describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import { Map } from 'immutable'
import nock from 'nock'
import { get as getConfig } from 'config'
import { getReferralData } from './index'
import BROOKLYN_JSON_API_USER_REFERRAL_DATA from './test/brooklyn-json-api-user-referral.json'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

const config = getConfig()

function createUserReferralDataRequestNock () {
  return nock(config.servers.brooklyn)
    .get('/v1/user/referrals')
    .reply(200, BROOKLYN_JSON_API_USER_REFERRAL_DATA)
}

describe('service user referrals', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('Function: getReferralData()', () => {
    it('should get the user referral data', () => {
      const expected = BROOKLYN_JSON_API_USER_REFERRAL_DATA
      const scope = createUserReferralDataRequestNock()
      const auth = Map({
        jwt: 'TEST_JWT',
      })
      return assert.isFulfilled(getReferralData({ auth })
        .then((data) => {
          assert.isTrue(scope.isDone(), 'user referral data endpoint called')
          assert.deepEqual(data, expected)
        }))
    })
  })
})
