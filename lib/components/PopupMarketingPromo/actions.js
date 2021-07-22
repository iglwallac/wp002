import {
  getCookie,
  setCookie,
  expireCookie,
} from 'services/cookie'

export const SET_POPUP_MARKETING_PROMO_VISIBLE =
  'SET_POPUP_MARKETING_PROMO_VISIBLE'
export const SET_POPUP_MARKETING_PROMO_COOKIE =
  'SET_POPUP_MARKETING_PROMO_COOKIE'
export const SET_POPUP_MARKETING_PROMO_SUCCESS =
  'SET_POPUP_MARKETING_PROMO_SUCCESS'

const SET_POPUP_MARKETING_PROMO_COOKIE_NAME = 'popupMarketingPromo'

export function setPopupMarketingPromoVisible (value) {
  return {
    type: SET_POPUP_MARKETING_PROMO_VISIBLE,
    payload: value,
  }
}

export function setPopupMarketingPromoCookie (value) {
  return {
    type: SET_POPUP_MARKETING_PROMO_COOKIE,
    payload: value,
  }
}

export function setPopupMarketingPromoSuccess (value) {
  return {
    type: SET_POPUP_MARKETING_PROMO_SUCCESS,
    payload: value,
  }
}

export function setPopupMarketingPromoCookiePersistent (value = 1, uid, authToken) {
  return function setPopupMarketingPromoCookiePersistentThunk (dispatch) {
    setCookie(SET_POPUP_MARKETING_PROMO_COOKIE_NAME, value, 86400, false, uid, authToken)
    return dispatch(setPopupMarketingPromoCookie(value))
  }
}

export function expirePopupMarketingPromoCookiePersistent () {
  return function expirePopupMarketingPromoCookiePersistentThunk (dispatch) {
    expireCookie(SET_POPUP_MARKETING_PROMO_COOKIE_NAME)
    return dispatch(setPopupMarketingPromoCookie(false))
  }
}

export function getPopupMarketingPromoCookiePersistent () {
  return function getPopupMarketingPromoCookiePersistentThunk (dispatch) {
    const cookie = getCookie(SET_POPUP_MARKETING_PROMO_COOKIE_NAME)
    dispatch(setPopupMarketingPromoCookie(cookie))
  }
}
