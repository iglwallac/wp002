import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS } from 'services/user-account/actions'
import { List, Map } from 'immutable'
import _get from 'lodash/get'
import {
  getPlans,
  getPlansLocalized,
} from 'services/plans'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import { EN } from 'services/languages/constants'
import { getAuthIsLoggedIn } from 'services/auth'
import { LTM } from 'services/currency'
import * as actions from './actions'

async function setPlans (language, dispatch, currency) {
  // have getPlansLocalized accept currency prop
  dispatch({
    type: actions.SET_PLANS_PROCESSING,
    payload: true,
  })

  try {
    const data = await getPlans({ language })
    const plans = data.get('plans', List())
    const skus = plans.map(plan => plan.get('sku'))
    // We are not done yet, now we need to localize
    const plansLocalized = await getPlansLocalized({
      skus,
      language,
      defaultPlans: plans,
      currencyOverride: currency,
    })

    dispatch({
      type: actions.SET_PLANS_DATA,
      payload: { data: plansLocalized, processing: false },
    })
  } catch (e) {
    dispatch({
      type: actions.SET_PLANS_PROCESSING,
      payload: false,
    })
  }
}

// -----------------------------------
// Watcher for checking data server side
// -----------------------------------
export function onPlansAppBootstrapPhase ({ before }) {
  return before(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state, action }) => {
    const { app, auth, user } = state
    const { payload } = action
    const authToken = auth.get('jwt')
    const currentBootstrapComplete = app.get('bootstrapComplete')
    const nextBootstrapComplete = _get(payload, 'isComplete')
    const language = getPrimaryLanguage(user.getIn(['data', 'language'], List([EN])))

    if (
      !authToken &&
      nextBootstrapComplete &&
      nextBootstrapComplete !== currentBootstrapComplete
    ) {
      // get plans on bootstrap complete for anonymous user on any page
      setPlans(language, dispatch)
    }
  })
}

// ---------------------------------------
// Watcher for getting user account details
// Get their currencyIso from userAccount
// and pass currencyOverride param to plans endpoint
// --------------------------------------
export function watchUserAccountBillingSubscriptionsData ({ after }) {
  return after(SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
    async ({ dispatch, state }) => {
      const { auth, user, userAccount } = state
      const language = getPrimaryLanguage(user.getIn(['data', 'language'], List([EN])))
      const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
      const latamPricing = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'latamPricing'])
      const currency = latamPricing ? LTM : currencyIso
      if (getAuthIsLoggedIn(auth)) {
        setPlans(language, dispatch, currency)
      }
    })
}

// ---------------------------------------
// Watcher for settings plans data when logged in
// --------------------------------------
export function watchSetPlansData ({ after }) {
  return after(actions.SET_PLANS_DATA,
    async ({ dispatch, state }) => {
      const { user, userAccount, plans } = state
      const language = getPrimaryLanguage(user.getIn(['data', 'language'], List([EN])))
      const defaultPlans = plans.getIn(['data', 'plans'], List())
      const selectedPlan = plans.get('selection', Map())
      const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
      const latamPricing = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'latamPricing'])
      const currency = latamPricing ? LTM : currencyIso
      // find the matching sku in the newly fetched plans
      // that matches the previously selected sku
      const updatedSelectedPlan = defaultPlans.find(plan => plan.get('sku') === selectedPlan.get('sku')) || Map()

      // if there is a plan selected
      if (selectedPlan.size > 0 && defaultPlans.size > 0 && updatedSelectedPlan.size > 0) {
        // @TODO: should not use Thunk here, we need to figure out a better solution
        // there is a lot of logic inside setPlansLocalizedSelection,
        // so we don't want to repeat it in multiple locations
        dispatch(
          actions.setPlansLocalizedSelection({ plan: updatedSelectedPlan, language, currency }),
        )
      }
    })
    .when(({ state }) => {
      const { auth } = state
      return getAuthIsLoggedIn(auth) === true
    })
}
