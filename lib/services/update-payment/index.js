import { get as apiGet, put as apiPut, TYPE_BROOKLYN_JSON } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _parseInt from 'lodash/parseInt'
import { formatCardType } from 'services/credit-card'

export function formatPayment (options) {
  const {
    paymentInfo,
    currencyIso,
  } = options
  const gcsi = {}

  if (paymentInfo.paymentType === 'paypal') {
    gcsi.payPalNonce = {
      firstName: _get(paymentInfo, 'firstName'),
      lastName: _get(paymentInfo, 'lastName'),
      nonce: _get(paymentInfo, 'nonce'),
      currencyIso,
    }
    return gcsi
  }

  const paymentData = {
    creditCard: {
      type: formatCardType(_get(paymentInfo, 'type')),
      cardHolder: _get(paymentInfo, 'cardholderName'),
      expMonth: _parseInt(_get(paymentInfo, 'expirationMonth')),
      expYear: _parseInt(_get(paymentInfo, 'expirationYear')),
      number: _get(paymentInfo, 'cardNumber'),
      cvv: _get(paymentInfo, 'cvv'),
      currencyIso,
      billingLocation: {
        countryIso: _get(paymentInfo, 'countryIso'),
        postalCode: _get(paymentInfo, 'postalCode'),
      },
    },
  }
  return paymentData
}

const SCHEMA_UPDATE_RESPONSE = {
  success: null,
  data: {
    uuid: null,
    cardHolder: null,
    customerRefNum: null,
    type: null,
    lastFour: null,
    expMonth: null,
    expYear: null,
    currencyIso: null,
    paymentSourceType: null,
    billingLocation: {
      countryIso: null,
      postalCode: null,
    },
    active: null,
    id: null,
    errors: null,
  },
}

const SCHEMA_UPDATE_PAYMENT_METHOD = {
  _dataError: null,
  success: null,
  data: null,
}

const SCHEMA_UPDATE_PAYMENT_METHOD_ERROR = {
  _dataError: null,
  success: false,
}

export function handleOrderResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return createOrderModel(data, _dataError)
}

export function createOrderModel (data, _dataError) {
  return _assign(_cloneDeep(SCHEMA_UPDATE_RESPONSE), {
    _dataError,
    success: _get(data, 'success'),
    data: {
      uuid: _get(data, ['data', 'uuid']),
      cardHolder: _get(data, ['data', 'cardHolder']),
      customerRefNum: _get(data, ['data', 'customerRefNum']),
      type: _get(data, ['data', 'type']),
      lastFour: _get(data, ['data', 'lastFour']),
      expMonth: _get(data, ['data', 'expMonth']),
      expYear: _get(data, ['data', 'expYear']),
      currencyIso: _get(data, ['data', 'currencyIso']),
      paymentSourceType: _get(data, ['data', 'paymentSourceType']),
      billingLocation: {
        countryIso: _get(data, ['data', 'billingLocation', 'countryIso']),
        postalCode: _get(data, ['data', 'billingLocation', 'postalCode']),
      },
      active: _get(data, ['data', 'active']),
      id: _get(data, ['data', 'id']),
      errors: _get(data, ['data', 'errors']),
    },
  })
}

export async function getPaypalToken () {
  const res = await apiGet('v1/checkout/paypal-token', null, null, TYPE_BROOKLYN_JSON)
  const data = _get(res, 'body', {})
  return { token: _get(data, 'token') }
}

export async function updateZuoraPaymentMethod (options) {
  const { auth } = options
  const update = formatZuoraPaymentMethod(options)
  try {
    const res = await apiPut('v1/billing/account/payment-method', update, { auth }, TYPE_BROOKLYN_JSON)
    return handleZuoraUpdatePaymentMethod(res)
  } catch (err) {
    return handleUpdatePaymentMethodError({}, true)
  }
}

function handleZuoraUpdatePaymentMethod (res, _dataError) {
  const data = _get(res, 'body', {})

  return _assign(_cloneDeep(SCHEMA_UPDATE_PAYMENT_METHOD), {
    _dataError,
    success: _get(data, 'success'),
    data,
  })
}

function handleUpdatePaymentMethodError (res, _dataError) {
  return _assign(_cloneDeep(SCHEMA_UPDATE_PAYMENT_METHOD_ERROR), {
    _dataError,
    success: false,
  })
}

/**
 * Format a Zuora update payment method
 */
export function formatZuoraPaymentMethod (options) {
  const {
    paymentMethodId,
    payPalNonce,
    country,
    postalCode,
    state,
  } = options
  const paymentUpdateData = {
    country,
    postalCode,
  }

  if (payPalNonce) {
    _set(paymentUpdateData, ['payPal', 'payPalNonce'], payPalNonce)

    if (state) {
      _set(paymentUpdateData, 'state', state)
    }

    return paymentUpdateData
  }

  _set(paymentUpdateData, ['creditCard', 'paymentMethodId'], paymentMethodId)
  return paymentUpdateData
}
