import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_MULTIPLE_PM_LISTS,
  GET_PM_LIST,
  SET_PM_LIST,
  SET_PM_LIST_ERROR,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MULTIPLE_PM_LISTS: {
      const listIds = action.payload
      return state.withMutations((mutableState) => {
        listIds.map(listId => mutableState.setIn([listId, 'processing'], true))
      })
    }

    case GET_PM_LIST: {
      const listId = action.payload
      return state.setIn([listId, 'processing'], true)
    }

    case SET_PM_LIST: {
      const { listId, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([listId, 'processing'], false)
          .setIn([listId, 'data'], fromJS(data))
          .deleteIn([listId, 'error'])
      })
    }

    case SET_PM_LIST_ERROR: {
      const { listId, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([listId, 'processing'], false)
          .deleteIn([listId, 'data'])
          .setIn([listId, 'error'], error)
      })
    }

    default:
      return state
  }
}

/*
Store
pmList: Map(
  74f84e4b-d308-4169-b7c9-bbada9eeb083: {
    processing: boolean,
    data: Map(),
    error: Map(),
  },
)
*/
