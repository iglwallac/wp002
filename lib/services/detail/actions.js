import { get as getDetail, getPlaceholder } from 'services/detail'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'

export const GET_DETAIL_DATA = 'GET_DETAIL_DATA'
export const SET_DETAIL_DATA = 'SET_DETAIL_DATA'
export const SET_DETAIL_DATA_PLACEHOLDER = 'SET_DETAIL_DATA_PLACEHOLDER'
export const SET_DETAIL_ID_PATH_TYPE = 'SET_DETAIL_ID_PATH_TYPE'
export const SET_DETAIL_TILES_ACTIVE_ROW_ID = 'SET_DETAIL_TILES_ACTIVE_ROW_ID'
export const SET_DETAIL_PROCESSING = 'SET_DETAIL_PROCESSING'
export const SET_DETAIL_USER_INFO_PROCESSING = 'SET_DETAIL_USER_INFO_PROCESSING'
export const SET_DETAIL_FEATURED_USER_INFO_PROCESSING =
  'SET_DETAIL_FEATURED_USER_INFO_PROCESSING'
export const APPEND_DETAIL_DATA_USER_INFO = 'APPEND_DETAIL_DATA_USER_INFO'
export const APPEND_DETAIL_DATA_FEATURED_USER_INFO =
  'APPEND_DETAIL_DATA_FEATURED_USER_INFO'
export const DELETE_DETAIL_DATA_USER_INFO = 'DELETE_DETAIL_DATA_USER_INFO'
export const RESET_DETAIL_DATA = 'RESET_DETAIL_DATA'

export function getDetailData (options) {
  const { id, path, type, auth, language } = options
  return function getDetailDataThunk (dispatch) {
    dispatch(setDetailIdPathType(id, path, type))
    return getDetail({ id, auth, language }).then((data) => {
      dispatch(setDetailData(data))
      return data
    })
  }
}

export function resetDetailData () {
  return {
    type: RESET_DETAIL_DATA,
    payload: {},
  }
}

export function setDetailData (data, processing = false) {
  return {
    type: SET_DETAIL_DATA,
    payload: { data, processing },
  }
}

export function setDetailDataPlaceholder (processing = true) {
  return {
    type: SET_DETAIL_DATA_PLACEHOLDER,
    payload: { data: getPlaceholder(), processing },
  }
}

export function setDetailIdPathType (id, path, type, processing = true) {
  return {
    type: SET_DETAIL_ID_PATH_TYPE,
    payload: { id, path, type, processing },
  }
}

export function setDetailTilesActiveRowId (value) {
  return {
    type: SET_DETAIL_TILES_ACTIVE_ROW_ID,
    payload: value,
  }
}

export function setDetailProcessing (value) {
  return {
    type: SET_DETAIL_PROCESSING,
    payload: value,
  }
}

export function setDetailUserInfoProcessing (value) {
  return {
    type: SET_DETAIL_USER_INFO_PROCESSING,
    payload: value,
  }
}

export function setDetailFeaturedUserInfoProcessing (value) {
  return {
    type: SET_DETAIL_FEATURED_USER_INFO_PROCESSING,
    payload: value,
  }
}

export function getDetailDataUserInfo (ids, auth) {
  return function getDetailDataUserInfoThunk (dispatch) {
    dispatch(setDetailUserInfoProcessing(true))
    return getUserNodeInfo({ ids, auth }).then((data) => {
      dispatch(appendDetailDataUserInfo(data))
      return data
    })
  }
}

export function getDetailDataFeaturedUserInfo (ids, auth) {
  return function getDetailDataFeaturedUserInfoThunk (dispatch) {
    dispatch(setDetailFeaturedUserInfoProcessing(true))
    return getUserNodeInfo({ ids, auth }).then((data) => {
      dispatch(appendDetailDataFeaturedUserInfo(data))
      return data
    })
  }
}

export function appendDetailDataUserInfo (userInfo, userInfoProcessing = false) {
  return {
    type: APPEND_DETAIL_DATA_USER_INFO,
    payload: { userInfo, userInfoProcessing },
  }
}

export function appendDetailDataFeaturedUserInfo (
  userInfo,
  featuredUserInfoProcessing = false,
) {
  return {
    type: APPEND_DETAIL_DATA_FEATURED_USER_INFO,
    payload: { userInfo, featuredUserInfoProcessing },
  }
}

export function deleteDetailDataUserInfo () {
  return {
    type: DELETE_DETAIL_DATA_USER_INFO,
  }
}
