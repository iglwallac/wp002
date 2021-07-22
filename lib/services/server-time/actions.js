import { get as getServerTime } from 'services/server-time'

export const SET_SERVER_TIME_DATA = 'SET_SERVER_TIME_DATA'
export const SET_SERVER_TIME_PROCESSING = 'SET_SERVER_TIME_PROCESSING'

export function getServerTimeData (options = {}) {
  return async function getServerTimeDataThunk (dispatch) {
    const { clientTimeMs } = options
    dispatch(setServerTimeProcessing(true))
    try {
      const data = await getServerTime({ clientTimeMs })
      dispatch(setServerTimeData(data))
      return data
    } catch (e) {
      dispatch(setServerTimeProcessing(false))
      return {}
    }
  }
}

export function setServerTimeData (data, processing = false) {
  return {
    type: SET_SERVER_TIME_DATA,
    payload: { data, processing },
  }
}

export function setServerTimeProcessing (processing) {
  return {
    type: SET_SERVER_TIME_PROCESSING,
    payload: processing,
  }
}
