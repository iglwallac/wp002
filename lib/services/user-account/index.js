import {
  post as apiPost,
  put as apiPut,
  TYPE_BILLING,
  TYPE_BROOKLYN,
  TYPE_BROOKLYN_JSON,
  RESPONSE_ERROR_TYPE_RANGE_500,
  get as apiGet,
} from 'api-client'
import {
  format as formatDateTime,
  getDateTime,
  getCurrentTime,
  getDifferenceInDays,
} from 'services/date-time'
import _get from 'lodash/get'
import _startsWith from 'lodash/startsWith'
import _assign from 'lodash/assign'
import { List, Map, fromJS } from 'immutable'
import _cloneDeep from 'lodash/cloneDeep'
import { isEntitled } from 'services/subscription'
import {
  PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY,
  PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL,
  PLAN_ID_NINETY_NINE_CENT_TWO_WEEKS,
  PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL,
  PLAN_SUBSCRIPTION_CANCELLED,
  PLAN_SUBSCRIPTION_MONTHLY,
  PLAN_ID_LIVE_DISCOUNTED,
  PLAN_ID_COMPLIMENTARY,
  PLAN_ID_SUMMIT_ANNUAL,
  PLAN_ID_LEGACY_ANNUAL,
  PLAN_ID_THREE_MONTH,
  PLAN_ID_FREE_TRIAL,
  PLAN_ID_MONTHLY,
  PLAN_ID_ANNUAL,
  PLAN_ID_LIVE,
  getPlanSubscriptionType,
} from 'services/plans'
import { PAYMENT_PROVIDER_NAME_GCSI } from 'services/paytrack'
import { FORM_SUBMISSION_NAME_CANCEL_FLOW } from 'services/form-submissions'
import { get as getConfig } from 'config'

const config = getConfig()

export const SPECIAL_OFFER_DURATION = 30

export const USER_ACCOUNT_ACTIVE = 'Active'
export const USER_ACCOUNT_PAUSED = 'Paused'
export const USER_ACCOUNT_CANCELLED = 'Cancelled'
export const USER_ACCOUNT_RECURRING_PLAN = 'Recurring'
export const USER_ACCOUNT_TRANSACTION_STATUS_DECLINED = 'Declined'
export const USER_ACCOUNT_TRANSACTION_STATUS_APPROVED = 'Approved'

export const PAUSE_REASON = 'pause_reason'

export const TEXTBOX_CANCEL_REASON_OTHER_ANSWER = 'cancel_reason_other_answer'

export const ACCOUNT_TYPE_DEFAULT = 'default'
export const ACCOUNT_TYPE_ITUNES = 'itunes'
export const ACCOUNT_TYPE_ROKU = 'roku'
export const ACCOUNT_TYPE_AMAZON = 'amazon'
export const ACCOUNT_TYPE_GCSI = 'gcsi'
export const ACCOUNT_TYPE_ZUORA = 'zuora'
export const ACCOUNT_TYPE_SECONDARY_PROFILE = 'secondary'
export const ACCOUNT_TYPE_TRIAL = 'trial'
export const ACCOUNT_TYPE_ANDROID_PAY = 'android_pay'
export const ACCOUNT_TYPE_PAYPAL_RECURRING = 'paypal_recurring'

export const ACCOUNT_TYPE_FMTV = 'fmtv'
export const ACCOUNT_TYPE_FMTV_ROKU = 'fmtv_roku'
export const ACCOUNT_TYPE_FMTV_ITUNES = 'fmtv_itunes'
export const ACCOUNT_TYPE_FMTV_PAYPAL = 'fmtv_paypal'
export const ACCOUNT_TYPE_FMTV_ANDROID = 'fmtv_android'
export const ACCOUNT_TYPE_FMTV_GIFT = 'fmtv_gift'
export const ACCOUNT_TYPE_FMTV_COMP = 'fmtv_comp'

export const USER_ACCOUNT_PAUSE_ONE_MONTH = 1
export const USER_ACCOUNT_PAUSE_TWO_MONTHS = 2
export const USER_ACCOUNT_PAUSE_THREE_MONTHS = 3

