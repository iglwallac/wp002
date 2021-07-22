export const SET_GIFT_CHEKOUT_STEP = 'SET_GIFT_CHEKOUT_STEP'
export const SET_GIFT_CHEKOUT_STEP_COMPLETE = 'SET_GIFT_CHEKOUT_STEP_COMPLETE'
export const SET_GIFT_CHECKOUT_THEME = 'SET_GIFT_CHECKOUT_THEME'
export const SET_GIFT_CHECKOUT_GIVER_DATA_ITEM = 'SET_GIFT_CHECKOUT_GIVER_DATA_ITEM'
export const SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM = 'SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM'
export const SET_GIFT_CHECKOUT_RECIPIENT_DATE_ERROR = 'SET_GIFT_CHECKOUT_RECIPIENT_DATE_ERROR'
export const SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING = 'SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING'
export const GET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS = 'GET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS'
export const SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_DATA = 'SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_DATA'
export const SET_GIFT_CHECKOUT_GIVER_PAYMENT_TYPE = 'SET_GIFT_CHECKOUT_GIVER_PAYMENT_TYPE'

export function setGiftCheckoutStep (value) {
  return {
    type: SET_GIFT_CHEKOUT_STEP,
    payload: value,
  }
}

export function setGiftCheckoutStepComplete (value) {
  return {
    type: SET_GIFT_CHEKOUT_STEP_COMPLETE,
    payload: value,
  }
}

export function setGiftCheckoutTheme (value) {
  return {
    type: SET_GIFT_CHECKOUT_THEME,
    payload: value,
  }
}

export function setGiftCheckoutGiverDataItem (key, value) {
  return {
    type: SET_GIFT_CHECKOUT_GIVER_DATA_ITEM,
    payload: { key, value },
  }
}

export function setGiftCheckoutRecipientDataItem (key, value) {
  return {
    type: SET_GIFT_CHECKOUT_RECIPIENT_DATA_ITEM,
    payload: { key, value },
  }
}

export function setGiftCheckoutRecipientDateError (value) {
  return {
    type: SET_GIFT_CHECKOUT_RECIPIENT_DATE_ERROR,
    payload: value,
  }
}

export function setGiftCheckoutRecipientSubscriptionStatusProcessing (processing) {
  return {
    type: SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_PROCESSING,
    payload: processing,
  }
}

export function getGiftCheckoutRecipientSubscriptionStatus (email) {
  return {
    type: GET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS,
    payload: email,
  }
}

export function setGiftCheckoutRecipientSubscriptionStatusData (data, processing = false) {
  return {
    type: SET_GIFT_CHECKOUT_RECIPIENT_SUBSCRIPTION_STATUS_DATA,
    payload: { data, processing },
  }
}

export function setGiftCheckoutGiverPaymentType (type) {
  return {
    type: SET_GIFT_CHECKOUT_GIVER_PAYMENT_TYPE,
    payload: type,
  }
}
