import { Map } from 'immutable'
import {
  SET_AUTOCOMPLETE_SEARCH_PROCESSING,
  SET_AUTOCOMPLETE_SEARCH_DATA,
  SET_AUTOCOMPLETE_SEARCH_ERROR,
} from './actions'

export const initialState = Map()

export default (state = initialState, action) => {
  const { payload, type } = action

  switch (type) {
    case SET_AUTOCOMPLETE_SEARCH_PROCESSING:
      return state.setIn(['autoComplete', 'processing'], payload.processing)
    case SET_AUTOCOMPLETE_SEARCH_DATA:
      return state
        .setIn(['autoComplete', 'results'], payload.data)
        .setIn(['autoComplete', 'processing'], false)
    case SET_AUTOCOMPLETE_SEARCH_ERROR:
      return state
        .setIn(['autoComplete', 'error'], payload.error)
        .setIn(['autoComplete', 'processing'], false)
    default:
      return state
  }
}
