import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  const { type, payload = {} } = action
  switch (type) {
    case actions.SET_NODES: {
      const { view, key, node } = payload
      if (view) {
        return state.updateIn([view], Map(), viewMap => (
          viewMap.set(key, fromJS(node))
        ))
      }
      return state.set(key, fromJS(node))
    }
    case actions.REMOVE_NODES: {
      const { view, key } = payload
      if (view) {
        return key
          ? state.deleteIn([view, key])
          : state.delete(view)
      }
      if (key) return state.delete(key)
      return initialState
    }
    default:
      return state
  }
}
