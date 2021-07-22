import _get from 'lodash/get'
import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_PM_MULTIPLE_TERMS,
  GET_PM_TERM,
  SET_PM_MULTIPLE_TERMS,
  SET_PM_TERM,
  SET_PM_TERM_ERROR,
  SET_PM_TERM_IMPRESSION_DATA,
  CLEAR_PM_TERMS_IMPRESSION_DATA,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PM_MULTIPLE_TERMS: {
      const { termIds, language } = action.payload
      return state.withMutations((mutableState) => {
        termIds.map(termId => mutableState.setIn([Number(termId), language, 'processing'], true))
      })
    }

    case GET_PM_TERM: {
      const { termId, language } = action.payload
      return state.setIn([Number(termId), language, 'processing'], true)
    }

    case SET_PM_MULTIPLE_TERMS: {
      const { termIds, language, data } = action.payload
      return state.withMutations((mutableState) => {
        termIds.forEach((termId, index) => {
          const key = Number(termId)
          const itemData = _get(data, index, {})
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

    case SET_PM_TERM: {
      const { termId, language, data } = action.payload
      const key = Number(termId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'data'], fromJS(data))
          .deleteIn([key, language, 'error'])
      })
    }

    case SET_PM_TERM_ERROR: {
      const { termId, language, error } = action.payload
      const key = Number(termId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .deleteIn([key, language, 'data'])
          .setIn([key, language, 'error'], error)
      })
    }

    case SET_PM_TERM_IMPRESSION_DATA: {
      const { termId, language } = action.payload
      const key = Number(termId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'impressed'], true)
      })
    }

    case CLEAR_PM_TERMS_IMPRESSION_DATA: {
      const { language } = action.payload
      return state.withMutations((mutableState) => {
        mutableState.map((term) => {
          if (term.getIn([language, 'impressed'])) {
            return mutableState
              .setIn([term.getIn([language, 'data', 'id']), language, 'impressed'], false)
          }
          return null
        })
      })
    }

    default:
      return state
  }
}
