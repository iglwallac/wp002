
import _get from 'lodash/get'
import { get as getConfig } from 'config'
import { Map } from 'immutable'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { NAVIGATION_HISTORY_PUSH } from 'services/navigation/actions'
import { TYPE_PAUSE_ERROR, TYPE_PAUSE_RESUME } from 'services/dialog'
import { DISMISS_MODAL } from 'services/dialog/actions'
import {
  URL_ACCOUNT_CANCEL,
  URL_ACCOUNT_CANCEL_OFFER,
  URL_ACCOUNT_CANCEL_CONFIRM,
  URL_ACCOUNT_CANCEL_FREE_MONTH,
  URL_HOME,
  URL_ACCOUNT,
  URL_ACCOUNT_PAUSE_CONFIRM,
  URL_ACCOUNT_PAUSE,
} from 'services/url/constants'
import {
  FORM_SUBMISSION_NAME_CANCEL_FLOW,
  post as postFormSubmissions,
} from 'services/form-submissions'
import {
  SET_FORM_SUBMISSIONS_PROCESSING,
  SET_FORM_SUBMISSIONS_CONFIRMED_DATA,
} from 'services/form-submissions/actions'
import { doAuthRenew } from 'services/auth/actions'
import { COMP_USER_SUBSCRIPTION_DATA } from 'services/subscription/actions'
import {
  updateUserAccountResume,
  updateUserAccountPause,
  getUserSubscriptionPayments,
  setZuoraUserAccountSubscriptionCancelConfirmed,
  getUserAccountBillingSubscriptionsWithDetailsZuora,
  changeUserAccountPlanTypeDataZuora,
  USER_ACCOUNT_CANCELLED,
} from './'
import * as actions from './actions'

const config = getConfig()
const cancelV2 = _get(config, ['features', 'userAccount', 'cancelV2'])

function shouldGetSubscriptionPayments ({ state }) {
  const { resolver, auth } = state
  const path = resolver.getIn(['data', 'path'])

  return (
    (
      path === URL_ACCOUNT_CANCEL_FREE_MONTH ||
      path === URL_ACCOUNT_CANCEL ||
      path === URL_ACCOUNT ||
      path === URL_ACCOUNT_PAUSE
    ) && auth.get('jwt')
  )
}

function cancelFlowAccessDenied ({ state }) {
  const { resolver, auth } = state
  const path = resolver.getIn(['data', 'path'])

  return (
    (path === URL_ACCOUNT_CANCEL || path === URL_ACCOUNT_CANCEL_OFFER || path === URL_ACCOUNT_CANCEL_CONFIRM) && !auth.get('jwt') && cancelV2
  )
}

function cancelFlowAccess ({ state }) {
  const { resolver, auth } = state
  const path = resolver.getIn(['data', 'path'])

  return (
    (path === URL_ACCOUNT_CANCEL || path === URL_ACCOUNT_CANCEL_OFFER || path === URL_ACCOUNT_CANCEL_CONFIRM) && auth.get('jwt') && cancelV2
  )
}

async function getUserPayments (state, dispatch) {
  const { auth, userAccount } = state
  const accountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const accountNumber = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountNumber'])

  if (accountId && accountNumber) {
    dispatch(actions.setUserAccountSubscriptionPaymentsProcessing(true))
    const payments = await getUserSubscriptionPayments({ accountId, accountNumber, auth })
    dispatch(actions.setUserAccountSubscriptionPaymentsData(payments))
  }
}

export function watchCancelPageSetResolverData ({ after }) {
  return after([
    SET_RESOLVER_DATA,
  ], async ({ dispatch, state }) => {
    getUserPayments(state, dispatch)
  }).when(shouldGetSubscriptionPayments)
}

export function watchCancelPageBillingSubscriptionsData ({ after }) {
  return after([
    actions.SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
  ],
  async ({ dispatch, state }) => {
    getUserPayments(state, dispatch)
  })
    .when(shouldGetSubscriptionPayments)
}

export function watchCancelFlowSetResolverData ({ after }) {
  return after([
    SET_RESOLVER_DATA,
  ], async ({ dispatch }) => {
    dispatch({
      type: NAVIGATION_HISTORY_PUSH,
      payload: { url: URL_HOME },
    })
  }).when(cancelFlowAccessDenied)
}

