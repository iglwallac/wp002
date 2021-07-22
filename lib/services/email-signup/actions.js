import { updateUserContactData } from 'services/user/actions'
import { postCore as postCoreSignup, postBrooklyn as postBrooklynSignup } from 'services/email-signup'
import _get from 'lodash/get'

export const SET_EMAIL_SIGNUP_SUCCESS = 'SET_EMAIL_SIGNUP_SUCCESS'
export const SET_EMAIL_SIGNUP_VIDEO_PREVIEW_COUNT = 'SET_EMAIL_SIGNUP_VIDEO_PREVIEW_COUNT'
export const SET_EMAIL_SIGNUP_CONFIRMATION = 'SET_EMAIL_SIGNUP_CONFIRMATION'
export const SET_EMAIL_SIGNUP_PREVIEW_GATE_VISIBLE = 'SET_EMAIL_SIGNUP_PREVIEW_GATE_VISIBLE'
export const SET_EMAIL_SIGNUP_OPTIN = 'SET_EMAIL_SIGNUP_OPTIN'

export function setEmailSignupSuccess (success, email, errorCode = null, processing, formName) {
  return {
    type: SET_EMAIL_SIGNUP_SUCCESS,
    payload: { success, email, errorCode, processing, formName },
  }
}

export function setEmailSignupConfirmation (value) {
  return {
    type: SET_EMAIL_SIGNUP_CONFIRMATION,
    payload: value,
  }
}

export function setEmailSignupVideoPreviewCount (value) {
  return {
    type: SET_EMAIL_SIGNUP_VIDEO_PREVIEW_COUNT,
    payload: value,
  }
}

export function setEmailSignupPreviewGateVisible (value) {
  return {
    type: SET_EMAIL_SIGNUP_PREVIEW_GATE_VISIBLE,
    payload: value,
  }
}

export function setEmailSignupOptin (value) {
  return {
    type: SET_EMAIL_SIGNUP_OPTIN,
    payload: value,
  }
}

export function doEmailSignup (
  emailAddress,
  formName,
  siteSegment,
  userLanguage,
  url,
  utm,
  optin = true,
) {
  return function doEmailSignupThunk (dispatch) {
    dispatch(setEmailSignupSuccess(null, null, null, true, formName))
    return postCoreSignup({ emailAddress, formName, siteSegment, userLanguage, url, utm, optin })
      .then((data) => {
        dispatch(setEmailSignupSuccess(_get(data, 'success'), emailAddress, _get(data, 'errorCode'), false, formName))
        return data
      })
      .catch(() => {
        dispatch(setEmailSignupSuccess(false, null, null, false, formName))
      })
  }
}

export function doEmailSignupBrooklyn (email, source, fields, utm, optin, updatePreferences) {
  return function doEmailSignupBrooklynThunk (dispatch) {
    dispatch(setEmailSignupSuccess(null, null, null, true, source))
    return postBrooklynSignup({ email, source, fields, optin, utm, updatePreferences })
      .then((data) => {
        dispatch(updateUserContactData(fields, optin))
        dispatch(setEmailSignupSuccess(_get(data, 'success'), email, _get(data, 'errorCode'), false, source))
        return data
      })
      .catch(() => {
        dispatch(setEmailSignupSuccess(false, null, null, false))
      })
  }
}
