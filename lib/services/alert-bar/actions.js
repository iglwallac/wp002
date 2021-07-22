export const SET_ALERT_BAR_VISIBLE = 'SET_ALERT_BAR_VISIBLE'
export const SET_ALERT_BAR_DATA = 'SET_ALERT_BAR_DATA'
export const SET_ALERT_BAR_DISMISSED = 'SET_ALERT_BAR_DISMISSED'

export function setAlertBarVisible (value) {
  return {
    type: SET_ALERT_BAR_VISIBLE,
    payload: value,
  }
}

export function setAlertBarDismissed (value) {
  return {
    type: SET_ALERT_BAR_DISMISSED,
    payload: value,
  }
}

export function setAlertBarData (data) {
  return {
    type: SET_ALERT_BAR_DATA,
    payload: { data },
  }
}
