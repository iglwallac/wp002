import _replace from 'lodash/replace'
import proxy from 'express-http-proxy'
import strictUriEncode from 'strict-uri-encode'
import { sendRes503RetryAfter, setFinalCacheHeaders } from 'server/common'

/**
 * Middleware to proxy the sitemap.xml
 * @param {Object} options The options
 * @param {Object} options.url The url of the origin server
 * @param {String} options.name The server name
 * @param {String} options.version The server version
 * @param {boolean} options.skipAuthenticated Don't proxy authenticated requests
 * instead pass the request to the next middleware
 */
export default function middleware (options = {}) {
  const { url } = options
  if (!url) {
    throw new Error('The url string option is required')
  }
  return proxy(_replace(url, /\/$/, ''), {
    timeout: 10000, // 10 second timeout
    parseReqBody: false,
    userResDecorator (proxyRes, proxyResData, userReq, userRes) {
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
