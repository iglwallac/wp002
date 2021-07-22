import { get, post, REQUEST_TYPE_X_WWW_FORM_URLENCODED, TYPE_BROOKLYN } from 'api-client'
import { Map } from 'immutable'
import Cookies from 'cookies-js'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _includes from 'lodash/includes'
import _isEmpty from 'lodash/isEmpty'
import _isString from 'lodash/isString'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _parseInt from 'lodash/parseInt'
import _reduce from 'lodash/reduce'
import { getRoles } from 'services/auth-access'
import SCHEMA from './schema'
import { LOGIN_CODE_INVALID_TOKEN } from './login-codes'

export const DEVICE = 'web-app'
export const AUTH_EXPIRES_SECONDS = 25920000 // 300 Days
export const AUTH_COOKIE_NAME = 'auth'

export function createModel (data) {
  const model = _reduce(
    data,
    (result, value, key) => {
      if (_has(result, key)) {
        _assign(result, { [key]: value })
      }
      return result
    },
    _cloneDeep(SCHEMA),
  )
  model.roles = getRoles(model)
  return model
}

/**
 * Renew auth information given an existing auth (which can be expired)
 * @param {Object} options The options
 * @param {Boolean} [options.retryOnError=true] When true retry the api on error
 * @param {Object} options.auth The auth object
 * @param {String} options.auth.uid The user id
 * @param {String} options.auth.jwt A JWT value to renew
 * @returns An auth object with renewed information
 */
export async function renew (options = {}) {
  const { auth, retryOnError = true } = options
  try {
    const res = await post(
      'v1/renew',
      { device: DEVICE },
      {
        auth,
        type: REQUEST_TYPE_X_WWW_FORM_URLENCODED,
        retryOnError,
      },
      TYPE_BROOKLYN,
    )
    return { auth: handleLoginResponse(res) }
  } catch (e) {
    return {
      auth: handleLoginResponse(e.response, true, 'Could not process renew information'),
    }
  }
}

/**
 * Login a user given a username and password
 * @param {Object} options The options
 * @param {string} options.username The username
 * @param {String} options.password The password
 * @returns An auth object with login information
 */
export async function login (options = {}) {
  try {
    const { username, password } = options
    const res = await post(
      'v1/login',
      { username, password, device: DEVICE },
      { type: REQUEST_TYPE_X_WWW_FORM_URLENCODED, retryOnError: true },
      TYPE_BROOKLYN,
    )
    return { auth: handleLoginResponse(res) }
  } catch (e) {
    return {
      auth: handleLoginResponse(e.response, true, 'Could not process login information'),
    }
  }
}

/**
 * Login a user to a profile given existing auth data
 * @param {Object} options The options
 * @param {Object} options.auth The auth object
 * @param {String} options.auth.uid The user id
 * @param {String} options.auth.jwt A JWT value to renew
 * @returns An auth object with login information
 */
export async function loginProfile (options = {}) {
  try {
    const { auth, uid, userAccountId } = options
    const res = await post(
      'v1/login-profile',
      { uid, userAccountId },
      {
        auth,
        type: REQUEST_TYPE_X_WWW_FORM_URLENCODED,
      },
      TYPE_BROOKLYN,
    )
    return { auth: handleLoginResponse(res) }
  } catch (e) {
    return {
      auth: handleLoginResponse(e.response, true, 'Could not login with this profile'),
    }
  }
}

/**
 * Handle login / renenew API responses and create a response shape
 * @param {Object} res The HTTP response
 * @param {Object} res.body The HTTP response body
 * @param {Boolean} _dataError True when the resposne was an error
 */
export function handleLoginResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  const statusCode = _get(res, 'statusCode')
  const success = _get(data, 'success', false)
  let codes = _get(data, 'codes')
  if (!codes) {
    codes = _includes([401, 403], statusCode) ? [LOGIN_CODE_INVALID_TOKEN] : []
  }
  if (success) {
    return createModel({
      _dataError,
      success,
      codes,
      roleIds: _get(data, 'roleIds') || [],
      jwt: _get(data, 'jwt'),
      idExpires: _parseInt(
        // Expire in 1 hour if it is not provided.
        _get(data, 'idExpires', Math.floor(Date.now() / 1000) + 3600),
      ),
      uid: _parseInt(_get(data, 'uid', -1)),
      uuid: _get(data, 'uuid'),
      email: _get(data, 'email'),
      username: _get(data, 'username'),
      country: _get(data, 'country'),
      subscriptions: _map(_get(data, 'subscriptions') || [], _parseInt),
      userAccountId: _get(data, 'userAccountId'),
    })
  }
  return {
    success,
    _dataError,
    messages: _get(data, 'messages') || [],
    jwt: _get(data, 'jwt') || null,
    idToken: _get(data, 'idToken') || null,
    statusCode,
    codes,
  }
}

