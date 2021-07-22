import { SET_SERVER_TIME_DATA } from 'services/server-time/actions'
import { BOOTSTRAP_PHASE_INIT } from 'services/app'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { getLogger } from 'log'
import { getAuthIsLoggedIn } from '.'
import { SET_AUTH_DATA, AUTH_RENEW_CHECK, doAuthRenew, authRenewCheck } from './actions'

/**
 * The auth renewal check in seconds
 */
const AUTH_RENEW_CHECK_INTERVAL_SECONDS = 300

/**
 * The timeout to run the auth check interval
 */
const AUTH_RENEW_CHECK_INTERVAL_TIMEOUT = AUTH_RENEW_CHECK_INTERVAL_SECONDS * 1000

/**
 * Time in seconds for optimistic auth renewal, i.e. renew before expire
 */
const AUTH_RENEW_OPTIMISTIC_INTERVAL_SECONDS = 1800

/**
 * A interval id for the auth renewal check
 * @type {Number}
 */
let _authRenewalCheckInterval

/**
 * A timestamp based lock for auth renewals to prevent thrashing
 * @type {Number}
 */
let _authRenewalLockTimestamp

/**
 * A timestamp for an optimistis token renewal
 * @type {Number}
 */
let _authRenewalOptimisticTimestamp

/**
 * Set the auth optimistic renewal timestamp, defaults to
 * now plus AUTH_RENEW_OPTIMISTIC_INTERVAL_SECONDS
 * @param {Number} timestamp An options timestamp
 */
function setAuthRenewalOptimisticTimestamp (timestamp) {
  _authRenewalOptimisticTimestamp = timestamp ||
    Math.floor(Date.now() / 1000) + AUTH_RENEW_OPTIMISTIC_INTERVAL_SECONDS
}

/**
 * Handle the auth renewal process
 * @param {Object} options The options
 * @param {Map} options.auth The auth state
 * @param {Map} options.serverTime The serverTime state
 * @param {Function} options.dispatch A redux dispatch function
 * @param {Number} [options.authRenewalLockTimestamp] A timestamp lock for the renewal
 */
async function handleAuthRenew (options = {}) {
  const {
    auth,
    dispatch,
    authRenewalLockTimestamp = _authRenewalLockTimestamp,
    authRenewalOptimisticTimestamp = _authRenewalOptimisticTimestamp,
  } = options
  const log = getLogger() || console
  // If the user is not logged in there is nothing to refresh
  if (!getAuthIsLoggedIn(auth)) {
    log.info({ watcher: 'auth', idExpires }, 'Not renewing not logged in')
    return
  }
  const idExpires = auth.get('idExpires')
  const currentTimestamp = Math.floor(Date.now() / 1000)
  // Only renew if the idExpires exists and is within check interval seconds
  // of the current timestamp
  if (!idExpires) {
    log.info({ watcher: 'auth', idExpires }, 'Not renewing auth idExpires does not exist')
    return
  }
  const timestampIdExpired = currentTimestamp - AUTH_RENEW_CHECK_INTERVAL_SECONDS
  const idExpired = idExpires <= timestampIdExpired
  const optimisticRenewal = authRenewalOptimisticTimestamp <= currentTimestamp
  if (idExpired || optimisticRenewal) {
    if (idExpired) {
      log.info(
        { watcher: 'auth', idExpires, currentTimestamp, timestampIdExpired },
        'Renewing auth due to idExpires is less than or equal to timestamp id expired',
      )
    }
    if (optimisticRenewal) {
      log.info(
        { watcher: 'auth', idExpires, currentTimestamp, authRenewalOptimisticTimestamp },
        'Renewing auth due to optimistic renewal timestamp is less than or equal to optimitic renewal timestamp',
      )
    }
    if (authRenewalLockTimestamp && authRenewalLockTimestamp > currentTimestamp) {
      log.info(
        { watcher: 'auth', idExpires, currentTimestamp, authRenewalLockTimestamp },
        'Not renewing auth renewal lock timestamp greater than current timestamp',
      )
      return
    }
    // If auth is already processing this should be triggered again by another
    // auth action when it is done
    const processingRenew = auth.get('processingRenew')
    if (processingRenew) {
      log.info(
        { watcher: 'auth', idExpires, currentTimestamp, authRenewalLockTimestamp, processingRenew },
        'Not renewing auth renew processing',
      )
      return
    }
    // Lock renewal attempts so they can't occur more then once a minute
    // to prevent thrashing
    _authRenewalLockTimestamp = Math.floor(Date.now() / 1000) + 60
    // Set the next optimistic renewal
    setAuthRenewalOptimisticTimestamp()
    // If we got this far we need to renew the token
    await dispatch(doAuthRenew(auth))
    return
  }
  log.info(
    { watcher: 'auth', idExpires, currentTimestamp, authRenewalOptimisticTimestamp },
    'Not renewing auth optimistic renewal timestamp and idExpires has not passed',
  )
}

/**
 * Clear the auth renewal check interval if it exists
 */
function clearAuthRenewalCheckInterval () {
  if (_authRenewalCheckInterval) {
    clearInterval(_authRenewalCheckInterval)
    _authRenewalCheckInterval = undefined
  }
}

/**
 * Initialize the auth renwal iterval first clearing any existing interval
 * @param {Object} options The the options
 * @param {Function} options.dispatch A redux dispatch function
 */
function initAuthRenewalCheckInterval (options = {}) {
  const { dispatch } = options
  clearAuthRenewalCheckInterval()
  // There is no interval set yet so dispatch the check
  dispatch(authRenewCheck())
  _authRenewalCheckInterval = setInterval(() => {
    dispatch(authRenewCheck())
  }, AUTH_RENEW_CHECK_INTERVAL_TIMEOUT)
}

export function authBootStrapWatcher ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, ({ state, dispatch }) => {
    const { app } = state
    switch (app.get('bootstrapPhase')) {
      case BOOTSTRAP_PHASE_INIT: {
        setAuthRenewalOptimisticTimestamp()
        initAuthRenewalCheckInterval({ dispatch })
        // On window blur the timeout does run so re-init the renew process
        window.addEventListener('focus', () => initAuthRenewalCheckInterval({ dispatch }))
        break
      }
      default:
        break
    }
  })
}

export function authRenewalWatcher ({ after }) {
  return after([
    SET_SERVER_TIME_DATA,
    SET_AUTH_DATA,
    AUTH_RENEW_CHECK,
  ], ({ state, dispatch }) => {
    const { auth, serverTime } = state
    handleAuthRenew({ auth, serverTime, dispatch })
  })
}