export const SCHEMA_USER_ACCOUNT_CANCEL_V2 = {
  formName: FORM_SUBMISSION_NAME_CANCEL_FLOW,
  billingAccountId: '',
  subscriptionId: '',
  reason: '',
  comment: '',
}

const SCHEMA_CANCEL_CONFIRM = {
  comments: null,
  create: null,
  reason: null,
  start: null,
  subscriptionUuid: null,
  uuid: null,
}

const SCHEMA_ZUORA_CANCEL_CONFIRM = {
  success: null,
}

export const SCHEMA_PAUSE = {
  durationInMonths: null,
  reason: null,
}

const SCHEMA_PAUSE_CONFIRM = {
  startDate: null,
  endDate: null,
}

const SCHEMA_BILLING_SUBSCRIPTION = {
  activationRequestUuid: null,
  userUuid: null,
  paidThroughDate: null,
  cancelDate: null,
  endDate: null,
  startDate: null,
  billingAddressUuid: null,
  uuid: null,
  gaiamDivisionName: null,
  gaiamDivisionUuid: null,
  nextReviewDate: null,
  planUuid: null,
  planName: null,
  paymentSourceUuid: null,
  paymentSourceType: null,
  shippingAddressUuid: null,
  currencyIso: null,
  status: null,
}

const SCHEMA_BILLING_SUBSCRIPTIONS_WITH_DETAILS = {
  errors: null,
  activationRequestUuid: null,
  userUuid: null,
  paidThroughDate: null,
  cancelDate: null,
  endDate: null,
  startDate: null,
  billingAddressUuid: null,
  uuid: null,
  gaiamDivisionName: null,
  gaiamDivisionUuid: null,
  nextReviewDate: null,
  paymentSource: null,
  planUuid: null,
  planName: null,
  plan: null,
  planCalculations: null,
  paymentSourceUuid: null,
  paymentSourceType: null,
  shippingAddressUuid: null,
  currencyIso: null,
}

const SCHEMA_BILLING_SUBSCRIPTIONS_WITH_DETAILS_ZUORA = {
  subscriptionId: null,
  subscriptionNumber: null,
  startDate: null,
  endDate: null,
  nextReviewDate: null,
  paidThroughDate: null,
  nextBillAmount: null,
  billingAccountId: null,
  billingAccountNumber: null,
  currencyIso: null,
  status: null,
  acceptedCancellationOffer: null,
  plan: null,
  nextPlan: null,
  paymentSource: null,
  errors: null,
  latamPricing: null,
  pauseDate: null,
  pauseMonths: null,
  resumeDate: null,
  cancelDate: null,
}

const SCHEMA_GIFT_RECIPIENT_SUBSCRIPTION_CHECK = {
  activeSubscription: null,
}

const SCHEMA_SUBSCRIPTION_PAYMENTS = {
  error: false,
  success: false,
  data: [],
}

export function userShouldReactivate (props) {
  const { userAccount, auth } = props
  const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const subscriptionCancelled = subscriptionStatus === PLAN_SUBSCRIPTION_CANCELLED

  return (billingAccountId && !userIsEntitled && subscriptionCancelled)
}

export function hasScheduledPause (userAccount) {
  const accountPause = _get(config, ['features', 'userAccount', 'accountPause'])
  const pauseDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseDate'])
  const pauseMonths = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseMonths'])
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])

  if (
    accountPause
    && pauseDate
    && pauseMonths
    && subscriptionStatus === USER_ACCOUNT_ACTIVE
  ) {
    return true
  }

  return false
}

export function hasScheduledOrActivePause (userAccount) {
  const accountPause = _get(config, ['features', 'userAccount', 'accountPause'])
  const pauseDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseDate'])
  const pauseMonths = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseMonths'])
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])

  if (
    accountPause
    && pauseDate
    && pauseMonths
    && ((subscriptionStatus === USER_ACCOUNT_ACTIVE)
      || (subscriptionStatus === USER_ACCOUNT_PAUSED))
  ) {
    return true
  }

  return false
}

