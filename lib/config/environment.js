import _pick from 'lodash/pick'
import _isUndefined from 'lodash/isUndefined'
import BROWSER_SAFE_ENVIRONMENT_VARS from './browser-safe.json'

const BROWSER = process.env.BROWSER

/**
 * Get the environment variables that can be used in the browser
 * with out createing securiry risks. Private keys or passwords
 * should not be present in this list because they will be
 * exposed to the world.
 */
export function parseBrowserSafe () {
  return _pick(process.env, BROWSER_SAFE_ENVIRONMENT_VARS)
}

export function isBrowser () {
  return _isUndefined(BROWSER) ? global.BROWSER_TEST : BROWSER
}

export default {
  parseBrowserSafe,
}
