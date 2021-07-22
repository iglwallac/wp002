import _get from 'lodash/get'
import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_MULTIPLE_GUIDE_DAYS,
  GET_GUIDE_DAY,
  SET_MULTIPLE_GUIDE_DAYS,
  SET_GUIDE_DAY,
  SET_GUIDE_DAYS_ERROR,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MULTIPLE_GUIDE_DAYS: {
      const { guideDayIds, language } = action.payload
      return state.withMutations((mutableState) => {
        guideDayIds.map(guideDayId => mutableState.setIn([Number(guideDayId), language, 'processing'], true))
      })
    }

    case GET_GUIDE_DAY: {
      const { guideDayId, language } = action.payload
      return state.setIn([Number(guideDayId), language, 'processing'], true)
    }

    case SET_MULTIPLE_GUIDE_DAYS: {
      const { guideDayIds, language, data } = action.payload
      return state.withMutations((mutableState) => {
        guideDayIds.forEach((guideDayId) => {
          const key = Number(guideDayId)
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

    case SET_GUIDE_DAY: {
      const { guideDayId, language, data } = action.payload
      const key = Number(guideDayId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'data'], fromJS(data))
          .deleteIn([key, language, 'error'])
      })
    }

    case SET_GUIDE_DAYS_ERROR: {
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
