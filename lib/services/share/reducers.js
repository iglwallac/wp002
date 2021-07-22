import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function shareReducer (state = initialState, action) {
  const { payload = {} } = action
  switch (action.type) {
    case actions.SET_SHARE_DATA: {
      return state.set('data', payload.data || Map())
        .set('error', fromJS(payload.error || false))
    }
    case actions.SET_SHARE:
      return state.set(payload.getIn(['data', 'token']), payload)
    case actions.SET_USER_HAS_SHARED:
      return state.set('hasShared', payload)
    case actions.SET_ACCOUNT_SHARES:
      return state.set('account', payload)
    case actions.CREATED_SHARE:
      return state.set('created', payload)
    case actions.DUPLICATE_SHARE_EMAIL_CAPTURE:
      return state.set('emailProcessing', true)
    case actions.DUPLICATED_SHARE_EMAIL_CAPTURE:
      return state.set('duplicate', payload.data)
        .set('emailProcessing', false)
    case actions.CLEAR_SHARE:
      return state.set('created', Map())
    case actions.SET_USER_SHARES:
      return state.set('user', payload)
    default:
      return state
  }
}