export function shouldRenderPauseSection (props) {
  const { userAccount } = props
  const accountPause = _get(config, ['features', 'userAccount', 'accountPause'])
  const productRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const nextProductRatePlanId = userAccount.getIn([
    'details',
    'data',
    'billing',
    'subscriptions',
    'nextPlan',
    'productRatePlanId',
  ])
  const subscriptionType = getPlanSubscriptionType(productRatePlanId)
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const zuoraAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const inTrialSegment = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'inTrialSegment'])
  const paidThroughDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  const paymentMadeInCurrentPlan = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'paymentMadeInCurrentPlan'])
  const payments = userAccount.getIn(['details', 'data', 'billing', 'payments', 'data'], Map())
  const paymentTypeExternal = payments.getIn([0, 'paymentType']) === 'External'

  const noComp =
  productRatePlanId !== PLAN_ID_COMPLIMENTARY &&
  nextProductRatePlanId !== PLAN_ID_COMPLIMENTARY

  if (
    accountPause
    && noComp
    && subscriptionType === PLAN_SUBSCRIPTION_MONTHLY
    && zuoraAccountId
    && !inTrialSegment
    && paymentMadeInCurrentPlan
    && subscriptionStatus === USER_ACCOUNT_ACTIVE
    && !paymentTypeExternal
    && getDateTime(paidThroughDate) > getCurrentTime()
  ) {
    return true
  }
  return false
}

export function shouldRenderNextPlanSection (props) {
  const { userAccount } = props
  const currentPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const nextPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productRatePlanId'])
  const nextPlan = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan'])
  const inTrialSegment = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'inTrialSegment'])

  if (inTrialSegment === true && nextPlan) {
    if (
      currentPlanId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY &&
      nextPlanId !== PLAN_ID_MONTHLY
    ) {
      return true
    } else if (
      currentPlanId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL &&
      nextPlanId !== PLAN_ID_ANNUAL
    ) {
      return true
    } else if (currentPlanId === PLAN_ID_FREE_TRIAL && nextPlanId) {
      return true
    } else if (currentPlanId === PLAN_ID_THREE_MONTH && nextPlanId) {
      return true
    } else if (
      currentPlanId === PLAN_ID_LIVE_DISCOUNTED &&
      nextPlanId !== PLAN_ID_LIVE
    ) {
      return true
    } else if (
      currentPlanId === PLAN_ID_NINETY_NINE_CENT_TWO_WEEKS &&
      nextPlanId !== PLAN_ID_MONTHLY
    ) {
      return true
    } else if (
      currentPlanId === PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL &&
      nextPlanId !== PLAN_ID_ANNUAL
    ) {
      return true
    }
    return false
  } else if (nextPlan && currentPlanId !== nextPlanId) {
    return true
  }
  return false
}

// this function appears to be out of date, and shouldn't be used
// until it is updated to match whatever the current/future needs are
// The function is indended to help show a message to the user when they are
// Within 15 days from the end of their non-recurring subscription
// In the future, that could be a gift subscription, etc.
export function showUserAccountRenewMessage (props) {
  const { userAccount } = props
  const planType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const endDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'endDate'])
  const remainingTime = Date.parse(endDate) - Date.now()
  const fifteenDaysInMilliseconds = 1296000000
  let recurrenceType = null

  if (
    userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'charges', 0, 'type']) === USER_ACCOUNT_RECURRING_PLAN ||
    userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'charges', 1, 'type']) === USER_ACCOUNT_RECURRING_PLAN ||
    userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'charges', 0, 'type']) === USER_ACCOUNT_RECURRING_PLAN
  ) {
    recurrenceType = USER_ACCOUNT_RECURRING_PLAN
  }

  if ((
    planType !== PLAN_ID_MONTHLY
    && planType !== PLAN_ID_ANNUAL
    && recurrenceType !== USER_ACCOUNT_RECURRING_PLAN
    && remainingTime > 0
    && endDate
  ) ||
  (
    remainingTime <= fifteenDaysInMilliseconds
    && remainingTime > 0
    && recurrenceType !== USER_ACCOUNT_RECURRING_PLAN
    && endDate
  )) {
    return true
  }

  return false
}

