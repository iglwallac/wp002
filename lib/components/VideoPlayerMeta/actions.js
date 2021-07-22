export const SET_VIDEO_PLAYER_META_VISIBLE = 'SET_VIDEO_PLAYER_META_VISIBLE'
export const SET_VIDEO_PLAYER_META_MORE_VISIBLE =
  'SET_VIDEO_PLAYER_META_MORE_VISIBLE'
export const TOGGLE_VIDEO_PLAYER_META_MORE_VISIBLE =
  'TOGGLE_VIDEO_PLAYER_META_MORE_VISIBLE'
export const SET_VIDEO_PLAYER_META_AUTO_HIDE = 'SET_VIDEO_PLAYER_META_AUTO_HIDE'

export function setVideoPlayerMetaVisible (value) {
  return {
    type: SET_VIDEO_PLAYER_META_VISIBLE,
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

export function setVideoPlayerMetaAutoHideVisibility (value) {
  return function setVideoPlayerMetaAutoHideVisibilityThunk (
    dispatch,
    getState,
  ) {
    if (getState().videoPlayerMeta.get('autoHide', true)) {
      dispatch(setVideoPlayerMetaVisible(value))
    }
  }
}
