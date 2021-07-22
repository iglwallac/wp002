export const RESET_HEADER_NAV = 'RESET_HEADER_NAV'
export const TOGGLE_NAVIGATION_OVERLAY_VISIBLE =
  'TOGGLE_NAVIGATION_OVERLAY_VISIBLE'
export const SET_NAVIGATION_OVERLAY_VISIBLE = 'SET_NAVIGATION_OVERLAY_VISIBLE'
export const SET_USER_MENU_VISIBLE = 'SET_USER_MENU_VISIBLE'
export const TOGGLE_USER_MENU_VISIBLE = 'TOGGLE_USER_MENU_VISIBLE'
export const SET_NOTIFICATIONS_MENU_VISIBLE = 'SET_NOTIFICATIONS_MENU_VISIBLE'
export const TOGGLE_NOTIFICATIONS_MENU_VISIBLE = 'TOGGLE_NOTIFICATIONS_MENU_VISIBLE'
export const SET_NOTIFICATIONS_MENU_SECTION = 'SET_NOTIFICATIONS_MENU_SECTION'

export function resetHeaderNav () {
  return {
    type: RESET_HEADER_NAV,
  }
}

export function toggleNavigationOverlayVisible () {
  return {
    type: TOGGLE_NAVIGATION_OVERLAY_VISIBLE,
  }
}

export function setNavigationOverlayVisible (value) {
  return {
    type: SET_NAVIGATION_OVERLAY_VISIBLE,
    payload: value,
  }
}

export function setUserMenuVisible (value) {
  return {
    type: SET_USER_MENU_VISIBLE,
    payload: value,
  }
}

export function toggleUserMenuVisible () {
  return {
    type: TOGGLE_USER_MENU_VISIBLE,
  }
}

export function setNotificationsMenuVisible (value) {
  return {
    type: SET_NOTIFICATIONS_MENU_VISIBLE,
    payload: value,
  }
}

export function toggleNotificationsMenuVisible () {
  return {
    type: TOGGLE_NOTIFICATIONS_MENU_VISIBLE,
  }
}

export function setNotificationsMenuSection (value) {
  return {
    type: SET_NOTIFICATIONS_MENU_SECTION,
    payload: value,
  }
}