export function showChangePlanMessage (props) {
  const { userAccount } = props
  const planType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const nextPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productId'])
  const paymentSourceType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'type'])
  const lastTransactionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'lastTransactionStatus'])
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const subscriptionCancelled = subscriptionStatus === PLAN_SUBSCRIPTION_CANCELLED
  const reactivateRequired = userShouldReactivate(props)

  if (
    planType !== PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL &&
    planType !== PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL &&
    planType !== PLAN_ID_SUMMIT_ANNUAL &&
    planType !== PLAN_ID_LEGACY_ANNUAL &&
    planType !== PLAN_ID_ANNUAL &&
    planType !== PLAN_ID_LIVE &&
    planType !== PLAN_ID_LIVE_DISCOUNTED &&
    !reactivateRequired &&
    nextPlanId !== PLAN_ID_ANNUAL &&
    paymentSourceType &&
    lastTransactionStatus !== USER_ACCOUNT_TRANSACTION_STATUS_DECLINED &&
    !subscriptionCancelled
  ) {
    return true
  }

  return false
}

export function showFreeTrialUpgradeMessage (props) {
  const { user, userAccount } = props
  const zuoraAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const freeTrial = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  if (!zuoraAccount && freeTrial) {
    return true
  }
  return false
}

export function showFreeTrialEndingMessage (props, locale) {
  const { user, userAccount } = props
  const zuoraAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const freeTrial = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  const twentyFourHoursInMilliseconds = 86400000
  const dateFormatString = 'MM/DD/YY'
  const endDateString = user.getIn(['data', 'userEntitlements', 'end'])
  const endDateInMilliseconds = parseInt(endDateString, 10) * 1000
  const formattedEndDate = new Date(endDateInMilliseconds)
  const getEndDate = getDateTime(formattedEndDate)
  const reformattedEndDate = formatDateTime(getEndDate, locale, dateFormatString)
  const remainingTime = Date.parse(reformattedEndDate) - Date.now()
  if (!zuoraAccount && freeTrial) {
    if (remainingTime < twentyFourHoursInMilliseconds && remainingTime > 0) {
      return true
    }
  }
  return false
}

export function showFmtvReactivateMessage (props) {
  const { userAccount, user } = props
  const currentDate = new Date()
  const currentDateTimeStamp = getDateTime(currentDate)
  const creationSource = user.getIn(['data', 'creation_source'])
  const creationSourceFMTV = _startsWith(creationSource, ACCOUNT_TYPE_FMTV, 0)
  const externalEmail = user.getIn(['data', 'email_registered_externally'])
  const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const fmtvBillingMigrationCompletionDate = _get(config, ['features', 'userAccount', 'fmtvMigrationDate'])

  if (
    (currentDateTimeStamp >= fmtvBillingMigrationCompletionDate) &&
    creationSourceFMTV &&
    !billingAccountId &&
    !externalEmail
  ) {
    return true
  } else if (
    (currentDateTimeStamp >= fmtvBillingMigrationCompletionDate) &&
    !creationSourceFMTV &&
    !billingAccountId &&
    externalEmail
  ) {
    return true
  }
  return false
}

export function showReactivateMessage (props) {
  const { paytrack } = props
  const providerName = paytrack.getIn(['lastTransaction', 'provider_name'])
  const reactivateRequired = userShouldReactivate(props)

  if (reactivateRequired || providerName === PAYMENT_PROVIDER_NAME_GCSI) {
    return true
  }

  return false
}

export function showPaymentErrorMessage (props) {
  const { userAccount } = props
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const lastTransactionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'lastTransactionStatus'])
  const subscriptionCancelled = subscriptionStatus === PLAN_SUBSCRIPTION_CANCELLED

  if (
    (lastTransactionStatus === USER_ACCOUNT_TRANSACTION_STATUS_DECLINED &&
      !subscriptionCancelled)
  ) {
    return true
  }

  return false
}

export function showUpdatePaymentMethodMessage (props) {
  const { userAccount } = props
  const expMonth = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'expMonth'])
  const expYear = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'expYear'])
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const subscriptionCancelled = subscriptionStatus === PLAN_SUBSCRIPTION_CANCELLED

  if (currentYear === expYear && currentMonth === expMonth && !subscriptionCancelled) {
    return true
  }

  return false
}

