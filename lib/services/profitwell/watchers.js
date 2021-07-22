import _get from 'lodash/get'
import { SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS } from 'services/user-account/actions'
import { PAYMENT_SOURCE_TYPE_CREDIT_CARD } from 'services/credit-card'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { doAuthRenew } from 'services/auth/actions'
import { Map } from 'immutable'
import { get as getConfig } from 'config'
import { getAuthIsLoggedIn } from 'services/auth'
import {
  isPasswordReset,
  isGo,
  isLogout,
  isPlans,
  isCart,
  isFullPlayer,
  isGift,
  isSharePage,
  isGetStarted,
  isActivate,
  isPolicy,
  isAccountCancelPath,
} from 'services/url'
import {
  getProfitwellApi,
  profitwellApiName,
  profitwellApiUrl,
  profitwellTagType,
  postProfitwellEntitle,
} from './'
import {
  setProfitwellReady,
  setProfitwellStarted,
  getProfitwellEntitlement,
  SET_PROFITWELL_READY,
  GET_PROFITWELL_ENTITLEMENT,
} from './actions'

const config = getConfig()
const profitwellRetain = _get(config, ['features', 'profitwell', 'retain'])

function shouldLoadProfitwell ({ state }) {
  const { auth } = state
  return profitwellRetain && getAuthIsLoggedIn(auth)
}

function shouldStartProfitwell (resolver) {
  const path = resolver.getIn(['data', 'path'])
  const query = resolver.get('query', Map()).toJS()

  return (
    (
      !isPasswordReset(path) &&
      !isGo(path) &&
      !isLogout(path) &&
      !isPlans(path) &&
      !isCart(path) &&
      !isFullPlayer(query) &&
      !isGift(path) &&
      !isSharePage(path) &&
      !isGetStarted(path) &&
      !isActivate(path) &&
      !isPolicy(path) &&
      !isAccountCancelPath(path)
    )
  )
}

// -----------------------------------
// Watcher for subscription data
// -----------------------------------
export function watchProfitwellAccountBillingSubscriptionData ({ after }) {
  return after(
    SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
    async ({ dispatch, state }) => {
      const { userAccount = Map() } = state
      const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
      const paymentType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'type'])

      const setProfitwellScriptLoaded = () => {
        return dispatch(setProfitwellReady(true))
      }

      if (billingAccountId && paymentType === PAYMENT_SOURCE_TYPE_CREDIT_CARD) {
        await getProfitwellApi(
          global,
          document,
          profitwellApiName,
          profitwellTagType,
          profitwellApiUrl,
          setProfitwellScriptLoaded,
        )
      }
    },
  )
    .when(shouldLoadProfitwell)
}

// -----------------------------------
// Watcher for profitwell ready
// -----------------------------------
export function watchProfitwellReady ({ after }) {
  return after(SET_PROFITWELL_READY, async ({ dispatch, state }) => {
    const { profitwell: profitwellState = Map(), userAccount = Map(), resolver } = state
    const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
    const ready = profitwellState.get('ready')
    const { profitwell } = global

    if (profitwell && shouldStartProfitwell(resolver) && ready && billingAccountId) {
      // start profitwell
      profitwell('start', {
        user_id: billingAccountId,
        events: {
          on_payment_recovered: () => dispatch(getProfitwellEntitlement()),
        },
      })
      dispatch(setProfitwellStarted(true))
    }
  })
    .when(shouldLoadProfitwell)
}

// -----------------------------------
// Watcher for profitwell set resolver data
// -----------------------------------
export function watchProfitwellSetResolverData ({ after }) {
  return after([SET_RESOLVER_DATA], async ({ dispatch, state }) => {
    const { profitwell: profitwellState = Map(), userAccount = Map(), resolver } = state
    const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
    const ready = profitwellState.get('ready')
    const started = profitwellState.get('started')
    const { profitwell } = global
    const baseCriteria = profitwell && shouldStartProfitwell(resolver) && ready && billingAccountId

    if (baseCriteria && !started) {
      // start profitwell since it hasn't been started yet
      profitwell('start', {
        user_id: billingAccountId,
        events: {
          on_payment_recovered: () => dispatch(getProfitwellEntitlement()),
        },
      })
      dispatch(setProfitwellStarted(true))
    } else if (baseCriteria && started) {
      // fire this on every url change
      profitwell('user_id', billingAccountId)
    }
  }).when(shouldLoadProfitwell)
}

// -----------------------------------
// Watcher for profitwell get entitlement
// -----------------------------------
export function watchProfitwellGetEntitlement ({ after }) {
  return after([GET_PROFITWELL_ENTITLEMENT], async ({ dispatch, state }) => {
    const { auth } = state

    try {
      const entitlement = await postProfitwellEntitle({ auth })
      const success = _get(entitlement, 'success', false)

      // renew auth to grab new subscription/entitlements
      if (success) {
        // @TODO: ideally we don't want to use a Thunk here
        // refactor when we have a better pattern for a reusable
        // non-thunk option
        dispatch(doAuthRenew(auth))
      }
    } catch (e) {
      // do nothing for now
    }
  }).when(shouldLoadProfitwell)
}
