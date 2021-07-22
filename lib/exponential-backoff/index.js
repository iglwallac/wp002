/**
 * Returns the next wait interval, in milliseconds, using an exponential
 * backoff algorithm.
 * @param {Number} retryCount The retry count
 * @param {Number} [delay=100] The delay
 * @returns {Number} A delay in milliseconds
 */
function getExponentialDelay (retryCount, delay = 100) {
  return Math.floor((2 ** retryCount) * delay)
}

export default { getExponentialDelay }
