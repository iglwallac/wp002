import { Map } from 'immutable'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'
import { getPlacementContent } from './index'

export const GET_PLACEMENT_CONTENT_DATA = 'GET_PLACEMENT_CONTENT_DATA'
export const SET_PLACEMENT_CONTENT_DATA = 'SET_PLACEMENT_CONTENT_DATA'
export const PLACEMENT_CONTENT_DATA_PROCESSING = 'PLACEMENT_CONTENT_DATA_PROCESSING'
export const SET_PLACEMENT_CONTENT_USER_INFO_PROCESSING = 'SET_PLACEMENT_CONTENT_USER_INFO_PROCESSING'
export const APPEND_PLACEMENT_CONTENT_USER_INFO_DATA = 'APPEND_PLACEMENT_CONTENT_USER_INFO_DATA'

export function getPlacementContentData ({ auth, tid, language }) {
  return async function getPlacementContentDataThunk (dispatch) {
    dispatch(PlacementContentDataProcessing(true))
    const data = await getPlacementContent({ auth, tid, language })
    dispatch(setPlacementContentData(data))
    const titles = data.getIn(['data', 'titles'], Map())
    const ids = titles.map(title => title.get('nid')).toJS()
    dispatch(getPlacementContentUserInfoData({ ids, auth }))
    return data
  }
}

export function getPlacementContentUserInfoData ({ ids, auth }) {
  return async function getPlacementContentUserInfoDataThunk (dispatch) {
    dispatch(setPlacementContentUserInfoProcessing(true))
    const data = await getUserNodeInfo({ ids, auth })
    dispatch(appendPlacementContentUserInfo(data))
    return data
  }
}

export function setPlacementContentData (data) {
  return {
    type: SET_PLACEMENT_CONTENT_DATA,
    payload: data,
  }
}

export function PlacementContentDataProcessing (value) {
  return {
    type: PLACEMENT_CONTENT_DATA_PROCESSING,
    payload: value,
  }
}

export function setPlacementContentUserInfoProcessing (value) {
  return {
    type: SET_PLACEMENT_CONTENT_USER_INFO_PROCESSING,
    payload: value,
  }
}

export function appendPlacementContentUserInfo (
  userInfo,
  featuredUserInfoProcessing = false,
) {
  return {
    type: APPEND_PLACEMENT_CONTENT_USER_INFO_DATA,
    payload: { userInfo, featuredUserInfoProcessing },
  }
}
