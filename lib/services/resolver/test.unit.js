import { describe, it, before, after, afterEach } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { get as getConfig } from 'config'
import parseInt from 'lodash/parseInt'
import strictUriEncode from 'strict-uri-encode'
import SUBCATEGORY_DATA from './test/subcategory-data.json'
import {
  cleanPath,
  removePathQuery,
  pathIsAbsolute,
  createNotFoundModel,
  createStaticModel,
  createShareModel,
  getPathType,
  getRouteInfo,
} from './'
import {
  RESOLVER_TYPE_HOME,
  RESOLVER_TYPE_SUBCATEGORY,
  RESOLVER_TYPE_NODE,
  RESOLVER_TYPE_CLASSIC_FACET,
  RESOLVER_TYPE_STATIC,
  RESOLVER_TYPE_NOT_FOUND,
  RESOLVER_TYPE_EVENTS,
} from './types'
import matchPath from './match-path'

const { assert } = chai.use(chaiAsPromised)
const config = getConfig()

const MODEL_NOT_FOUND = {
  id: -1,
  type: 'notFound',
  filterSet: null,
  filter: null,
  redirectType: null,
  url: null,
  path: 'foo/bar',
  content_type: null,
  vocabularyId: null,
  vocabulary: null,
  params: null,
  payload: null,
}

const MODEL_STATIC = {
  id: -1,
  type: 'static',
  filterSet: null,
  filter: null,
  redirectType: null,
  url: null,
  path: 'foo/bar',
  content_type: null,
  vocabularyId: null,
  vocabulary: null,
  params: null,
  payload: null,
}

export const SUBCATEGORY_PATH = 'films-docs/films'

export function getSubCategoryNock (path) {
  return nock(config.servers.brooklyn)
    .get('/pathinfo')
    .query({ path })
    .reply(200, SUBCATEGORY_DATA)
}

export function getEventsNock (id, code = 200) {
  return nock(config.servers.brooklyn)
    .get(`/live-access-events/${strictUriEncode(id)}`)
    .reply(code, {
      event: {
        title: 'Human by Design: Unleashing the Power of the New Human Story',
        route: id,
      },
    })
}

