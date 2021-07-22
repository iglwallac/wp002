/**
 * Helper methods for routes
 * @module routes
 */
import _get from 'lodash/get'
import _reduce from 'lodash/reduce'
import _concat from 'lodash/concat'
import definedRoutes from './routes'

/**
 * Path patterns that are static by default
 */
const STATIC_PATH_REGEX = /^[a-zA-Z0-9/-]+$/

/**
 * Cache of static paths
 * @type {Object[]} Array of static path objects i.e. { path, resolve, component }
 */
let _staticPaths

/**
 * Get static paths from routes.js
 * @param {Object} options The options
 * @param {Object} routes The routes to get static paths
 * @param {Boolean} disableCache Whether or not to use the internal cache
 * @returns {Object[]} Array of static path objects i.e. { path, resolve, component }
 */
export function getStaticPaths (options = {}) {
  const { routes = definedRoutes, disableCache } = options
  if (!disableCache && _staticPaths) {
    return _staticPaths
  }
  _staticPaths = _reduce(routes, (reduction, route) => {
    const path = _get(route, 'path', '')
    if (_get(route, 'static') === true || STATIC_PATH_REGEX.test(path)) {
      return _concat(reduction, path)
    }
    return reduction
  }, [])
  return _staticPaths
}

/**
 * Get all of the routes defined in routes.js
 * @returns {Array}
 */
export function getRoutes () {
  return definedRoutes
}

export default { getStaticPaths, getRoutes }
