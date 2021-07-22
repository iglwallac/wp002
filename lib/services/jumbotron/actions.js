import _get from 'lodash/get'
import { List, Map, fromJS } from 'immutable'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'
import { getMediaData } from 'services/media/actions'
import { setInPlaylist } from 'services/playlist'
import { RESOLVER_TYPE_SUBCATEGORY } from 'services/resolver/types'
import { getPlaceholder, get as getJumbotron } from 'services/jumbotron'
import { isFeatureAllowedWithSubscription } from 'services/subscription'
import { authExists } from 'services/auth'

export const GET_JUMBOTRON_DATA = 'GET_JUMBOTRON_DATA'
export const SET_JUMBOTRON_DATA = 'SET_JUMBOTRON_DATA'
export const RESET_JUMBOTRON_DATA = 'RESET_JUMBOTRON_DATA'
export const SET_JUMBOTRON_DATA_PLACEHOLDER = 'SET_JUMBOTRON_DATA_PLACEHOLDER'
export const SET_JUMBOTRON_PROCESSING = 'SET_JUMBOTRON_PROCESSING'
export const SET_JUMBOTRON_ID_TYPE_PATH = 'SET_JUMBOTRON_ID_TYPE_PATH'
export const SET_JUMBOTRON_USER_INFO_PROCESSING =
  'SET_JUMBOTRON_USER_INFO_PROCESSING'
export const SET_JUMBOTRON_USER_PLAYLIST = 'SET_JUMBOTRON_USER_PLAYLIST'
export const APPEND_JUMBOTRON_DATA_USER_INFO = 'APPEND_JUMBOTRON_DATA_USER_INFO'

export function getJumbotronData (storeKey, id, type, path, auth, user = Map()) {
  return async function getJumbotronDataThunk (dispatch) {
    const language = user.getIn(['data', 'language'], List())
    dispatch(setJumbotronIdTypePath(storeKey, id, type, path))
    const data = await getJumbotron({ id, type, auth, language })
    const mediaId = _get(data, 'feature.id') || _get(data, 'preview.id')
    const media = fromJS(_get(data, 'feature') || _get(data, 'preview') || {})
    if (mediaId && isFeatureAllowedWithSubscription(media, auth)) {
      dispatch(getMediaData({ id: mediaId, auth, user }))
    }
    dispatch(setJumbotronData(storeKey, data))
    if (authExists(auth) && type !== RESOLVER_TYPE_SUBCATEGORY) {
      dispatch(getJumbotronDataUserInfo(storeKey, [data.id], auth))
    }
    return data
  }
}

export function setJumbotronData (storeKey, data, processing = false) {
  return {
    type: SET_JUMBOTRON_DATA,
    payload: { storeKey, data, processing },
  }
}

export function resetJumbotronData () {
  return {
    type: RESET_JUMBOTRON_DATA,
  }
}

export function setJumbotronDataPlaceholder (
  storeKey,
  placeholder = getPlaceholder(),
) {
  return {
    type: SET_JUMBOTRON_DATA_PLACEHOLDER,
    payload: { storeKey, placeholder },
  }
}

export function setJumbotronProcessing (storeKey, processing) {
  return {
    type: SET_JUMBOTRON_PROCESSING,
    payload: { storeKey, processing },
  }
}

export function setJumbotronIdTypePath (
  storeKey,
  id,
  type,
  path,
  processing = true,
) {
  return {
    type: SET_JUMBOTRON_ID_TYPE_PATH,
    payload: { storeKey, id, type, path, processing },
  }
}

export function setJumbotronUserInfoProcessing (storeKey, userInfoProcessing) {
  return {
    type: SET_JUMBOTRON_USER_INFO_PROCESSING,
    payload: { storeKey, userInfoProcessing },
  }
}

export function setJumbotronDataUserPlaylist (storeKey, id, inPlaylist, auth) {
  return function setJumbotronDataUserPlaylistThunk (dispatch) {
    dispatch(setJumbotronUserInfoProcessing(storeKey, true))
    dispatch(setJumbotronUserPlaylist(storeKey, inPlaylist))
    return setInPlaylist({ id, inPlaylist, auth })
      .catch(() => {
        // We got an error so reset the state of the playlist
        dispatch(setJumbotronUserPlaylist(storeKey, !inPlaylist))
      })
      .finally(() => {
        dispatch(setJumbotronUserInfoProcessing(storeKey, false))
      })
  }
}

export function setJumbotronUserPlaylist (storeKey, playlist) {
  return {
    type: SET_JUMBOTRON_USER_PLAYLIST,
    payload: { storeKey, playlist },
  }
}

export function getJumbotronDataUserInfo (storeKey, ids, auth) {
  return async function getJumbotronDataUserInfoThunk (dispatch) {
    try {
      dispatch(setJumbotronUserInfoProcessing(storeKey, true))
      const data = await getUserNodeInfo({ ids, auth })
      dispatch(appendJumbotronDataUserInfo(storeKey, data))
      return data
    } catch (e) {
      // Do nothing
    }
    return {}
  }
}

export function appendJumbotronDataUserInfo (
  storeKey,
  userInfo,
  userInfoProcessing = false,
) {
  return {
    type: APPEND_JUMBOTRON_DATA_USER_INFO,
    payload: { storeKey, userInfo, userInfoProcessing },
  }
}
