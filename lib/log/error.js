/**
 * Log errors using the logger
 */
import { getLogger } from '.'

/**
 * Log an error using the logger singleton
 * @param {Error} error The error
 * @param {String} message The error message
 */
export function log (error, message) {
  let logger = getLogger()
  if (!logger || !logger.error) {
    // eslint-disable-next-line no-console
    if (!console.error) {
      return null
    }
    logger = console
  }
  return logger.error(error || 'Unknown error', message)
}

export default {
  log,
}
