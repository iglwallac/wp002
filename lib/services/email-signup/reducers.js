import { Map } from 'immutable'
import { isBoolean as _isBoolean } from 'lodash'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_EMAIL_SIGNUP_SUCCESS:
      return state.withMutations((mutatableState) => {
        mutatableState
          .set('processing', action.payload.processing)
          .set('errorCode', action.payload.errorCode)
          .set('email', action.payload.email)
        if (_isBoolean(action.payload.success)) {
          mutatableState.set('success', action.payload.success)
        } else {
          mutatableState.delete('success')
        }
      })
    case actions.SET_EMAIL_SIGNUP_CONFIRMATION:
      return state
        .set('completed', action.payload)
    case actions.SET_EMAIL_SIGNUP_VIDEO_PREVIEW_COUNT:
      return state
        .set('previewCount', action.payload)
    case actions.SET_EMAIL_SIGNUP_PREVIEW_GATE_VISIBLE:
      return state
        .set('previewGateVisible', action.payload)
    case actions.SET_EMAIL_SIGNUP_OPTIN:
      return state
        .set('optIn', action.payload)
    default:
      return state
  }
}
