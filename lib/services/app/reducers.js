import { Map } from 'immutable'

import {
  SET_APP_BOOTSTRAP_PHASE,
  SET_APP_SCROLLABLE,
  SET_APP_VIEWPORT,
  SET_APP_HEADER,
  SET_APP_FOOTER,
  SET_APP_ROUTES,
} from './actions'

export const initialState = Map({
  viewport: Map({ width: 0, height: 0, ready: false }),
})

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_APP_HEADER:
      return state.set('enableHeader', action.payload)
    case SET_APP_FOOTER:
      return state.set('enableFooter', action.payload)
    case SET_APP_ROUTES:
      return state.set('enableRoutes', action.payload)
    case SET_APP_SCROLLABLE:
      return state.set('scrollable', action.payload)
    case SET_APP_VIEWPORT:
      return state.set('viewport', Map(action.payload))
    case SET_APP_BOOTSTRAP_PHASE: {
      const { payload = {} } = action
      const { phase, isComplete } = payload
      return state.set('bootstrapPhase', phase)
        .set('bootstrapComplete', isComplete)
    }
    default:
      return state
  }
}
