import { Map, List } from 'immutable'
import _set from 'lodash/set'
import _isUndefined from 'lodash/isUndefined'
import { emarsysSend } from 'services/emarsys'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { SET_EVENT_CART_CHECKOUT_STEP } from 'services/event-tracking/actions'
import { SET_PAYTRACK_DATA_LAST_TRANSACTION } from 'services/paytrack/actions'
import { SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS } from 'services/user-account/actions'
import { SET_USER_DATA_ENTITLED, SET_USER_PROCESSING } from 'services/user/actions'
import { NAVIGATION_HISTORY_PUSH } from 'services/navigation/actions'
import { buildCheckoutStepDataLayerObject } from 'services/event-tracking'
import {
  CHECKOUT_STEP_ONE,
  CHECKOUT_STEP_TWO,
  // CHECKOUT_STEP_THREE,
  CHECKOUT_EVENT_STEP_ONE,
  CHECKOUT_EVENT_STEP_TWO,
  CHECKOUT_EVENT_STEP_THREE,
  CHECKOUT_EVENT_STEP_FOUR,
  CHECKOUT_EVENT_STEP_FIVE,
  CHECKOUT_EVENT_STEP_SIX,
  CHECKOUT_EVENT_STEP_SEVEN,
  userCheckoutAllowed,
} from 'services/checkout'
import { isCart, isPlans, isCartAccessDenied } from 'services/url'
import {
  URL_PLAN_SELECTION,
  URL_PLAN_SELECTION_PLANS,
  URL_ACCOUNT_CREATION,
  URL_CART_ACCOUNT_CREATION_CREATE,
  URL_CART_BILLING,
  URL_CART_BILLING_PAYMENT,
  URL_CART_CONFIRMATION,
  URL_CART_ACCESS_DENIED,
} from 'services/url/constants'
import { SET_DIALOG_COMPONENT_NAME } from 'services/dialog/actions'
import { TYPE_LOGIN } from 'services/dialog'
import { getUserEntitled } from 'services/subscription'
import * as actions from './actions'

function isCheckoutPage ({ state }) {
  const { resolver } = state
  const path = resolver.getIn(['data', 'path'])

  return (
    isCart(path) || isPlans(path)
  )
}

function isCartAccessDeniedPage ({ state }) {
  const { resolver } = state
  const path = resolver.getIn(['data', 'path'])

  return (
    isCartAccessDenied(path)
  )
}

function isAuthenticatedCheckout ({ state }) {
  const { resolver, auth } = state
  const path = resolver.getIn(['data', 'path'])

  return (
    (isPlans(path) ||
    path === URL_ACCOUNT_CREATION ||
    path === URL_CART_ACCOUNT_CREATION_CREATE ||
    path === URL_CART_BILLING ||
    path === URL_CART_BILLING_PAYMENT) &&
    auth.get('jwt')
  )
}

function getCheckoutStep (state) {
  const { resolver } = state
  const path = resolver.getIn(['data', 'path'])
  let step

  switch (path) {
    case URL_PLAN_SELECTION:
    case URL_PLAN_SELECTION_PLANS:
      step = CHECKOUT_STEP_ONE
      break
    case URL_ACCOUNT_CREATION:
      step = CHECKOUT_STEP_TWO
      break
    default:
      // do nothing
  }

  return step
}

function getCheckoutEventStep (state) {
  const { resolver } = state
  const path = resolver.getIn(['data', 'path'])
  let step

  switch (path) {
    case URL_PLAN_SELECTION:
      step = CHECKOUT_EVENT_STEP_ONE
      break
    case URL_PLAN_SELECTION_PLANS:
      step = CHECKOUT_EVENT_STEP_TWO
      break
    case URL_ACCOUNT_CREATION:
      step = CHECKOUT_EVENT_STEP_THREE
      break
    case URL_CART_ACCOUNT_CREATION_CREATE:
      step = CHECKOUT_EVENT_STEP_FOUR
      break
    case URL_CART_BILLING:
      step = CHECKOUT_EVENT_STEP_FIVE
      break
    case URL_CART_BILLING_PAYMENT:
      step = CHECKOUT_EVENT_STEP_SIX
      break
    case URL_CART_CONFIRMATION:
      step = CHECKOUT_EVENT_STEP_SEVEN
      break
    default:
      // do nothing
  }

  return step
}

