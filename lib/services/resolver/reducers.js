import { Map, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map({
  processing: false,
  path: null,
  redirectPath: null,
  data: Map(),
})

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_RESOLVER_DATA:
      return state.withMutations(mutateState => mutateState
        .set('processing', action.payload.processing)
        .set('data', fromJS(action.payload.data)))
    case actions.SET_RESOLVER_LOCATION:
      return state.withMutations((mutateState) => {
        const { location, processing } = action.payload
        const { pathname, query } = location
        return mutateState
          .set('path', pathname)
          .set('query', fromJS(query))
          .set('processing', processing)
          .set('location', location)
      })
    case actions.SET_RESOLVER_REDIRECT_PATH:
      return state.set('redirectPath', action.payload)
    case actions.SET_RESOLVER_PROCESSING:
      return state.set('processing', action.payload)
    default:
      return state
  }
}
