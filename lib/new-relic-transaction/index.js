import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _replace from 'lodash/replace'
import { TYPE_FEATURE as VIDEO_TYPE_FEATURE } from 'services/video'
import {
  isCartAccountCreationCreate,
  isPlanSelectionPlans,
  isCartBillingPayment,
  isCartCreateAccount,
  isCartConfirmation,
  isCartBilling,
  isFast404,
  isPlans,
  isVideo,
  isGo,
} from 'services/url'

/**
 * The NewRelic library for this environment
 */
let _newrelic

/**
 * Set the NewRelic library that works for this runtime
 * @param {*} newrelic The NewRelic library
 * @returns The newrelic object which was passed in
 */
export function setNewRelicLibrary (newrelic) {
  _newrelic = newrelic
  return _newrelic
}

/**
 * Get the NewRelic library that works for this runtime
 * @return {Object} The NewRelic library
 */
export function getNewRelicLibrary () {
  return _newrelic
}

/**
 * Add release information using the NewRelic browser API
 * @param {Object} options The options
 * @param {String} options.name The application name
 * @param {String} options.version The application version
 * @param {*} [options.newrelic] The NewRelic library defaults to singleton
 */
export function addRelease (options = {}) {
  const { name = 'web-app', version = '0.0.0', newrelic = getNewRelicLibrary() } = options
  if (!newrelic) {
    return
  }
  newrelic.addRelease(name, version)
}

/**
 * Set route information using the NewRelic browser api
 * @param {Object} options The options
 * @param {String} [options.username] The username
 * @param {String} [options.uid] The user id
 * @param {Object} options.query A location query object
 * @param {String} options.pathname A location pathname
 * @param {String} [options.authToken] A JWT Token
 * @param {*} [options.newrelic] The NewRelic library defaults to singleton
 */
export function setRoute (options = {}) {
  const { uid, username, newrelic = getNewRelicLibrary() } = options
  if (!newrelic) {
    return
  }
  if (username) {
    newrelic.setCustomAttribute('username', username)
  }
  if (uid) {
    newrelic.setCustomAttribute('uid', uid)
  }
  const name = getName(options)
  newrelic.setPageViewName(name)
  newrelic.setCurrentRouteName(name)
}

/**
 * Set transaction information which occurs on the server side.
 */
export function setTransaction (options) {
  const { uid, username, newrelic = getNewRelicLibrary() } = options
  if (!newrelic) {
    return
  }
  if (username) {
    newrelic.addCustomAttribute('username', username)
  }
  if (uid) {
    newrelic.addCustomAttribute('uid', uid)
  }
  newrelic.setTransactionName(getName(options))
}

/**
 * Get a transaction name based on path, query and authToken
 * @param {Object} options The options
 * @param {Object} options.query A location query object
 * @param {String} options.pathname A location pathname
 * @param {String} [options.authToken] A JWT Token
 * @returns {String} The transaction name
 */
export function getName (options = {}) {
  const { query, pathname, authToken } = options
  // Perform all work before we get to the transaction section
  if (isFast404(pathname)) {
    return 'fast-404'
  } else if (pathname === '/' && !authToken) {
    return 'home'
  } else if (pathname === '/' && authToken) {
    return 'member-home'
  } else if (pathname === '/beta-login-page') {
    return 'beta-login-page'
  } else if (pathname === '/get-started') {
    return 'get-started'
  } else if (pathname === '/password-reset') {
    return 'password-reset'
  } else if (pathname === '/search') {
    return 'search'
  } else if (pathname === '/playlist') {
    return 'playlist'
  } else if (pathname === '/activate') {
    return 'activate'
  } else if (pathname === '/go') {
    return 'go'
  } else if (pathname === '/yoga') {
    return 'yoga'
  } else if (_includes(pathname, '/show/')) {
    return 'show/:id'
  } else if (_includes(pathname, '/tv/')) {
    return 'tv/:id'
  } else if (_includes(pathname, '/series/')) {
    return 'series/:id'
  } else if (isVideo(pathname)) {
    const fullplayer = _get(query, 'fullplayer')
    if (!fullplayer) {
      return 'video/:id'
    } else if (fullplayer === VIDEO_TYPE_FEATURE) {
      return 'video/:id/feature'
    }
    return 'video/:id/preview'
  } else if (isPlans(pathname)) {
    return 'plan-selection'
  } else if (isPlanSelectionPlans(pathname)) {
    return 'plan-selection/plans'
  } else if (isGo(pathname)) {
    return 'go'
  } else if (isCartCreateAccount(pathname)) {
    return 'cart/account-creation'
  } else if (isCartAccountCreationCreate(pathname)) {
    return 'cart/account-creation/create'
  } else if (isCartBilling(pathname)) {
    return 'cart/billing'
  } else if (isCartBillingPayment(pathname)) {
    return 'cart/billing/payment'
  } else if (isCartConfirmation(pathname)) {
    return 'cart/confirmation'
  } else if (/^\/[a-z-]+\/[a-z-]+/.test(pathname)) {
    // This is generic and should always be second to last
    return ':category/:sub-category'
  } else if (/^\/[a-z-]+/.test(pathname)) {
    // This is generic and always be last
    return _replace(pathname || '', /^\//, '')
  }
  return 'unknown'
}
