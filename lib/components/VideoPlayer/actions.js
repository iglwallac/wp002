import { Promise as BluebirdPromise } from 'bluebird'

export const SET_VIDEO_PLAYER_DATA = 'SET_VIDEO_PLAYER_DATA'
export const SET_VIDEO_PLAYER_LOADING = 'SET_VIDEO_PLAYER_LOADING'
export const SET_VIDEO_PLAYER_VIDEO_BASIC_VISIBLE =
  'SET_VIDEO_PLAYER_VIDEO_BASIC_VISIBLE'
export const SET_VIDEO_PLAYER_PROCESSING = 'SET_VIDEO_PLAYER_PROCESSING'
export const SET_VIDEO_PLAYER_META_VISIBLE = 'SET_VIDEO_PLAYER_META_VISIBLE'
export const SET_VIDEO_PLAYER_HEARTS_VISIBLE = 'SET_VIDEO_PLAYER_HEARTS_VISIBLE'
export const SET_VIDEO_PLAYER_META_MORE_VISIBLE =
  'SET_VIDEO_PLAYER_META_MORE_VISIBLE'
export const TOGGLE_VIDEO_PLAYER_META_MORE_VISIBLE =
  'TOGGLE_VIDEO_PLAYER_META_MORE_VISIBLE'
export const SET_VIDEO_PLAYER_META_AUTO_HIDE = 'SET_VIDEO_PLAYER_META_AUTO_HIDE'
export const SET_VIDEO_PLAYER_ENDED = 'SET_VIDEO_PLAYER_ENDED'
export const SET_VIDEO_PLAYER_FULL_SCREEN = 'SET_VIDEO_PLAYER_FULL_SCREEN'

export function setVideoPlayerFullscreen (fullscreen) {
  return {
    type: SET_VIDEO_PLAYER_FULL_SCREEN,
    payload: {
      fullscreen,
    },
  }
}

export function setVideoPlayerEnded (ended) {
  return {
    type: SET_VIDEO_PLAYER_ENDED,
    payload: {
      ended,
    },
  }
}

export function setVideoPlayerData (data) {
  return {
    type: SET_VIDEO_PLAYER_DATA,
    payload: data,
  }
}

export function setVideoPlayerLoading (value) {
  return {
    type: SET_VIDEO_PLAYER_LOADING,
    payload: value,
  }
}

export function setVideoPlayerVideoBasicVisible (value) {
  return {
    type: SET_VIDEO_PLAYER_VIDEO_BASIC_VISIBLE,
    payload: value,
  }
}

export function setVideoPlayerProcessing (value) {
  return {
    type: SET_VIDEO_PLAYER_PROCESSING,
    payload: value,
  }
}

export function setVideoPlayerMetaVisible (value) {
  return {
    type: SET_VIDEO_PLAYER_META_VISIBLE,
    payload: value,
  }
}

export function setVideoPlayerHeartsVisible (value) {
  return {
    type: SET_VIDEO_PLAYER_HEARTS_VISIBLE,
    payload: value,
  }
}

export function toggleVideoPlayerMetaMoreVisible () {
  return {
    type: TOGGLE_VIDEO_PLAYER_META_MORE_VISIBLE,
  }
}

export function setVideoPlayerMetaMoreVisible (value) {
  return {
    type: SET_VIDEO_PLAYER_META_MORE_VISIBLE,
    payload: value,
  }
}

export function setVideoPlayerMetaAutoHide (value) {
  return {
    type: SET_VIDEO_PLAYER_META_AUTO_HIDE,
    payload: value,
  }
}

export function setVideoPlayerMetaAutoHideVisibility (
  value,
  stateKey = 'videoPlayer',
) {
  return function setVideoPlayerMetaAutoHideVisibilityThunk (
    dispatch,
    getState,
  ) {
    dispatch(setVideoPlayerHeartsVisible(value))
    if (getState()[stateKey].get('metaAutoHide', true)) {
      dispatch(setVideoPlayerMetaVisible(value))
    }
    return BluebirdPromise.resolve(true)
  }
}
