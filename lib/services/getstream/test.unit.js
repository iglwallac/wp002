import { describe, it } from 'mocha'
import { assert } from 'chai'
import nock from 'nock'
import { Map } from 'immutable'
import { get as getConfig } from 'config'
import GETSTREAM_AUTH_HANDLED_RESPONSE from './test/getstream-user-token.json'
import { createSession } from './'

const config = getConfig()

function createNock () {
  return nock(config.servers.brooklyn)
    .post('/v1/getstream-io/auth')
    .reply(201, GETSTREAM_AUTH_HANDLED_RESPONSE.success)
}

function createForbiddenNock () {
  return nock(config.servers.brooklyn)
    .post('/v1/getstream-io/auth')
    .reply(403)
}

function createErrorNock () {
  return nock(config.servers.brooklyn)
    .post('/v1/getstream-io/auth')
    .reply(500, GETSTREAM_AUTH_HANDLED_RESPONSE.error)
}

describe('service getstream index', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('Function: createSession()', () => {
    it('should get stream auth data', () => {
      const expected = GETSTREAM_AUTH_HANDLED_RESPONSE.success
      const scope = createNock()
      const auth = Map({ jwt: 'TEST_JWT' })
      return assert.isFulfilled(createSession({ auth })
        .then((data) => {
          assert.isTrue(scope.isDone(), 'getstream auth endpoint called')
          assert.hasAllKeys(data, [
            'userToken',
            'forbidden',
            'expires',
            'userId',
            'apiKey',
            'appId',
            'error',
            'id',
          ])
          assert.equal(data.userId, expected.userId)
          assert.equal(data.token, expected.token)
          assert.equal(data.forbidden, false)
        }))
    })

    it('should handle access denied', () => {
      const scope = createForbiddenNock()
      return assert.isFulfilled(createSession())
        .then((data) => {
          assert.isTrue(scope.isDone(), 'getstream auth endpoint called')
          assert.equal(data.forbidden, true)
          assert.equal(data.error, false)
        })
    })

    it('should error correctly', () => {
      const scope = createErrorNock()
      return assert.isFulfilled(createSession())
        .then((data) => {
          assert.isTrue(scope.isDone(), 'getstream auth endpoint called')
          assert.equal(data.forbidden, false)
          assert.equal(data.error, true)
        })
    })
  })
})
