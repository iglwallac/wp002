export const SET_PROFITWELL_READY = 'SET_PROFITWELL_READY'
export const SET_PROFITWELL_STARTED = 'SET_PROFITWELL_STARTED'
export const GET_PROFITWELL_ENTITLEMENT = 'GET_PROFITWELL_ENTITLEMENT'

export function setProfitwellReady (value) {
  return {
    type: SET_PROFITWELL_READY,
    payload: value,
  }
}

export function setProfitwellStarted (value) {
  return {
    type: SET_PROFITWELL_STARTED,
    payload: value,
  }
}

export function getProfitwellEntitlement () {
  return {
    type: GET_PROFITWELL_ENTITLEMENT,
  }
}
