import { Map } from 'immutable'
import getPaytrackLastTransaction from '.'

export const SET_PAYTRACK_DATA_PROCESSING = 'SET_PAYTRACK_DATA_PROCESSING'
export const SET_PAYTRACK_DATA_LAST_TRANSACTION = 'SET_PAYTRACK_DATA_LAST_TRANSACTION'

export function getPaytrackDataLastTransaction ({ auth }) {
  return function getPaytrackDataLastTransactionThunk (dispatch) {
    dispatch(setPaytrackProcessing(true))
    return getPaytrackLastTransaction({ auth })
      .then((data) => {
        dispatch(setPaytrackDataLastTransaction(data))
        return data
      })
      .catch(() => {
        dispatch(setPaytrackDataLastTransaction(undefined))
        return undefined
      })
  }
}

export function setPaytrackProcessing (processing) {
  return {
    type: SET_PAYTRACK_DATA_PROCESSING,
    processing,
  }
}

export function setPaytrackDataLastTransaction (payload = Map()) {
  return {
    type: SET_PAYTRACK_DATA_LAST_TRANSACTION,
    payload,
  }
}
