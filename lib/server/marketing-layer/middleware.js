import _replace from 'lodash/replace'
// import _isEmpty from 'lodash/isEmpty'
import { parse as parseUrl, format as formatUrl } from 'url'
import proxy from 'express-http-proxy'
import strictUriEncode from 'strict-uri-encode'
import { getReqAuthToken, sendRes503RetryAfter, setFinalCacheHeaders } from 'server/common'

/**
 * Middleware to proxy the marketing layer
 * @param {Object} options The options
 * @param {Object} options.url The url of the origin server
 * @param {String} options.name The server name
 * @param {String} options.version The server version
 * @param {boolean} options.skipAuthenticated Don't proxy authenticated requests
 * instead pass the request to the next middleware
 */
export default function middleware (options = {}) {
  const { url, skipAuthenticated = true } = options
  if (!url) {
    throw new Error('The url string option is required')
  }
  return proxy(_replace(url, /\/$/, ''), {
    timeout: 10000, // 10 second timeout
    parseReqBody: false,
    // Filter will call next instead of calling the proxy if value is falsy
    filter (req) {
      // Skip authenticated user proxy
      if (skipAuthenticated && getReqAuthToken(req)) {
        return false
      }
      return true
    },
    proxyReqPathResolver (req) {
      const { pathname, search } = parseUrl(req.url)
      // Original wordpress / to /home-page-template fix that is no longer need
      // let updatedPathname = _replace(pathname, /[/^]$/, '')
      // if (_isEmpty(updatedPathname) || updatedPathname === '/') {
      //   updatedPathname = '/home-page-template'
      // }
      // return formatUrl({ pathname: updatedPathname, search })
      return formatUrl({ pathname, search })
    },
    userResDecorator (_, proxyResData, userReq, userRes) {
      const { retryAfter, maxAge = 0, name, version } = options
      if (retryAfter) {
        sendRes503RetryAfter(userRes, retryAfter)
      } else {
        setFinalCacheHeaders(userReq, userRes, { public: true, maxAge })
      }
      if (name && version) {
        userRes.setHeader('Server', `${strictUriEncode(name)}/${strictUriEncode(version)}`)
      }
      return proxyResData
    },
  })
}
