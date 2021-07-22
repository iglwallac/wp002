import { get as getUserVideo } from 'services/user-video'

export const GET_USER_VIDEO_DATA = 'GET_USER_VIDEO_DATA'
export const SET_USER_VIDEO_DATA = 'SET_USER_VIDEO_DATA'
export const SET_USER_VIDEO_ID_PATH = 'SET_USER_VIDEO_ID_PATH'
export const SET_USER_VIDEO_PROCESSING = 'SET_USER_VIDEO_PROCESSING'
export const SET_USER_VIDEO_DATA_FEATURE_POSITION =
  'SET_USER_VIDEO_DATA_FEATURE_POSITION'
export const RESET_USER_VIDEO = 'RESET_USER_VIDEO'

export function getUserVideoData (id, path, auth) {
  return async (dispatch) => {
    dispatch(setUserVideoIdPath({ id, path, processing: true }))
    const data = await getUserVideo({ id, auth })
    dispatch(setUserVideoData(data))
    return data
  }
}

export function setUserVideoData (data, processing = false) {
  return {
    type: SET_USER_VIDEO_DATA,
    payload: { data, processing },
  }
}

export function setUserVideoIdPath ({ id, path, processing = true }) {
  return {
    type: SET_USER_VIDEO_ID_PATH,
    payload: { id, path, processing },
  }
}

export function setUserVideoProcessing (value = true) {
  return {
    type: SET_USER_VIDEO_PROCESSING,
    payload: value,
  }
}

export function setUserVideoDataFeaturePosition (value) {
  return {
    type: SET_USER_VIDEO_DATA_FEATURE_POSITION,
    payload: value,
  }
}

export function resetUserVideo () {
  return {
    type: RESET_USER_VIDEO,
  }
}
