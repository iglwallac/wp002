import _get from 'lodash/get'
import { SET_AUTH_DATA } from 'services/auth/actions'
import { BOOTSTRAP_PHASE_POST_RENDER } from 'services/app'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { SET_CHECKOUT_ORDER_DATA } from 'services/checkout/actions'
import {
  getUserAccountDataBillingSubscriptionsWithDetails,
  clearUserAccountBillingSubscriptionsWithDetails,
  SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA,
  CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA,
} from './actions'

const BROWSER = process.env.BROWSER

function getAccountDetails (store) {
  const { auth, userAccount } = store.getState()
  const billingSubscriptionsProcessing = userAccount.get('billingSubscriptionsProcessing')
  const userAccountDetails = userAccount.get('details')
  const isLoggedIn = !!auth.get('jwt')
  if (isLoggedIn && !billingSubscriptionsProcessing && !userAccountDetails) {
    store.dispatch(getUserAccountDataBillingSubscriptionsWithDetails({ auth }))
  }
}

/**
 * Redux middleware for user account behaviors
 */
export default function userAccountMiddleware (store, options = {}) {
  const { browser = BROWSER } = options
  return next => (action) => {
    if (!browser) {
      next(action)
      return
    }

    switch (action.type) {
      case SET_CHECKOUT_ORDER_DATA:
      case CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA:
      case SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA: {
        const { auth } = store.getState()
        const jwt = auth.get('jwt')
        if (jwt) {
          store.dispatch(clearUserAccountBillingSubscriptionsWithDetails())
          store.dispatch(getUserAccountDataBillingSubscriptionsWithDetails({ auth }))
        }
        break
      }
      case SET_RESOLVER_DATA: {
        getAccountDetails(store)
        break
      }
      case SET_APP_BOOTSTRAP_PHASE: {
        const { payload = {} } = action
        const { phase } = payload
        if (phase === BOOTSTRAP_PHASE_POST_RENDER) {
          getAccountDetails(store)
        }
        break
      }
      case SET_AUTH_DATA: {
        const { auth } = store.getState()
        const jwtNext = _get(action, 'payload.data.jwt')
        if (jwtNext && auth.get('jwt') !== jwtNext) {
          // We only want to do this on a fresh login, switching profiles shouldn't call this
          store.dispatch(getUserAccountDataBillingSubscriptionsWithDetails({ auth: jwtNext }))
        }
        break
      }
      default:
        break
    }
    next(action)
  }
}
