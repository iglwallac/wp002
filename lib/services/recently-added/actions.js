import { getRecentlyAdded } from 'services/recently-added'

export const SET_RECENTLY_ADDED_DATA = 'SET_RECENTLY_ADDED_DATA'
export const RESET_RECENTLY_ADDED_DATA = 'RESET_RECENTLY_ADDED_DATA'

export function getRecentlyAddedData (locale) {
  return async function getRecentlyAddedDataThunk (dispatch) {
    const data = await getRecentlyAdded({ locale })
    dispatch(setRecentlyAddedData(data))
  }
}

export function resetRecentlyAddedData () {
  return {
    type: RESET_RECENTLY_ADDED_DATA,
    payload: {},
  }
}

export function setRecentlyAddedData (data) {
  return {
    type: SET_RECENTLY_ADDED_DATA,
    payload: {
      data,
    },
  }
}
