import { Map } from 'immutable'
import { get as getMedia } from 'services/media'

export const GET_MEDIA_DATA = 'GET_MEDIA_DATA'
export const SET_MEDIA_DATA = 'SET_MEDIA_DATA'
export const SET_MEDIA_ID_PATH = 'SET_MEDIA_ID_PATH'
export const SET_MEDIA_PROCESSING = 'SET_MEDIA_PROCESSING'
export const SET_MEDIA_LANG = 'SET_MEDIA_LANG'
export const RESET_MEDIA = 'RESET_MEDIA'

export function getMediaData (options = {}) {
  const { id, path, auth, user = Map() } = options
  return async function getMediaDataThunk (dispatch) {
    try {
      dispatch(setMediaIdPath(id, path))
      const data = await getMedia({ id, auth, user })
      dispatch(setMediaData(data))
      return data
    } catch (e) {
      dispatch(setMediaProcessing(false))
    }
    return {}
  }
}

export function setMediaData (data, processing = false) {
  return {
    type: SET_MEDIA_DATA,
    payload: { data, processing },
  }
}

export function setMediaLang (lang) {
  return {
    type: SET_MEDIA_LANG,
    payload: lang,
  }
}

export function setMediaIdPath (id, path, processing = true) {
  return {
    type: SET_MEDIA_ID_PATH,
    payload: { id, path, processing },
  }
}

export function setMediaProcessing (value) {
  return {
    type: SET_MEDIA_PROCESSING,
    payload: value,
  }
}

export function resetMedia () {
  return {
    type: RESET_MEDIA,
  }
}
