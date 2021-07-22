import {
  getMultiplePmUserNodeInfo,
  getPmUserNodeInfo,
} from 'services/user-node-info/actions'
import {
  getAuthIsLoggedIn,
} from 'services/auth'
import {
  SET_EVENT_VIDEO_IMPRESSED,
} from 'services/event-tracking/actions'
import {
  setMultipleVideos,
  setVideo,
  setVideoError,
  setVideoImpressionData,
  GET_PM_MULTIPLE_VIDEOS,
  GET_PM_VIDEO,
} from './actions'
import {
  getMany as getManyVideos,
  get as getVideo,
} from '.'

async function getMultiple (dispatch, actionPayload, options = {}) {
  const { auth } = options
  try {
    const { videoIds, language } = actionPayload
    const pmVideos = await getManyVideos(videoIds, { auth, language })
    // Errors on individual videos are returned inside pmVideos
    // and handled by SET_PM_MULTIPLE_VIDEOS
    dispatch(setMultipleVideos(videoIds, language, pmVideos))
    if (getAuthIsLoggedIn(auth)) dispatch(getMultiplePmUserNodeInfo(videoIds))
  } catch (e) {
    // Do Nothing
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const { auth } = options
  const { videoId, language } = actionPayload
  try {
    const pmVideo = await getVideo(videoId, { auth, language })
    dispatch(setVideo(videoId, language, pmVideo))
    dispatch(getPmUserNodeInfo(pmVideo.id))
  } catch (e) {
    dispatch(setVideoError(videoId, language, e))
  }
}

async function handleVideoImpression (dispatch, actionPayload) {
  const { event, language } = actionPayload
  const videoId = event.getIn(['properties', 'contentId'])
  dispatch(setVideoImpressionData(videoId, language.get(0)))
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_PM_MULTIPLE_VIDEOS:
          getMultiple(dispatch, action.payload, { auth })
          break

        case GET_PM_VIDEO:
          getSingle(dispatch, action.payload, { auth })
          break

        case SET_EVENT_VIDEO_IMPRESSED:
          handleVideoImpression(dispatch, action.payload)
          break

        default:
          break
      }
    }
    next(action)
  }
}
