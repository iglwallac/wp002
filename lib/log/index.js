/**
 * Logger features
 */

/**
 * A logger singleton that implements the console api
 */
let _logger

/**
 * Set the logger singleton
 * @param {Object} logger A logger which implements the console api
 */
export function setLogger (logger) {
  _logger = logger
}

/**
 * Get the logger singleton
 * @returns {Object|undefined} The logger singleton which implements the console api if
 * it was set
 */
export function getLogger () {
  return _logger
}

/**
 * Set and then get the logger singleton
 * @param {Object} logger A logger which implements the console api
 */
export function getSetLogger (logger) {
  setLogger(logger)
  return getLogger()
}

/**
 * Log an error
 * @param {Error} error An error
 */
export function log (error) {
  if (!_logger || !_logger.error) {
    // eslint-disable-next-line no-console
    if (!console.error) {
      return null
    }
    // eslint-disable-next-line no-console
    console.error(error || 'Unknown error')
  }
  return _logger.error(error || 'Unknown error')
}

export default {
  setLogger,
  getLogger,
  getSetLogger,
  log,
}
