import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_MESSAGE_BOX_VISIBLE:
      return state.set('visible', action.payload)
    case actions.SET_MESSAGE_BOX_TYPE:
      return state.withMutations(mutateState => mutateState
        .set('visible', action.payload.visible)
        .set('messageType', action.payload.messageType)
        .set('type', action.payload.type)
        .set('persistent', action.payload.persistent))
    case actions.SET_MESSAGE_BOX_VIEWED:
      return state.set('viewed', action.payload)
    default:
      return state
  }
}
