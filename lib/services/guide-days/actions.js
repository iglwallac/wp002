export const GET_MULTIPLE_GUIDE_DAYS = 'GET_MULTIPLE_GUIDE_DAYS'
export const GET_GUIDE_DAY = 'GET_GUIDE_DAY'
export const SET_MULTIPLE_GUIDE_DAYS = 'SET_MULTIPLE_GUIDE_DAYS'
export const SET_GUIDE_DAY = 'SET_GUIDE_DAY'
export const SET_GUIDE_DAY_ERROR = 'SET_GUIDE_DAY_ERROR'
export const SET_GUIDE_DAY_IMPRESSION_DATA = 'SET_GUIDE_DAY_IMPRESSION_DATA'
export const CLEAR_GUIDE_DAY_IMPRESSION_DATA = 'CLEAR_GUIDE_DAY_IMPRESSION_DATA'

export function getMultipleGuideDays (guideDayIds, language, fetchChildren) {
  return {
    type: GET_MULTIPLE_GUIDE_DAYS,
    payload: { guideDayIds, language, fetchChildren },
  }
}

export function getGuideDay (guideDayId, language, fetchChildren) {
  return {
    type: GET_GUIDE_DAY,
    payload: { guideDayId, language, fetchChildren },
  }
}

export function setMultipleGuideDays (guideDayIds, language, data) {
  return {
    type: SET_MULTIPLE_GUIDE_DAYS,
    payload: {
      guideDayIds,
      language,
      data,
    },
  }
}

export function setGuideDay (guideDayId, language, data) {
  return {
    type: SET_GUIDE_DAY,
    payload: {
      guideDayId,
      language,
      data,
    },
  }
}

export function setGuideDayError (guideDayId, language, error) {
  return {
    type: SET_GUIDE_DAY_ERROR,
    payload: {
      guideDayId,
      language,
      error,
    },
  }
}
