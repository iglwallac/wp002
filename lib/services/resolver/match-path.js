/**
 * Resolver match path logic which is separate from index.js
 * to avoid browser load problem when used in a React component
 * @module resolver/match-path
 */
import _get from 'lodash/get'
import _set from 'lodash/set'
import pathToRegexp from 'path-to-regexp'

const pathToRegexpMatcherCache = {}

/**
 * Match a pathname against a path pattern
 * @param {Object} param The params
 * @param {String} path The path pattern to check
 * @param {String} pathname The pathname value to check against path
 * @param {Boolean?} disableCache If true recompile the pathToRegexp matcher
 * @returns {Boolean} Returns an array if a match is found or null if not
 * @example A returned array with the whole path followed by the variables matched in order
 * // Arguments
 * { path: '/event/:eventId' pathname: '/event/test' }
 * // result
 * ['/event/test', 'test']
 */
export default function matchPath ({ path, pathname, disableCache }) {
  let matcher = _get(pathToRegexpMatcherCache, path)
  if (!matcher) {
    matcher = pathToRegexp(path, [])
    if (!disableCache) {
      _set(pathToRegexpMatcherCache, path, matcher)
    }
  }
  return matcher.exec(pathname)
}
