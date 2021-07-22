import {
  setMultiplePmUserNodeInfo,
  setMultiplePmUserNodeInfoError,
  setPmUserNodeInfo,
  setPmUserNodeInfoError,
  GET_MULTIPLE_PM_USER_NODE_INFO,
  GET_PM_USER_NODE_INFO,
} from './actions'
import {
  getMany,
  getOne,
} from '.'

async function getMultiple (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const nodeIds = actionPayload
  try {
    // Use batch getMany()
    const data = await getMany(nodeIds, { auth })
    dispatch(setMultiplePmUserNodeInfo(nodeIds, data))
  } catch (e) {
    dispatch(setMultiplePmUserNodeInfoError(nodeIds, e))
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const nodeId = actionPayload
  try {
    // Use single getOne()
    const pmUserNodeInfo = await getOne(nodeId, { auth })
    dispatch(setPmUserNodeInfo(nodeId, pmUserNodeInfo))
  } catch (e) {
    dispatch(setPmUserNodeInfoError(nodeId, e))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_MULTIPLE_PM_USER_NODE_INFO:
          getMultiple(dispatch, action.payload, { auth })
          break

        case GET_PM_USER_NODE_INFO:
          getSingle(dispatch, action.payload, { auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
