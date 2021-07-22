/**
 * @module community-blog-layer/middleware
 * Middleware which handles proxying of blog requests
 */
import _replace from 'lodash/replace'
import _split from 'lodash/split'
import _first from 'lodash/first'
import proxy from 'express-http-proxy'
import strictUriEncode from 'strict-uri-encode'
import { getReqAuthToken, sendRes503RetryAfter, setFinalCacheHeaders } from 'server/common'

const WORDPRESS_CONTENT_PATH_REGEX = /\/wp-content\//

/**
 * Middleware to proxy the marketing layer
 * @param {Object} options The options
 * @param {string} options.url The url of the origin server
 * @param {String} options.name The server name
 * @param {String} options.version The server version
 * @returns {Function} A route handler function
 */
export default function middleware (options = {}) {
  const { url } = options
  if (!url) {
    throw new Error('The url string option is required')
  }

  /**
   * Proxy route handler that passes through the request unchanged which
   * should be used for authenticated requests and WP statics assets folders
   * i.e. wp-content
   * @type {Function} Express route handler
   */
  return proxy(_replace(url, /\/$/, ''), {
    timeout: 10000, // 10 second timeout
    parseReqBody: false,
    /**
     * Modify the proxy's response before sending it to the client.
     * @param {Object} proxyRes Origin response
     * @param {Object} proxyResData Origin response body
     * @param {Object} userReq The express req object
     * @param {Object} userRes The express res object
     */
    userResDecorator (proxyRes, proxyResData, userReq, userRes) {
      const { retryAfter, maxAge = 0, name, version } = options
      if (retryAfter) {
        sendRes503RetryAfter(userRes, retryAfter)
      } else {
        // Remove origin cache control and replace it with ours
        userRes.setHeader('Cache-Control', null)
        setFinalCacheHeaders(userReq, userRes, { public: true, maxAge })
      }
      if (name && version) {
        userRes.setHeader('Server', `${strictUriEncode(name)}/${strictUriEncode(version)}`)
      }
      return proxyResData
    },
    proxyReqPathResolver (req) {
      const resolvedPath = req.url
      if (WORDPRESS_CONTENT_PATH_REGEX.test(req.path) || getReqAuthToken(req)) {
        return resolvedPath
      }
      // Just send the access denied response for all requests when users are not logged in
      const path = _first(_split(resolvedPath, '?'))
      return _replace(resolvedPath, path, '/access-denied')
    },
  })
}