// -----------------------------------
// Watcher for checking data "server side"
// -----------------------------------
export function watchCancelFlowAccessDeniedBootstrapPhase ({ before }) {
  return before(SET_APP_BOOTSTRAP_PHASE, async ({ dispatch, state, action }) => {
    const { app } = state
    const { payload } = action
    const currentBootstrapComplete = app.get('bootstrapComplete')
    const nextBootstrapComplete = _get(payload, 'isComplete')

    // only fire once
    if (nextBootstrapComplete && nextBootstrapComplete !== currentBootstrapComplete) {
      dispatch({
        type: NAVIGATION_HISTORY_PUSH,
        payload: { url: URL_HOME },
      })
    }
  })
    .when(cancelFlowAccessDenied)
}

// Watch for user account cancel
export function watchUserAccountCancel ({ after }) {
  return after([
    actions.SET_USER_ACCOUNT_CANCEL,
  ], async ({ dispatch, state }) => {
    const { auth } = state

    try {
      dispatch({
        type: actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING,
        payload: true,
      })
      const data = await setZuoraUserAccountSubscriptionCancelConfirmed({ auth })
      dispatch({
        type: actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA,
        payload: { data, processing: false },
      })
    } catch (e) {
      dispatch({
        type: actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING,
        payload: false,
      })
      dispatch({
        type: actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA,
        payload: { data: { success: false }, processing: false },
      })
    }
  })
    .when(cancelFlowAccess)
}

export function watchUserAccountCancelConfirmData ({ after }) {
  return after([
    actions.SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA,
  ], async ({ dispatch, state }) => {
    const { userAccount, auth } = state
    const success = userAccount.getIn(['manageSubscription', 'data', 'cancelConfirmData', 'success'])
    const cancelFormData = userAccount.getIn(['manageSubscription', 'data', 'formData'], Map())
    const formNameCancelFlow = cancelFormData.get('formName') === FORM_SUBMISSION_NAME_CANCEL_FLOW

    if (success && formNameCancelFlow) {
      try {
        dispatch({
          type: SET_FORM_SUBMISSIONS_PROCESSING,
          payload: true,
        })
        const result = await postFormSubmissions({ auth, data: cancelFormData.toJS() })
        dispatch({
          type: SET_FORM_SUBMISSIONS_CONFIRMED_DATA,
          payload: { data: _get(result, 'data'), processing: false },
        })
      } catch (e) {
        dispatch({
          type: SET_FORM_SUBMISSIONS_PROCESSING,
          payload: false,
        })
      }
    }
  })
    .when(cancelFlowAccess)
}

export function watchCompUserSubscriptionData ({ after }) {
  return after([
    COMP_USER_SUBSCRIPTION_DATA,
  ], async ({ dispatch, state }) => {
    const { auth, subscription } = state
    const userCompSuccess = subscription.get('success')

    if (userCompSuccess) {
      try {
        dispatch({
          type: actions.SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
          payload: true,
        })
        const data = await getUserAccountBillingSubscriptionsWithDetailsZuora({ auth })
        dispatch({
          type: actions.SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
          payload: { data, processing: false },
        })
      } catch (e) {
        dispatch({
          type: actions.SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
          payload: false,
        })
      }
    }
  })
    .when(cancelFlowAccess)
}

export function watchCancelFlowAccess ({ after }) {
  return after([
    actions.SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
    SET_RESOLVER_DATA,
  ],
  async ({ dispatch, state }) => {
    const { userAccount, resolver } = state
    const path = resolver.getIn(['data', 'path'])
    const accountStatusCancelled = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status']) === USER_ACCOUNT_CANCELLED
    const accountCancelReason = userAccount.getIn(['manageSubscription', 'data', 'cancelReason'])

    if (
      accountStatusCancelled &&
      (path === URL_ACCOUNT_CANCEL || path === URL_ACCOUNT_CANCEL_OFFER)
    ) {
      // send the user to the account page
      dispatch({
        type: NAVIGATION_HISTORY_PUSH,
        payload: { url: URL_ACCOUNT },
      })
    } else if (
      !accountCancelReason &&
      (path === URL_ACCOUNT_CANCEL_OFFER || path === URL_ACCOUNT_CANCEL_CONFIRM)
    ) {
      // send the user to the cancel page
      dispatch({
        type: NAVIGATION_HISTORY_PUSH,
        payload: { url: URL_ACCOUNT_CANCEL },
      })
    }
  })
    .when(cancelFlowAccess)
}


