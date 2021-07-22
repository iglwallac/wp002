import _get from 'lodash/get'
import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function userScoreReducer (state = initialState, action) {
  switch (action.type) {
    case actions.SET_YOGA_SCORE_PROCESSING:
      return state.set('processing', action.payload)
    case actions.SET_YOGA_SCORE_DATA:
      return state.set(_get(action, ['payload', 'scoreType'], 'undefined'), { score: _get(action, ['payload', 'score'], null) })
    case actions.SET_YOGA_SCORE_ERROR:
      return state.set('error', action.payload)
    default:
      return state
  }
}
