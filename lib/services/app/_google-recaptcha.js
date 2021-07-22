import { Map } from 'immutable'
import _get from 'lodash/get'
import _camelCase from 'lodash/camelCase'
import { getName } from 'new-relic-transaction'
import { get as getConfig } from 'config'
import { fromCallback as fromCallbackPromise, delay } from 'bluebird'
import { getExponentialDelay } from 'exponential-backoff'

const BROWSER = process.env.BROWSER

/**
 * Send event data to Google recaptcha
 * @param {Object} location A location object
 * @param {import('immutable').Map} [auth] An auth object
 * @param {Number} attempt The current attempt
 * @param {Number} [maxAttempt=3] The maximum number of attempts
 */
// eslint-disable-next-line max-len
export default async function updateGoogleRecaptcha (location, auth = Map(), attempt = 0, maxAttempt = 3) {
  if (!BROWSER) {
    return
  }
  const { default: scriptjs } = await import('scriptjs')
  const { googleRecaptchaSiteKey } = getConfig()
  await fromCallbackPromise(cb => scriptjs(`https://www.google.com/recaptcha/api.js?render=${googleRecaptchaSiteKey}`, () => cb()))
  const { grecaptcha } = global
  // Check if Google recaptcha did load and try again
  if (!grecaptcha && attempt < maxAttempt) {
    // Try to load the script again
    await delay(getExponentialDelay(300))
    await updateGoogleRecaptcha(location, auth, attempt + 1)
    return
  } else if (!grecaptcha && attempt === maxAttempt) {
    // We tried too many times and the script didn't load, just give up
    return
  }
  await fromCallbackPromise(cb => grecaptcha.ready(() => cb()))
  const pathname = _get(location, 'pathname', '')
  const query = _get(location, 'query', {})
  const authToken = Map.isMap(auth) ? auth.get('jwt') : null
  try {
    await grecaptcha.execute(googleRecaptchaSiteKey, {
      action: _camelCase(getName({ query, pathname, authToken })),
    })
  } catch (e) {
    // Do thing this only need to send an action
  }
}
