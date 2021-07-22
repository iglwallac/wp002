import _get from 'lodash/get'
import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_ASSETS_LIST,
  GET_ASSET,
  SET_ASSETS_LIST,
  SET_ASSET,
  SET_ASSETS_ERROR,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ASSETS_LIST: {
      const { params, language } = action.payload
      return state.withMutations((mutableState) => {
        mutableState.setIn([params.contentId, language, 'processing'], true)
      })
    }

    case GET_ASSET: {
      const { guideDayId, language } = action.payload
      return state.setIn([Number(guideDayId), language, 'processing'], true)
    }

    case SET_ASSETS_LIST: {
      const { language, data } = action.payload
      return state.withMutations((mutableState) => {
        data.forEach((entry) => {
          const key = _get(entry, 'uuid')
          const itemData = entry
          // const itemError = _get(data, [key, 'error'])
          // if (itemError) {
          //   mutableState
          //     .setIn([key, language, 'processing'], false)
          //     .deleteIn([key, language, 'data'])
          //     .setIn([key, language, 'error'], itemError)
          // } else {
          mutableState
            .setIn([key, language, 'processing'], false)
            .setIn([key, language, 'data'], fromJS(itemData))
            .deleteIn([key, language, 'error'])
          // }
        })
      })
    }

    case SET_ASSET: {
      const { guideDayId, language, data } = action.payload
      const key = Number(guideDayId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'data'], fromJS(data))
          .deleteIn([key, language, 'error'])
      })
    }

    case SET_ASSETS_ERROR: {
      const { guideDayId, language, error } = action.payload
      const key = Number(guideDayId)
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
