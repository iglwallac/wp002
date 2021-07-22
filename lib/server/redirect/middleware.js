import _get from 'lodash/get'
import _size from 'lodash/size'
import _parseInt from 'lodash/parseInt'
import _includes from 'lodash/includes'
import _replace from 'lodash/replace'
import { getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import {
  getReqAuthUid,
  setFinalCacheHeaders,
  isReqForwardedProtoHttps,
} from 'server/common'
import { anonymousAllowed } from 'services/url'
import { get as getConfig } from 'config'
import { parse as parseUrl, format as formatUrl } from 'url'
import { parse as parseQuery, stringify as stringifyQuery } from 'services/query-string'

let log

export default function middleware (options) {
  return function route (req, res, next) {
    // @TODO remove redirectAuthAccess when anonymous visitors are allowed.
    const uid = getReqAuthUid(req)
    log = getSetLogger(getLoggerServer(uid))
    if (processRedirect(options, req, res)) {
      res.end()
      return
    }
    next()
  }
}

export function processRedirect (options, req, res) {
  const { https, hostname } = options
  let redirectSent
  // Special handler for accounts.gaia.com which needs to be checked first
  if (!redirectSent) {
    redirectSent = redirectUserAccountsHostname(req, res, options)
  }
  // General redirects
  if (!redirectSent) {
    redirectSent = redirect(req, res, options)
  }
  // HTTPS redirect
  if (!redirectSent && https) {
    redirectSent = redirectHttps(req, res, options)
  }
  // Hostname redirect
  if (!redirectSent && hostname) {
    redirectSent = redirectHostname(req, res, options)
  }
  if (!redirectSent) {
    redirectSent = redirectUrlFormat(req, res, options)
  }
  return redirectSent
}

export function upgradeToHttps (req) {
  return !isReqForwardedProtoHttps(req)
}

export function changeHostname (req, origin) {
  const hostname = _get(req, 'hostname')
  if (!hostname) {
    return false
  }
  return getOriginDomain(origin) !== hostname
}

export function changeUrlFormat (req, options = {}) {
  const { persistTrailingSlash } = options
  const parsedUrl = parseUrl(req.originalUrl)
  const pathname = _get(parsedUrl, 'pathname')

  let shouldChangeUrl = false

  if (/\.\w+$/.test(pathname)) {
    return false
  } else if (persistTrailingSlash) {
    shouldChangeUrl = _size(pathname) > 1 && pathname.slice(-1) !== '/'
  } else {
    shouldChangeUrl = pathname !== pathname.toLowerCase() ||
      (_size(pathname) > 1 && pathname.slice(-1) === '/')
  }
  return shouldFormatUrl(req.originalUrl) && shouldChangeUrl
}

export function changeToResolverPath (req) {
  const resolver = _get(req, ['hydrate', 'resolver', 'data'], {})
  return resolver.redirectType && resolver.url
}

/**
 *
 * @param {String} url The redirect url
 * @param {String} origin The origin
 * @param {Object} [options={}] The options object
 * @param {String} options.originalUrl The original requested url
 * @param {Boolean} options.persistTrailingSlash If true persist pathname trailing slash
 * @returns {String} The redirect url
 */
export function createRedirectUrl (url, origin = getConfig().origin, options = {}) {
  const { originalUrl, persistTrailingSlash } = options
  const redirectUrl = parseUrl(url)

  if (/^https?:\/\//.test(url)) {
    const redirectQuery = parseQuery(_get(redirectUrl, ['search']), '')
    // look at the original url and get it's query params
    const originalParsedUrl = originalUrl ? parseUrl(originalUrl) : {}
    const originalParsedQuery = parseQuery(_get(originalParsedUrl, ['search'], ''))
    // Prefer the original query string params over the redirect query params
    const combinedQuery = { ...redirectQuery, ...originalParsedQuery }

    // return a formatted url with the new combined query string
    const formattedUrl = formatUrl(
      {
        protocol: redirectUrl.protocol,
        host: redirectUrl.host,
        pathname: redirectUrl.pathname,
        search: stringifyQuery(combinedQuery),
      },
    )
    return _replace(formattedUrl, /\/$/, '')
  }

  const shouldFormat = shouldFormatUrl(url)
  let pathname = _get(redirectUrl, 'pathname') || '/'
  if (shouldFormat) {
    pathname = cleanPathname({ persistTrailingSlash }, pathname)
  }
  const search = _get(redirectUrl, 'search') || ''
  return `${origin}${pathname || '/'}${search}`
}

export function shouldFormatUrl (url) {
  const hostname = parseUrl(url).hostname
  return _includes(['www.gaia.com', null, getOriginDomain()], hostname)
}

export function cleanPathname (options = {}, pathname = '/') {
  const { persistTrailingSlash } = options
  if (persistTrailingSlash) {
    return addPathnameTrailingSlash(pathname)
  }
  return stripPathnameTrailingSlashes(pathname).toLowerCase()
}

export function addPathnameTrailingSlash (pathname = '/') {
  const altered = pathname.replace(/([^/])$/, '$1/')
  if (!altered) {
    return '/'
  }
  return altered
}

export function stripPathnameTrailingSlashes (pathname = '/') {
  const altered = pathname !== '/' ? pathname.replace(/[/]+$/i, '') : pathname
  if (!altered) {
    return '/'
  }
  return altered
}

export function getOrigin (origin = getConfig().origin) {
  return origin.replace(/\/$/, '')
}

export function getOriginDomain (origin = getConfig().origin) {
  return _get(parseUrl(origin), 'hostname')
}

export function sendRedirect (req, res, options = {}) {
  const { logMessage, maxAge, path = req.originalUrl } = options
  const url = createRedirectUrl(path, getConfig().origin, options)
  log.info(`${logMessage} ${url}`)
  setFinalCacheHeaders(req, res, { public: true, maxAge })
  res.redirect(301, url)
  return true
}

/**
 * Redirect the request based on hostname related to accounts.gaia.com
 */
export function redirectUserAccountsHostname (req, res, options = {}) {
  const { maxAge, userAccountHostname = getConfig().userAccountHostname } = options
  const hostname = _get(req, 'hostname')
  if (!hostname) {
    return false
  }
  if (hostname === userAccountHostname) {
    return sendRedirect(req, res, {
      logMessage: 'Redirecting user account hostname',
      maxAge,
      path: '/account',
      originalUrl: req.originalUrl,
    })
  }
  return false
}

/**
 * Redirect the request based on hostname
 */
export function redirectHostname (req, res, options = {}) {
  const { maxAge } = options
  if (changeHostname(req)) {
    return sendRedirect(req, res, {
      logMessage: 'Redirecting hostname',
      maxAge,
      originalUrl: req.originalUrl,
    })
  }
  return false
}

export function redirectHttps (req, res, options = {}) {
  const { maxAge } = options
  if (upgradeToHttps(req)) {
    return sendRedirect(req, res, {
      logMessage: 'Redirecting http to https',
      maxAge,
      originalUrl: req.originalUrl,
    })
  }
  return false
}

export function redirectUrlFormat (req, res, options = {}) {
  const { maxAge, persistTrailingSlash } = options
  if (changeUrlFormat(req, options)) {
    return sendRedirect(req, res, {
      logMessage: `Redirecting to canonical url ${persistTrailingSlash ? 'with trailing slash' : 'without trailing slash'}`,
      persistTrailingSlash,
      maxAge,
      originalUrl: req.originalUrl,
    })
  }
  return false
}

export function redirect (req, res, options = {}) {
  const { maxAge } = options
  const resolver = _get(req, ['hydrate', 'resolver', 'data'], {})
  if (changeToResolverPath(req)) {
    const url = createRedirectUrl(
      resolver.url,
      getConfig().origin,
      { ...options, originalUrl: req.originalUrl },
    )
    const status = _parseInt(resolver.redirectType)
    log.info(`Redirecting via ${status} to ${url}`)
    setFinalCacheHeaders(req, res, { public: true, maxAge })
    res.redirect(status, url)
    return true
  }
  return false
}

export function redirectAuthAccess (req, res) {
  if (
    anonymousAllowed(
      req.originalUrl,
      _get(req, ['hydrate', 'auth', 'roles'], []),
    )
  ) {
    return false
  }
  log.info('Redirecting based on anonymous visitor.')
  res.redirect(302, '/')
  return true
}
