import { getReferralData, postUserReferralAttributionData } from 'services/referral'

export const GET_USER_REFERRAL_DATA = 'GET_USER_REFERRAL_DATA'
export const SET_USER_REFERRAL_DATA = 'SET_USER_REFERRAL_DATA'
export const REMOVE_USER_REFERRAL_DATA = 'REMOVE_USER_REFERRAL_DATA'
export const SET_VIEW_ALL_USER_REFERRAL_DATA = 'SET_VIEW_ALL_USER_REFERRAL_DATA'
export const SET_USER_REFERRAL_DATA_PROCESSING = 'SET_USER_REFERRAL_DATA_PROCESSING'
export const SET_USER_REFERRAL_ATTRIBUTION_DATA = 'SET_USER_REFERRAL_ATTRIBUTION_DATA'
export const SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING = 'SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING'
export const REFERRAL_CLEAR_VIEWALL = 'REFERRAL_CLEAR_VIEWALL'
export const SHOW_INVITE_FRIEND_POPUP = 'SHOW_INVITE_FRIEND_POPUP'
export const SET_INVITE_FRIEND_TILES_DATA = 'SET_INVITE_FRIEND_TILES_DATA'

export function getUserReferralData (options = {}) {
  return {
    type: GET_USER_REFERRAL_DATA,
    payload: options,
  }
}

export function setUserReferralData (payload) {
  return {
    type: SET_USER_REFERRAL_DATA,
    payload,
  }
}

export function removeUserReferralData () {
  return {
    type: REMOVE_USER_REFERRAL_DATA,
    payload: {},
  }
}

// remove this once new invite page is up
export function getViewAllUserReferralData ({ auth, p = 1, pp = 25, storeKey = null }) {
  return async function getUserReferralDataThunk (dispatch) {
    dispatch(setUserReferralDataProcessing(true))
    const data = await getReferralData({ auth, p, pp })
    dispatch(setViewAllUserReferralData({ data, storeKey, p, pp }))
    return data
  }
}

export function saveUserReferralAttributionData ({ auth, referralId, sourceId, source }) {
  return async function saveUserReferralAttributionDataThunk (dispatch) {
    dispatch(setUserReferralAttributionDataProcessing(true))
    const data = await postUserReferralAttributionData({ auth, referralId, sourceId, source })
    dispatch(setUserReferralAttributionData(data))
    return data
  }
}

// remove this once new invite page is up
export function setViewAllUserReferralData ({ data, storeKey, p, pp, processing = false }) {
  return {
    type: SET_VIEW_ALL_USER_REFERRAL_DATA,
    payload: { data, storeKey, p, pp, processing },
  }
}

export function setUserReferralDataProcessing (value) {
  return {
    type: SET_USER_REFERRAL_DATA_PROCESSING,
    payload: value,
  }
}

export function setUserReferralAttributionData (data, processing = false) {
  return {
    type: SET_USER_REFERRAL_ATTRIBUTION_DATA,
    payload: { data, processing },
  }
}

export function setUserReferralAttributionDataProcessing (value) {
  return {
    type: SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING,
    payload: value,
  }
}

// remove this once new invite page is up
export function clearReferralViewAll () {
  return {
    type: REFERRAL_CLEAR_VIEWALL,
  }
}

export function showInviteFriendPopup (value) {
  return {
    type: SHOW_INVITE_FRIEND_POPUP,
    payload: value,
  }
}

export function setInviteFriendTileData (data) {
  return {
    type: SET_INVITE_FRIEND_TILES_DATA,
    payload: { data },
  }
}
