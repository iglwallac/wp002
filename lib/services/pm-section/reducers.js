import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_MULTIPLE_PM_SECTIONS,
  GET_PM_SECTION,
  SET_PM_SECTION,
  SET_PM_SECTION_ERROR,
  DELETE_PM_SECTION,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MULTIPLE_PM_SECTIONS: {
      const sectionIds = action.payload
      return state.withMutations((mutableState) => {
        sectionIds.map(sectionId => mutableState.setIn([sectionId, 'processing'], true))
      })
    }

    case GET_PM_SECTION: {
      const sectionId = action.payload
      return state.setIn([sectionId, 'processing'], true)
    }

    case SET_PM_SECTION: {
      const { sectionId, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([sectionId, 'processing'], false)
          .setIn([sectionId, 'data'], fromJS(data))
          .deleteIn([sectionId, 'error'])
      })
    }

    case SET_PM_SECTION_ERROR: {
      const { sectionId, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([sectionId, 'processing'], false)
          .deleteIn([sectionId, 'data'])
          .setIn([sectionId, 'error'], error)
      })
    }

    case DELETE_PM_SECTION: {
      const { sectionId } = action.payload
      return state.delete(sectionId)
    }

    default:
      return state
  }
}

/*
Store
pmSection: Map(
  f52dfbd7-930e-4316-9516-00eaee4d6d2c: {
    processing: boolean,
    data: Map(),
    error: Map(),
  },
)
*/