export async function setUserAccountSubscriptionCancelConfirmed (options = {}) {
  try {
    const { auth } = options
    const res = await apiPost('v1/user/subscription/cancel', null, { auth }, TYPE_BILLING)
    return handleSetSubscriptionCancelResponse(res)
  } catch (err) {
    return handleSetSubscriptionCancelResponse({})
  }
}

export async function setZuoraUserAccountSubscriptionCancelConfirmed (options = {}) {
  try {
    const { auth } = options
    const res = await apiPut('v1/user/subscription', null, { auth }, TYPE_BROOKLYN_JSON)
    return handleZuoraSetSubscriptionCancelResponse(res)
  } catch (err) {
    return handleSetSubscriptionCancelResponse({})
  }
}

export function handleZuoraSetSubscriptionCancelResponse (res) {
  const { statusCode } = res
  const data = _get(res, ['body'], {})

  if (statusCode > 299 || _get(data, 'status') > 299) {
    return { success: false }
  }

  return _assign(_cloneDeep(SCHEMA_ZUORA_CANCEL_CONFIRM), {
    success: _get(data, 'success'),
  })
}

export function handleSetSubscriptionCancelResponse (res) {
  const data = _get(res, ['body', 'data'], {})
  return _assign(_cloneDeep(SCHEMA_CANCEL_CONFIRM), {
    comments: _get(data, 'comments'),
    create: _get(data, 'create'),
    reason: _get(data, 'reason'),
    start: _get(data, 'start'),
    paidThroughDate: _get(data, 'paidThroughDate'),
    subscriptionUuid: _get(data, 'subscriptionUuid'),
    uuid: _get(data, 'uuid'),
  })
}

export function handleSetSubscriptionsWithDetailsZuoraResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  const subscriptions = _assign(_cloneDeep(SCHEMA_BILLING_SUBSCRIPTIONS_WITH_DETAILS_ZUORA), {
    subscriptionId: _get(data, 'subscriptionId'),
    subscriptionNumber: _get(data, 'subscriptionNumber'),
    startDate: _get(data, 'startDate'),
    endDate: _get(data, 'endDate'),
    nextReviewDate: _get(data, 'nextReviewDate'),
    paidThroughDate: _get(data, 'paidThroughDate'),
    nextBillAmount: _get(data, 'nextBillAmount'),
    billingAccountId: _get(data, 'billingAccountId'),
    billingAccountNumber: _get(data, 'billingAccountNumber'),
    currencyIso: _get(data, 'currencyIso'),
    status: _get(data, 'status'),
    acceptedCancellationOffer: _get(data, 'acceptedCancellationOffer'),
    plan: _get(data, 'plan'),
    nextPlan: _get(data, 'nextPlan'),
    paymentSource: _get(data, 'paymentSource'),
    errors: _get(data, ['errors']),
    latamPricing: _get(data, 'latamPricing'),
    pauseDate: _get(data, 'pauseDate'),
    pauseMonths: _get(data, 'pauseMonths'),
    resumeDate: _get(data, 'resumeDate'),
    cancelDate: _get(data, 'cancelDate'),
  })

  return fromJS({
    _dataError,
    subscriptions,
  })
}

/**
 * PAUSE
 */
export async function updateUserAccountPause (options = {}) {
  const { auth, data } = options
  const res = await apiPost('/v1/user/subscription/pause', data, { auth }, TYPE_BROOKLYN_JSON)
  const body = _get(res, 'body')
  return body
}

export async function setUserAccountSubscriptionPauseConfirmed (options = {}) {
  try {
    const { auth, data } = options
    const res = await apiPost('v2/user/subscription/pause', data, { auth }, TYPE_BILLING)
    return handleSetSubscriptionPauseResponse(res)
  } catch (err) {
    return handleSetSubscriptionPauseResponse({})
  }
}

export function handleSetSubscriptionPauseResponse (res) {
  const data = _get(res, ['body'], {})
  return _assign(_cloneDeep(SCHEMA_PAUSE_CONFIRM), {
    startDate: _get(data, 'startDate'),
    endDate: _get(data, 'endDate'),
  })
}

