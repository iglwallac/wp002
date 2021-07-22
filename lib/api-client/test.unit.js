import { describe, it, before, after } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { get as getConfig } from 'config'
import nock from 'nock'
import { List } from 'immutable'
import {
  get,
  getUrl,
  setAgentKeepAlive,
  getAgentKeepAlive,
  setAgentKeepAliveHttps,
  getAgentKeepAliveHttps,
  setOrigin,
  getOrigin,
  getLanguageFromMixedType,
  TYPE_BROOKLYN,
  TYPE_BROOKLYN_JSON,
  TYPE_AUTH,
} from '.'
import { getSeparator } from './query'

const { assert } = chai.use(chaiAsPromised)
const config = getConfig()

describe('api-client', () => {
  before(() => {
    nock.disableNetConnect()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe('Function: getUrl()', () => {
    it('should get the correct url for TYPE_BROOKLYN', () => {
      const url = 'test'
      assert.equal(
        getUrl({ url, clientType: TYPE_BROOKLYN }),
        `${config.servers[TYPE_BROOKLYN]}${url}`,
      )
    })
    it('should get the correct url for TYPE_BROOKLYN_JSON', () => {
      const url = 'test'
      assert.equal(
        getUrl({ url, clientType: TYPE_BROOKLYN_JSON }),
        `${config.servers[TYPE_BROOKLYN]}${url}`,
      )
    })
    it('should get the correct url for TYPE_AUTH', () => {
      const url = 'test'
      assert.equal(
        getUrl({ url, clientType: TYPE_AUTH }),
        `${config.servers[TYPE_AUTH]}${url}`,
      )
    })
  })
  describe('Function: setAgent()', () => {
    after(() => {
      setAgentKeepAlive(undefined)
      setAgentKeepAliveHttps(undefined)
    })
    it('should set the HTTP agent in the module', () => {
      const agent = {
        type: 'TEST_HTTP_AGENT',
      }
      setAgentKeepAlive(agent)
      assert.deepEqual(agent, getAgentKeepAlive(), 'the agent is set in the module')
    })
    it('should set the HTTPS agent in the module', () => {
      const agent = {
        type: 'TEST_HTTPS_AGENT',
      }
      setAgentKeepAliveHttps(agent)
      assert.deepEqual(agent, getAgentKeepAliveHttps(), 'the agent is set in the module')
    })
  })
  describe('Function: setOrigin()', () => {
    after(() => {
      setOrigin(undefined)
    })
    it('should set the origin in the module', () => {
      const origin = 'http://www.gaia.com'
      setOrigin(origin)
      assert.deepEqual(origin, getOrigin(), 'the origin is set in the module')
    })
  })
  describe('Function: getSeparator()', () => {
    it('should detect the separator is ?', () => {
      const url = 'http://www.gaia.com'
      assert.equal('?', getSeparator(url))
    })
    it('should detect the separator is &', () => {
      const url = 'http://www.gaia.com?test=1&someVar=test'
      assert.equal('&', getSeparator(url))
    })
  })
  describe('Function: getLanguageFromMixedType()', () => {
    it('should get language from an immutable List', () => {
      const language = 'en'
      assert.deepEqual([language], getLanguageFromMixedType(List([language])))
    })
    it('should get null from an emtpy immutable List', () => {
      assert.equal(null, getLanguageFromMixedType(List()))
    })
    it('should get language from an array', () => {
      const language = 'en'
      assert.deepEqual([language], getLanguageFromMixedType([language]))
    })
    it('should get null from an empty array', () => {
      assert.equal(null, getLanguageFromMixedType([]))
    })
    it('should get language from a string', () => {
      const language = 'en'
      assert.deepEqual([language], getLanguageFromMixedType(language))
    })
    it('should get null from a undefined', () => {
      assert.equal(null, getLanguageFromMixedType())
    })
  })
  describe('Function: get()', () => {
    it('should fetch the endpoint data using a GET request for application/json, include authorization, clientAttributes, and a query', async () => {
      const url = 'test'
      const auth = 'TEST_JWT'
      const query = { test: 1, language: ['en'] }
      const data = { success: true }
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('origin', config.origin)
        .matchHeader('accept', 'application/json')
        .matchHeader('authorization', `Bearer ${auth}`)
        .matchHeader('X-Client-Attributes', 'app-provider/gaia,app/web')
        .get(`/${url}`)
        .query(query)
        .reply(200, data)
      const options = { auth, origin: config.origin }
      const res = await get(url, query, options, TYPE_BROOKLYN)
      assert.deepEqual(
        res.body,
        data,
        'response body matches endpoint data',
      )
      assert.isTrue(scope.isDone(), 'endpoint has been called')
    })
    it('should fetch the endpoint data using a GET request for application/json, include authorization, and a query and handle a 400', async () => {
      const url = 'test'
      const auth = 'TEST_JWT'
      const query = { test: 1, language: ['en'] }
      const data = { success: false }
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('origin', config.origin)
        .matchHeader('accept', 'application/json')
        .matchHeader('authorization', `Bearer ${auth}`)
        .get(`/${url}`)
        .query(query)
        .reply(400, data)
      const options = { auth, origin: config.origin }
      const res = await get(url, query, options, TYPE_BROOKLYN)
      assert.deepEqual(
        res.body,
        data,
        'response body matches endpoint data',
      )
      assert.isTrue(scope.isDone(), 'endpoint has been called')
    })
    it('should fetch the endpoint data using a GET request for application/json, include authorization, and a query and handle a 404', async () => {
      const url = 'test'
      const auth = 'TEST_JWT'
      const query = { test: 1, language: ['en'] }
      const data = { success: false }
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('origin', config.origin)
        .matchHeader('accept', 'application/json')
        .matchHeader('authorization', `Bearer ${auth}`)
        .get(`/${url}`)
        .query(query)
        .reply(404, data)
      const options = { auth, origin: config.origin }
      const error = await assert.isRejected(get(url, query, options, TYPE_BROOKLYN))
      assert.equal(error.code, 404)
      assert.isTrue(scope.isDone(), 'endpoint has been called')
    })
    it('should return a 301 redirect successfully', async () => {
      const url = 'redirect-this-url'
      const query = {}
      const location = `${config.servers[TYPE_BROOKLYN]}test`
      const scope = nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('origin', config.origin)
        .matchHeader('accept', 'application/json')
        .get(`/${url}`)
        .reply(301, undefined, { Location: location })
      const options = { origin: config.origin, followRedirect: false }
      const res = await get(url, query, options, TYPE_BROOKLYN)
      assert.isTrue(scope.isDone(), 'endpoint has been called')
      assert.deepEqual(res.status, 301, 'response status is 301')
      assert.deepEqual(res.statusCode, 301, 'response statusCode is 301')
      assert.deepEqual(res.headers.location, location, 'response header location matches')
      assert.isTrue(scope.isDone(), 'endpoint has been called')
    })
  })
  describe('Function: fetch()', () => {
    it('should retry on failure if specified', async () => {
      nock.enableNetConnect()
      const url = 'test'
      const auth = 'TEST_JWT'
      const failureData = { success: false }
      const successData = { success: true }
      const options = {
        auth, origin: config.origin, retryOnError: true, retryDelay: 0,
      }

      nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('origin', config.origin)
        .matchHeader('accept', 'application/json')
        .matchHeader('authorization', `Bearer ${auth}`)
        .get(`/${url}`)
        .once() // first time we want to send a 500
        .reply(500, failureData)

      nock(config.servers[TYPE_BROOKLYN])
        .matchHeader('origin', config.origin)
        .matchHeader('accept', 'application/json')
        .matchHeader('authorization', `Bearer ${auth}`)
        .get(`/${url}`)
        .twice() // second time we want to sence a 200
        .reply(200, successData)

      const res = await get(`${config.servers[TYPE_BROOKLYN]}${url}`, null, options, TYPE_BROOKLYN)
      assert.equal(res.body.success, true)
    })
  })
})
