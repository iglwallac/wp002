import { Map, List, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SAVE_ROW_EDITS:
      return state.updateIn(['data', 'rows', action.payload.index, 'payload'], List(), (list) => {
        const removals = action.payload.removals
        return list.filter(item => !removals.includes(item.get('id')))
      })
    case actions.UPDATE_ROW_EDIT_MODE:
      return state.setIn(
        ['data', 'rows', action.payload.index, 'rowEditMode'],
        action.payload.mode,
      )
    case actions.ADD_TILE_ROW_REMOVAL:
      return state.updateIn(['data', 'rows', action.payload.rowIndex, 'removalQueue'], List(), (removalQueue) => {
        return removalQueue.push(action.payload.id)
      })
    case actions.UNDO_TILE_ROW_REMOVAL:
      return state.updateIn(['data', 'rows', action.payload.rowIndex, 'removalQueue'], List(), (removalQueue) => {
        return removalQueue.filter(id => id !== action.payload.id)
      })
    case actions.SET_MEMBER_HOME_DATA:
      return state.withMutations(mutateState => mutateState
        .set('data', fromJS(action.payload.data))
        .set('processing', action.payload.processing))
    case actions.RESET_MEMBER_HOME_DATA:
      return state.delete('data')
    case actions.SET_MEMBER_HOME_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_MEMBER_HOME_USER_INFO_PROCESSING:
      return state.set('userInfoProcessing', action.payload)
    case actions.SET_MEMBER_HOME_TILE_ACTIVE_ID:
      return state.set('tileActiveId', action.payload)
    case actions.SET_MEMBER_HOME_SCROLLABLE_TILE_INDEX:
      return state.setIn(
        ['data', 'rows', action.payload.rowId, 'scrollableTileIndex'],
        action.payload.index,
      )
    case actions.SET_MEMBER_HOME_SCROLLABLE_ROW_WIDTH:
      return state.set('scrollableRowWidth', action.payload)
    case actions.SET_MEMBER_HOME_TILE_ROW_ACTIVE_ID:
      return state.set('tileRowActiveId', action.payload)
    case actions.APPEND_MEMBER_HOME_DATA_USER_INFO:
      return state.withMutations((mutateState) => {
        const userInfo = fromJS(action.payload.userInfo)
        // Map the userInfo onto existing rows

        return mutateState
          .set('userInfoProcessing', action.payload.processing)
          .updateIn(['data', 'rows'], List(), rows => rows.map((row) => {
            return row.update('payload', List(), payload => payload.map((title) => {
              return appendUserInfoToTitle(title, userInfo)
            }))
          }))
      })
    case actions.SET_MEMBER_HOME_ROW_COUNT:
      return state.set('rowCount', action.payload)
    case actions.DELETE_MEMBER_HOME_ROW:
      return state.deleteIn(['data', 'rows', action.payload])
    case actions.SET_CONSOLIDATED_CONTINUE_WATCHING_DATA: {
      const newState = state.withMutations((mutateState) => {
        return mutateState
          .updateIn(['data', 'rows'], List(), rows => rows.map((row) => {
            return row
          }))
      })
      return newState
    }
    default:
      return state
  }
}

function appendUserInfoToTitle (title, userInfo) {
  const userInfoMatch = userInfo.find(
    (_userInfoItem) => {
      return title.get('id') === _userInfoItem.get('id')
    })
  return title.set('userInfo', userInfoMatch || Map())
}
