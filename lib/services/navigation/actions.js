
export const NAVIGATION_HISTORY_PUSH = 'NAVIGATION_HISTORY_PUSH'
export const NAVIGATION_HISTORY_REPLACE = 'NAVIGATION_HISTORY_REPLACE'

/**
 * Push state onto the navigation history
 * @param {Object} payload The options for the function
 * @param {String} [payload.url] the url to push
 * @param {Number} [payload.timeout] the amount of time to delay push
 * @param {Object|Map} [payload.query] query string parameters
 * @returns {Object} A Redux action
 */
export function pushHistory (payload) {
  return {
    type: NAVIGATION_HISTORY_PUSH,
    payload,
  }
}

/**
 * Replace state on the navigation history
 * @param {Object} payload The options for the function
 * @param {String} [payload.url] the url to replace
 * @param {Number} [payload.timeout] the amount of time to delay replace
 * @param {Object|Map} [payload.query] query string parameters
 * @returns {Object} A Redux action
 */
export function replaceHistory (payload) {
  return {
    type: NAVIGATION_HISTORY_REPLACE,
    payload,
  }
}