// -----------------------------------
// Watcher for checking data "server side" for setting the step and event step
// -----------------------------------
export function onCheckoutStepHydrationComplete ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state }) => {
    const { app, checkout } = state
    const previousStep = checkout.get('step')
    const previousEventStep = checkout.get('eventStep')
    const step = getCheckoutStep(state)
    const eventStep = getCheckoutEventStep(state)

    // set the checkout step
    if (app.get('bootstrapComplete') && step && step !== previousStep) {
      dispatch({
        type: actions.SET_CHECKOUT_STEP,
        payload: step,
      })

      // Send emarsys "go" command
      emarsysSend()
    }

    // set the checkout step event
    if (eventStep && eventStep !== previousEventStep) {
      dispatch({
        type: actions.SET_CHECKOUT_EVENT_STEP,
        payload: eventStep,
      })
    }
  })
    .when(isCheckoutPage)
}

// -----------------------------------
// Watcher for componentDidMount/DidUpdate for setting the step and event step
// -----------------------------------
export function onCheckoutStepMountAndUpdate ({ after }) {
  return after(SET_RESOLVER_DATA, async ({ dispatch, state }) => {
    const { checkout } = state
    const previousStep = checkout.get('step')
    const previousEventStep = checkout.get('eventStep')
    const step = getCheckoutStep(state)
    const eventStep = getCheckoutEventStep(state)

    // set the checkout step
    if (step && step !== previousStep) {
      dispatch({
        type: actions.SET_CHECKOUT_STEP,
        payload: step,
      })
    }

    // set the checkout step event
    if (eventStep && eventStep !== previousEventStep) {
      dispatch({
        type: actions.SET_CHECKOUT_EVENT_STEP,
        payload: eventStep,
      })

      // Send emarsys "go" command on every url in plan flow
      emarsysSend()
    }
  })
    .when(isCheckoutPage)
}

// -----------------------------------
// Watcher for setCheckoutStep
// -----------------------------------
export function onSetCheckoutStep ({ after }) {
  return after(actions.SET_CHECKOUT_STEP, async ({ dispatch, state }) => {
    const { checkout, plans, auth } = state
    const selection = plans.get('selection', Map())
    const checkoutStep = checkout.get('step')
    const authToken = auth.get('jwt')

    // check to see what step the user is on and if they have selected a plan
    if (!authToken && selection.size === 0 && checkoutStep >= CHECKOUT_STEP_TWO) {
      dispatch({
        type: NAVIGATION_HISTORY_PUSH,
        payload: { url: URL_PLAN_SELECTION },
      })
    }
  })
    .when(isCheckoutPage)
}

// -----------------------------------
// Watcher for setCheckoutEventStep
// -----------------------------------
export function onSetCheckoutEventStep ({ after }) {
  return after(actions.SET_CHECKOUT_EVENT_STEP, async ({ dispatch, action, state }) => {
    const { payload } = action
    const { plans } = state

    // set the checkout step event
    if (payload) {
      const eventData = {
        step: payload,
      }
      const selection = plans.get('selection', Map())

      if (selection.size > 0) {
        _set(eventData, 'selection', selection)
      }

      const event = buildCheckoutStepDataLayerObject(eventData)

      dispatch({
        type: SET_EVENT_CART_CHECKOUT_STEP,
        payload: { event },
      })
    }
  })
    .when(isCheckoutPage)
}