describe('service resolver', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe('Function: cleanPath()', () => {
    it('cleans the path correctly', () => {
      assert.equal(cleanPath('/foo?bar'), 'foo', 'Path is cleaned as expected')
      assert.equal(cleanPath('foo?bar'), 'foo', 'Path is cleaned as expected')
      assert.equal(cleanPath('/foo??bar'), 'foo', 'Path is cleaned as expected')
    })
  })
  describe('Function: removePathQuery()', () => {
    it('removes the query from a path', () => {
      assert.equal(
        removePathQuery('/foo?bar'),
        '/foo',
        'Query string was removed as expected',
      )
      assert.equal(
        removePathQuery('?bar'),
        '',
        'Query string was removed as expected',
      )
      assert.equal(
        removePathQuery('/foo?bar'),
        '/foo',
        'Query string was removed as expected',
      )
    })
  })
  describe('Function: pathIsAbsolute()', () => {
    it('correctly identifies absolute paths', () => {
      assert.isTrue(
        pathIsAbsolute('http://www.gaia.com/my-yoga/hatha'),
        'Absolute path returns true',
      )
      assert.isFalse(
        pathIsAbsolute('/my-yoga/hatha'),
        'Path relative to root returns false',
      )
      assert.isFalse(
        pathIsAbsolute('my-yoga/hatha'),
        'Relative path returns false',
      )
    })
  })
  describe('Function: getPathType()', () => {
    it('correctly discovers path type', () => {
      assert.equal(
        getPathType('home'),
        RESOLVER_TYPE_HOME,
        'Expected path type "RESOLVER_TYPE_HOME" returned',
      )
      assert.equal(
        getPathType('subcategory'),
        RESOLVER_TYPE_SUBCATEGORY,
        'Expected path type "RESOLVER_TYPE_SUBCATEGORY" returned',
      )
      assert.equal(
        getPathType('node'),
        RESOLVER_TYPE_NODE,
        'Expected path type "RESOLVER_TYPE_NODE" returned',
      )
      assert.equal(
        getPathType('classicFacet'),
        RESOLVER_TYPE_CLASSIC_FACET,
        'Expected path type "RESOLVER_TYPE_CLASSIC_FACET" returned',
      )
      assert.equal(
        getPathType('static'),
        RESOLVER_TYPE_STATIC,
        'Expected path type "RESOLVER_TYPE_STATIC" returned',
      )
      assert.equal(
        getPathType('foo'),
        RESOLVER_TYPE_NOT_FOUND,
        'Expected path type "RESOLVER_TYPE_NOT_FOUND" returned',
      )
    })
  })
  describe('Function: createNotFoundModel()', () => {
    it('creates a not found model', () => {
      assert.deepEqual(
        createNotFoundModel('foo/bar'),
        MODEL_NOT_FOUND,
        'Model returned is valid as expected',
      )
    })
  })
  describe('Function: createStaticModel()', () => {
    it('creates a not found model', () => {
      assert.deepEqual(
        createStaticModel('foo/bar'),
        MODEL_STATIC,
        'Model returned is valid as expected',
      )
    })
  })
  describe('Function: createShareModel()', () => {
    it('creates a share model', () => {
      const token = '123'
      const path = `share/${token}`

      const payload = {
        qualifiedViewCount: 0,
        conversionCount: 0,
        viewCount: 2,
        contentId: 48316,
        token,
        type: 'VIDEO',
        userReferralId: null,
        expirationDate: '2019-04-20T22:43:11.595Z',
        firstViewDate: '2019-04-17T22:43:11.595Z',
        expired: false,
        url: 'https://hls-stage-3jd84j.gaia.com/hls/45146/master.m3u8?expiration=1555628400&token=d9ec273d4577a231e89f54276d1b977286d8c80ac680dfd34a2d9f38025e1a73',
      }

      const expected = {
        id: -1,
        type: 'share',
        filterSet: null,
        filter: null,
        redirectType: null,
        url: null,
        path: `share/${token}`,
        content_type: null,
        vocabularyId: null,
        vocabulary: null,
        params: { token },
        payload,
      }
      assert.deepEqual(
        createShareModel(path, { token }, payload),
        expected,
        'ShareModel returned is valid as expected',
      )
    })
  })
  describe('Function: matchPath()', () => {
    it('should match a subcategory path', () => {
      const result = matchPath({ path: '/:category/:subCategory', pathname: `/${SUBCATEGORY_PATH}` })
      assert.isArray(result)
      assert.deepEqual(['/films-docs/films', 'films-docs', 'films'], result)
    })
    it('should match a static path with a variable', () => {
      const result = matchPath({ path: '/:test', pathname: '/test-value' })
      assert.isArray(result)
      assert.deepEqual(['/test-value', 'test-value'], result)
    })
    it('should match a static path followed by a variable', () => {
      const result = matchPath({ path: '/test/:test', pathname: '/test/test-value' })
      assert.isArray(result)
      assert.deepEqual(['/test/test-value', 'test-value'], result)
    })
    it('should match a static path without a variable', () => {
      const result = matchPath({ path: '/test', pathname: '/test' })
      assert.isArray(result)
      assert.deepEqual(['/test'], result)
    })
    it('should not match a subcategory path with two variables', () => {
      assert.isNull(matchPath({ path: '/:category/:subCategory', pathname: '/fake' }))
    })
    it('should not match a static path', () => {
      assert.isNull(matchPath({ path: '/test', pathname: '/fake' }))
    })
    it('should not match a static path with a variable', () => {
      assert.isNull(matchPath({ path: '/test/:test', pathname: '/fake' }))
    })
  })
  describe('Function: getRouteInfo()', () => {
    it('should succesfully not call pathinfo for a not found route', async () => {
      const path = '/does-not-exist'
      const scope = getSubCategoryNock(path)
      const expected = {
        id: -1,
        type: RESOLVER_TYPE_NOT_FOUND,
        filterSet: null,
        filter: null,
        redirectType: null,
        url: null,
        path,
        content_type: null,
        vocabularyId: null,
        vocabulary: null,
        params: null,
        payload: null,
      }
      // We mark the * route as not found because it is our default error page
      const routes = [{
        path: '*',
        resolverType: RESOLVER_TYPE_NOT_FOUND,
        component: null,
      }]
      const data = await assert.isFulfilled(getRouteInfo({ path, routes }))
      assert.deepEqual(expected, data)
      assert.isFalse(scope.isDone(), 'Endpoint pathinfo is not called')
    })
    it('should succesfully call pathinfo for a subcategory', async () => {
      const path = SUBCATEGORY_PATH
      const scope = getSubCategoryNock(path)
      const expected = {
        id: parseInt(SUBCATEGORY_DATA.id),
        type: RESOLVER_TYPE_SUBCATEGORY,
        filterSet: null,
        filter: null,
        redirectType: null,
        url: null,
        path,
        content_type: null,
        vocabularyId: null,
        vocabulary: null,
        params: null,
        payload: null,
      }
      const routes = [{
        path: '/:category/:subCategory',
        component: null,
      }]
      const data = await assert.isFulfilled(getRouteInfo({ path, routes }))
      assert.deepEqual(expected, data)
      assert.isTrue(scope.isDone(), 'Endpoint pathinfo called')
    })
    it('should not call pathinfo for a static route by path pattern', async () => {
      const path = '/test-route'
      const scope = getSubCategoryNock(path)
      const expected = {
        id: -1,
        type: 'static',
        filterSet: null,
        filter: null,
        redirectType: null,
        url: null,
        path,
        content_type: null,
        vocabularyId: null,
        vocabulary: null,
        params: null,
        payload: null,
      }
      const routes = [{
        path: '/test-route',
        component: null,
      }]
      const data = await assert.isFulfilled(getRouteInfo({ path, routes }))
      assert.isFalse(scope.isDone(), 'Endpoint pathinfo is not called')
      assert.deepEqual(expected, data)
    })
    it('should not call pathinfo for a static route by resloverType', async () => {
      const path = '/test-route/test1'
      const scope = getSubCategoryNock(path)
      const expected = {
        id: -1,
        type: 'static',
        filterSet: null,
        filter: null,
        redirectType: null,
        url: null,
        path,
        content_type: null,
        vocabularyId: null,
        vocabulary: null,
        params: null,
        payload: null,
      }
      const routes = [{
        path: '/test-route/:testId',
        resolverType: RESOLVER_TYPE_STATIC,
        component: null,
      }]
      const data = await assert.isFulfilled(getRouteInfo({ path, routes }))
      assert.isFalse(scope.isDone(), 'Endpoint pathinfo is not called')
      assert.deepEqual(expected, data)
    })
    it('should call events endpoint when type is RESOLVER_TYPE_EVENTS', async () => {
      const route = 'gregg-braden-human-by-design'
      const path = `/events/${route}`
      const scope = getEventsNock(route)
      const expected = {
        id: -1,
        type: 'static',
        filterSet: null,
        filter: null,
        redirectType: null,
        url: null,
        path,
        content_type: null,
        vocabularyId: null,
        vocabulary: null,
        params: null,
        payload: null,
      }
      const routes = [{
        path: '/events/:route',
        resolverType: RESOLVER_TYPE_EVENTS,
        component: null,
      }]
      const data = await assert.isFulfilled(getRouteInfo({ path, routes }))
      assert.isTrue(scope.isDone(), 'Endpoint events not called')
      assert.deepEqual(expected, data)
    })
    it('should fail RESOLVER_TYPE_EVENTS when the path is wrong', async () => {
      const id = 'gregg-braden-human-by-design'
      const path = `/events/${id}1`
      const scope = getEventsNock(id)
      const routes = [{
        path: '/events/:id',
        resolverType: RESOLVER_TYPE_EVENTS,
        component: null,
      }]
      await assert.isFulfilled(getRouteInfo({ path, routes }))
      assert.isFalse(scope.isDone(), 'Endpoint events was called')
    })
    it('should return RESOLVER_TYPE_EVENTS not found on 404', async () => {
      const id = 'gregg-braden-human-by-design'
      const path = `/events/${id}`
      const scope = getEventsNock(id, 404)
      const routes = [{
        path: '/events/:id',
        resolverType: RESOLVER_TYPE_EVENTS,
        component: null,
      }]
      const data = await assert.isFulfilled(getRouteInfo({ path, routes }))
      assert.isTrue(scope.isDone(), 'Endpoint events was not called')
      assert.equal('notFound', data.type)
    })
  })
})
