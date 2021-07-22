import { Map, fromJS } from 'immutable'
import { INTERSTITIAL_SET, INTERSTITIAL_REMOVE } from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case INTERSTITIAL_SET: {
      const { payload } = action
      return state.merge(fromJS(payload))
    }
    case INTERSTITIAL_REMOVE: {
      return state.set('view', null)
        .set('renderedAt', null)
        .set('leaving', false)
    }
    default:
      return state
  }
}
