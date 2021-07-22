import _get from 'lodash/get'
import _map from 'lodash/map'
import { getAssetsList } from 'services/assets/actions'
import { getMultipleGuideDays } from 'services/guide-days/actions'
import {
  setMultipleGuide,
  setGuide,
  setGuideError,
  GET_MULTIPLE_GUIDES,
  GET_GUIDE,
} from './actions'
import {
  getMany as getManyGuide,
  get as getGuide,
} from '.'

async function getMultiple (dispatch, actionPayload, options = {}) {
  const { auth } = options
  try {
    const { guideIds, language } = actionPayload
    const guide = await getManyGuide(guideIds, { auth, language })
    // Errors on individual guide are returned inside guide
    // and handled by SET_MULTIPLE_GUIDES
    dispatch(setMultipleGuide(guideIds, language, guide))
  } catch (e) {
    // Do nothing
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const { auth } = options
  const { guideId, language, fetchChildren } = actionPayload
  try {
    const guide = await getGuide(guideId, { auth, language })
    dispatch(setGuide(guideId, language, guide))
    if (fetchChildren) {
      dispatch(getAssetsList({ contentId: guideId, contentType: 'guide', language, primaryLanguage: language, contentReferenceType: 'guide-material' }))
      const contentIds = _map(_get(guide, 'guideDays', []), 'contentId')
      dispatch(getMultipleGuideDays(contentIds, language, fetchChildren))
    }
  } catch (e) {
    dispatch(setGuideError(guideId, language, e))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_MULTIPLE_GUIDES:
          getMultiple(dispatch, action.payload, { auth })
          break

        case GET_GUIDE:
          getSingle(dispatch, action.payload, { auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
