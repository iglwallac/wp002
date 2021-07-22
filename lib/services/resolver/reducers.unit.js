import { describe, it, before, after, afterEach } from 'mocha'
import chai from 'chai'
import chaiImmutable from 'chai-immutable'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import { Map } from 'immutable'
import parseInt from 'lodash/parseInt'
import SUBCATEGORY_DATA from './test/subcategory-data.json'
import reducers, { initialState } from './reducers'
import {
  setResolverRedirectPath,
  SET_RESOLVER_REDIRECT_PATH,
  setResolverLocation,
  SET_RESOLVER_LOCATION,
  setResolverData,
  SET_RESOLVER_DATA,
  setResolverProcessing,
  SET_RESOLVER_PROCESSING,
  getResolverData,
} from './actions'
import {
  getSubCategoryNock,
  SUBCATEGORY_PATH,
} from './test.unit'
import { RESOLVER_TYPE_SUBCATEGORY } from './types'

chai.use(chaiImmutable).use(chaiAsPromised)
const { assert } = chai

describe('service resolver reducers', () => {
  before(() => {
    nock.disableNetConnect()
  })
  afterEach(() => {
    nock.cleanAll()
  })
  after(() => {
    nock.enableNetConnect()
  })
  describe(`Reducer ${SET_RESOLVER_REDIRECT_PATH}`, () => {
    it('should set state', () => {
      const path = 'test'
      const state = reducers(initialState, setResolverRedirectPath(path))
      assert.equal(path, state.get('redirectPath'))
    })
  })
  describe(`Reducer ${SET_RESOLVER_LOCATION}`, () => {
    it('should set state', () => {
      const processing = true
      const location = {
        pathname: '/test',
        hash: '',
        search: '?test=1',
        query: {
          test: '1',
        },
      }
      const state = reducers(initialState, setResolverLocation(location, processing))
      assert.equal(location.pathname, state.get('path'))
      assert.equal(Map(location.query), state.get('query'))
      assert.equal(processing, state.get('processing'))
      assert.deepEqual(location, state.get('location'))
    })
  })
  describe(`Reducer ${SET_RESOLVER_DATA}`, () => {
    it('should set state', () => {
      const processing = true
      const data = {
        test: 1,
      }
      const state = reducers(initialState, setResolverData(data, processing))
      assert.equal(Map(data), state.get('data'))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe(`Reducer ${SET_RESOLVER_PROCESSING}`, () => {
    it('should set state', () => {
      const processing = true
      const state = reducers(initialState, setResolverProcessing(processing))
      assert.equal(processing, state.get('processing'))
    })
  })
  describe.skip('Function: getResolverData()', () => {
    it('should succesfully get a subcategory and set state', async () => {
      const path = SUBCATEGORY_PATH
      const scope = getSubCategoryNock(path)
      const location = {
        pathname: `/${SUBCATEGORY_PATH}`,
        hash: '',
        search: '',
        query: {},
      }
      const expected = {
        id: parseInt(SUBCATEGORY_DATA.id),
        type: RESOLVER_TYPE_SUBCATEGORY,
        filterSet: null,
        filter: null,
        redirectType: null,
        url: null,
        path: `/${path}`,
        content_type: null,
        vocabularyId: null,
        vocabulary: null,
        params: null,
        payload: null,
      }
      let state = initialState
      const dispatch = (action) => {
        state = reducers(state, action)
      }
      const getState = () => {
        return { resolver: initialState }
      }
      const getResolverDataThunk = getResolverData(location)
      const data = await assert.isFulfilled(getResolverDataThunk(dispatch, getState))
      assert.isTrue(scope.isDone(), 'Endpoint pathinfo called')
      assert.deepEqual(expected, data)
      assert.equal(location.pathname, state.get('path'))
      assert.equal(Map(location.query), state.get('query'))
      assert.deepEqual(location, state.get('location'))
      assert.deepEqual(expected, state.get('data').toJS())
    })
  })
})
