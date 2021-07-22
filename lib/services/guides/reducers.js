import _get from 'lodash/get'
import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_MULTIPLE_GUIDES,
  GET_GUIDE,
  SET_MULTIPLE_GUIDES,
  SET_GUIDE,
  SET_GUIDES_ERROR,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MULTIPLE_GUIDES: {
      const { guideIds, language } = action.payload
      return state.withMutations((mutableState) => {
        guideIds.map(guideId => mutableState.setIn([Number(guideId), language, 'processing'], true))
      })
    }

    case GET_GUIDE: {
      const { guideId, language } = action.payload
      return state.setIn([Number(guideId), language, 'processing'], true)
    }

    case SET_MULTIPLE_GUIDES: {
      const { guideIds, language, data } = action.payload
      return state.withMutations((mutableState) => {
        guideIds.forEach((guideId) => {
          const key = Number(guideId)
          const itemData = _get(data, [key, 'data'], {})
          const itemError = _get(data, [key, 'error'])
          if (itemError) {
            mutableState
              .setIn([key, language, 'processing'], false)
              .deleteIn([key, language, 'data'])
              .setIn([key, language, 'error'], itemError)
          } else {
            mutableState
              .setIn([key, language, 'processing'], false)
              .setIn([key, language, 'data'], fromJS(itemData))
              .deleteIn([key, language, 'error'])
          }
        })
      })
    }

    case SET_GUIDE: {
      const { guideId, language, data } = action.payload
      const key = Number(guideId)

      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'data'], fromJS(data))
          .deleteIn([key, language, 'error'])
      })
    }

    case SET_GUIDES_ERROR: {
      const { guideId, language, error } = action.payload
      const key = Number(guideId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .deleteIn([key, language, 'data'])
          .setIn([key, language, 'error'], error)
      })
    }

    default:
      return state
  }
}

/*
Store
guide: Map(
  3346: {
    processing: boolean,
    data: Map(),
    error: Map(),
  },
)
*/
