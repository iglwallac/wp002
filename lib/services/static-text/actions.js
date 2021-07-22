import { get as getStaticText } from './index'

export const SET_STATIC_TEXT_DATA = 'SET_STATIC_TEXT_DATA'
export const SET_STATIC_TEXT_PROCESSING = 'SET_STATIC_TEXT_PROCESSING'

export function getStaticTextData (language) {
  return function getStaticTextDataThunk (dispatch) {
    dispatch(setStaticTextProcessing(true))
    return getStaticText({ language }).then((data) => {
      dispatch(setStaticTextData(data))
      return data
    })
  }
}

export function setStaticTextProcessing (value) {
  return {
    type: SET_STATIC_TEXT_PROCESSING,
    payload: value,
  }
}

export function setStaticTextData (data, processing = false) {
  return {
    type: SET_STATIC_TEXT_DATA,
    payload: { data, processing },
  }
}
