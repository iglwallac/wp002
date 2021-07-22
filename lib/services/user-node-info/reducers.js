import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_MULTIPLE_PM_USER_NODE_INFO,
  GET_PM_USER_NODE_INFO,
  SET_MULTIPLE_PM_USER_NODE_INFO,
  SET_PM_USER_NODE_INFO,
  SET_MULTIPLE_PM_USER_NODE_INFO_ERROR,
  SET_PM_USER_NODE_INFO_ERROR,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MULTIPLE_PM_USER_NODE_INFO: {
      const nodeIds = action.payload
      return state.withMutations((mutableState) => {
        nodeIds.forEach((nodeId) => {
          const key = Number(nodeId)
          mutableState.setIn([key, 'processing'], true)
        })
      })
    }

    case GET_PM_USER_NODE_INFO: {
      const nodeId = action.payload
      const key = Number(nodeId)
      return state.setIn([key, 'processing'], true)
    }

    case SET_MULTIPLE_PM_USER_NODE_INFO: {
      const { nodeIds, data } = action.payload
      return state.withMutations((mutableState) => {
        nodeIds.forEach((nodeId) => {
          const key = Number(nodeId)
          mutableState
            .setIn([key, 'processing'], false)
            .setIn([key, 'data'], fromJS(data[key] || {}))
            .deleteIn([key, 'error'])
        })
      })
    }

    case SET_PM_USER_NODE_INFO: {
      const { nodeId, data } = action.payload
      const key = Number(nodeId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, 'processing'], false)
          .setIn([key, 'data'], fromJS(data))
          .deleteIn([key, 'error'])
      })
    }

    case SET_MULTIPLE_PM_USER_NODE_INFO_ERROR: {
      const { nodeIds, error } = action.payload
      return state.withMutations((mutableState) => {
        nodeIds.forEach((nodeId) => {
          const key = Number(nodeId)
          mutableState
            .setIn([key, 'processing'], false)
            .deleteIn([key, 'data'])
            .setIn([key, 'error'], error)
        })
      })
    }

    case SET_PM_USER_NODE_INFO_ERROR: {
      const { nodeId, error } = action.payload
      const key = Number(nodeId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, 'processing'], false)
          .deleteIn([key, 'data'])
          .setIn([key, 'error'], error)
      })
    }

    default:
      return state
  }
}

/*
Store
pmUserNodeInfo: Map(
  4891: {
    processing: boolean,
    data: Map(),
    error: Map(),
  },
)
*/
