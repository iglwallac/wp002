import _get from 'lodash/get'
import _concat from 'lodash/concat'
import {
  compUserSubscription,
} from './index'

export const COMP_USER_SUBSCRIPTION_PROCESSING = 'COMP_USER_SUBSCRIPTION_PROCESSING'
export const COMP_USER_SUBSCRIPTION_DATA = 'COMP_USER_SUBSCRIPTION_DATA'
export const COMP_USER_SUBSCRIPTION_ERROR = 'COMP_USER_SUBSCRIPTION_ERROR'
export const SET_USER_COMP = 'SET_USER_COMP'
export const RESET_USER_COMP = 'RESET_USER_COMP'

export function processCompUserSubscription (options = {}) {
  return function compUserSubscriptionThunk (dispatch) {
    dispatch(setCompUserSubscriptionProcessing(true))
    return compUserSubscription(options)
      .then((compData) => {
        if (_get(compData, 'success')) {
          dispatch(setCompUserSubscriptionData(compData))
        } else {
          dispatch(setCompUserSubscriptionError(compData.errors))
        }
        return compData
      })
      .catch((e) => {
        dispatch(setCompUserSubscriptionError(e))
        throw e
      })
  }
}

export function setCompUserSubscriptionProcessing (processing) {
  return {
    type: COMP_USER_SUBSCRIPTION_PROCESSING,
    processing,
  }
}

export function setCompUserSubscriptionData (data) {
  return {
    type: COMP_USER_SUBSCRIPTION_DATA,
    processing: false,
    payload: data,
  }
}

export function setCompUserSubscriptionError (errors = []) {
  return {
    type: COMP_USER_SUBSCRIPTION_ERROR,
    processing: false,
    errors: _concat([], errors),
  }
}

export function setUserComp () {
  return {
    type: SET_USER_COMP,
  }
}

export function resetUserComp () {
  return {
    type: RESET_USER_COMP,
  }
}
