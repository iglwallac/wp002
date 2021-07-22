import {
  setUserAccountSubscriptionPauseConfirmed,
  setZuoraUserAccountSubscriptionCancelConfirmed,
  getUserAccountBillingSubscriptions,
  getUserAccountBillingSubscriptionsWithDetailsZuora,
  getUserAccountBillingSubscriptionsWithDetailsZuoraForProfile,
  changeUserAccountPlanTypeDataZuora,
} from './index'

export const SET_USER_ACCOUNT_SUBSCRIPTION_MANAGE_TYPE = 'SET_USER_ACCOUNT_SUBSCRIPTION_MANAGE_TYPE'
export const SET_USER_ACCOUNT_CANCEL_REASON = 'SET_USER_ACCOUNT_CANCEL_REASON'
export const SET_USER_ACCOUNT_CANCEL_FORM_DATA = 'SET_USER_ACCOUNT_CANCEL_FORM_DATA'
export const RESET_USER_ACCOUNT_CANCEL_FORM_DATA = 'RESET_USER_ACCOUNT_CANCEL_FORM_DATA'
export const RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA = 'RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA'
export const SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING = 'SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING'
export const SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA = 'SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA'
export const SET_USER_ACCOUNT_CANCEL_CONFIRM_ANSWER = 'SET_USER_ACCOUNT_CANCEL_CONFIRM_ANSWER'
export const SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING = 'SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING'
export const SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS = 'SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS'
export const SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS = 'SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS'
export const CHANGE_USER_ACCOUNT_CHANGE_PLAN_TYPE_PROCESSING = 'CHANGE_USER_ACCOUNT_CHANGE_PLAN_TYPE_PROCESSING'
export const CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA = 'CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA'
export const SET_USER_ACCOUNT_PAUSE_PROCESSING = 'SET_USER_ACCOUNT_PAUSE_PROCESSING'
export const SET_USER_ACCOUNT_PAUSE_DATA = 'SET_USER_ACCOUNT_PAUSE_DATA'
export const SET_USER_ACCOUNT_PAUSE_LENGTH = 'SET_USER_ACCOUNT_PAUSE_LENGTH'
export const SET_USER_ACCOUNT_PAUSE_FORM_DATA = 'SET_USER_ACCOUNT_PAUSE_FORM_DATA'
export const CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS = 'CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS'
export const RESET_ACCOUNT_CHANGE_PLAN_DATA = 'RESET_ACCOUNT_CHANGE_PLAN_DATA'
export const SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING = 'SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING'
export const SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA = 'SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA'
export const UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN = 'UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN'
export const SET_USER_ACCOUNT_CANCEL = 'SET_USER_ACCOUNT_CANCEL'
export const UPDATE_USER_ACCOUNT_PLAN = 'UPDATE_USER_ACCOUNT_PLAN'

// Account Pause V2
export const UPDATE_USER_ACCOUNT_PAUSE = 'UPDATE_USER_ACCOUNT_PAUSE'
export const SET_USER_ACCOUNT_PAUSE = 'SET_USER_ACCOUNT_PAUSE'
export const RESET_USER_ACCOUNT_PAUSE_ERRORS = 'RESET_USER_ACCOUNT_PAUSE_ERRORS'
export const UPDATE_USER_ACCOUNT_RESUME = 'UPDATE_USER_ACCOUNT_RESUME'
export const SET_USER_ACCOUNT_RESUME = 'SET_USER_ACCOUNT_RESUME'

export function changeUserAccountPlanType (planInfo) {
  return async function changeUserAccountPlanTypeThunk (dispatch) {
    try {
      dispatch(changeUserAccountPlanTypeProcessing(true))
      const data = await changeUserAccountPlanTypeDataZuora(planInfo)
      dispatch(changeUserAccountPlanTypeSetData(data))
    } catch (e) {
      dispatch(changeUserAccountPlanTypeProcessing(false))
    }
  }
}

export function setUserAccountCancelSubscriptionConfirm ({ auth }) {
  return async function setUserAccountCancelSubscriptionConfirmThunk (dispatch) {
    try {
      dispatch(setUserAccountCancelSubscriptionConfirmProcessing(true))
      const data = await setZuoraUserAccountSubscriptionCancelConfirmed({ auth })
      dispatch(setUserAccountCancelSubscriptionConfirmData(data))
    } catch (e) {
      dispatch(setUserAccountCancelSubscriptionConfirmProcessing(false))
    }
  }
}

export function setUserAccountPauseSubscriptionConfirm ({ auth, data }) {
  return async function setUserAccountPauseSubscriptionConfirmThunk (dispatch) {
    try {
      dispatch(setUserAccountPauseProcessing(true))
      const result = await setUserAccountSubscriptionPauseConfirmed({ auth, data })
      dispatch(setUserAccountPauseData(result))
    } catch (e) {
      dispatch(setUserAccountPauseProcessing(false))
    }
  }
}

export function getUserAccountDataBillingSubscriptions ({ auth }) {
  return async function getUserAccountDataBillingSubscriptionsThunk (dispatch) {
    try {
      dispatch(setUserAccountBillingSubscriptionsProcessing(true))
      const data = await getUserAccountBillingSubscriptions({ auth })
      dispatch(setUserAccountDataBillingSubscriptions(data))
    } catch (e) {
      dispatch(setUserAccountBillingSubscriptionsProcessing(false))
    }
  }
}

