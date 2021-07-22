import _has from 'lodash/has'
import _isFunction from 'lodash/isFunction'
import { SET_AUTH_DATA } from 'services/auth/actions'
import { log as logError } from 'log/error'

const BROWSER = process.env.BROWSER

function handleAuthSetData () {
  if (!_has(global, 'auth.setAuthCookie') || !_isFunction(global.auth.setAuthCookie)) {
    return
  }
  try {
    // send event to external hook such as Android
    global.auth.setAuthCookie()
  } catch (e) {
    logError(e)
  }
}

export default function middleware (store, options = {}) {
  const { browser = BROWSER } = options
  return next => (action) => {
    if (!browser) {
      next(action)
      return
    }
    const { type } = action
    switch (type) {
      case SET_AUTH_DATA:
        handleAuthSetData({ store, action })
        break
      default:
        // Do nothing.
        break
    }
    next(action)
  }
}
