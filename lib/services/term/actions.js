export const GET_PM_MULTIPLE_TERMS = 'GET_PM_MULTIPLE_TERMS'
export const GET_PM_TERM = 'GET_PM_TERM'
export const SET_PM_MULTIPLE_TERMS = 'SET_PM_MULTIPLE_TERMS'
export const SET_PM_TERM = 'SET_PM_TERM'
export const SET_PM_TERM_ERROR = 'SET_PM_TERM_ERROR'
export const SET_PM_TERM_IMPRESSION_DATA = 'SET_PM_TERM_IMPRESSION_DATA'
export const CLEAR_PM_TERMS_IMPRESSION_DATA = 'CLEAR_PM_TERMS_IMPRESSION_DATA'


export function getMultipleTerms (termIds, language) {
  return {
    type: GET_PM_MULTIPLE_TERMS,
    payload: { termIds, language },
  }
}

export function getTerm (termId, language) {
  return {
    type: GET_PM_TERM,
    payload: { termId, language },
  }
}

export function setMultipleTerms (termIds, language, data) {
  return {
    type: SET_PM_MULTIPLE_TERMS,
    payload: {
      termIds,
      language,
      data,
    },
  }
}

export function setTerm (termId, language, data) {
  return {
    type: SET_PM_TERM,
    payload: {
      termId,
      language,
      data,
    },
  }
}

export function setTermError (termId, language, error) {
  return {
    type: SET_PM_TERM_ERROR,
    payload: {
      termId,
      language,
      error,
    },
  }
}

export function setTermImpressionData (termId, language) {
  return {
    type: SET_PM_TERM_IMPRESSION_DATA,
    payload: { termId, language },
  }
}


export function clearTermsImpressionData (language) {
  return {
    type: CLEAR_PM_TERMS_IMPRESSION_DATA,
    payload: { language },
  }
}