export function getUserAccountDataBillingSubscriptionsWithDetails ({ auth }) {
  return async function getUserAccountDataBillingSubscriptionsWithDetailsThunk (dispatch) {
    try {
      dispatch(setUserAccountBillingSubscriptionsProcessing(true))
      const data = await getUserAccountBillingSubscriptionsWithDetailsZuora({ auth })
      dispatch(setUserAccountDataBillingSubscriptionsWithDetails(data))
    } catch (e) {
      dispatch(setUserAccountBillingSubscriptionsProcessing(false))
    }
  }
}

export function getUserAccountDataBillingSubscriptionsWithDetailsForProfile ({
  auth, userAccountId, accountId, accountNumber }) {
  return async function getUserAccountDataBillingSubscriptionsWithDetailsForProfileThunk
  (dispatch) {
    try {
      dispatch(setUserAccountBillingSubscriptionsProcessing(true))
      const data = await getUserAccountBillingSubscriptionsWithDetailsZuoraForProfile({
        auth, userAccountId, accountId, accountNumber,
      })
      dispatch(setUserAccountDataBillingSubscriptionsWithDetails(data))
    } catch (e) {
      dispatch(setUserAccountBillingSubscriptionsProcessing(false))
    }
  }
}

export function setUserAccountSubscriptionManageType (value) {
  return {
    type: SET_USER_ACCOUNT_SUBSCRIPTION_MANAGE_TYPE,
    payload: value,
  }
}

export function setUserAccountCancelReason (value) {
  return {
    type: SET_USER_ACCOUNT_CANCEL_REASON,
    payload: value,
  }
}

export function setUserAccountCancelFormData (data) {
  return {
    type: SET_USER_ACCOUNT_CANCEL_FORM_DATA,
    payload: data,
  }
}

export function resetUserAccountCancelFormData () {
  return {
    type: RESET_USER_ACCOUNT_CANCEL_FORM_DATA,
  }
}

export function resetUserAccountManageSubscriptionData () {
  return {
    type: RESET_USER_ACCOUNT_MANAGE_SUBSCRIPTION_DATA,
  }
}

export function setUserAccountCancelSubscriptionConfirmProcessing (value) {
  return {
    type: SET_USER_ACCOUNT_CANCEL_CONFIRM_PROCESSING,
    payload: value,
  }
}

export function setUserAccountPauseProcessing (value) {
  return {
    type: SET_USER_ACCOUNT_PAUSE_PROCESSING,
    payload: value,
  }
}

export function setUserAccountPauseData (data, processing = false) {
  return {
    type: SET_USER_ACCOUNT_PAUSE_DATA,
    payload: { data, processing },
  }
}

export function setUserAccountCancelSubscriptionConfirmData (data, processing = false) {
  return {
    type: SET_USER_ACCOUNT_CANCEL_CONFIRM_DATA,
    payload: { data, processing },
  }
}

export function setUserAccountCancelConfirmAnswer (value) {
  return {
    type: SET_USER_ACCOUNT_CANCEL_CONFIRM_ANSWER,
    payload: value,
  }
}

export function setUserAccountDataBillingSubscriptions (data, processing = false) {
  return {
    type: SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS,
    payload: { data, processing },
  }
}

export function setUserAccountDataBillingSubscriptionsWithDetails (data, processing = false) {
  return {
    type: SET_USER_ACCOUNT_DATA_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
    payload: { data, processing },
  }
}

export function setUserAccountBillingSubscriptionsProcessing (value) {
  return {
    type: SET_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_PROCESSING,
    payload: value,
  }
}

export function setUserAccountPauseLength (value) {
  return {
    type: SET_USER_ACCOUNT_PAUSE_LENGTH,
    payload: value,
  }
}

export function setUserAccountPauseFormData (data) {
  return {
    type: SET_USER_ACCOUNT_PAUSE_FORM_DATA,
    payload: data,
  }
}

export function changeUserAccountPlanTypeProcessing (value) {
  return {
    type: CHANGE_USER_ACCOUNT_CHANGE_PLAN_TYPE_PROCESSING,
    payload: value,
  }
}

export function changeUserAccountPlanTypeSetData (value) {
  return {
    type: CHANGE_USER_ACCOUNT_PLAN_TYPE_SET_DATA,
    payload: value,
  }
}

export function updateUserAccountPlan (value) {
  return {
    type: UPDATE_USER_ACCOUNT_PLAN,
    payload: value,
  }
}

export function clearUserAccountBillingSubscriptionsWithDetails () {
  return {
    type: CLEAR_USER_ACCOUNT_BILLING_SUBSCRIPTIONS_WITH_DETAILS,
  }
}

export function resetAccountChangePlanData () {
  return {
    type: RESET_ACCOUNT_CHANGE_PLAN_DATA,
  }
}

export function setUserAccountSubscriptionPaymentsProcessing (processing) {
  return {
    type: SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_PROCESSING,
    payload: processing,
  }
}

export function setUserAccountSubscriptionPaymentsData (data, processing = false) {
  return {
    type: SET_USER_ACCOUNT_SUBSCRIPTION_PAYMENTS_DATA,
    payload: { data, processing },
  }
}

export function setUserAccountCancelOfferShown (value) {
  return {
    type: UPDATE_USER_ACCOUNT_CANCEL_OFFER_SHOWN,
    payload: value,
  }
}

export function setUserAccountCancel () {
  return {
    type: SET_USER_ACCOUNT_CANCEL,
  }
}

export function updateUserAccountPause (duration) {
  return {
    type: UPDATE_USER_ACCOUNT_PAUSE,
    payload: duration,
  }
}

export function updateUserAccountResume () {
  return {
    type: UPDATE_USER_ACCOUNT_RESUME,
  }
}