/**
 * RESUME
 */
export async function updateUserAccountResume (options = {}) {
  const { auth, data } = options
  const res = await apiPut('/v1/user/subscription/resume', data, { auth }, TYPE_BROOKLYN_JSON)
  const body = _get(res, 'body')
  return body
}

/**
 * Get the user's billing related subscription information
 * @param {object} options - Options for the function
 * @param {Map|string} auth - Immutable Map or string for authentication
 */
export async function getUserAccountBillingSubscriptions (options = {}) {
  const handleResponse = function handleResponse (res, _dataError) {
    const data = _get(res, 'body.subscriptions', {})
    const subscriptions = _assign(_cloneDeep(SCHEMA_BILLING_SUBSCRIPTION), {
      activationRequestUuid: _get(data, 'activationRequestUuid'),
      userUuid: _get(data, 'userUuid'),
      paidThroughDate: _get(data, 'paidThroughDate'),
      cancelDate: _get(data, 'cancelDate'),
      endDate: _get(data, 'endDate'),
      startDate: _get(data, 'startDate'),
      billingAddressUuid: _get(data, 'billingAddressUuid'),
      uuid: _get(data, 'uuid'),
      gaiamDivisionName: _get(data, 'gaiamDivisionName'),
      gaiamDivisionUuid: _get(data, 'gaiamDivisionUuid'),
      planUuid: _get(data, 'planUuid'),
      planName: _get(data, 'planName'),
      paymentSourceUuid: _get(data, 'paymentSourceUuid'),
      paymentSourceType: _get(data, 'paymentSourceType'),
      shippingAddressUuid: _get(data, 'shippingAddressUuid'),
      currencyIso: _get(data, 'currencyIso'),
      status: _get(data, 'status'),
    })

    return fromJS({ _dataError, subscriptions })
  }
  try {
    const { auth } = options
    if (!auth) {
      return handleResponse({}, true)
    }
    const apiOptions = {
      auth,
      responseErrorType: RESPONSE_ERROR_TYPE_RANGE_500,
    }
    const res = await apiGet('v2/user/subscriptions', null, apiOptions, TYPE_BILLING)
    return handleResponse(res)
  } catch (e) {
    return handleResponse({}, true)
  }
}

/**
* Get the user's billing related subscription information
* @param {object} options - Options for the function
* @param {Map|string} auth - Immutable Map or string for authentication
*/
export async function getUserAccountBillingSubscriptionsWithDetails (options = {}) {
  const handleResponse = function handleResponse (res, _dataError) {
    const data = _get(res, 'body', {})
    const subscriptions = _assign(_cloneDeep(SCHEMA_BILLING_SUBSCRIPTIONS_WITH_DETAILS), {
      errors: _get(data, ['errors']),
      activationRequestUuid: _get(data, 'activationRequestUuid'),
      plan: _get(data, 'plan'),
      planCalculations: _get(data, 'planCalculations'),
      userUuid: _get(data, 'userUuid'),
      paidThroughDate: _get(data, 'paidThroughDate'),
      cancelDate: _get(data, 'cancelDate'),
      endDate: _get(data, 'endDate'),
      startDate: _get(data, 'startDate'),
      billingAddressUuid: _get(data, 'billingAddressUuid'),
      uuid: _get(data, 'uuid'),
      gaiamDivisionName: _get(data, 'gaiamDivisionName'),
      gaiamDivisionUuid: _get(data, 'gaiamDivisionUuid'),
      planUuid: _get(data, 'planUuid'),
      planName: _get(data, 'planName'),
      paymentSource: _get(data, 'paymentSource'),
      paymentSourceUuid: _get(data, 'paymentSourceUuid'),
      paymentSourceType: _get(data, 'paymentSourceType'),
      shippingAddressUuid: _get(data, 'shippingAddressUuid'),
      currencyIso: _get(data, 'currencyIso'),
      nextPlan: _get(data, 'nextPlan'),
    })

    return fromJS({
      _dataError,
      subscriptions,
    })
  }
  try {
    const { auth } = options
    if (!auth) {
      return handleResponse({}, true)
    }
    const apiOptions = {
      auth,
      responseErrorType: RESPONSE_ERROR_TYPE_RANGE_500,
    }
    const res = await apiGet('v1/user/subscription-with-details', null, apiOptions, TYPE_BILLING)
    return handleResponse(res)
  } catch (e) {
    return handleResponse({}, true)
  }
}

