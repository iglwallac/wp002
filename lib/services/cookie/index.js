import _get from 'lodash/get'
import {
  get,
  set,
  expire,
} from 'cookies-js'
import { getLocalPreferences, LOCAL_PREFERENCE_COOKIE_OPTIN_ACCEPTED } from 'services/local-preferences'
import { get as getConfig } from 'config'

const config = getConfig()
const dataPrivacyCompliance = _get(config, ['features', 'anonymousUser', 'dataPrivacyCompliance'])

function getCookieDomain () {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'local'
    ? 'localhost'
    : '.gaia.com'
}

export function canSetCookie (uid, authToken) {
  if (!getLocalPreferences(uid, LOCAL_PREFERENCE_COOKIE_OPTIN_ACCEPTED) && !authToken) {
    return false
  }

  return true
}

export function setCookie (name, value, path = '/', expires = 86400, secure = false, uid, authToken) {
  /* eslint-disable consistent-return */
  if (!canSetCookie(uid, authToken) && dataPrivacyCompliance) {
    return
  }

  return set(name, value, {
    expires, // time in seconds
    domain: getCookieDomain(),
    path,
    secure,
  })
  /* eslint-enable consistent-return */
}

export function getCookie (name) {
  return get(name)
}

export function expireCookie (name) {
  return expire(name, { domain: getCookieDomain() })
}
