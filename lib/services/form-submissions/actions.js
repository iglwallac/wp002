import _get from 'lodash/get'
import { post as postFormSubmissions } from './index'

export const SET_FORM_SUBMISSIONS_CONFIRMED_DATA = 'SET_FORM_SUBMISSIONS_CONFIRMED_DATA'
export const SET_FORM_SUBMISSIONS_PROCESSING = 'SET_FORM_SUBMISSIONS_PROCESSING'
export const RESET_FORM_SUBMISSIONS_DATA = 'RESET_FORM_SUBMISSIONS_DATA'

export function setFormSubmissionsData ({ auth, data }) {
  return async function setFormSubmissionsDataThunk (dispatch) {
    dispatch(setFormSubmissionsProcessing(true))
    const result = await postFormSubmissions({ auth, data })
    dispatch(setFormSubmissionsConfirmedData(_get(result, 'data')))
    return result
  }
}

export function setFormSubmissionsConfirmedData (data, processing = false) {
  return {
    type: SET_FORM_SUBMISSIONS_CONFIRMED_DATA,
    payload: { data, processing },
  }
}

export function setFormSubmissionsProcessing (value) {
  return {
    type: SET_FORM_SUBMISSIONS_PROCESSING,
    payload: value,
  }
}

export function resetFormSubmissionsData () {
  return {
    type: RESET_FORM_SUBMISSIONS_DATA,
  }
}
