export const GET_MULTIPLE_PM_USER_NODE_INFO = 'GET_MULTIPLE_PM_USER_NODE_INFO'
export const GET_PM_USER_NODE_INFO = 'GET_PM_USER_NODE_INFO'
export const SET_MULTIPLE_PM_USER_NODE_INFO = 'SET_MULTIPLE_PM_USER_NODE_INFO'
export const SET_PM_USER_NODE_INFO = 'SET_PM_USER_NODE_INFO'
export const SET_MULTIPLE_PM_USER_NODE_INFO_ERROR = 'SET_MULTIPLE_PM_USER_NODE_INFO_ERROR'
export const SET_PM_USER_NODE_INFO_ERROR = 'SET_PM_USER_NODE_INFO_ERROR'

export function getMultiplePmUserNodeInfo (nodeIds) {
  return {
    type: GET_MULTIPLE_PM_USER_NODE_INFO,
    payload: nodeIds,
  }
}

export function getPmUserNodeInfo (nodeId) {
  return {
    type: GET_PM_USER_NODE_INFO,
    payload: nodeId,
  }
}

export function setMultiplePmUserNodeInfo (nodeIds, data) {
  return {
    type: SET_MULTIPLE_PM_USER_NODE_INFO,
    payload: {
      nodeIds,
      data,
    },
  }
}

export function setPmUserNodeInfo (nodeId, data) {
  return {
    type: SET_PM_USER_NODE_INFO,
    payload: {
      nodeId,
      data,
    },
  }
}

export function setMultiplePmUserNodeInfoError (nodeIds, error) {
  return {
    type: SET_MULTIPLE_PM_USER_NODE_INFO_ERROR,
    payload: {
      nodeIds,
      error,
    },
  }
}

export function setPmUserNodeInfoError (nodeId, error) {
  return {
    type: SET_PM_USER_NODE_INFO_ERROR,
    payload: {
      nodeId,
      error,
    },
  }
}
