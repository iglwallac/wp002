import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { get as getConfig } from 'config'
import { EN } from 'services/languages/constants'
import { stringify as stringifyQuery } from 'services/query-string'
import {
  sendEmail,
  updatePassword,
} from '.'

const { assert } = chai.use(chaiImmutable).use(chaiAsPromised)

describe('service reset-password', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  const config = getConfig()
  describe('Function: sendEmail()', () => {
    it('should get password reset response', async () => {
      const email = 'test@gaia.com'
      const primaryLanguage = EN
      const scope = nock(config.servers.brooklyn)
        .post('/v1/password/send-email', stringifyQuery({
          email,
          primaryLanguage,
        }))
        .reply(200, {
          success: true,
          error: '',
        })

      const data = await sendEmail({ email, primaryLanguage })
      assert.isTrue(scope.isDone(), 'brooklyn password send email endpoint called')
      assert.deepEqual(data, {
        success: true,
        error: '',
      })
    })
  })
  describe('Function: updatePassword()', () => {
    it('should send update password', async () => {
      const uid = 8
      const expiry = Math.floor(Date.now() / 1000) + 3600
      const token = 'abc123'
      const newPassword = 'password'
      const scope = nock(config.servers.brooklyn)
        .post('/v1/password/reset', stringifyQuery({
          uid,
          expiry,
          token,
          newPassword,
        }))
        .reply(200, {
          success: true,
          error: '',
        })
      const data = await updatePassword({
        uid,
        expiry,
        token,
        newPassword,
      })
      assert.isTrue(scope.isDone(), 'brooklyn password reset password endpoint called')
      assert.deepEqual(data, {
        success: true,
        error: '',
      })
    })
  })
})
