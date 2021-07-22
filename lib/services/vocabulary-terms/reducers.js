import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_VOCABULARY_TERMS_DATA_PROCESSING:
      return state.setIn([action.payload.vocabularyId, 'processing'], action.payload.processing)
    case actions.SET_VOCABULARY_TERMS_DATA:
      return state.withMutations((mutateState) => {
        return mutateState
          .setIn([action.payload.vocabularyId, 'processing'], action.payload.processing)
          .setIn([action.payload.vocabularyId, 'data'], fromJS(action.payload.data))
      })
    default:
      return state
  }
}
