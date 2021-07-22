import { get as apiGet, post as apiPost, put as apiPut, TYPE_BROOKLYN_JSON } from 'api-client'
import { Map } from 'immutable'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _has from 'lodash/has'
import _toString from 'lodash/toString'
import _startsWith from 'lodash/startsWith'
import _parseInt from 'lodash/parseInt'
import { stringify as stringifyQuery } from 'query-string'
import { EMAIL_SIGNUP_GENERIC, SITE_SEGMENT_SHORT_BRAND } from 'services/email-signup'
import { ACCOUNT_TYPE_FMTV, USER_ACCOUNT_PAUSED } from 'services/user-account'
import { PAYMENT_PROVIDER_NAME_GCSI } from 'services/paytrack'

export const CHECKOUT_TOTAL_STEPS = 3
export const CHECKOUT_STEP_ONE = 1
export const CHECKOUT_STEP_TWO = 2
export const CHECKOUT_STEP_THREE = 3
export const CHECKOUT_EVENT_STEP_ONE = 1
export const CHECKOUT_EVENT_STEP_TWO = 2
export const CHECKOUT_EVENT_STEP_THREE = 3
export const CHECKOUT_EVENT_STEP_FOUR = 4
export const CHECKOUT_EVENT_STEP_FIVE = 5
export const CHECKOUT_EVENT_STEP_SIX = 6
export const CHECKOUT_EVENT_STEP_SEVEN = 7
export const PAYMENT_TYPE_PAYPAL = 'paypal'
export const CHECKOUT_ORDER_ERROR_TYPE_ALREADY_SUBSCRIBED = 'ALREADY_SUBSCRIBED'
export const CHECKOUT_ORDER_ERROR_TYPE_GENERIC = 'GENERIC_ERROR'
export const CHECKOUT_ORDER_ERROR_TYPE_PAYMENT = 'PAYMENT_ERROR'
export const CHECKOUT_ORDER_ERROR_TYPE_UNKNOWN = 'UNKNOWN'

const SCHEMA_ORDER = {
  _dataError: null,
  success: null,
  userIsNew: null,
  newUsername: null,
  billing: {},
}

const SCHEMA_ORDER_ERROR = {
  _dataError: null,
  success: false,
  errors: null,
}

const SCHEMA_EMARSYS_FIELDS = {
  form_name: EMAIL_SIGNUP_GENERIC,
  prospect_behavior_segment: SITE_SEGMENT_SHORT_BRAND,
  prospect_email_comm_br: true,
}

function handleOrderError (res, _dataError) {
  const data = _get(res, 'body', {})
  return createOrderErrorModel(data, _dataError)
}

function createOrderErrorModel (data, _dataError) {
  return _assign(_cloneDeep(SCHEMA_ORDER_ERROR), {
    _dataError,
    success: false,
  })
}

export function userCheckoutAllowed (props, entitled) {
  const {
    auth,
    user = Map(),
    userAccount,
    paytrack,
  } = props
  const endDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'endDate'])
  const providerName = paytrack.getIn(['lastTransaction', 'provider_name'])
  const freeTrialNoBillingId = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  const gaiaBillingAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const accountOwnerUid = _parseInt(user.getIn(['data', 'account_owner_uid']))
  const uid = _parseInt(user.getIn(['data', 'uid']))
  const creationSource = user.getIn(['data', 'creation_source'])
  const creationSourceFMTV = _startsWith(creationSource, ACCOUNT_TYPE_FMTV, 0)
  const externalEmail = user.getIn(['data', 'email_registered_externally'])
  const freeTrialNoGaiaBillingAccount = freeTrialNoBillingId && !gaiaBillingAccount
  const fmtvMigratedNoGaiaBillingAccount = (creationSourceFMTV && !gaiaBillingAccount) ||
    (!creationSourceFMTV && externalEmail && !gaiaBillingAccount)
  const notAccountOwner = accountOwnerUid !== uid
  const entitledNotCancelledNotGCSI = entitled && !endDate &&
    providerName !== PAYMENT_PROVIDER_NAME_GCSI
  const entitledCancelled = entitled && endDate
  const accountPaused = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status']) === USER_ACCOUNT_PAUSED

  if (auth.get('jwt') && !user.get('processing')) {
    if (freeTrialNoGaiaBillingAccount || fmtvMigratedNoGaiaBillingAccount) {
      return true
    } else if (
      notAccountOwner ||
      entitledNotCancelledNotGCSI ||
      entitledCancelled ||
      accountPaused
    ) {
      return false
    }
  }

  return true
}

export async function getPaypalToken () {
  const res = await apiGet('v1/checkout/paypal-token', null, null, TYPE_BROOKLYN_JSON)
  const data = _get(res, 'body', {})

  return { token: _get(data, 'token') }
}

