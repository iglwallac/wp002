import { get as getLanguages } from './index'

export const SET_LANGUAGES = 'SET_LANGUAGES'
export const SET_LANGUAGE_PROCESSING = 'SET_LANGUAGE_PROCESSING'

export function getLanguagesData () {
  return function getLanguagesDataThunk (dispatch) {
    dispatch(setLanguageProcessing(true))
    return getLanguages().then((data) => {
      dispatch(setLanguages(data))
      return data
    })
  }
}

export function setLanguageProcessing (value) {
  return {
    type: SET_LANGUAGE_PROCESSING,
    payload: value,
  }
}

export function setLanguages (data, processing = false) {
  return {
    type: SET_LANGUAGES,
    payload: { data, processing },
  }
}
