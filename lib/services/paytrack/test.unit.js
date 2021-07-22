import { before, afterEach, describe, it } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import { Map, fromJS } from 'immutable'
import nock from 'nock'
import { get as getConfig } from 'config'
import getPaytrackLastTransaction from '.'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

const config = getConfig()

const paytrackMockReturn = {
  id: '623c4e49-e9a9-4512-bd87-034cac8184c7',
  provider_name: 'roku',
}

const auth = Map({
  jwt: 'TEST_JWT',
})

describe('paytrack service', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('Function: getPaytrackLastTransaction()', () => {
    it('should get the last transaction for the user', () => {
      const lastTransactionNock = nock(config.servers.brooklyn)
        .get('/last-transaction')
        .reply(200, paytrackMockReturn)

      const expected = fromJS({
        lastTransaction: paytrackMockReturn,
      })

      return assert.isFulfilled(getPaytrackLastTransaction({ auth }))
        .then((data) => {
          assert.isTrue(lastTransactionNock.isDone(), 'brooklyn endpoint called')
          assert.deepEqual(data, expected)
        })
    })

    it('should return a null state when brooklyn responds with a 400 level error', () => {
      const lastTransactionNockForbidden = nock(config.servers.brooklyn)
        .get('/last-transaction')
        .reply(403)

      const expected = fromJS({
        lastTransaction: {},
      })

      return assert.isFulfilled(getPaytrackLastTransaction({ auth }))
        .then((data) => {
          assert.isTrue(lastTransactionNockForbidden.isDone(), 'brooklyn endpoint called')
          assert.equal(data.get('lastTransaction'), expected.get('lastTransaction'))
        })
    })

    it('should return a null state when brooklyn responds with a 500 level error', async () => {
      const lastTransactionNockError = nock(config.servers.brooklyn)
        .get('/last-transaction')
        .reply(500)

      await assert.isRejected(getPaytrackLastTransaction({ auth }))
      assert.isTrue(lastTransactionNockError.isDone(), 'brooklyn endpoint called')
    })
  })
})
