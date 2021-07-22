import { get as getConfig } from 'config'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _size from 'lodash/size'
import _assign from 'lodash/assign'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import _isFunction from 'lodash/isFunction'
import _includes from 'lodash/includes'
import _isArray from 'lodash/isArray'
import _replace from 'lodash/replace'
import { delay } from 'bluebird'
import { List } from 'immutable'
import _startsWith from 'lodash/startsWith'
import _isEmpty from 'lodash/isEmpty'
import _isFinite from 'lodash/isFinite'
import _forEach from 'lodash/forEach'
import superagent from 'superagent'
import { getExponentialDelay } from 'exponential-backoff'
import { stringify as stringifyQuery } from 'services/query-string'
import { AGENT_TYPE_HTTPS, AGENT_TYPE_HTTP } from './agent'
import { getSeparator as getQuerySeparator } from './query'

// HTTP types
export const TYPE_GET = 'get'
export const TYPE_POST = 'post'
export const TYPE_PUT = 'put'
export const TYPE_DELETE = 'delete'
export const TYPE_PATCH = 'patch'
// API types
export const TYPE_WEB_APP = 'webApp'
export const TYPE_BROOKLYN = 'brooklyn'
export const TYPE_BROOKLYN_JSON = 'brooklynJson'
export const TYPE_VA_SERVICE = 'videoAnalyticsService' // ###VATest
export const TYPE_TESTAROSSA = 'testarossa'
export const TYPE_AUTH = 'auth'
export const TYPE_AUTH_JSON = 'authJson'
export const TYPE_BILLING = 'billing'
export const TYPE_ASSET = 'asset'
export const TYPE_GOOGLE_RECAPTCHA_API = 'googleRecaptchaApi'
export const DEFAULT_TIMEOUT = 30000
// Request Types
export const REQUEST_TYPE_APPLICATION_JSON = 'application/json'
export const REQUEST_TYPE_X_WWW_FORM_URLENCODED =
  'application/x-www-form-urlencoded'
export const REQUEST_TYPE_APPLICATION_XML = 'application/xml'
// Accept Types
export const REQUEST_ACCEPT_APPLICATION_JSON = 'application/json'
export const REQUEST_ACCEPT_APPLICATION_XML = 'application/xml'
// Error Types
export const RESPONSE_ERROR_TYPE_404_OR_RANGE_500 =
  'RESPONSE_ERROR_TYPE_404_OR_RANGE_500'
export const RESPONSE_ERROR_TYPE_RANGE_500 = 'RESPONSE_ERROR_TYPE_RANGE_500'
export const RESPONSE_ERROR_TYPE_RANGE_400 = 'RESPONSE_ERROR_TYPE_RANGE_400'

/**
 * The default max retry attempts
 */
export const MAX_RETRY_ATTEMPTS = 3

const RETRYABLE_STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524])

const RETRYABLE_ERROR_CODES = new Set([
  'EADDRINUSE',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENETUNREACH',
  'ENOTFOUND',
  'EPIPE',
  'EPROTO',
  'ETIMEDOUT',
])

/**
 * Configuration singleton
 */
const _config = Object.freeze(getConfig())
const SERVER_ASSET = _get(_config, 'servers.assets', '')
const SERVER_BROOKLYN = _get(_config, 'servers.brooklyn', '')
const SERVER_VA = _get(_config, 'servers.videoAnalytics', '') // ###VATest
const SERVER_AUTH = _get(_config, 'servers.auth', '')
const SERVER_TESTAROSSA = _get(_config, 'servers.testarossa', '')
const SERVER_GOOGLE_RECAPTCHA_API = _get(_config, 'googleRecaptchaApiUrl', '')
const PATH_ASSETS = _get(_config, 'paths.assets', '')

// An optional agent which can replace the default HTTP agent
let _origin
let _keepaliveAgentHttps
let _keepaliveAgent

/**
 * Get the language value from multiple data types
 * @param {import('immutable').List|Array|String} language The language
 * @param {Boolean} languageShouldBeString When true return language as a string
 * @returns {String[]|String} The language
 */
export function getLanguageFromMixedType (language, languageShouldBeString) {
  let result = null

  if (List.isList(language)) {
    result = language.size > 0 ? language.toJS() : null
  } else if (_isArray(language)) {
    result = _size(language) > 0 ? language : null
  } else if (_isString(language)) {
    result = [language]
  }

  if (result && languageShouldBeString) {
    result = _get(result, 0)
  }

  return result
}

/**
 * Create request data to be used in HTTP requests i.e. URL query or request body
 * @param {import('immutable').Map|Object} data The data that will be changed into request data
 * @returns {Object} A plain object for the request body
 */
