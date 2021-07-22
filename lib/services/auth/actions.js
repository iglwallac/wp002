import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _some from 'lodash/some'
import { Map } from 'immutable'
import { LOGIN_CODE_BLOCKED_USER, LOGIN_CODE_INVALID_TOKEN } from 'services/auth/login-codes'
import { login, logout, loginProfile, renew, setTokenDataInStorage } from '.'

export const RESET_AUTH_DATA = 'RESET_AUTH_DATA'
export const SET_AUTH_DATA = 'SET_AUTH_DATA'
export const SET_AUTH_RENEW_TIMES = 'SET_AUTH_RENEW_TIMES'
export const SET_AUTH_LOGIN_SUCCESS = 'SET_AUTH_LOGIN_SUCCESS'
export const INCREMENT_AUTH_RENEWAL_COUNT = 'INCREMENT_AUTH_RENEWAL_COUNT'
export const RESET_AUTH_RENEWAL_COUNT = 'RESET_AUTH_RENEWAL_COUNT'
export const SET_AUTH_LOGIN_FAILED = 'SET_AUTH_LOGIN_FAILED'
export const SET_ATOMIC_AUTH_DATA = 'SET_ATOMIC_AUTH_DATA'
export const AUTH_CHANGE_PROFILE = 'AUTH_CHANGE_PROFILE'
export const AUTH_LOGOUT = 'AUTH_LOGOUT'
export const AUTH_LOGIN = 'AUTH_LOGIN'
export const AUTH_ERROR = 'AUTH_ERROR'
export const AUTH_RENEW_CHECK = 'AUTH_RENEW_CHECK'

/**
 * Login codes that cause the application to logout
 */
const LOGIN_CODES_DO_LOGOUT = [LOGIN_CODE_BLOCKED_USER, LOGIN_CODE_INVALID_TOKEN]

function onAuthError (dispatch) {
  dispatch({ type: AUTH_ERROR })
}

export function resetAuthData () {
  return { type: RESET_AUTH_DATA }
}

export function authRenewCheck () {
  return { type: AUTH_RENEW_CHECK }
}

export function setAuthData (data, processing = false) {
  return {
    type: SET_AUTH_DATA,
    payload: { data, processing },
  }
}

export function setAtomicAuthData (data) {
  return {
    type: SET_ATOMIC_AUTH_DATA,
    payload: data,
  }
}

export function setAuthLoginFailed (codes, statusCode) {
  return {
    type: SET_AUTH_LOGIN_FAILED,
    payload: { codes, statusCode },
  }
}

export function setAuthLoginSuccess (value) {
  return {
    type: SET_AUTH_LOGIN_SUCCESS,
    payload: value,
  }
}

/**
 * Increment the auth renewal count by 1 optional setting processing and processingRenew
 * @param {Object} options The options
 * @param {Boolean} [options.processing=true] The processing value
 * @param {Boolean} [options.processingRenew=true] The process renew value
 */
export function incrementAuthRenewalCount (options = {}) {
  const { processing = true, processingRenew = true } = options
  return {
    type: INCREMENT_AUTH_RENEWAL_COUNT,
    payload: { processing, processingRenew },
  }
}

/**
 * Reset the auth renewal count optional setting processing and processingRenew
 * @param {Object} options The options
 * @param {Boolean} [options.processing=false] The processing value
 * @param {Boolean} [options.processingRenew=false] The process renew value
 */
export function resetAuthRenewalCount (options = {}) {
  const { processing = false, processingRenew = false } = options
  return {
    type: RESET_AUTH_RENEWAL_COUNT,
    payload: { processing, processingRenew },
  }
}

export function setAuthPersistentData (data, processing = false) {
  return async function setAuthPersistentDataThunk (dispatch) {
    setTokenDataInStorage(data)
    dispatch(setAuthData(data, processing))
  }
}

export function doAuthRenew (auth) {
  return async function doAuthRenewThunk (dispatch) {
    try {
      dispatch(incrementAuthRenewalCount())
      const data = await renew({ auth })
      const codes = _get(data, 'auth.codes') || []
      if (_get(data, 'auth.success')) {
        dispatch(setAuthPersistentData(data.auth))
        dispatch(resetAuthRenewalCount())
      } else {
        onAuthError(dispatch)
        // If the user is blocked logged them out
        const doLogout = _some(LOGIN_CODES_DO_LOGOUT, v => _includes(codes, v))
        if (doLogout) {
          dispatch(doAuthLogout(auth))
        }
      }
      return _get(data, 'auth')
    } catch (e) {
      onAuthError(dispatch)
      throw e
    }
  }
}

export function doAuthLogin ({ username, password }) {
  return async function doAuthLoginThunk (dispatch) {
    try {
      dispatch({ type: AUTH_LOGIN })
      const data = await login({ username, password })
      const statusCode = data.statusCode
      const { codes = Map() } = data
      if (_get(data, 'auth.success')) {
        dispatch(setAuthPersistentData(data.auth))
        dispatch(setAuthLoginSuccess(true))
      } else {
        dispatch(setAuthLoginFailed(codes, statusCode))
        onAuthError(dispatch)
      }
      return _get(data, 'auth')
    } catch (e) {
      const statusCode = e.status || 500
      const codes = ['serviceUnavailable']
      dispatch(setAuthLoginFailed(codes, statusCode))
      onAuthError(dispatch)
      throw e
    }
  }
}

export function changeAuthProfile ({ auth, uid, userAccountId }) {
  return async function changeAuthProfileThunk (dispatch) {
    try {
      dispatch({ type: AUTH_CHANGE_PROFILE })
      await doAuthRenew()
      await doAuthLogout(auth)
      const data = await loginProfile({ auth, uid, userAccountId })
      const statusCode = data.statusCode
      const { codes = Map() } = data
      if (_get(data, 'auth.success')) {
        dispatch(setAuthPersistentData(data.auth))
        dispatch(setAuthLoginSuccess(true))
      } else {
        dispatch(setAuthLoginFailed(codes, statusCode))
        onAuthError(dispatch)
      }
      return _get(data, 'auth')
    } catch (e) {
      const statusCode = e.status || 500
      const codes = ['serviceUnavailable']
      dispatch(setAuthLoginFailed(codes, statusCode))
      onAuthError(dispatch)
      throw e
    }
  }
}

export function doAuthLogout (auth) {
  return async function doAuthLogoutThunk (dispatch) {
    try {
      dispatch({ type: AUTH_LOGOUT })
      await logout({ auth })
    } catch (e) {
      // Not important to tell users why it failed so do nothing
    }
    setTokenDataInStorage(null)
    dispatch(resetAuthData())
    if (sessionStorage) {
      try {
        sessionStorage.removeItem('whoiswatching')
      } catch (e) {
        // Do nothing
      }
    }
    // Redirect to homepage which will also cause app to restart
    if (global && global.location) {
      setTimeout(() => global.location.assign('/'), 100)
    }
    return null
  }
}