export async function getUserAccountBillingSubscriptionsWithDetailsZuoraForProfile (options = {}) {
  try {
    const { auth, userAccountId, accountId, accountNumber } = options
    if (!auth) {
      return handleSetSubscriptionsWithDetailsZuoraResponse({}, true)
    }
    const res = await apiGet('v1/user/subscription', { userAccountId, accountId, accountNumber }, { auth }, TYPE_BROOKLYN)
    return handleSetSubscriptionsWithDetailsZuoraResponse(res)
  } catch (e) {
    return handleSetSubscriptionsWithDetailsZuoraResponse({}, true)
  }
}

export async function getUserAccountBillingSubscriptionsWithDetailsZuora (options = {}) {
  try {
    const { auth } = options
    if (!auth) {
      return handleSetSubscriptionsWithDetailsZuoraResponse({}, true)
    }
    const res = await apiGet('v1/user/subscription', null, { auth }, TYPE_BROOKLYN)
    return handleSetSubscriptionsWithDetailsZuoraResponse(res)
  } catch (e) {
    return handleSetSubscriptionsWithDetailsZuoraResponse({}, true)
  }
}

/**
* Change user's plan type, return either immediate change or
* change for next billing cycle
* @param {object} options - Options for the function
* @param {Map|string} auth - Immutable Map or string for authentication
*/
export async function changeUserAccountPlanTypeData (options = {}) {
  const handleResponse = function handleResponse (res, _dataError) {
    const data = _get(res, 'body', {})
    const success = _get(data, 'success')
    if (_get(data, 'data', 'nextPlan')) {
      return fromJS({
        _dataError,
        immediate: false,
        success,
      })
    }
    return fromJS({
      _dataError,
      immediate: true,
      success,
    })
  }
  try {
    const { planUuid, paymentSourceUuid, paymentSourceType, currencyIso, auth } = options
    if (!auth) {
      return handleResponse({}, true)
    }

    const apiOptions = {
      auth,
      responseErrorType: RESPONSE_ERROR_TYPE_RANGE_500,
    }
    const res = await apiPut(
      'v1/user/change-plan',
      { planUuid, paymentSourceUuid, paymentSourceType, currencyIso },
      apiOptions,
      TYPE_BILLING,
    )
    return handleResponse(res)
  } catch (e) {
    return handleResponse({}, true)
  }
}

export async function changeUserAccountPlanTypeDataZuora (options = {}) {
  const handleResponse = function handleResponse (res, _dataError) {
    const data = _get(res, 'body', {})
    const success = _get(data, 'success')
    const orderNumber = _get(data, 'orderNumber')
    const errorCode = _get(data, ['errorCode'])

    if (!success) {
      return fromJS({
        _dataError: true,
        errorCode,
        immediate: false,
        success,
        orderNumber,
      })
    }

    if (_get(data, 'data', 'plan')) {
      return fromJS({
        _dataError,
        immediate: false,
        success,
        orderNumber,
      })
    }

    return fromJS({
      _dataError,
      immediate: true,
      success,
      orderNumber,
    })
  }

  try {
    const { nextRatePlanId, auth, tracking } = options
    if (!auth) {
      return handleResponse({}, true)
    }

    const apiOptions = {
      auth,
    }
    const res = await apiPut(
      'v1/user/plan',
      { nextRatePlanId, tracking },
      apiOptions,
      TYPE_BROOKLYN_JSON,
    )
    return handleResponse(res)
  } catch (e) {
    return handleResponse({}, true)
  }
}

export function getUserType (paytrack) {
  const lastTransaction = paytrack.get('lastTransaction')
  return lastTransaction ? lastTransaction.get('provider_name') : null
}