export function createReqData (options = {}) {
  const {
    data,
    languageShouldBeString = false,
  } = options
  const reqData = _isFunction(_get(data, 'toJS')) ? data.toJS() : data
  // We are omitting language in config so just get out of here.
  if (_get(_config, 'features.apiClient.omitLanguage')) {
    return _omit(reqData, ['language'])
  }
  // Add language query
  const language = getLanguageFromMixedType(
    _get(reqData, 'language', null),
    languageShouldBeString,
  )

  if (language) {
    return _assign({}, reqData, { language })
  }
  return _omit(reqData, ['language'])
}

export function useUrlEncodedForHttpMethod (endpointType, httpMethodType) {
  const endpointTypes = [TYPE_BROOKLYN, TYPE_AUTH, TYPE_GOOGLE_RECAPTCHA_API]
  const httpMethodTypes = [TYPE_POST, TYPE_PUT, TYPE_DELETE]
  const isMatchingEndpointType = _includes(endpointTypes, endpointType)
  const isMatchingMethodType = _includes(httpMethodTypes, httpMethodType)
  return isMatchingEndpointType && isMatchingMethodType
}

/**
 * @typedef ClientRequestOptions
 * @type {Object}
 * @property {import('immutable').Map|Object|String} auth Authentication header for
 * @property {String} clientType The client type e.g. brooklyn
 * the http request, if it is not a string there should be a jwt property
 * @property {import('immutable').Map|Object} data The data to be sent with the HTTP request
 * @property {String} responseErrorType The response type the client will consider an error
 * and throw when the HTTP code is in the range
 * @property {Boolean} [followRedirect=true] When true follow redirects
 * @property {Boolean} languageShouldBeString Send language query as string, not array
 * @property {String} origin The origin header for the request
 * @property {String} reqAccept The accept header for the request
 * @property {String} reqType The content type for the request
 * @property {Number} timeout The timeout value for the HTTP request
 * @property {String} type The type of HTTP method for the request e.g. GET
 * @property {String} url The url for the HTTP request
 * @property {String} userAgent The user-agent header
 * @property {Object} headers name value pair of additional headers to send
 * @property {String} xff The X-FORWARED-FOR header value
 */

/**
 * Get a HTTP client to be executed later (it is currently superagent)
 * @param {ClientRequestOptions} options Options for the client
 * @returns {Promise<superagent.Request>} A HTTP request client
 */
export async function getClient (options = {}) {
  const {
    auth,
    clientType,
    data,
    followRedirect = true,
    languageShouldBeString = false,
    origin = getOrigin(),
    reqAccept,
    reqType,
    timeout = DEFAULT_TIMEOUT,
    type,
    url,
    userAgent,
    headers,
    xff,
  } = options
  if (xff) {
    if (!_isString(xff)) {
      throw new Error('X-Forwarded-For header must be of type string.')
    }
  }
  let authorization
  if (auth) {
    // Default is a string for auth
    let bearer = auth
    // Check for immutablejs methods
    if (_isFunction(_get(auth, 'get'))) {
      bearer = auth.get('jwt')
    } else if (_isObject(auth)) {
      // Check for plain object
      bearer = auth.jwt
    }
    if (bearer) {
      authorization = `Bearer ${bearer}`
    }
  }
  let reqUrl = getUrl({ url, clientType })
  // GET requests will be handled be the qs library so don't use super agent query method
  const reqData = data ? createReqData({ data, languageShouldBeString }) : null
  if (reqData && !_isEmpty(reqData) && type === TYPE_GET) {
    const queryString = stringifyQuery(reqData)
    reqUrl += queryString ? `${getQuerySeparator(reqUrl)}${queryString}` : ''
  }
  const client = superagent[type](reqUrl)
  const agentType = _startsWith(reqUrl, 'https')
    ? AGENT_TYPE_HTTPS
    : AGENT_TYPE_HTTP
  client.withCredentials()
  // Set the HTTP agent if one exists in this module
  if (agentType === AGENT_TYPE_HTTPS && getAgentKeepAliveHttps()) {
    client.agent(getAgentKeepAliveHttps())
  }
  if (agentType === AGENT_TYPE_HTTP && getAgentKeepAlive()) {
    client.agent(getAgentKeepAlive())
  }
  // If the type of request is not a GET request we need to put the data on the request body
  if (reqData && !_isEmpty(reqData) && type !== TYPE_GET) {
    client.send(createReqData({ data: reqData }))
  }
  // headers passed to the api client
  // we do this first in case anybody passes headers they shouldnt.
  // like origin, user-agent, authorization, xff, etc.
  if (headers) {
    _forEach(headers, (value, name) => {
      client.set(name, value)
    })
  }
  // Setting the origin, on the server should help hit cache entries in Varnish
  if (origin) {
    client.set('Origin', origin)
  }
  // If the user agent is passed set the value, useful for server side rendering
  if (userAgent) {
    client.set('User-Agent', userAgent)
  }

  // Set the clientAttributes for web app
  client.set('X-Client-Attributes', 'app-provider/gaia,app/web')

  if (authorization) {
    client.set('Authorization', authorization)
  }

  if (xff) {
    client.set('X-Forwarded-For', xff)
  }

  if (timeout) {
    client.timeout(timeout)
  }

  if (!reqType && useUrlEncodedForHttpMethod(clientType, type)) {
    client.type(REQUEST_TYPE_X_WWW_FORM_URLENCODED)
  } else {
    client.type(reqType || REQUEST_TYPE_APPLICATION_JSON)
  }
  if (followRedirect) {
    client.redirects(_isFinite(followRedirect) ? followRedirect : 10)
  } else {
    client.redirects(0)
  }
  client.accept(reqAccept || REQUEST_ACCEPT_APPLICATION_JSON)

  return client
}

