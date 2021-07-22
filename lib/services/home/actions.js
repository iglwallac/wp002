import { get as getData } from 'services/home'

export const SET_HOME_PROCESSING = 'SET_HOME_PROCESSING'
export const SET_HOME_DATA = 'SET_HOME_DATA'
export const SET_HOME_SCROLL_TO = 'SET_HOME_SCROLL_TO'

export function getHomeData (options) {
  return function getHomeDataThunk (dispatch) {
    dispatch(setHomeProcessing(true))

    getData(options).then((data) => {
      dispatch(setHomeData(data, false))
      return data
    })
  }
}

export function setHomeProcessing (data) {
  return {
    type: SET_HOME_PROCESSING,
    payload: data,
  }
}

export function setHomeData (data, processing) {
  return {
    type: SET_HOME_DATA,
    payload: { data, processing },
  }
}

export function setHomeScrollTo (data) {
  return {
    type: SET_HOME_SCROLL_TO,
    payload: data,
  }
}
