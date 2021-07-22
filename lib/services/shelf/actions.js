import _get from 'lodash/get'
import { get, getPlaceholder, TYPE_TAB_OVERVIEW } from 'services/shelf'
import { getMediaData } from 'services/media/actions'
import { isFeatureAllowedWithSubscription } from 'services/subscription'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'
import { setInPlaylist } from 'services/playlist'
import { authExists } from 'services/auth'
import { fromJS } from 'immutable'

export const GET_SHELF_DATA = 'GET_SHELF_DATA'
export const SET_SHELF_DATA = 'SET_SHELF_DATA'
export const SET_SHELF_DATA_PLACEHOLDER = 'SET_SHELF_DATA_PLACEHOLDER'
export const SET_SHELF_PROCESSING = 'SET_SHELF_PROCESSING'
export const SET_SHELF_LANGUAGE = 'SET_SHELF_LANGUAGE'
export const SET_SHELF_ID_TYPE_ACTIVE_TAB_PLACEHOLDER =
  'SET_SHELF_ID_TYPE_ACTIVE_TAB_PLACEHOLDER'
export const SET_SHELF_VISIBLE_ID = 'SET_SHELF_VISIBLE_ID'
export const SET_SHELF_VISIBLE = 'SET_SHELF_VISIBLE'
export const SET_SHELF_ACTIVE_TAB = 'SET_SHELF_ACTIVE_TAB'
export const SET_SHELF_USER_INFO_PROCESSING = 'SET_SHELF_USER_INFO_PROCESSING'
export const SET_SHELF_USER_PLAYLIST = 'SET_SHELF_USER_PLAYLIST'
export const APPEND_SHELF_DATA_USER_INFO = 'APPEND_SHELF_DATA_USER_INFO'
export const SET_SHELF_ANIMATION_STATE = 'SET_SHELF_ANIMATION_STATE'

export function getShelfData (options = {}) {
  return async function getShelfDataThunk (dispatch, getState) {
    const {
      activeTab = TYPE_TAB_OVERVIEW,
      language: explicitLang,
      contentType,
      id,
    } = options

    const { auth: authState, user, shelf } = getState()
    const language = explicitLang || user.getIn(['data', 'language', 0], 'en')
    const auth = authState.get('jwt')

    if (language === shelf.get('language')
      && (id === shelf.get('id') && contentType === shelf.get('type'))) {
      return undefined
    }

    dispatch(
      setShelfIdTypeActiveTabPlaceholder(
        id,
        contentType,
        activeTab,
        getPlaceholder(),
        true,
      ),
    )
    const data = await get({ id, language })
    const mediaId = _get(data, 'feature.id') || _get(data, 'preview.id')
    const media = fromJS(_get(data, 'feature') || _get(data, 'preview') || {})
    if (isFeatureAllowedWithSubscription(media, authState)) {
      dispatch(getMediaData({ id: mediaId, auth, user }))
    }
    dispatch(setShelfLanguage(language))
    dispatch(setShelfData(data))
    if (authExists(auth)) {
      dispatch(getShelfDataUserInfo([data.id], auth))
    }
    return data
  }
}

export function setShelfData (data, processing = false) {
  return {
    type: SET_SHELF_DATA,
    payload: data,
    processing,
  }
}

export function setShelfProcessing (value) {
  return {
    type: SET_SHELF_PROCESSING,
    payload: value,
  }
}

export function setShelfLanguage (value) {
  return {
    type: SET_SHELF_LANGUAGE,
    payload: value,
  }
}

export function setShelfAnimationState (value) {
  return {
    type: SET_SHELF_ANIMATION_STATE,
    payload: value,
  }
}

export function setShelfIdTypeActiveTabPlaceholder (
  id,
  type,
  activeTab,
  placeholder,
  processing = false,
) {
  return {
    type: SET_SHELF_ID_TYPE_ACTIVE_TAB_PLACEHOLDER,
    payload: { id, type, placeholder, activeTab },
    processing,
  }
}

export function setShelfVisibleId (id, visible) {
  return {
    type: SET_SHELF_VISIBLE_ID,
    payload: { id, visible },
  }
}

export function setShelfVisible (value) {
  return {
    type: SET_SHELF_VISIBLE,
    payload: value,
  }
}

export function setShelfDataPlaceholder () {
  return {
    type: SET_SHELF_DATA_PLACEHOLDER,
    payload: getPlaceholder(),
  }
}

export function setShelfActiveTab (value) {
  return {
    type: SET_SHELF_ACTIVE_TAB,
    payload: value,
  }
}

export function setShelfUserInfoProcessing (value) {
  return {
    type: SET_SHELF_USER_INFO_PROCESSING,
    payload: value,
  }
}

export function setShelfDataUserPlaylist (id, inPlaylist, auth) {
  return function setShelfDataUserPlaylistThunk (dispatch) {
    dispatch(setShelfUserInfoProcessing(true))
    dispatch(setShelfUserPlaylist(inPlaylist))
    return setInPlaylist({ id, inPlaylist, auth })
      .catch(() => {
        // We got an error so reset the state of the playlist
        dispatch(setShelfUserPlaylist(!inPlaylist))
      })
      .finally(() => {
        dispatch(setShelfUserInfoProcessing(false))
      })
  }
}

export function setShelfUserPlaylist (value) {
  return {
    type: SET_SHELF_USER_PLAYLIST,
    payload: value,
  }
}

export function getShelfDataUserInfo (ids, auth) {
  return async function getShelfDataUserInfoThunk (dispatch) {
    try {
      dispatch(setShelfUserInfoProcessing(true))
      const data = await getUserNodeInfo({ ids, auth })
      dispatch(appendShelfDataUserInfo(data))
      return data
    } catch (e) {
      dispatch(setShelfUserInfoProcessing(false))
    }
    return {}
  }
}

export function appendShelfDataUserInfo (userInfo, processing = false) {
  return {
    type: APPEND_SHELF_DATA_USER_INFO,
    payload: { userInfo, processing },
  }
}
