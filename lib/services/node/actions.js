import assign from 'lodash/assign'
import {
  getNode as apiGetNode,
  getNodes as apiGetNodes,
} from '.'

export const SET_NODES = 'SET_NODE'
export const REMOVE_NODES = 'REMOVE_NODES'

export function dispatchSetNode (view, key, node, dispatch) {
  dispatch({ type: SET_NODES, payload: { view, key, node } })
  return node
}

export function getNode (options = {}) {
  return async function getNodeThunk (dispatch, getState) {
    const { key = 'anonymous', view } = options
    const { auth } = getState()
    let newOptions = options
    if (auth.get('jwt')) {
      newOptions = assign({}, options, { auth })
    }
    try {
      const node = await apiGetNode(newOptions)
      return dispatchSetNode(view, key, [node], dispatch)
    } catch (e) {
      return dispatchSetNode(view, key, [{}], dispatch)
    }
  }
}

export function getNodes (options = {}) {
  return async function getNodesThunk (dispatch, getState) {
    const { key = 'anonymous', view } = options
    const { auth } = getState()
    let newOptions = options
    if (auth.get('jwt')) {
      newOptions = assign({}, options, { auth })
    }
    try {
      const nodes = await apiGetNodes(newOptions)
      return dispatchSetNode(view, key, nodes, dispatch)
    } catch (e) {
      return dispatchSetNode(view, key, [], dispatch)
    }
  }
}

export function clearNodes (options = {}) {
  const { key, view } = options
  return { type: REMOVE_NODES, payload: { key, view } }
}
