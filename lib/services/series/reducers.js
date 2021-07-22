import _get from 'lodash/get'
import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_MULTIPLE_PM_SERIES,
  GET_PM_SERIES,
  SET_PM_MULTIPLE_SERIES,
  SET_PM_SERIES,
  SET_PM_SERIES_ERROR,
  SET_PM_SERIES_IMPRESSION_DATA,
  CLEAR_PM_SERIES_IMPRESSION_DATA,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_MULTIPLE_PM_SERIES: {
      const { seriesIds, language } = action.payload
      return state.withMutations((mutableState) => {
        seriesIds.map(seriesId => mutableState.setIn([Number(seriesId), language, 'processing'], true))
      })
    }

    case GET_PM_SERIES: {
      const { seriesId, language } = action.payload
      return state.setIn([Number(seriesId), language, 'processing'], true)
    }

    case SET_PM_MULTIPLE_SERIES: {
      const { seriesIds, language, data } = action.payload
      return state.withMutations((mutableState) => {
        seriesIds.forEach((seriesId) => {
          const key = Number(seriesId)
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

    case SET_PM_SERIES: {
      const { seriesId, language, data } = action.payload
      const key = Number(seriesId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'data'], fromJS(data))
          .deleteIn([key, language, 'error'])
      })
    }

    case SET_PM_SERIES_ERROR: {
      const { seriesId, language, error } = action.payload
      const key = Number(seriesId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .deleteIn([key, language, 'data'])
          .setIn([key, language, 'error'], error)
      })
    }


    case SET_PM_SERIES_IMPRESSION_DATA: {
      const { seriesId, language } = action.payload
      const key = Number(seriesId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'impressed'], true)
      })
    }

    case CLEAR_PM_SERIES_IMPRESSION_DATA: {
      const { language } = action.payload
      return state.withMutations((mutableState) => {
        mutableState.map((series) => {
          if (series.getIn([language, 'impressed'])) {
            return mutableState
              .setIn([series.getIn([language, 'data', 'id']), language, 'impressed'], false)
          }
          return null
        })
      })
    }


    default:
      return state
  }
}

/*
Store
series: Map(
  3346: {
    processing: boolean,
    data: Map(),
    error: Map(),
  },
)
*/