function formatCaptureEmailData (options) {
  const {
    email,
    sku,
    utm,
    language,
    country,
    firstName,
  } = options
  const data = {
    email,
    sku,
    language,
    country,
    fields: { ...SCHEMA_EMARSYS_FIELDS, first_name: firstName },
  }
  if (utm) {
    data.utm = utm
  }
  return data
}

export async function captureEmail (options) {
  try {
    const res = await apiPost('v1/checkout/cart-begin', formatCaptureEmailData(options), null, TYPE_BROOKLYN_JSON)
    const data = _get(res, 'body', {})
    return {
      success: _get(data, 'success'),
      errorCode: _get(data, 'errorCode'),
    }
  } catch (e) {
    return { success: false, errorCode: null }
  }
}

export async function createOrder (options) {
  const order = formatOrder(options)
  try {
    const res = await apiPost('v1/billing/checkout', order, null, TYPE_BROOKLYN_JSON)
    return handleOrderResponse(res)
  } catch (err) {
    return handleOrderError({}, true)
  }
}

function handleOrderResponse (res, _dataError) {
  const data = _get(res, 'body', {})

  return _assign(_cloneDeep(SCHEMA_ORDER), {
    _dataError,
    success: _get(data, 'success'),
    errorCode: _get(data, 'errorCode'),
    userIsNew: _get(data, 'userIsNew'),
    newUsername: _get(data, 'newUsername'),
    billing: _get(data, 'billing'),
  })
}

/**
 * Format start date override
 */
export function formatStartDateOverride (startDateOverrideInfo) {
  const query = {
    startDateOverride: _get(startDateOverrideInfo, 'formattedEndDate'),
  }
  if (startDateOverrideInfo) {
    return `?${stringifyQuery(query)}`
  }
  return ''
}

/**
 * Format a new order
 */
export function formatOrder (options) {
  const {
    userInfo,
    paymentInfo,
    language,
    tracking,
  } = options
  return {
    user: {
      email: _get(userInfo, 'email'),
      emailOptIn: _get(userInfo, 'emailOptIn') === true,
      firstName: _get(userInfo, 'firstName'),
      lastName: _get(userInfo, 'lastName'),
      password: _get(userInfo, 'password'),
      sendWelcomeEmail: true,
      language,
    },
    tracking: formatTracking(tracking),
    billing: formatBilling(paymentInfo),
    fields: SCHEMA_EMARSYS_FIELDS,
  }
}

/**
 * Format billing information sent in an order
 */
export function formatBilling (paymentInfo) {
  const {
    currencyIso,
    country,
    state,
    postalCode,
    productRatePlanId,
    payPal,
    creditCard,
  } = paymentInfo
  const billingData = {
    country,
    postalCode,
    currency: currencyIso,
    productRatePlanId,
  }

  if (payPal) {
    _set(billingData, ['payPal', 'payPalNonce'], _get(payPal, 'payPalNonce'))

    if (state) {
      _set(billingData, 'state', state)
    }

    return billingData
  }

  _set(billingData, ['creditCard', 'paymentMethodId'], _get(creditCard, 'paymentMethodId'))
  return billingData
}

/**
 * Format tracking that is sent in an order
 */
export function formatTracking (inboundTracking) {
  const trackingData = {}

  if (Map.isMap(inboundTracking) && inboundTracking.size > 0) {
    const utm = inboundTracking.getIn(['data', 'strings', 'utm'])
    const chan = inboundTracking.getIn(['data', 'chan'])
    const cid = inboundTracking.getIn(['data', 'cid'])
    const linkshare = inboundTracking.getIn(['data', 'linkshare'], Map())

    if (utm) {
      _set(trackingData, 'utm', _has(utm, 'toJS') ? utm.toJS() : utm)
    }

    if (linkshare.size > 0) {
      _set(
        trackingData,
        'linkshare',
        _has(linkshare, 'toJS') || Map.isMap(linkshare) ? linkshare.toJS() : linkshare,
      )
    }

    if (chan) {
      _set(trackingData, 'chan', _toString(chan))
    }

    if (cid) {
      _set(trackingData, 'cid', _toString(cid))
    }
  }

  return trackingData
}

export async function createRenewOrder (options) {
  const { paymentInfo, auth, startDateOverrideInfo } = options
  const order = { billing: formatBilling(paymentInfo) }
  const startDateOverride = formatStartDateOverride(startDateOverrideInfo)
  try {
    const res = await apiPut(`v1/billing/account${startDateOverride}`, order, { auth }, TYPE_BROOKLYN_JSON)
    return handleRenewOrderResponse(res)
  } catch (e) {
    return handleOrderError({}, true)
  }
}

function handleRenewOrderResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return {
    _dataError,
    success: _get(data, 'success'),
    errorCode: _get(data, 'errorCode'),
    billing: _get(data, 'billing'),
  }
}
