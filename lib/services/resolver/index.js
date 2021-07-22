import { Map } from 'immutable'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _first from 'lodash/first'
import _last from 'lodash/last'
import _reduce from 'lodash/reduce'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import _split from 'lodash/split'
import _replace from 'lodash/replace'
import { log as logError } from 'log/error'
import { createBrowserHistory, createMemoryHistory } from 'history'
import { parse as parseQuery } from 'services/query-string'
import { getEvent } from 'services/live-access-events'
import {
  SCREEN_TYPE_MEMBER_HOME,
  SCREEN_TYPE_WATCH_HISTORY,
  SCREEN_TYPE_SUBCATEGORY,
  SCREEN_TYPE_CLASSIC_FACET,
  SCREEN_TYPE_DETAIL_VIDEO,
  SCREEN_TYPE_DETAIL_SERIES,
  SCREEN_TYPE_SEARCH_PAGE,
  SCREEN_TYPE_PLAYLIST,
  SCREEN_TYPE_RECENTLY_ADDED,
  SCREEN_TYPE_SITE_SEGMENT,
  SCREEN_TYPE_YOGA_HOME,
} from 'services/upstream-context'
import { PLAYLIST_TYPE_DEFAULT } from 'services/playlist'
import { SCHEMA } from './schema'
import matchPath from './match-path'
import {
  RESOLVER_TYPE_COMMUNITY_ACTIVITY,
  RESOLVER_TYPE_HOME,
  RESOLVER_TYPE_CATEGORY,
  RESOLVER_TYPE_SUBCATEGORY,
  RESOLVER_TYPE_NODE,
  RESOLVER_TYPE_CLASSIC_FACET,
  RESOLVER_TYPE_STATIC,
  RESOLVER_TYPE_NOT_FOUND,
  RESOLVER_TYPE_SHARE,
  RESOLVER_TYPE_EVENTS,
  RESOLVER_TYPE_PORTAL,
  RESOLVER_TYPE_PLAYLIST,
} from './types'

// Node content types
export const NODE_CONTENT_TYPE_VIDEO = 'video'
export const NODE_CONTENT_TYPE_SERIES = 'series'
// Redirects
export const MAX_REDIRECTS = 10

const { BROWSER } = process.env
const STATIC_PATH_REGEX = /^[a-zA-Z0-9/-]+$/

/**
 * Clean a path stripping the value down so it can be used by getPathInfo
 * @param {String} path The path to be cleaned
 * @returns {String} The clean path
 */
