import {
  hydrateReq,
  setFinalCacheHeaders,
} from 'server/common'
import _get from 'lodash/get'
import {
  getRouteInfo,
  createHistory,
  parseLocation,
} from 'services/resolver'
import { RESOLVER_TYPE_NOT_FOUND } from 'services/resolver/types'
import { isFast404 } from 'services/url'
import { getRoutes } from 'routes/index'

export default function middleware (options = {}) {
  const { log = console, enableHeadersAndStatus = true } = options
  return async function route (req, res, next) {
    const { url, path, query } = req
    if (isFast404(path)) {
      next()
      return
    }
    log.info(`Resolver Getting Route Info ${path}`)
    try {
      const routes = getRoutes()
      const data = await getRouteInfo({
        path,
        auth: null,
        followRedirects: false,
        routes,
      })
      log.info(`Completed Resolving Route Info ${url}`)
      const { location } = createHistory(url)
      hydrateReq(req, {
        resolver: {
          path,
          query,
          routes,
          data,
          location: parseLocation(location),
        },
      })
      if (enableHeadersAndStatus && _get(data, 'type') === RESOLVER_TYPE_NOT_FOUND) {
        // Prevent 404 stampedes on the server.
        setFinalCacheHeaders(req, res, { public: true, maxAge: 60 })
        res.status(404)
      }
    } catch (err) {
      log.error(err, 'Resolver Getting Route Info Failed')
      if (enableHeadersAndStatus) {
        // Prevent 500 stampedes on the server.
        setFinalCacheHeaders(req, res, { public: true, maxAge: 30 })
        res.status(500)
      }
    } finally {
      next()
    }
  }
}
