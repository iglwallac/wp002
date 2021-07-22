import { Map, fromJS } from 'immutable'
import { SET_SERVER_TIME_DATA, SET_SERVER_TIME_PROCESSING } from './actions'

export const initialState = Map()

export default function serverTimeReducer (state = initialState, action) {
  const { type } = action
  switch (type) {
    case SET_SERVER_TIME_DATA:
      return state.withMutations(mutateState => mutateState
        .set('data', fromJS(action.payload.data))
        .set('processing', action.payload.processing),
      )
    case SET_SERVER_TIME_PROCESSING:
      return state.set('processing', action.payload)
    default:
      return state
  }
}
