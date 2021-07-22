export const GET_PM_SCREEN = 'GET_PM_SCREEN'
export const SET_PM_SCREEN = 'SET_PM_SCREEN'
export const RESET_PM_SCREEN = 'RESET_PM_SCREEN'
export const DELETE_PM_SCREEN = 'DELETE_PM_SCREEN'
export const SET_PM_SCREEN_ERROR = 'SET_PM_SCREEN_ERROR'

export function getPmScreen (screenType, language) {
  return {
    type: GET_PM_SCREEN,
    payload: { screenType, language },
  }
}

export function deletePmScreen (screenType, language) {
  return {
    type: DELETE_PM_SCREEN,
    payload: { screenType, language },
  }
}

export function setPmScreen (screenType, language, data) {
  return {
    type: SET_PM_SCREEN,
    payload: {
      screenType,
      language,
      data,
    },
  }
}

export function resetPmScreen (screenType, language) {
  return {
    type: RESET_PM_SCREEN,
    payload: { screenType, language },
  }
}

export function setPmScreenError (screenType, language, error) {
  return {
    type: SET_PM_SCREEN_ERROR,
    payload: {
      screenType,
      language,
      error,
    },
  }
}
