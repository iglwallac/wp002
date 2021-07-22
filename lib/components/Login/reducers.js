import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_LOGIN_MESSAGE_CODES:
      return action.payload
        ? state.set('messageCodes', fromJS(action.payload))
        : state.delete('messageCodes')
    case actions.SET_LOGIN_MESSAGES:
      return action.payload
        ? state.set('messages', fromJS(action.payload))
        : state.delete('messages')
    case actions.SET_LOGIN_CAN_SUBMIT:
      return state.set('canSubmit', action.payload)
    case actions.SET_LOGIN_PROCESSING:
      return state.set('processing', action.payload)
    default:
      return state
  }
}
