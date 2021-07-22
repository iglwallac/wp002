import _get from 'lodash/get'
import _first from 'lodash/first'
import _assign from 'lodash/assign'
import _isNumber from 'lodash/isNumber'
import _toString from 'lodash/toString'
import _split from 'lodash/split'
import { get as getConfig } from 'config'

export function isReqForwardedProtoHttps (req) {
  return req.get('X-Forwarded-Proto') === 'https'
}

export function getReqResolver (req) {
  return _get(req, ['hydrate', 'resolver'], null)
}

export function hydrateReq (req, data) {
  req.hydrate = _assign(req.hydrate || {}, data)
}

export function sendRes503RetryAfter (res, retryAfter) {
  res.status(503)
  res.setHeader('Retry-After', retryAfter)
}

export function setResNoCache (res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Expires', new Date('1970-01-01 00:00:00').toUTCString())
}

export function setResCache (res, options = {}) {
  const cacheOptions = []
  const { maxAge = 0 } = options
  // eslint-disable-next-line no-unused-expressions
  options.public && cacheOptions.push('public')
  // eslint-disable-next-line no-unused-expressions
  options.private && cacheOptions.push('private')
  if (options.public && maxAge > 0) {
    cacheOptions.push(`s-maxage=${maxAge}`)
    cacheOptions.push(`max-age=${Math.round(maxAge / 4)}`)
  } else {
    cacheOptions.push(`max-age=${maxAge}`)
  }
  // eslint-disable-next-line no-unused-expressions
  options.mustRevalidate && cacheOptions.push('must-revalidate')
  if (cacheOptions.length > 0) {
    res.header('Cache-Control', cacheOptions.join(', '))
  }
}

export function setFinalCacheHeaders (req, res, options = {}) {
  // Something else already set the headers.
  if (res.get('Cache-Control')) {
    return undefined
  }
  if (
    getReqAuthToken(req) ||
    (!process.env.NODE_ENV || process.env.NODE_ENV === 'local')
  ) {
    // Don't cache authtenticated users.
    return setResNoCache(res)
  }
  const maxAge = options.maxAge || getConfig().appCache.maxAge
  if (_isNumber(maxAge) && maxAge > 0) {
    return setResCache(res, { maxAge })
  }
  return setResNoCache(res)
}

export function getReqAuth (req) {
  return _get(req, ['hydrate', 'auth'])
}

export function getReqAuthToken (req) {
  return _get(req, ['hydrate', 'auth', 'jwt'])
}

export function getReqAuthUid (req) {
  return _get(req, ['hydrate', 'auth', 'uid'])
}

export function getReqAuthUuid (req) {
  return _get(req, ['hydrate', 'auth', 'uuid'])
}

export function getReqUserPortal (req) {
  return _get(req, ['hydrate', 'user', 'data', 'portal', 'url'], '')
}

export function getPathname (req) {
  const originalUrl = _toString(_get(req, 'originalUrl', ''))
  return _first(_split(originalUrl, '?'))
}

export function getUserLocale (req) {
  const hydrate = req.hydrate || {}
  const userLanguage = _get(hydrate, ['user', 'language'])
  const pathLanguageRegion = _get(hydrate, ['page', 'pathLanguageRegion'])
  if (userLanguage) {
    return userLanguage
  }
  return pathLanguageRegion || null
}

export function getReqUserLanguage (req) {
  return _get(req, ['hydrate', 'user', 'data', 'language', 0])
}
