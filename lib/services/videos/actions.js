export const GET_PM_MULTIPLE_VIDEOS = 'GET_PM_MULTIPLE_VIDEOS'
export const GET_PM_VIDEO = 'GET_PM_VIDEO'
export const SET_PM_MULTIPLE_VIDEOS = 'SET_PM_MULTIPLE_VIDEOS'
export const SET_PM_VIDEO = 'SET_PM_VIDEO'
export const SET_PM_VIDEO_ERROR = 'SET_PM_VIDEO_ERROR'
export const SET_PM_VIDEO_IMPRESSION_DATA = 'SET_PM_VIDEO_IMPRESSION_DATA'
export const CLEAR_PM_VIDEOS_IMPRESSION_DATA = 'CLEAR_PM_VIDEOS_IMPRESSION_DATA'


export function getMultipleVideos (videoIds, language) {
  return {
    type: GET_PM_MULTIPLE_VIDEOS,
    payload: { videoIds, language },
  }
}

export function getVideo (videoId, language) {
  return {
    type: GET_PM_VIDEO,
    payload: { videoId, language },
  }
}

export function setMultipleVideos (videoIds, language, data) {
  return {
    type: SET_PM_MULTIPLE_VIDEOS,
    payload: {
      videoIds,
      language,
      data,
    },
  }
}

export function setVideo (videoId, language, data) {
  return {
    type: SET_PM_VIDEO,
    payload: {
      videoId,
      language,
      data,
    },
  }
}

export function setVideoError (videoId, language, error) {
  return {
    type: SET_PM_VIDEO_ERROR,
    payload: {
      videoId,
      language,
      error,
    },
  }
}

export function setVideoImpressionData (videoId, language) {
  return {
    type: SET_PM_VIDEO_IMPRESSION_DATA,
    payload: { videoId, language },
  }
}


export function clearVideosImpressionData (language) {
  return {
    type: CLEAR_PM_VIDEOS_IMPRESSION_DATA,
    payload: { language },
  }
}

