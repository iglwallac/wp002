import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_MULTIPLE_PM_PLACEMENTS,
  GET_PM_PLACEMENT,
  SET_PM_PLACEMENT,
  SET_PM_PLACEMENT_ERROR,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MULTIPLE_PM_PLACEMENTS: {
      const { placementNames, language } = action.payload
      return state.withMutations((mutableState) => {
        placementNames.map(placementName => mutableState.setIn([placementName, language, 'processing'], true))
      })
    }

    case GET_PM_PLACEMENT: {
      const { placementName, language } = action.payload
      return state.setIn([placementName, language, 'processing'], true)
    }

    case SET_PM_PLACEMENT: {
      const { placementName, language, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([placementName, language, 'processing'], false)
          .setIn([placementName, language, 'data'], fromJS(data))
          .deleteIn([placementName, language, 'error'])
      })
    }

    case SET_PM_PLACEMENT_ERROR: {
      const { placementName, language, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([placementName, language, 'processing'], false)
          .deleteIn([placementName, language, 'data'])
          .setIn([placementName, language, 'error'], error)
      })
    }

    default:
      return state
  }
}

/*
Store
pmPlacement: Map({
  "member-home-spotlight-a-v1": Map({
    en: Map({
      processing: boolean,
      data: Map(),
      error: Map(),
    }),
  }),
})
*/
