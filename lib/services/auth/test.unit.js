import { assert } from 'chai'
import td from 'testdouble'
import nock from 'nock'
import { v4 as uuidv4 } from 'uuid'
import { REQUEST_TYPE_X_WWW_FORM_URLENCODED, TYPE_BROOKLYN } from 'api-client'
import { stringify as stringifyQuery } from 'services/query-string'
import { get as getConfig } from 'config'
import { Map } from 'immutable'
import {
  getUidFromStorage,
  getTokenFromStorage,
  getTokenDataFromStorage,
  setTokenDataInStorage,
  getAuthJwt,
  getAuthIsLoggedIn,
  renew,
  DEVICE,
} from '.'
import { LOGIN_CODE_BLOCKED_USER, LOGIN_CODE_INVALID_TOKEN } from './login-codes'

const config = getConfig()
const tokenData = {
  uid: 1234,
  username: 'test',
  idExpires: 1234567890,
  jwt: 'TEST_JWT',
}
const getStorage = {
  get () {
    return JSON.stringify(tokenData)
  },
}

describe('service auth', () => {
  describe('Function: getTokenFromStorage()', () => {
    it('should get jwt from storage', () => {
      const jwt = getTokenFromStorage(getStorage)
      assert.equal(jwt, tokenData.jwt)
    })
  })
  describe('Function: getUidFromStorage()', () => {
    it('should get jwt from storage', () => {
      const uid = getUidFromStorage(getStorage)
      assert.equal(uid, tokenData.uid)
    })
  })
  describe('Function: getTokenDataFromStorage()', () => {
    it('should get data from storage', () => {
      const result = getTokenDataFromStorage(getStorage)
      assert.equal(result.uid, tokenData.uid)
      assert.equal(result.username, tokenData.username)
      assert.equal(result.idExpires, tokenData.idExpires)
      assert.equal(result.jwt, tokenData.jwt)
    })
  })
  describe('Function: setTokenDataInStorage()', () => {
    it('should set data in storage', () => {
      const storage = { set: td.function(), expire: td.function() }
      const storageOptions = {
        path: '/test',
        secure: true,
      }
      setTokenDataInStorage(tokenData, storage, storageOptions)
      td.verify(storage.expire(), { times: 2, ignoreExtraArgs: true })
      td.verify(storage.set(
        'auth',
        JSON.stringify(tokenData),
        {
          expires: td.matchers.isA(Date),
          path: '/test',
          secure: true,
        },
      ))
    })
    it('should expire data in storage', () => {
      const expire = td.function()
      const storage = { expire }
      setTokenDataInStorage(null, storage)
      td.verify(expire('auth'))
    })
  })
  describe('Function: getAuthJwt()', () => {
    it('should get the jwt when auth is a string', () => {
      const jwt = 'JWT'
      assert.equal(getAuthJwt(jwt), jwt)
    })
    it('should get the jwt when auth is a Map with a jwt', () => {
      const jwt = 'JWT'
      const auth = Map({ jwt })
      assert.equal(getAuthJwt(auth), jwt)
    })
  })
  describe('Function: getAuthIsLoggedIn()', () => {
    it('should return false when auth undefined', () => {
      const jwt = undefined
      assert.isFalse(getAuthIsLoggedIn(jwt))
    })
    it('should return true when auth is a string', () => {
      const jwt = 'JWT'
      assert.isTrue(getAuthIsLoggedIn(jwt))
    })
    it('should return true when auth is a Map with a jwt', () => {
      const jwt = 'JWT'
      const auth = Map({ jwt })
      assert.isTrue(getAuthIsLoggedIn(auth))
    })
    it('should return false when auth is a Map without a jwt', () => {
      const jwt = undefined
      const auth = Map({ jwt })
      assert.isFalse(getAuthIsLoggedIn(auth))
    })
  })
  describe('Function: renew()', () => {
    it('should successfully call the api to renew the token', async () => {
      const jwt = 'TEST_JWT'
      const expected = {
        success: true,
        roleIds: [2],
        jwt,
        idExpires: Math.floor(Date.now() / 1000), // Expire in 24 hours if it is not provided.
        uid: 8,
        uuid: uuidv4(),
        email: 'test@gaia.com',
        username: 'test',
        country: 'US',
        subscriptions: [253],
        userAccountId: uuidv4(),
      }
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('accept', 'application/json')
        .matchHeader('content-type', REQUEST_TYPE_X_WWW_FORM_URLENCODED)
        .matchHeader('authorization', `Bearer ${jwt}`)
        .post('/v1/renew', stringifyQuery({ device: DEVICE }))
        .reply(200, expected)
      const data = await renew({ auth: { jwt } })
      assert.nestedPropertyVal(data, 'auth.success', expected.success)
      assert.nestedPropertyVal(data, 'auth.jwt', expected.jwt)
      assert.deepNestedPropertyVal(data, 'auth.roleIds', expected.roleIds)
      assert.nestedPropertyVal(data, 'auth.jwt', expected.jwt)
      assert.nestedPropertyVal(data, 'auth.idExpires', expected.idExpires)
      assert.nestedPropertyVal(data, 'auth.uid', expected.uid)
      assert.nestedPropertyVal(data, 'auth.uuid', expected.uuid)
      assert.nestedPropertyVal(data, 'auth.email', expected.email)
      assert.nestedPropertyVal(data, 'auth.username', expected.username)
      assert.nestedPropertyVal(data, 'auth.country', expected.country)
      assert.deepNestedPropertyVal(data, 'auth.subscriptions', expected.subscriptions)
      assert.deepNestedPropertyVal(data, 'auth.userAccountId', expected.userAccountId)
      assert.isTrue(scope.isDone(), 'renew endpoint is called')
    })
    it('should succesfully call the api to renew the token and handle a 200 response with success false and codes', async () => {
      const jwt = 'TEST_JWT'
      const expected = {
        success: false,
        codes: [LOGIN_CODE_BLOCKED_USER],
        messages: [],
        jwt: null,
        idToken: null,
      }
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('accept', 'application/json')
        .matchHeader('content-type', REQUEST_TYPE_X_WWW_FORM_URLENCODED)
        .matchHeader('authorization', `Bearer ${jwt}`)
        .post('/v1/renew', stringifyQuery({ device: DEVICE }))
        .reply(200, expected)
      const data = await renew({ auth: { jwt } })
      assert.nestedPropertyVal(data, 'auth.success', expected.success)
      assert.deepNestedPropertyVal(data, 'auth.codes', expected.codes)
      assert.deepNestedPropertyVal(data, 'auth.messages', expected.messages)
      assert.nestedPropertyVal(data, 'auth.jwt', expected.jwt)
      assert.nestedPropertyVal(data, 'auth.idToken', expected.idToken)
      assert.isTrue(scope.isDone(), 'renew endpoint is called')
    })
    it('should succesfully call the api to renew the token and handle a 403 response with success false and codes', async () => {
      const jwt = 'TEST_JWT'
      const expected = {
        success: false,
        codes: [LOGIN_CODE_INVALID_TOKEN],
        messages: [],
        jwt: null,
        idToken: null,
      }
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('accept', 'application/json')
        .matchHeader('content-type', REQUEST_TYPE_X_WWW_FORM_URLENCODED)
        .matchHeader('authorization', `Bearer ${jwt}`)
        .post('/v1/renew', stringifyQuery({ device: DEVICE }))
        .reply(403, {})
      const data = await renew({
        retryOnError: false,
        auth: { jwt },
      })
      assert.nestedPropertyVal(data, 'auth.success', expected.success)
      assert.deepNestedPropertyVal(data, 'auth.codes', expected.codes)
      assert.deepNestedPropertyVal(data, 'auth.messages', expected.messages)
      assert.nestedPropertyVal(data, 'auth.jwt', expected.jwt)
      assert.nestedPropertyVal(data, 'auth.idToken', expected.idToken)
      assert.isTrue(scope.isDone(), 'renew endpoint is called')
    })
  })
})
