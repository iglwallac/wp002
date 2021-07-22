import { post as apiPost, TYPE_GOOGLE_RECAPTCHA_API, TYPE_WEB_APP } from 'api-client'
import { delay as wait, fromCallback as fromCallbackPromise } from 'bluebird'
import _get from 'lodash/get'
import _join from 'lodash/join'
import { getExponentialDelay } from 'exponential-backoff'
import { get as getConfig } from 'config'

const NODE_ENV = process.env.NODE_ENV
const BROWSER = process.env.BROWSER

export const CAPTCHA_ACTION_BILLING_PAYMENT_FORM_VIEW = 'billing/paymentFormView'

export async function getGoogleRecaptchaScript (attempt = 0, maxAttempt = 3) {
  // bail if grecaptcha already exists
  if (!BROWSER || global.grecaptcha) {
    return
  }

  const { default: scriptjs } = await import('scriptjs')
  const { googleRecaptchaSiteKey } = getConfig()
  await fromCallbackPromise(cb => scriptjs(`https://www.google.com/recaptcha/api.js?render=${googleRecaptchaSiteKey}`, () => cb()))
  const { grecaptcha } = global

  // Check if Google recaptcha did load and try again
  /* eslint-disable no-useless-return */
  if (!grecaptcha && attempt < maxAttempt) {
    // Try to load the script again
    await wait(getExponentialDelay(300))
    await getGoogleRecaptchaScript(attempt + 1)
    return
  } else if (!grecaptcha && attempt === maxAttempt) {
    // We tried too many times and the script didn't load, just give up
    return
  }
  /* eslint-enable no-useless-return */
}

/**
 * Milliseconds to begin exponetial backoff
 */
const EXPONENTIAL_BACKOFF_INITIAL_DELAY = NODE_ENV === 'test' ? 0 : 300

/**
 * Number of attempts to retrieve Google Recaptcha token
 */
const MAX_RETRIES_CREATE_TOKEN = 5

export default async function verifyToken (options) {
  const { token, log = console } = options
  const {
    retryCount = 0,
    maxRetries = MAX_RETRIES_CREATE_TOKEN,
    retryDelay = EXPONENTIAL_BACKOFF_INITIAL_DELAY,
  } = options
  const { googleRecaptchaSecretKey, googleRecaptchaThreshold } = getConfig()
  try {
    const newrelic = await import('newrelic')
    const params = {
      secret: googleRecaptchaSecretKey,
      response: token,
    }
    const response = await apiPost('siteverify', params, undefined, TYPE_GOOGLE_RECAPTCHA_API)
    const success = _get(response, 'body.success')
    const score = _get(response, 'body.score')
    const action = _get(response, 'body.action', CAPTCHA_ACTION_BILLING_PAYMENT_FORM_VIEW)
    const hostname = _get(response, 'body.hostname')
    const errorCodes = _join(_get(response, 'body.error-codes'), ', ')
    /**
     * @see https://developers.google.com/recaptcha/docs/v3#site_verify_response
     */
    // eslint-disable-next-line max-len
    const valid = success && score >= googleRecaptchaThreshold && action === CAPTCHA_ACTION_BILLING_PAYMENT_FORM_VIEW

    if (!valid) {
      newrelic.recordCustomEvent('BillingGoogleRecaptchaInvaild', {
        success,
        score,
        action,
        hostname,
        errorCodes,
      })
    }

    return { valid }
  } catch (err) { // Will throw an error on any status not 200
    if (retryCount < maxRetries) {
      const delay = getExponentialDelay(retryCount, retryDelay)
      log.warn(`Unable to verify captcha token, retry ${retryCount} delay ${delay}`)
      await wait(delay)
      return verifyToken({ retryCount: retryCount + 1, token })
    }
    // default to let requests through
    return { valid: true }
  }
}

export async function getCaptchaVerifyToken (options) {
  const { token } = options
  try {
    const res = await apiPost('v1/captcha/verify-token', { googleRecaptchaToken: token }, null, TYPE_WEB_APP)
    const { body } = res
    return body
  } catch (e) {
    return {}
  }
}
