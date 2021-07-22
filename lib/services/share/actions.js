export const GET_USER_SHARES = 'GET_USER_SHARES'
export const SET_USER_SHARES = 'SET_USER_SHARES'

export const GET_ACCOUNT_SHARES = 'GET_ACCOUNT_SHARES'
export const SET_ACCOUNT_SHARES = 'SET_ACCOUNT_SHARES'

export const SET_SHARE_REMOVE_PERSONALIZATION = 'SET_SHARE_REMOVE_PERSONALIZATION'
export const SET_SHARE_PERSONALIZATION = 'SET_SHARE_PERSONALIZATION'
export const SET_SHARE_QUALIFIED_VIEW = 'SET_SHARE_QUALIFIED_VIEW'
export const SET_SHARE_CONVERSION = 'SET_SHARE_CONVERSION'
export const SET_SHARE_SOURCE = 'SET_SHARE_SOURCE'

export const GET_USER_HAS_SHARED = 'GET_USER_HAS_SHARED'
export const SET_USER_HAS_SHARED = 'SET_USER_HAS_SHARED'

export const CREATE_SHARE = 'CREATE_SHARE'
export const CREATED_SHARE = 'CREATED_SHARE'

export const DUPLICATE_SHARE_EMAIL_CAPTURE = 'DUPLICATE_SHARE_EMAIL_CAPTURE'
export const DUPLICATED_SHARE_EMAIL_CAPTURE = 'DUPLICATED_SHARE_EMAIL_CAPTURE'

export const CLEAR_SHARE = 'CLEAR_SHARE'
export const GET_SHARE = 'GET_SHARE'
export const SET_SHARE = 'SET_SHARE'
export const SET_SHARE_DATA = 'SET_SHARE_DATA'

export function clearShare () {
  return { type: CLEAR_SHARE }
}

export function getUserShares () {
  return { type: GET_USER_SHARES }
}

export function getUserHasShared () {
  return { type: GET_USER_HAS_SHARED }
}

export function getAccountShares () {
  return { type: GET_ACCOUNT_SHARES }
}

export function getShare (token, language) {
  return { type: GET_SHARE, payload: { token, language } }
}

export function setShareData (payload) {
  return { type: SET_SHARE_DATA, payload }
}

export function setShareConversion (token) {
  return { type: SET_SHARE_CONVERSION, payload: { token } }
}

export function addPersonalization (payload) {
  return { type: SET_SHARE_PERSONALIZATION, payload }
}

export function removePersonalization (payload) {
  return { type: SET_SHARE_REMOVE_PERSONALIZATION, payload }
}

export function setShareSource (payload) {
  return { type: SET_SHARE_SOURCE, payload }
}

export function setShareQualifiedView (token) {
  return { type: SET_SHARE_QUALIFIED_VIEW, payload: { token } }
}

export function createShare (payload) {
  return { type: CREATE_SHARE, payload }
}

export function duplicateShareEmailCapture (payload) {
  return { type: DUPLICATE_SHARE_EMAIL_CAPTURE, payload }
}

