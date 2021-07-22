import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  const { type, payload = {} } = action
  switch (type) {
    case actions.TESTAROSSA_SET_INITIAL_STATE: {
      const { state: tState } = payload
      return state.set('initialized', tState.initialized || false)
        .set('records', fromJS(tState.records || []))
        .set('context', fromJS(tState.context || {}))
        .set('failure', tState.failure || false)
    }
    case actions.TESTAROSSA_SET_INITIALIZED: {
      const { initialized } = payload
      return state.set('initialized', initialized)
    }
    case actions.TESTAROSSA_SET_RECORDS: {
      const { records = [] } = payload
      return state.set('records', fromJS(records))
    }
    case actions.TESTAROSSA_SET_CONTEXT: {
      const { context = {} } = payload
      return state.set('context', fromJS(context))
    }
    default:
      return state
  }
}
