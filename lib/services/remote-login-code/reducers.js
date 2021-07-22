import { Map, fromJS } from 'immutable'
import * as actions from './actions'
import { APPROVE_REMOTE_LOGIN_CODE_PROCESSING } from '.'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_REMOTE_LOGIN_CODE_PROCESSING:
      return state.set(APPROVE_REMOTE_LOGIN_CODE_PROCESSING, action.payload)
    case actions.SET_REMOTE_LOGIN_CODE_DATA:
      return state.withMutations(mutateState => mutateState
        .update('data', Map(), data =>
          data.merge(fromJS(action.payload.data)),
        )
        .set(APPROVE_REMOTE_LOGIN_CODE_PROCESSING, action.payload.processing))
    default:
      return state
  }
}
