const LOCAL = 'local'
const PRODUCTION = 'production'
const NODE_ENV = process.env.NODE_ENV || LOCAL
const BROWSER = process.env.BROWSER

/**
 * Get the enviroment i.e. NODE_ENV
 */
function get () {
  return NODE_ENV
}

/**
 * Return true if we are running in a local environment
 * i.e. you are developing on your laptop. If NODE_ENV
 * is falsy or is equal to 'local'.
 */
function isLocal () {
  return get() === LOCAL
}

/**
 * Return true if NODE_ENV === PRODUCTION
 */
function isProduction () {
  return get() === PRODUCTION
}

/**
 * Checks if touch feature are available.
 * @see https://ctrlq.org/code/19616-detect-touch-screen-javascript
 */
function isTouch () {
  if (BROWSER) {
    return (
      'ontouchstart' in window ||
      navigator.MaxTouchPoints > 1 ||
      navigator.msMaxTouchPoints > 0
    )
  }
  return false
}

/**
 * Returns true for iPhone or iPad, browser agnostic.
 */
function isIOS (options = {}) {
  const { global: g = global } = options
  if (g && g.navigator) {
    const { navigator } = g
    const ua = navigator.userAgent
    return /iPad/i.test(ua) || /iPhone/i.test(ua)
  }
  return false
}

/**
 * Returns true for Android Device but not Amazon, browser agnostic.
 */
function isNonAmazonAndroid (options = {}) {
  const { global: g = global } = options
  if (g && g.navigator) {
    const { navigator } = g
    const ua = navigator.userAgent
    const androidTest = /android/i.test(ua)
    const silkTest = /silk/i.test(ua)
    return androidTest && !silkTest
  }
  return false
}

/**
 * Returns true for Android Device, silk browser.
 */
function isAmazon (options = {}) {
  const { global: g = global } = options
  if (g && g.navigator) {
    const { navigator } = g
    const ua = navigator.userAgent
    const androidTest = /android/i.test(ua)
    const silkTest = /silk/i.test(ua)
    return androidTest && silkTest
  }
  return false
}


/**
 * Returns true for Safari on either iPhone or iPad.
 * Addresses the similiarity in UA string from Chrome on iOS.
 */
function isMobileSafari (options = {}) {
  const { global: g = global } = options
  if (g && g.navigator) {
    const { navigator } = g
    const ua = navigator.userAgent
    const webkit = /WebKit/i.test(ua)
    return isIOS(options) && webkit && !ua.match(/CriOS/i)
  }
  return false
}

export default {
  get,
  isLocal,
  isProduction,
  isTouch,
  isIOS,
  isNonAmazonAndroid,
  isAmazon,
  isMobileSafari,
  LOCAL,
  PROD: PRODUCTION,
}
