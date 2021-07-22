/**
 * Unit test helpers
 * @module test
 */
import { JSDOM } from 'jsdom'

/**
 * Create a dom object using jsdom
 * @returns {Object} jsdom instance
 */
export function createDom (options = {}) {
  return new JSDOM(options)
}

/**
 * Given a location object build a mock location object
 * for testing
 * @param {Object} location A location object
 * @param {String} location.pathname The pathname
 * @param {String} [location.search] The query as a string i.e. param=value
 * @param {String} [location.query] The query as an object
 */
export function createLocation (location = {}) {
  const { pathname, search, query } = location
  if (!pathname) {
    throw new Error('The pathname on location is required')
  }
  return {
    pathname: pathname || '',
    search: search || '',
    query: query || {},
  }
}