// -----------------------------------
// Watcher for checking data "server side" on the Cart Access Info page
// -----------------------------------
export function onCheckoutCartAccessDeniedHydrationComplete ({ before }) {
  return before(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state, action }) => {
    const { app, auth } = state
    const { payload } = action
    const { isComplete } = payload
    const previousBootstrapComplete = app.get('bootstrapComplete')
    const authToken = auth.get('jwt')

    // trigger the login modal for anonymous
    if (!authToken && isComplete && isComplete !== previousBootstrapComplete) {
      dispatch({
        type: SET_DIALOG_COMPONENT_NAME,
        payload: { name: TYPE_LOGIN },
      })
    }
  })
    .when(isCartAccessDeniedPage)
}

// -----------------------------------
// Watcher for componentDidMount/DidUpdate on the Cart Access Info page
// -----------------------------------
export function onCheckoutCartAccessDeniedMountAndUpdate ({ after }) {
  return after(SET_RESOLVER_DATA, async ({ dispatch, state }) => {
    const { auth } = state
    const authToken = auth.get('jwt')

    // trigger the login modal for anonymous
    if (!authToken) {
      dispatch({
        type: SET_DIALOG_COMPONENT_NAME,
        payload: { name: TYPE_LOGIN },
      })
    }
  })
    .when(isCartAccessDeniedPage)
}

// -----------------------------------
// Watcher for determining cart access when logged in
// -----------------------------------
export function onCheckoutAccessCheck ({ after }) {
  return after([
    SET_RESOLVER_DATA,
    SET_APP_BOOTSTRAP_PHASE,
    SET_PAYTRACK_DATA_LAST_TRANSACTION,
    SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
  ], async ({ dispatch, state }) => {
    const { user, auth, userAccount, paytrack, checkout, plans } = state
    let entitled = user.getIn(['data', 'entitled'])
    const billingSubscriptionsProcessing = userAccount.get('billingSubscriptionsProcessing')
    const userBillingSubscriptions = userAccount.getIn(['details', 'data', 'billing', 'subscriptions'])
    const paytrackProcessing = paytrack.get('processing')
    const paytrackLastTransaction = paytrack.get('lastTransaction')
    const accessCheckDataReady = !billingSubscriptionsProcessing && !paytrackProcessing &&
      userBillingSubscriptions && paytrackLastTransaction
    const checkoutStep = checkout.get('step')
    const plansLocalizedProcessing = plans.get('processingLocalized')
    const selectedPlan = plans.get('selection')

    // we don't know if the user is entitled, so lets find out
    if (_isUndefined(entitled)) {
      try {
        const idExpires = auth.get('idExpires')
        const subscriptions = auth.get('subscriptions', List()).toJS()

        // set user processing
        dispatch({
          type: SET_USER_PROCESSING,
          payload: true,
        })

        entitled = await getUserEntitled(idExpires, subscriptions)

        dispatch({
          type: SET_USER_DATA_ENTITLED,
          payload: { value: entitled },
        })
      } catch (e) {
        dispatch({
          type: SET_USER_PROCESSING,
          payload: false,
        })
      }
    }

    // all the data is ready, so lets check the users access
    if (accessCheckDataReady) {
      const checkoutAllowed = userCheckoutAllowed({ auth, user, userAccount, paytrack }, entitled)
      const checkoutAllowedNoPlanSelected = checkoutAllowed &&
        checkoutStep >= CHECKOUT_STEP_TWO &&
        !plansLocalizedProcessing &&
        !selectedPlan

      if (!checkoutAllowed) {
        // if the user is not allowed to checkout, send them to the cart access denied page
        dispatch({
          type: NAVIGATION_HISTORY_PUSH,
          payload: { url: URL_CART_ACCESS_DENIED },
        })
      } else if (checkoutAllowedNoPlanSelected) {
        // if the user is too far along in the checkout process and
        // has not selected a plan, send them back to plan selection
        dispatch({
          type: NAVIGATION_HISTORY_PUSH,
          payload: { url: URL_PLAN_SELECTION },
        })
      }
    }
  })
    .when(isAuthenticatedCheckout)
}
