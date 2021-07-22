export const GET_MULTIPLE_GUIDES = 'GET_MULTIPLE_GUIDES'
export const GET_GUIDE = 'GET_GUIDE'
export const SET_PM_MULTIPLE_SERIES = 'SET_PM_MULTIPLE_SERIES'
export const SET_GUIDE = 'SET_GUIDE'
export const SET_GUIDE_ERROR = 'SET_GUIDE_ERROR'
export const SET_GUIDE_IMPRESSION_DATA = 'SET_GUIDE_IMPRESSION_DATA'
export const CLEAR_GUIDE_IMPRESSION_DATA = 'CLEAR_GUIDE_IMPRESSION_DATA'

export function getMultipleGuides (guideIds, language) {
  return {
    type: GET_MULTIPLE_GUIDES,
    payload: { guideIds, language },
  }
}

export function getGuide (guideId, language, fetchChildren) {
  return {
    type: GET_GUIDE,
    payload: { guideId, language, fetchChildren },
  }
}

export function setMultipleGuides (guideIds, language, data) {
  return {
    type: SET_PM_MULTIPLE_SERIES,
    payload: {
      guideIds,
      language,
      data,
    },
  }
}

export function setGuide (guideId, language, data) {
  return {
    type: SET_GUIDE,
    payload: {
      guideId,
      language,
      data,
    },
  }
}

export function setGuideError (guideId, language, error) {
  return {
    type: SET_GUIDE_ERROR,
    payload: {
      guideId,
      language,
      error,
    },
  }
}
