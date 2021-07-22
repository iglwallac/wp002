export const GET_MULTIPLE_PM_SERIES = 'GET_MULTIPLE_PM_SERIES'
export const GET_PM_SERIES = 'GET_PM_SERIES'
export const SET_PM_MULTIPLE_SERIES = 'SET_PM_MULTIPLE_SERIES'
export const SET_PM_SERIES = 'SET_PM_SERIES'
export const SET_PM_SERIES_ERROR = 'SET_PM_SERIES_ERROR'
export const SET_PM_SERIES_IMPRESSION_DATA = 'SET_PM_SERIES_IMPRESSION_DATA'
export const CLEAR_PM_SERIES_IMPRESSION_DATA = 'CLEAR_PM_SERIES_IMPRESSION_DATA'

export function getMultipleSeries (seriesIds, language) {
  return {
    type: GET_MULTIPLE_PM_SERIES,
    payload: { seriesIds, language },
  }
}

export function getSeries (seriesId, language) {
  return {
    type: GET_PM_SERIES,
    payload: { seriesId, language },
  }
}

export function setMultipleSeries (seriesIds, language, data) {
  return {
    type: SET_PM_MULTIPLE_SERIES,
    payload: {
      seriesIds,
      language,
      data,
    },
  }
}

export function setSeries (seriesId, language, data) {
  return {
    type: SET_PM_SERIES,
    payload: {
      seriesId,
      language,
      data,
    },
  }
}

export function setSeriesError (seriesId, language, error) {
  return {
    type: SET_PM_SERIES_ERROR,
    payload: {
      seriesId,
      language,
      error,
    },
  }
}

export function setSeriesImpressionData (seriesId, language) {
  return {
    type: SET_PM_SERIES_IMPRESSION_DATA,
    payload: { seriesId, language },
  }
}

export function clearSeriesImpressionData (language) {
  return {
    type: CLEAR_PM_SERIES_IMPRESSION_DATA,
    payload: { language },
  }
}
