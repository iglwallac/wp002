import { Promise as BluebirdPromise } from 'bluebird'
import { get as getVideo } from 'services/video'

export const GET_VIDEO_DATA = 'GET_VIDEO_DATA'
export const SET_VIDEO_DATA = 'SET_VIDEO_DATA'
export const SET_VIDEO_PROCESSING = 'SET_VIDEO_PROCESSING'
export const SET_VIDEO_ID_PATH = 'SET_VIDEO_ID_PATH'
export const SET_VIDEO_END_STATE_TIMER_VISIBLE =
  'SET_VIDEO_END_STATE_TIMER_VISIBLE'

export function idIsValid (id, getState) {
  const video = getState().video
  return video.get('id') === null || video.get('id') === id
}

export function getVideoData ({ id, path, auth, language }) {
  return function getVideoDataThunk (dispatch, getState) {
    const state = getState().video
    if (id === state.get('id')) {
      return BluebirdPromise.resolve()
    }
    dispatch(setVideoIdPath(id, path))
    // NOTE: the original call appears to have passed 'path' into the 'auth' parameter
    // 'path' is not used by get (getVideo)
    // const getPromise = get(id, path, auth)
    return getVideo({ id, auth, language })
      .then((data) => {
        if (idIsValid(data.id, getState)) {
          dispatch(setVideoData(data))
        }
        return data
      })
      .catch(() => {
        if (idIsValid(id, getState)) {
          dispatch(setVideoProcessing(false))
        }
      })
  }
}

export function setVideoData (data, processing = false) {
  return {
    type: SET_VIDEO_DATA,
    payload: { data, processing },
  }
}

export function setVideoProcessing (value) {
  return {
    type: SET_VIDEO_PROCESSING,
    payload: value,
  }
}

export function setVideoIdPath (id, path, processing = true) {
  return {
    type: SET_VIDEO_ID_PATH,
    payload: { id, path, processing },
  }
}

export function setVideoEndStateTimerVisible (value) {
  return {
    type: SET_VIDEO_END_STATE_TIMER_VISIBLE,
    payload: value,
  }
}
