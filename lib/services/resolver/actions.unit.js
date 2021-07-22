import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parseLocation } from '.'
import {
  setResolverRedirectPath,
  SET_RESOLVER_REDIRECT_PATH,
  setResolverStaticPaths,
  SET_RESOLVER_STATIC_PATHS,
  setResolverLocation,
  SET_RESOLVER_LOCATION,
  setResolverData,
  SET_RESOLVER_DATA,
  setResolverProcessing,
  SET_RESOLVER_PROCESSING,
} from './actions'

describe('service resolver actions', () => {
  describe('Function: setResolverRedirectPath()', () => {
    it('should create an action', () => {
      const path = 'test'
      const action = {
        type: SET_RESOLVER_REDIRECT_PATH,
        payload: path,
      }
      assert.deepEqual(action, setResolverRedirectPath(path))
    })
  })
  describe('Function: setResolverStaticPaths()', () => {
    it('should create an action', () => {
      const paths = ['test']
      const action = {
        type: SET_RESOLVER_STATIC_PATHS,
        payload: paths,
      }
      assert.deepEqual(action, setResolverStaticPaths(paths))
    })
  })
  describe('Function: setResolverLocation()', () => {
    it('should create an action', () => {
      const processing = true
      const location = {
        pathname: '/test',
        hash: '',
        search: '?test=1',
        query: {
          test: '1',
        },
      }
      const action = {
        type: SET_RESOLVER_LOCATION,
        payload: { location: parseLocation(location), processing },
      }
      assert.deepEqual(action, setResolverLocation(location, processing))
    })
  })
  describe('Function: setResolverData()', () => {
    it('should create an action', () => {
      const processing = true
      const data = {
        test: 1,
      }
      const action = {
        type: SET_RESOLVER_DATA,
        payload: { data, processing },
      }
      assert.deepEqual(action, setResolverData(data, processing))
    })
  })
  describe('Function: setResolverProcessing()', () => {
    it('should create an action', () => {
      const processing = true
      const action = {
        type: SET_RESOLVER_PROCESSING,
        payload: processing,
      }
      assert.deepEqual(action, setResolverProcessing(processing))
    })
  })
})