export function cleanPath (path) {
  let clean = path
  clean = _replace(clean, /^\//, '') // Strip leading slash
  clean = _replace(clean, /\?.*/, '') // Strip query
  clean = _replace(clean, /#.*/, '') // Strip hash
  clean = _replace(clean, /\/$/, '') // Strip trailing slash
  return clean
}

/**
 * Remove everything after the ? in a path
 * @param {String} path The path
 * @returns {String} The clean path
 */
export function removePathQuery (path) {
  return _first(_split(path, '?'))
}

/**
 * Check if a path is asbolute by checked to see if it starts with https?://
 * @param {String} path The path
 * @returns {Boolean} Whether or not this is an absolute path
 */
export function pathIsAbsolute (path) {
  return /^https?:\/\//.test(path)
}

/**
 * Get the route info by first checking static path matches from the local
 * routes then calling pathInfo if there are no misses
 * @param {Object} options The options
 * @property {String} options.path The path to lookup
 * @property {String=} options.originalPath The original path that was called
 * if calling the function recursively following redirects
 * @property {Object=} options.auth An object or immutbale map with auth information
 * @property {Boolean=} options.followRedirects Whether or not the redirects should be followed
 * @property {Object[]=} options.routes All of the main routes which the application handles
 * @example routes example input
 * [{ path: '/:category/:subCategory', component: (<div></div>) }]
 * @property {Number=} options.depth How many times has the function be called recursively
 * when following redirects
 * @see routes
 * @returns {Object} An object created using the createDataModel function
 */
export async function getRouteInfo (options) {
  const { path, auth, followRedirects, routes = [] } = options
  const { originalPath = path } = options
  const { depth = 0 } = options

  if (depth >= MAX_REDIRECTS) {
    logError(
      new Error(`The resolver service was not able to get route info for ${originalPath} after ${MAX_REDIRECTS} attempts.`),
    )
    return createNotFoundModel(path)
  }
  const pathClean = cleanPath(path)
  try {
    const pathMatch = _reduce(routes, (acc, route) => {
      if (!acc) {
        const routePath = _get(route, 'path')
        const match = matchPath({ pathname: `/${pathClean}`, path: routePath })
        if (match || routePath === '*') {
          return { match, route }
        }
      }
      return acc
    }, false)
    const routerResolverType = _get(pathMatch, 'route.resolverType')
    if (!pathMatch || routerResolverType === RESOLVER_TYPE_NOT_FOUND) {
      return createNotFoundModel(path)
    }
    const pathTypeIsStatic = STATIC_PATH_REGEX.test(_get(pathMatch, 'route.path'))
    if (pathTypeIsStatic || routerResolverType === RESOLVER_TYPE_STATIC) {
      return createStaticModel(path)
    }
    if (routerResolverType === RESOLVER_TYPE_SHARE) {
      const token = _last(_get(pathMatch, 'match'))
      return createShareModel(path, { token }, {})
    }
    if (routerResolverType === RESOLVER_TYPE_PORTAL) {
      const portal = _last(_get(pathMatch, 'match'))
      return createPortalModel(path, { portal }, {})
    }
    if (routerResolverType === RESOLVER_TYPE_PLAYLIST) {
      const playlistType = _last(_get(pathMatch, 'match'))
      return createPlaylistModel(path, { playlistType }, {})
    }
    if (routerResolverType === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
      const activityId = _last(_get(pathMatch, 'match'))
      return createDataModel({
        type: RESOLVER_TYPE_COMMUNITY_ACTIVITY,
      }, path, { activityId }, {})
    }
    if (routerResolverType === RESOLVER_TYPE_EVENTS) {
      const id = _last(_get(pathMatch, 'match'))
      const { success } = await getEvent({ id })
      if (success) {
        return createStaticModel(path)
      }
      return createNotFoundModel(path)
    }
    const res = await apiGet(`pathinfo?path=${pathClean}`, null, { auth }, TYPE_BROOKLYN)
    const data = _get(res, 'body', {})
    const success = _get(data, 'success', false)
    if (success) {
      const model = createDataModel(data, path)
      if (followRedirects && model.redirectType && model.url) {
        // If we have an absolute url we are at the end skip another resolution attempt
        if (!pathIsAbsolute(model.url)) {
          // Recursively call until we get to the last redirect
          return await getRouteInfo({
            path: model.url,
            auth,
            followRedirects,
            routes,
            originalPath,
            depth: depth + 1,
          })
        }
      }
      return model
    }
    return createNotFoundModel(path)
  } catch (e) {
    logError(e, `There was an error attempting to resolve ${path}`)
    return createNotFoundModel(path)
  }
}

/**
 * Create a model for a not found route
 * @param {String} path The path
 * @returns {Object} A data model object
 */
export function createNotFoundModel (path) {
  return createDataModel({ type: RESOLVER_TYPE_NOT_FOUND }, path)
}

/**
 * Create a model for a static path
 * @param {String} path The path
 * @returns {Object} A data model object
 */
export function createStaticModel (path) {
  return createDataModel({ type: RESOLVER_TYPE_STATIC }, path)
}

/**
 * Create a model for a share path
 * @param {String} path The path
 * @returns {Object} A data model object
 */
export function createShareModel (path, params = null, payload = null) {
  return createDataModel({ type: RESOLVER_TYPE_SHARE }, path, params, payload)
}

/**
 * Create a model for a portal path
 * @param {String} path The path
 * @returns {Object} A data model object
 */
export function createPortalModel (path, params = null, payload = null) {
  return createDataModel({ type: RESOLVER_TYPE_PORTAL }, path, params, payload)
}

/**
 * Create a model for a playlist path
 * @param {String} path The path
 * @returns {Object} A data model object
 */
export function createPlaylistModel (path, params = null, payload = null) {
  return createDataModel({ type: RESOLVER_TYPE_PLAYLIST }, path, params, payload)
}

/**
 * Get the type
 * @param {String} type The type to match
 * @returns {String} The path type
 */
export function getPathType (type) {
  switch (type) {
    case 'home':
      return RESOLVER_TYPE_HOME
    case 'subcategory':
      return RESOLVER_TYPE_SUBCATEGORY
    case 'node':
      return RESOLVER_TYPE_NODE
    case 'classicFacet':
      return RESOLVER_TYPE_CLASSIC_FACET
    case 'static':
      return RESOLVER_TYPE_STATIC
    case 'share':
      return RESOLVER_TYPE_SHARE
    case 'portal':
      return RESOLVER_TYPE_PORTAL
    case 'playlist':
      return RESOLVER_TYPE_PLAYLIST
    case 'community-activity':
      return RESOLVER_TYPE_COMMUNITY_ACTIVITY
    default:
      return RESOLVER_TYPE_NOT_FOUND
  }
}

/**
 * Create a data model
 * @param {Object} data The data to parse
 * @param {String} path The path
 */
export function createDataModel (data, path, params, payload) {
  return _assign(_cloneDeep(SCHEMA), {
    id: data.id ? _parseInt(data.id) : -1,
    type: getPathType(data.type),
    path: removePathQuery(path),
    filterSet: data.filterSet || null,
    filter: data.filter || null,
    redirectType: data.redirectType || null,
    url: data.url || null,
    vocabulary: data.vocabulary || null,
    vocabularyId: data.vocabularyId || null,
    content_type: data.content_type || null,
    params: params || null,
    payload: payload || null,
  })
}

/**
 * Create a location object with a query parameter
 * @param {Object} location A location object
 * @param {String} location.search The search string on a location object
 * @returns {Object} The original location object with a query property added
 * that is the parsed query string
 */
export function parseLocation (location = {}) {
  return _assign({}, location, { query: createLocationQuery(location) })
}

/**
 * Parse the search string into a query paramter for a location object
 * @param {Object} location A location object
 * @param {String} location.search The search string on a location object
 * @returns {Object} The location search string as an object
 */
export function createLocationQuery (location = {}) {
  const { search = '' } = location
  try {
    return parseQuery(search) || {}
  } catch (e) {
    // If the URI is malformed you will end up here
    // which means we can't parse the query
    return {}
  }
}

/**
 * Create history singleton in the browser or in memory on the server
 * @param {String} url The initial url
 */
export function createHistory (url) {
  if (BROWSER) {
    return createBrowserHistory()
  }
  return createMemoryHistory({
    initialEntries: [url],
  })
}

/**
 * Create a gaiaScreen model based on resolver path info
 * @param {Map} resolver The resolver
 * @returns {Map} A page manager Immutable Map
 */
export function createGaiaScreenModel ({ resolver }) {
  let screenType
  const path = resolver.get('path')
  screenType = getScreenTypeByStaticRoute(path)
  if (screenType) {
    if (screenType === SCREEN_TYPE_SEARCH_PAGE) {
      return Map({
        screenType,
        screenParam: resolver.getIn(['query', 'q']),
      })
    } else if (screenType === SCREEN_TYPE_PLAYLIST) {
      return Map({
        screenType,
        screenParam: PLAYLIST_TYPE_DEFAULT,
      })
    }
    return Map({ screenType })
  }

  const pathType = resolver.getIn(['data', 'type'])
  const contentType = resolver.getIn(['data', 'content_type'])
  screenType = getScreenTypeByPathInfo(pathType, contentType)
  if (screenType) {
    if (screenType === SCREEN_TYPE_CLASSIC_FACET) {
      const filterSet = resolver.getIn(['data', 'filterSet'])
      return Map({
        screenType,
        contextType: `${filterSet}-classic-facet`,
      })
    }
    return Map({
      screenType,
      screenParam: resolver.getIn(['data', 'id']),
    })
  }

  return Map()
}

function getScreenTypeByPathInfo (type, contentType) {
  switch (type) {
    case RESOLVER_TYPE_CATEGORY:
      return SCREEN_TYPE_SITE_SEGMENT
    case RESOLVER_TYPE_SUBCATEGORY:
      return SCREEN_TYPE_SUBCATEGORY
    case RESOLVER_TYPE_CLASSIC_FACET:
      return SCREEN_TYPE_CLASSIC_FACET
    case RESOLVER_TYPE_NODE:
      return getScreenTypeByNodeContentType(contentType)
    default:
      return null
  }
}

function getScreenTypeByNodeContentType (contentType) {
  switch (contentType) {
    case NODE_CONTENT_TYPE_VIDEO:
      return SCREEN_TYPE_DETAIL_VIDEO
    case NODE_CONTENT_TYPE_SERIES:
      return SCREEN_TYPE_DETAIL_SERIES
    default:
      return null
  }
}

function getScreenTypeByStaticRoute (path) {
  switch (path) {
    case '/':
      return SCREEN_TYPE_MEMBER_HOME
    case '/playlist':
      return SCREEN_TYPE_PLAYLIST
    case '/recently-added':
      return SCREEN_TYPE_RECENTLY_ADDED
    case '/search':
      return SCREEN_TYPE_SEARCH_PAGE
    case '/watch-history':
      return SCREEN_TYPE_WATCH_HISTORY
    case '/yoga':
      return SCREEN_TYPE_YOGA_HOME
    default:
      return null
  }
}
