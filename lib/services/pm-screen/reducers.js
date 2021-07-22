import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_PM_SCREEN,
  SET_PM_SCREEN,
  RESET_PM_SCREEN,
  DELETE_PM_SCREEN,
  SET_PM_SCREEN_ERROR,
} from './actions'

export const initialState = Map({
  'yoga-home': Map(),
  'community-portals': Map(),
})

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PM_SCREEN: {
      const { screenType, language } = action.payload
      return state.setIn([screenType, language, 'processing'], true)
    }
    case SET_PM_SCREEN: {
      const { screenType, language, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([screenType, language, 'processing'], false)
          .setIn([screenType, language, 'data'], fromJS(data))
          .deleteIn([screenType, language, 'error'])
      })
    }
    case RESET_PM_SCREEN:
      return initialState
    case DELETE_PM_SCREEN: {
      const { screenType, language } = action.payload
      if (language) {
        return state.deleteIn([screenType, language])
      }
      return state.delete(screenType)
    }
    case SET_PM_SCREEN_ERROR: {
      const { screenType, language, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([screenType, language, 'processing'], false)
          .deleteIn([screenType, language, 'data'])
          .setIn([screenType, language, 'error'], error)
      })
    }
    default:
      return state
  }
}

/*
Store
pmScreen: Map(
  yoga-home: {
    en: {
      processing: boolean,
      data: Map(),
      error: Map(),
    },
  },
)
*/
