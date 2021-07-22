import { afterEach, before, describe, it } from 'mocha'
import { Map } from 'immutable'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { get as getConfig } from 'config'
import APPROVE_REMOTE_LOGIN_CODE_SUCCESS from './test/approve-remote-login-code-success.json'
import APPROVE_REMOTE_LOGIN_CODE_NOT_FOUND from './test/approve-remote-login-code-not-found.json'
import APPROVE_REMOTE_LOGIN_CODE_SERVER_ERROR from './test/approve-remote-login-code-server-error.json'
import {
  approveRemoteLoginCode,
} from './index'

describe('service remote-login-code', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)
  const config = getConfig()
  const auth = Map({
    jwt: 'TEST_JWT',
  })

  it('should approve a remote login code', () => {
    const expected = APPROVE_REMOTE_LOGIN_CODE_SUCCESS
    const remoteLoginCode = '123456'
    const approveNock = nock(config.servers.brooklyn)
      .get('/v1/approve-code/123456')
      .reply(200, APPROVE_REMOTE_LOGIN_CODE_SUCCESS)

    return assert.isFulfilled(approveRemoteLoginCode({ auth, remoteLoginCode })
      .then((data) => {
        assert.isTrue(approveNock.isDone(), 'auth api approve-code endpoint called')
        assert.deepEqual(data, expected.data)
      }))
  })

  it('should 400 an invalid remote login code', () => {
    const expected = APPROVE_REMOTE_LOGIN_CODE_NOT_FOUND
    const remoteLoginCode = '111111'
    const remoteLoginCodeNotFoundNock = nock(config.servers.brooklyn)
      .get('/v1/approve-code/111111')
      .reply(400, {})

    return assert.isFulfilled(approveRemoteLoginCode({ auth, remoteLoginCode })
      .then((data) => {
        assert.isTrue(remoteLoginCodeNotFoundNock.isDone(), 'auth endpoint called')
        assert.deepEqual(data, expected.data)
      }))
  })

  it('should 500 a server error', () => {
    const expected = APPROVE_REMOTE_LOGIN_CODE_SERVER_ERROR
    const remoteLoginCode = '222222'
    const remoteLoginCodeNotFoundNock = nock(config.servers.brooklyn)
      .get('/v1/approve-code/222222')
      .reply(500, {})

    return assert.isFulfilled(approveRemoteLoginCode({ auth, remoteLoginCode })
      .then((data) => {
        assert.isTrue(remoteLoginCodeNotFoundNock.isDone(), 'auth endpoint called')
        assert.deepEqual(data, expected.data)
      }))
  })
})
