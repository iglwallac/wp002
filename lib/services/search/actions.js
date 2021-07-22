// Autocomplete "fuzzy" Search
export const GET_AUTOCOMPLETE_SEARCH_DATA = 'GET_AUTOCOMPLETE_SEARCH_DATA'
export const SET_AUTOCOMPLETE_SEARCH_DATA = 'SET_AUTOCOMPLETE_SEARCH_DATA'
export const SET_AUTOCOMPLETE_SEARCH_ERROR = 'SET_AUTOCOMPLETE_SEARCH_ERROR'
export const SET_AUTOCOMPLETE_SEARCH_PROCESSING = 'SET_AUTOCOMPLETE_SEARCH_PROCESSING'

// Content Search
export const GET_SEARCH_CONTENT = 'GET_SEARCH_CONTENT'
export const SET_SEARCH_CONTENT = 'SET_SEARCH_CONTENT'
export const UPDATE_SEARCH_PAGINATION = 'UPDATE_SEARCH_PAGINATION'
export const SET_SEARCH_PAGINATION = 'SET_SEARCH_PAGINATION'

export function getAutoCompleteSearchData (value) {
  return {
    type: GET_AUTOCOMPLETE_SEARCH_DATA,
    payload: value,
  }
}

export function setAutoCompleteSearchData ({ data }) {
  return {
    type: SET_AUTOCOMPLETE_SEARCH_DATA,
    payload: { data },
  }
}

export function setAutoCompleteSearchError ({ error }) {
  return {
    type: SET_AUTOCOMPLETE_SEARCH_ERROR,
    payload: { error },
  }
}

export function setAutoCompleteSearchProcessing ({ processing = true }) {
  return {
    type: SET_AUTOCOMPLETE_SEARCH_PROCESSING,
    payload: { processing },
  }
}

export function searchContent ({ contentType, page, searchTerm, limit }) {
  return {
    type: GET_SEARCH_CONTENT,
    payload: { contentType, searchTerm, limit, page },
  }
}
