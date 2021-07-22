import { describe, it } from 'mocha'
import { assert } from 'chai'
import td from 'testdouble'
import { setLogger } from 'log'
import nock from 'nock'
import { AUTH_COOKIE_NAME } from 'services/auth'
import { get as getConfig } from 'config'
import middleware from './middleware'

describe('server auth', () => {
  before(() => {
    nock.disableNetConnect()
  })
  after(() => {
    nock.enableNetConnect()
  })
  afterEach(() => {
    setLogger(undefined)
  })
  describe('Function: middleware()', () => {
    const { servers, origin } = getConfig()
    it('should call next with out doing anything when there is no auth cookie', async () => {
      const req = {}
      const res = {
        cookie: td.function(),
      }
      const next = td.function()
      await middleware({ origin })(req, res, next)
      td.verify(res.cookie(), { times: 0, ignoreExtraArgs: true }, 'res.cookie is not called')
      td.verify(next(), 'next is called')
    })
    it('should handle a negative uid i.e. anonymous', async () => {
      const log = {
        info: td.function(),
        error: td.function(),
        warn: td.function(),
      }
      setLogger(log)
      const auth = { uid: -1, idExpires: Math.floor(Date.now() / 1000) + 60 }
      const req = {
        cookies: { auth: JSON.stringify(auth) },
      }
      const res = {
        cookie: td.function(),
        status: td.function(),
        clearCookie: td.function(),
      }
      const next = td.function()
      await middleware({ origin })(req, res, next)
      td.verify(log.info(), { ignoreExtraArgs: true })
      td.verify(log.warn('Failed Hydrating Auth', auth))
      td.verify(log.error(), { times: 0, ignoreExtraArgs: true })
      td.verify(res.cookie(), { times: 0, ignoreExtraArgs: true })
      td.verify(res.clearCookie(AUTH_COOKIE_NAME))
      td.verify(res.status(400))
      td.verify(next())
    })
    it('should handle a valid auth with a postive uid when it is expired', async () => {
      const log = {
        info: td.function(),
        error: td.function(),
        warn: td.function(),
      }
      setLogger(log)
      const date = new Date('2020-03-01T010:00:00')
      const nowSeconds = Math.floor(date.getTime() / 1000)
      const auth = { uid: 10, idExpires: nowSeconds - 60, success: true }
      const req = {
        cookies: { auth: JSON.stringify(auth), jwt: 'EXPIRED_JWT' },
      }
      const res = {
        cookie: td.function(),
        status: td.function(),
        clearCookie: td.function(),
      }
      const next = td.function()
      const scope = nock(servers.brooklyn)
        .matchHeader('accept', 'application/json')
        .post('/v1/renew', 'device=web-app')
        .reply(200, {
          uid: 10,
          idExpires: nowSeconds + 60,
          jwt: 'RENEWED_JWT',
          success: true,
          subscriptions: [235],
          roleIds: [],
        })
      await middleware({ origin })(req, res, next)
      const expectedCookie = {
        success: true,
        jwt: 'RENEWED_JWT',
        idExpires: nowSeconds + 60,
        uid: 10,
        subscriptions: [235],
        roleIds: [],
        roles: ['view-site'],
      }
      assert.isTrue(scope.isDone(), 'auth renew endpoint called')
      td.verify(log.info(), { ignoreExtraArgs: true })
      td.verify(log.warn(), { times: 0, ignoreExtraArgs: true })
      td.verify(log.error(), { times: 0, ignoreExtraArgs: true })
      td.verify(res.cookie(
        AUTH_COOKIE_NAME,
        JSON.stringify(expectedCookie),
        { path: '/', secure: td.matchers.isA(Boolean), expires: td.matchers.isA(Date) }),
      )
      td.verify(res.clearCookie(), { times: 0, ignoreExtraArgs: true })
      td.verify(res.status(), { times: 0, ignoreExtraArgs: true })
      td.verify(next())
    })
  })
})
