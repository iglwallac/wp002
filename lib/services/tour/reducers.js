import { Map } from 'immutable'
import {
  SET_ACTIVE_ARROW,
} from './actions'

export const initialState = Map()

export default (state = initialState, action) => {
  const { payload, type } = action
  switch (type) {
    case SET_ACTIVE_ARROW:
      return state.set('activeArrow', payload)
    default:
      return state
  }
}
