import ls from 'local-storage'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _parseInt from 'lodash/parseInt'
import _merge from 'lodash/merge'
import { log as logError } from 'log/error'
import { canSetCookie } from 'services/cookie'
import { get as getConfig } from 'config'
import { Map } from 'immutable'

const config = getConfig()
const dataPrivacyCompliance = _get(config, ['features', 'anonymousUser', 'dataPrivacyCompliance'])

export const LOCAL_PREFERENCE_COOKIE_OPTIN_ACCEPTED = 'cookieOptInAccepted'

export function setLocalStorage (key, value, uid, auth = Map(), force = false) {
  const authToken = auth.get('jwt')
  // force should only be set for the cookie acceptance banner
  // and should not ever be used for anything else
  // if the user is anonymous and has opted in to cookies,
  // save data to local storage
  if (force || (canSetCookie(uid, authToken) && dataPrivacyCompliance)) {
    return ls.set(key, value)
  } else if (!dataPrivacyCompliance) {
    return ls.set(key, value) // support original behavior if feature toggle is off
  }
  return // eslint-disable-line
}

export function getLocalStorage (key) {
  return ls.get(key)
}

export function removeLocalStorage (key) {
  if (key) {
    ls.remove(key)
    return
  }
  ls.clear()
}

export function getSessionStorage (key, defaultValue = null) {
  if (typeof sessionStorage !== 'undefined') {
    const value = sessionStorage.getItem(key) || defaultValue
    // if the value IS the default, exit
    if (value === defaultValue) {
      return value
    }
    // all of these can be JSON parsed (boolean, int, float, null)
    // AND quoted value, array, or object
    if (/^(true|false|null|\d+\.?\d+)$/i.test(value)
      || /^("|\[|\{)/.test(value)) {
      try {
        const result = JSON.parse(value)
        return result
      } catch (e) {
        // do nothing
      }
    }
    return value
  }
  return defaultValue
}

export function setSessionStorage (key, value) {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.setItem(key, JSON.stringify(value))
  }
  return null
}

export function clearSessionStorage (key) {
  if (typeof sessionStorage !== 'undefined') {
    if (key) {
      sessionStorage.removeItem(key)
      return
    }
    sessionStorage.clear()
  }
}

function getData () {
  const data = getLocalStorage('gaia') || {}
  const anonLanguageAlertBarAccepted = _get(data, [-1, 'user', 'data', 'languageAlertBarAccepted'])
  const session = getSessionStorage('gaia', {})
  // set anonymous languageAlertBarAccepted for session because local storage should always win
  // without setting this here, when local storage and session are merged below
  // session will overwrite what is in local storage
  _set(session, [-1, 'user', 'data', 'languageAlertBarAccepted'], anonLanguageAlertBarAccepted)

  try {
    // Fix double encoded JSON data.
    if (
      _isString(data) &&
      data.indexOf('{') === 0 &&
      data.lastIndexOf('}') === data.length - 1
    ) {
      const obj = JSON.parse(data)

      return _merge(obj, session)
    }
  } catch (e) {
    // Do nothing we will return null below
    logError(e)
    return null
  }

  return _merge(data, session)
}

export function getLocalPreferences (uid, key) {
  if (!_isNumber(uid)) {
    // eslint-disable-next-line no-param-reassign
    uid = -1
  }
  let localData = {}
  try {
    localData = getData()
    if (!localData) {
      return null
    }
    return _get(localData, `${uid}.${key}`, null)
  } catch (e) {
    // Do nothing we will return null below
    logError(e)
  }
  return null
}

export function setLocalPreferences (uid, key, value, auth, force) {
  if (!_isNumber(uid)) {
    // eslint-disable-next-line no-param-reassign
    uid = -1
  }
  let userPrefs = {}
  let localData = {}
  try {
    localData = getData() || {}
    userPrefs = _get(localData, uid, {})
  } catch (e) {
    // Do nothing
    logError(e)
  }
  userPrefs[key] = value
  localData[_parseInt(uid)] = userPrefs

  // 'force' should only be used when setting the cookie banner acceptance
  // no local storage or cookies should be set unless acceptance has been set
  setSessionStorage('gaia', localData)
  return setLocalStorage('gaia', localData, uid, auth, force)
}
