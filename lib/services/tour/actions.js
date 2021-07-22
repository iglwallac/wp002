export const SET_ACTIVE_ARROW = 'SET_ACTIVE_ARROW'

export function setActiveArrow (value) {
  return {
    type: SET_ACTIVE_ARROW,
    payload: value,
  }
}