/**
 * Get a url given the client request options
 * @param {ClientRequestOptions} options The options
 * @returns {String} The url for the request
 */
export function getUrl (options) {
  const { url = '', clientType } = options
  // If the URL starts with a protocol just use the value
  if (/^https?:\/\//.test(url)) {
    return url
  }
  const cleanUrl = _replace(url, /^\//, '')
  switch (clientType) {
    case TYPE_ASSET:
      return `${SERVER_ASSET}${PATH_ASSETS}${cleanUrl}`
    case TYPE_BROOKLYN:
    case TYPE_BROOKLYN_JSON:
      return `${SERVER_BROOKLYN}${cleanUrl}`
    case TYPE_VA_SERVICE: // ###VATest
      return `${SERVER_VA}${cleanUrl}`
    case TYPE_AUTH:
    case TYPE_AUTH_JSON:
      return `${SERVER_AUTH}${cleanUrl}`
    case TYPE_TESTAROSSA:
      return `${SERVER_TESTAROSSA}${cleanUrl}`
    case TYPE_GOOGLE_RECAPTCHA_API:
      return `${SERVER_GOOGLE_RECAPTCHA_API}${cleanUrl}`
    case TYPE_WEB_APP:
    default:
      return `/${cleanUrl}`
  }
}

function isResponseError404orRange500 (err) {
  return isResponse404(err) || isResponseRange500(err)
}

export function isResponseRange500 (res) {
  const status = _get(res, 'status')
  return status >= 500 && status <= 599
}

export function isResponseRange400 (res) {
  const status = _get(res, 'status')
  return status >= 400 && status <= 499
}

export function isResponse404 (res) {
  const status = _get(res, 'status')
  return status === 404
}

function isReponseError (err, responseErrorType) {
  // If we don't have a response code this is an error
  const status = _get(err, 'status') || _get(err, 'statusCode')
  if (!status) {
    return true
  }
  if (responseErrorType === RESPONSE_ERROR_TYPE_RANGE_500) {
    return isResponseRange500(err)
  }
  if (responseErrorType === RESPONSE_ERROR_TYPE_RANGE_400) {
    return isResponseRange400(err)
  }
  return isResponseError404orRange500(err)
}

/**
 * Perform a HTTP request
 * @param {String} url The url for the rquest
 * @param {String} type The type of HTTP method for the request e.g. GET
 * @param {import('immutable').Map|Object} data The data to be sent with the HTTP request
 * @param {ClientRequestOptions} options The client request options
 * @param {String} clientType The client type e.g. brooklyn
 * @param {superagent.Request} [client] An existing http client
 * @returns {Promise<superagent.Request>} A HTTP request client
 */
export async function fetch (url, type, data, options = {}, clientType = TYPE_GET, client) {
  let res
  // There is a function passing options as a non object
  // this will fix it
  const optionsArg = options || {}
  try {
    const clientOptions = _assign({}, optionsArg, { url, type, data, clientType })
    // eslint-disable-next-line no-param-reassign
    client = client || await getClient(clientOptions)
    res = await client
  } catch (e) {
    const {
      attempt = 0,
      maxAttempts = MAX_RETRY_ATTEMPTS,
      retryOnError = true,
      retryDelay = 100,
    } = optionsArg
    const code = _get(e, 'code')
    const statusCode = _get(e, 'response.statusCode')
    const isRetryableStatus = statusCode && RETRYABLE_STATUS_CODES.has(statusCode)
    const isRetryableCode = code && RETRYABLE_ERROR_CODES.has(code)
    // Retry timeout errors
    const isRetyableTimeout = _get(e, 'timeout') && code === 'ECONNABORTED'
    const isRetryable = isRetryableStatus || isRetryableCode || isRetyableTimeout
    if (retryOnError && attempt < maxAttempts && isRetryable) {
      const newOptions = _assign({}, optionsArg, {
        attempt: attempt + 1,
      })
      await delay(getExponentialDelay(attempt, retryDelay))
      return fetch(url, type, data, newOptions, clientType)
    }
    e.status = statusCode
    e.statusCode = statusCode
    e.code = statusCode
    res = e.response
    if (isReponseError(e, _get(optionsArg, 'responseErrorType'))) {
      throw e
    }
  }
  if (res) {
    res.status = res.status || res.statusCode
  }
  return res
}

/**
 * Perform a HTTP GET request
 * @param {String} url The url for the rquest
 * @param {import('immutable').Map|Object} data The data to be sent with the HTTP request
 * @param {ClientRequestOptions} options The client request options
 * @param {String} clientType The client type e.g. brooklyn
 * @param {superagent.Request} [client] An existing http client
 * @returns {Promise<superagent.Request>} A HTTP request client
 */
export function get (url, data, options, clientType, client) {
  return fetch(url, TYPE_GET, data, options, clientType, client)
}

/**
 * Perform a HTTP POST request
 * @param {String} url The url for the rquest
 * @param {import('immutable').Map|Object} data The data to be sent with the HTTP request
 * @param {ClientRequestOptions} options The client request options
 * @param {String} clientType The client type e.g. brooklyn
 * @param {superagent.Request} [client] An existing http client
 * @returns {Promise<superagent.Request>} A HTTP request client
 */
export function post (url, data, options, clientType, client) {
  return fetch(url, TYPE_POST, data, options, clientType, client)
}

/**
 * Perform a HTTP PUT request
 * @param {String} url The url for the rquest
 * @param {import('immutable').Map|Object} data The data to be sent with the HTTP request
 * @param {ClientRequestOptions} options The client request options
 * @param {String} clientType The client type e.g. brooklyn
 * @param {superagent.Request} [client] An existing http client
 * @returns {Promise<superagent.Request>} A HTTP request client
 */
export function put (url, data, options, clientType, client) {
  return fetch(url, TYPE_PUT, data, options, clientType, client)
}

/**
 * Perform a HTTP PATCH request
 * @param {String} url The url for the rquest
 * @param {import('immutable').Map|Object} data The data to be sent with the HTTP request
 * @param {ClientRequestOptions} options The client request options
 * @param {String} clientType The client type e.g. brooklyn
 * @param {superagent.Request} [client] An existing http client
 * @returns {Promise<superagent.Request>} A HTTP request client
 */
export function patch (url, data, options, clientType, client) {
  return fetch(url, TYPE_PATCH, data, options, clientType, client)
}

/**
 * Perform a HTTP DELETE request
 * @param {String} url The url for the rquest
 * @param {import('immutable').Map|Object} data The data to be sent with the HTTP request
 * @param {ClientRequestOptions} options The client request options
 * @param {String} clientType The client type e.g. brooklyn
 * @param {superagent.Request} [client] An existing http client
 * @returns {Promise<superagent.Request>} A HTTP request client
 */
export function del (url, data, options, clientType, client) {
  return fetch(url, TYPE_DELETE, data, options, clientType, client)
}

/**
 * Set the http keepalive agent singleton
 * @param {*} keepaliveAgent The keepalive agent
 */
export function setAgentKeepAlive (keepaliveAgent) {
  _keepaliveAgent = keepaliveAgent
}

/**
 * Get the http keepalive agent singleton
 * @returns The keepalive agent if it exists
 */
export function getAgentKeepAlive () {
  return _keepaliveAgent
}

/**
 * Set the https keepalive agent singleton
 * @param {*} keepaliveAgent The keepalive agent
 */
export function setAgentKeepAliveHttps (keepaliveAgentHttps) {
  _keepaliveAgentHttps = keepaliveAgentHttps
}

/**
 * Get the https keepalive agent singleton
 * @returns The keepalive agent if it exists
 */
export function getAgentKeepAliveHttps () {
  return _keepaliveAgentHttps
}

/**
 * Set the origin singleton
 * @param {String} origin The origin value
 */
export function setOrigin (origin) {
  _origin = origin
}

/**
 * Get the origin singleton
 * @return {String|undefined} The origin if it exists
 */
export function getOrigin () {
  return _origin
}
