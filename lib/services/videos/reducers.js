import _get from 'lodash/get'
import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_PM_MULTIPLE_VIDEOS,
  GET_PM_VIDEO,
  SET_PM_MULTIPLE_VIDEOS,
  SET_PM_VIDEO,
  SET_PM_VIDEO_ERROR,
  SET_PM_VIDEO_IMPRESSION_DATA,
  CLEAR_PM_VIDEOS_IMPRESSION_DATA,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PM_MULTIPLE_VIDEOS: {
      const { videoIds, language } = action.payload
      return state.withMutations((mutableState) => {
        videoIds.map(videoId => mutableState.setIn([Number(videoId), language, 'processing'], true))
      })
    }

    case GET_PM_VIDEO: {
      const { videoId, language } = action.payload
      return state.setIn([Number(videoId), language, 'processing'], true)
    }

    case SET_PM_MULTIPLE_VIDEOS: {
      const { videoIds, language, data } = action.payload
      return state.withMutations((mutableState) => {
        videoIds.forEach((videoId) => {
          const key = Number(videoId)
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

    case SET_PM_VIDEO: {
      const { videoId, language, data } = action.payload
      const key = Number(videoId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'data'], fromJS(data))
          .deleteIn([key, language, 'error'])
      })
    }

    case SET_PM_VIDEO_ERROR: {
      const { videoId, language, error } = action.payload
      const key = Number(videoId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .deleteIn([key, language, 'data'])
          .setIn([key, language, 'error'], error)
      })
    }

    case SET_PM_VIDEO_IMPRESSION_DATA: {
      const { videoId, language } = action.payload
      const key = Number(videoId)
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([key, language, 'processing'], false)
          .setIn([key, language, 'impressed'], true)
      })
    }

    case CLEAR_PM_VIDEOS_IMPRESSION_DATA: {
      const { language } = action.payload
      return state.withMutations((mutableState) => {
        mutableState.map((video) => {
          if (video.getIn([language, 'impressed'])) {
            return mutableState
              .setIn([video.getIn([language, 'data', 'id']), language, 'impressed'], false)
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
videos: Map(
  4891: {
    processing: boolean,
    data: Map(),
    error: Map(),
  },
)
*/
