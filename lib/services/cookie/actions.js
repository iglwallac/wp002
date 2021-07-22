export const SET_COOKIE_CAN_SET_COOKIE = 'SET_COOKIE_CAN_SET_COOKIE'
export const SET_COOKIE_BANNER_ACCEPTED = 'SET_COOKIE_BANNER_ACCEPTED'

export function setCookieCanSetCookie (value) {
  return {
    type: SET_COOKIE_CAN_SET_COOKIE,
    payload: value,
  }
}

export function setCookieBannerAccepted (value) {
  return {
    type: SET_COOKIE_BANNER_ACCEPTED,
    payload: value,
  }
}
