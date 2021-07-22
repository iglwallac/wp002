import { List } from 'immutable'
import { getPlaceholderTitles } from 'services/tiles'
import { legacyBatchGet as getUserNodeInfo } from 'services/user-node-info'

import {
  get as getMemberHome,
} from 'services/member-home'

export const GET_MEMBER_HOME_DATA = 'GET_MEMBER_HOME_DATA'
export const SET_MEMBER_HOME_DATA = 'SET_MEMBER_HOME_DATA'
export const RESET_MEMBER_HOME_DATA = 'RESET_MEMBER_HOME_DATA'
export const SET_MEMBER_HOME_PROCESSING = 'SET_MEMBER_HOME_PROCESSING'
export const SET_MEMBER_HOME_USER_INFO_PROCESSING =
  'SET_MEMBER_HOME_USER_INFO_PROCESSING'
export const SET_MEMBER_HOME_TILE_ACTIVE_ID = 'SET_MEMBER_HOME_TILE_ACTIVE_ID'
export const SET_MEMBER_HOME_TILE_ROW_ACTIVE_ID =
  'SET_MEMBER_HOME_TILE_ROW_ACTIVE_ID'
export const SET_MEMBER_HOME_SCROLLABLE_TILE_INDEX =
  'SET_MEMBER_HOME_SCROLLABLE_TILE_INDEX'
export const SET_MEMBER_HOME_SCROLLABLE_ROW_WIDTH =
  'SET_MEMBER_HOME_SCROLLABLE_ROW_WIDTH'
export const APPEND_MEMBER_HOME_DATA_USER_INFO =
  'APPEND_MEMBER_HOME_DATA_USER_INFO'
export const SET_MEMBER_HOME_ROW_COUNT = 'SET_MEMBER_HOME_ROW_COUNT'
export const DELETE_MEMBER_HOME_ROW = 'DELETE_MEMBER_HOME_ROW'
export const UPDATE_ROW_EDIT_MODE = 'UPDATE_ROW_EDIT_MODE'
export const ADD_TILE_ROW_REMOVAL = 'ADD_TILE_ROW_REMOVAL'
export const UNDO_TILE_ROW_REMOVAL = 'UNDO_TILE_ROW_REMOVAL'
export const SAVE_ROW_EDITS = 'SAVE_ROW_EDITS'
export const SET_CONSOLIDATED_CONTINUE_WATCHING_DATA = 'SET_CONSOLIDATED_CONTINUE_WATCHING_DATA'

function getPlaceholderData (tileCount = 8) {
  return { rows: [{ title: '', payload: getPlaceholderTitles(tileCount) }] }
}

export function saveRowEdits (options = {}) {
  const { index, removals = List() } = options
  return {
    type: SAVE_ROW_EDITS,
    payload: { index, removals },
  }
}

export function updateRowEditMode (options = {}) {
  const { index = null, mode = '' } = options
  return {
    type: UPDATE_ROW_EDIT_MODE,
    payload: { index, mode },
  }
}

export function addTileRowRemoval (options = {}) {
  const { rowIndex, id } = options
  return {
    type: ADD_TILE_ROW_REMOVAL,
    payload: { rowIndex, id },
  }
}

export function undoTileRowRemoval (options = {}) {
  const { rowIndex, id } = options
  return {
    type: UNDO_TILE_ROW_REMOVAL,
    payload: { rowIndex, id },
  }
}

export function getMemberHomeData (options) {
  const { auth, disableImpressionCount } = options
  return function getMemberHomeDataThunk (dispatch, getState) {
    const { user } = getState()
    const userLanguage = user.getIn(['data', 'language'], List())

    if (userLanguage.get(0) === 'en') return null

    const language = userLanguage.size > 0 ? userLanguage.toJS() : undefined
    const memberHomeOptions = { language, user, auth, disableImpressionCount }
    dispatch(setMemberHomeData(getPlaceholderData(8), true))
    return getMemberHome(memberHomeOptions)
      .then((data) => {
        dispatch(setMemberHomeData(data, false))
        return data
      })
  }
}

export function setMemberHomeData (data, processing = false) {
  return {
    type: SET_MEMBER_HOME_DATA,
    payload: { data, processing },
  }
}

export function resetMemberHomeData () {
  return {
    type: RESET_MEMBER_HOME_DATA,
  }
}

export function setMemberHomeProcessing (value) {
  return {
    type: SET_MEMBER_HOME_PROCESSING,
    payload: value,
  }
}

export function setMemberHomeUserInfoProcessing (value) {
  return {
    type: SET_MEMBER_HOME_USER_INFO_PROCESSING,
    payload: value,
  }
}

export function setMemberHomeTileActiveId (value) {
  return {
    type: SET_MEMBER_HOME_TILE_ACTIVE_ID,
    payload: value,
  }
}

export function setMemberHomeTileRowActiveId (value) {
  return {
    type: SET_MEMBER_HOME_TILE_ROW_ACTIVE_ID,
    payload: value,
  }
}

export function setMemberHomeScrollableTileIndex (rowId, index) {
  return {
    type: SET_MEMBER_HOME_SCROLLABLE_TILE_INDEX,
    payload: { index, rowId },
  }
}

export function setMemberHomeScrollableRowWidth (value) {
  return {
    type: SET_MEMBER_HOME_SCROLLABLE_ROW_WIDTH,
    payload: value,
  }
}

export function getMemberHomeDataUserInfo (ids, auth) {
  return function getMemberHomeDataUserInfoThunk (dispatch) {
    dispatch(setMemberHomeUserInfoProcessing(true))
    return getUserNodeInfo({ ids, auth }).then((data) => {
      dispatch(appendMemberHomeDataUserInfo(data))
      return data
    })
  }
}

export function appendMemberHomeDataUserInfo (userInfo, processing = false) {
  return {
    type: APPEND_MEMBER_HOME_DATA_USER_INFO,
    payload: { userInfo, processing },
  }
}

export function setMemberHomeRowCount (value) {
  return {
    type: SET_MEMBER_HOME_ROW_COUNT,
    payload: value,
  }
}

export function deleteMemberHomeRow (rowIndex) {
  return {
    type: DELETE_MEMBER_HOME_ROW,
    payload: rowIndex,
  }
}

/**
 * SKUNK 152 - Replace Continue Watching data in the consolidated row
 * @param {[type]} data [description]
 */
export function setConsolidatedContinueWatchingData (data) {
  return {
    type: SET_CONSOLIDATED_CONTINUE_WATCHING_DATA,
    payload: data,
  }
}