export function getCurrentPlanInfoFromPlansCall (props, planId) {
  const { plans } = props
  const plansList = plans.getIn(['data', 'plans'], List())
  const planData = plansList.filter((plan) => {
    const id = plan.get('id')
    if (id === planId) {
      return plan
    }
    return null
  })
  return planData
}

export function handleUserSubscriptionCheckResponse (res, _dataError) {
  const data = _get(res, ['body'], {})
  return _assign(_cloneDeep(SCHEMA_GIFT_RECIPIENT_SUBSCRIPTION_CHECK), {
    _dataError,
    activeSubscription: _get(data, 'activeSubscription'),
  })
}

export async function checkUserSubscriptionStatus (options = {}) {
  try {
    const { email } = options
    const res = await apiPost('v1/user/subscription/check', { email }, null, TYPE_BROOKLYN_JSON)
    return handleUserSubscriptionCheckResponse(res)
  } catch (err) {
    return handleUserSubscriptionCheckResponse({}, true)
  }
}

export function handleUserSubscriptionPaymentsResponse (res, _dataError) {
  const data = _get(res, ['body'], {})
  const success = !_dataError
  return _assign(_cloneDeep(SCHEMA_SUBSCRIPTION_PAYMENTS), {
    error: _dataError,
    success,
    data: data || [],
  })
}

export async function getUserSubscriptionPayments (options = {}) {
  try {
    const { accountId, accountNumber, auth } = options
    const res = await apiGet('v1/payments', { accountId, accountNumber }, { auth }, TYPE_BROOKLYN_JSON)
    return handleUserSubscriptionPaymentsResponse(res)
  } catch (err) {
    return handleUserSubscriptionPaymentsResponse({}, true)
  }
}

export function shouldRenderCancelOffer (props, usePaidThroughDate = null) {
  const { user, userAccount } = props
  const userBillingAccountId = user.getIn(['data', 'billing_account_id'])
  const paidThroughDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  const startDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'startDate'])
  const reformattedStartDate = startDate ? getDateTime(startDate) : undefined
  const now = getDateTime(new Date())
  const futurePaidThroughDate = getDateTime(paidThroughDate) > now
  const daysOnSubscription = reformattedStartDate ?
    getDifferenceInDays(now, reformattedStartDate) : undefined
  const isVested = daysOnSubscription >= 8
  const accountStatusNotActive = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status']) !== USER_ACCOUNT_ACTIVE
  const productRatePlanId = userAccount.getIn([
    'details',
    'data',
    'billing',
    'subscriptions',
    'plan',
    'productRatePlanId',
  ])
  const nextProductRatePlanId = userAccount.getIn([
    'details',
    'data',
    'billing',
    'subscriptions',
    'nextPlan',
    'productRatePlanId',
  ])
  const cancelOfferAccepted = userAccount.getIn([
    'details',
    'data',
    'billing',
    'subscriptions',
    'acceptedCancellationOffer',
  ])
  const isPaymentApproved = USER_ACCOUNT_TRANSACTION_STATUS_APPROVED === userAccount.getIn([
    'details',
    'data',
    'billing',
    'subscriptions',
    'paymentSource',
    'lastTransactionStatus',
  ])
  const noMonthLongTrial = productRatePlanId !== PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL &&
      productRatePlanId !== PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY
  const payments = userAccount.getIn(['details', 'data', 'billing', 'payments', 'data'], List())
  const paymentProcessed = payments.find((payment) => {
    return payment.get('status') === 'Processed'
  })
  const noComp =
      productRatePlanId !== PLAN_ID_COMPLIMENTARY &&
      nextProductRatePlanId !== PLAN_ID_COMPLIMENTARY
  const standardCase =
    userBillingAccountId &&
    !cancelOfferAccepted &&
    isVested &&
    isPaymentApproved &&
    noComp &&
    noMonthLongTrial &&
    paymentProcessed &&
    !hasScheduledOrActivePause(userAccount)
  const extendedCase = standardCase && futurePaidThroughDate && accountStatusNotActive
  if (usePaidThroughDate) {
    return extendedCase
  } else if (standardCase) {
    return true
  }
  return false
}
