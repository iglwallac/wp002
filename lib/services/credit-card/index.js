import _get from 'lodash/get'
import cardValidator from 'card-validator'
import { Promise as BluebirdPromise } from 'bluebird'
import { fromJS } from 'immutable'
import { US } from 'services/country'

export const PAYMENT_SOURCE_TYPE_CREDIT_CARD = 'CreditCard'
export const PAYMENT_SOURCE_TYPE_PAYPAL = 'PayPal'

export const CARD_TYPE_VISA = 'Visa'
export const CARD_TYPE_MASTERCARD = 'MasterCard'
export const CARD_TYPE_AMERICAN_EXPRESS = 'AmericanExpress'

export function onBlurCc (e, validatePaymentCc) {
  validatePaymentCc(_get(e, ['target', 'value']))
}

export function onChangeCc (e, state, resetPaymentCcValidations) {
  if (state.get('ccValidations')) {
    resetPaymentCcValidations()
  }
}

export function onBlurExpMonth (e, validatePaymentExpMonth) {
  validatePaymentExpMonth(_get(e, ['target', 'value']))
}

export function onChangeExpMonth (e, state, resetPaymentExpMonthValidations) {
  if (state.get('expMonthValidations')) {
    resetPaymentExpMonthValidations()
  }
}

export function onBlurExpYear (e, validatePaymentExpYear) {
  validatePaymentExpYear(_get(e, ['target', 'value']))
}

export function onChangeExpYear (e, state, resetPaymentExpYearValidations) {
  if (state.get('expYearValidations')) {
    resetPaymentExpYearValidations()
  }
}

export function onBlurCvv (e, state, validatePaymentCvv) {
  const maxLength = state.getIn(['ccValidations', 'card', 'code', 'size'], 3)
  _get(e, ['target', 'value'])
  validatePaymentCvv(_get(e, ['target', 'value']), maxLength)
}

export function onChangeCvv (e, state, resetPaymentCvvValidations) {
  if (state.get('cvvValidations')) {
    resetPaymentCvvValidations(_get(e, ['target', 'value']))
  }
}

export function onChangeForm (state, setPaymentBillingZipRequired, model) {
  const country = _get(model, 'countryIso', '')
  const billingZipRequired = country === US || !country
  if (state.get('billingZipRequired') !== billingZipRequired) {
    setPaymentBillingZipRequired(billingZipRequired)
  }
}

export function formatCardType (type) {
  switch (type) {
    case 'American Express':
      return 'AMEX'
    case 'MasterCard':
      return 'Mastercard'
    default:
      return type
  }
}

export function validateCc (number) {
  return new BluebirdPromise(((resolve) => {
    resolve(fromJS(cardValidator.number(number)))
  }))
}

export function validateExpMonth (month) {
  return new BluebirdPromise(((resolve) => {
    resolve(fromJS(cardValidator.expirationMonth(month)))
  }))
}

export function validateExpYear (year) {
  return new BluebirdPromise(((resolve) => {
    resolve(fromJS(cardValidator.expirationYear(year)))
  }))
}

export function validateCvv (cvv, maxLength) {
  return new BluebirdPromise(((resolve) => {
    resolve(fromJS(cardValidator.cvv(cvv, maxLength)))
  }))
}