/**
 * Logout a user given existing auth data
 * @param {Object} options The options
 * @param {Object} options.auth The auth object
 * @param {String} options.auth.uid The user id
 * @param {String} options.auth.jwt A JWT value to renew
 * @returns The logout response
 */
export async function logout (options = {}) {
  try {
    const { auth } = options
    const res = await get('v1/logout', null, { auth }, TYPE_BROOKLYN)
    return handleLogoutResponse(res)
  } catch (e) {
    return handleLogoutResponse({}, true)
  }
}

export function handleLogoutResponse (res) {
  const data = _get(res, 'body', {})
  if (!_get(data, 'success')) {
    throw new Error(_join(_get(data, 'messages', [], ', ')))
  }
  return { complete: true }
}

/**
 * Create params including the value and options for token data storage
 * as a cookie
 * @param {Object} auth The auth data
 * @param {Object} options The cookie options to override defaults
 * @param {Number} [options.expires=AUTH_EXPIRES_SECONDS] The exipration of
 * the cookie in seconds
 * @param {String} [options.path=/] The path for the cookie
 * @param {Boolean} [options.secure] True when the cookie should be marked
 * secure
 * @return {{value: String, expires: Date, path: String, secure: Boolean}} The
 * params to be used in cookie storage
 */
export function createAuthCookieStorage (auth, options = {}) {
  const {
    expires = AUTH_EXPIRES_SECONDS,
    path = '/',
    secure = !(!process.env.NODE_ENV || process.env.NODE_ENV === 'local'),
  } = options
  return {
    value: JSON.stringify(auth),
    expires: new Date(Date.now() + (expires * 1000)),
    path,
    secure,
  }
}

export function setTokenDataInStorage (auth, storage = Cookies, storageOptions = {}) {
  // Expire all cookies for becuase it needs to be done either way
  storage.expire(AUTH_COOKIE_NAME)
  // Expire any additonal cookies for good measure incase they start with a dot prefix
  storage.expire(AUTH_COOKIE_NAME)
  // We don't have auth so we are done since the expires cleaned it up
  if (!auth) {
    return
  }
  const {
    value,
    expires,
    path,
    secure,
  } = createAuthCookieStorage(auth, storageOptions)
  storage.set(AUTH_COOKIE_NAME, value, { expires, path, secure })
}

export function getTokenDataFromStorage (storage = Cookies) {
  try {
    return createModel(JSON.parse(storage.get(AUTH_COOKIE_NAME)))
  } catch (e) {
    /* Do nothing */
  }
  return null
}

export function getTokenFromStorage (storage = Cookies) {
  const data = getTokenDataFromStorage(storage)
  if (_has(data, 'jwt')) {
    return _get(data, 'jwt')
  }
  return null
}

export function getUidFromStorage (storage = Cookies) {
  const data = getTokenDataFromStorage(storage)
  if (_has(data, 'uid')) {
    return _get(data, 'uid')
  }
  return null
}

/**
 * The auth state exists
 * @param {String|Map} auth The auth state or JWT
 * @returns {Boolean} True if auth state exists
 */
export function authExists (auth) {
  if (Map.isMap(auth) && !auth.isEmpty()) {
    return true
  } else if (_isString(auth) && _isEmpty(auth)) {
    return true
  }
  return false
}

/**
 * Get the JWT if it exists
 * @param {String|Map} auth The auth state or JWT
 * @returns {String|undefined} The jwt if it exists
 */
export function getAuthJwt (auth) {
  if (Map.isMap(auth)) {
    return auth.get('jwt')
  }
  return auth
}


/**
 * Returns true if the auth state shows the user is logged in
 * @param {String|Map} auth The auth state or JWT
 * @returns {Boolean} True if a JWT exists
 */
export function getAuthIsLoggedIn (auth) {
  return !_isEmpty(getAuthJwt(auth))
}