// Account Pause v2
export function updateAccountPause ({ takeLatest }) {
  return takeLatest(actions.UPDATE_USER_ACCOUNT_PAUSE, async ({ action, state }) => {
    const { auth } = state
    const { payload: months } = action
    const data = { months }
    const payload = await updateUserAccountPause({
      data,
      auth,
    })

    if (_get(payload, 'success') && global.dataLayer) {
      global.dataLayer.push({
        event: 'customEvent',
        eventCategory: 'Account Pause',
        eventAction: 'Paused',
        eventLabel: months,
      })
    }

    return {
      type: actions.SET_USER_ACCOUNT_PAUSE,
      payload,
    }
  })
}

const redirectToMyAccount = async (dispatch, auth) => {
  try {
    dispatch({
      type: actions.SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
      payload: true,
    })
    const data = await getUserAccountBillingSubscriptionsWithDetailsZuora({ auth })
    dispatch({
      type: actions.SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
      payload: { data, processing: false },
    })
  } catch (e) {
    dispatch({
      type: actions.SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
      payload: false,
    })
  }

  return dispatch({
    type: NAVIGATION_HISTORY_PUSH,
    payload: { url: URL_ACCOUNT_PAUSE_CONFIRM },
  })
}

export function setAccountPause ({ after }) {
  return after(actions.SET_USER_ACCOUNT_PAUSE, async ({ action, dispatch, state }) => {
    const { auth } = state
    const { payload } = action

    if (_get(payload, 'success')) {
      redirectToMyAccount(dispatch, auth)
    }

    return false
  })
}

export function clearPauseErrors ({ takeLatest }) {
  return takeLatest(DISMISS_MODAL, () => {
    return {
      type: actions.RESET_USER_ACCOUNT_PAUSE_ERRORS,
    }
  })
    .when(({ action }) =>
      _get(action, ['payload', 'clickedOverlay']) === TYPE_PAUSE_ERROR
      || _get(action, ['payload', 'clickedOverlay']) === TYPE_PAUSE_RESUME)
}

export function resumeAccount ({ takeLatest }) {
  return takeLatest(actions.UPDATE_USER_ACCOUNT_RESUME, async ({ state }) => {
    const { auth, userAccount } = state
    const pauseAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseMonths'])
    const payload = await updateUserAccountResume({ auth })

    if (_get(payload, 'success') && global.dataLayer) {
      global.dataLayer.push({
        event: 'customEvent',
        eventCategory: 'Account Pause',
        eventAction: 'Pause Removed',
        eventLabel: pauseAmount,
      })
    }
    return {
      type: actions.SET_USER_ACCOUNT_RESUME,
      payload,
    }
  })
}

export function watchResumeAccount ({ after }) {
  return after(actions.SET_USER_ACCOUNT_RESUME, async ({ action, state, dispatch }) => {
    const { payload } = action
    const { auth } = state

    if (_get(payload, 'success')) {
      try {
        dispatch({
          type: actions.SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
          payload: true,
        })
        const data = await getUserAccountBillingSubscriptionsWithDetailsZuora({ auth })
        dispatch({
          type: actions.SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
          payload: { data, processing: false },
        })

        await dispatch(doAuthRenew(auth))
      } catch (e) {
        dispatch({
          type: actions.SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
          payload: false,
        })
      }

      return dispatch({
        type: NAVIGATION_HISTORY_PUSH,
        payload: { url: URL_ACCOUNT },
      })
    }

    return false
  })
}

export function clearManageSubscription ({ after }) {
  return after(NAVIGATION_HISTORY_PUSH, async ({ action, dispatch }) => {
    const { payload } = action
    const shouldReset = [URL_ACCOUNT, URL_ACCOUNT_PAUSE_CONFIRM].includes(_get(payload, 'url'))

    if (shouldReset) {
      return dispatch({
        type: actions.RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA,
      })
    }

    return false
  })
}


export function updateUserAccountPlan ({ after }) {
  return after(actions.UPDATE_USER_ACCOUNT_PLAN, async ({ action, dispatch }) => {
    const { payload } = action
    try {
      dispatch({
        type: actions.CHANGE_USER_ACCOUNT_CHANGE_PLAN_TYPE_PROCESSING,
        payload: true,
      })
      const data = await changeUserAccountPlanTypeDataZuora(payload)
      dispatch({
        type: actions.CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA,
        payload: data,
      })
    } catch (e) {
      dispatch({
        type: actions.CHANGE_USER_ACCOUNT_CHANGE_PLAN_TYPE_PROCESSING,
        payload: false,
      })
    }
  })
}
