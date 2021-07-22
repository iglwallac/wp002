import { log as logError } from 'log/error'
import {
  setMultipleGuideDays,
  setGuideDay,
  setGuideDayError,
  GET_MULTIPLE_GUIDE_DAYS,
  GET_GUIDE_DAY,
} from './actions'
import {
  getMany as getManyGuideDay,
  get as getGuideDay,
} from '.'

async function getMultiple (dispatch, actionPayload, options = {}) {
  const { auth } = options
  try {
    const { guideDayIds, language, fetchChildren } = actionPayload
    const guide = await getManyGuideDay(dispatch, guideDayIds, { auth, language }, fetchChildren)
    // Errors on individual guide are returned inside guide
    // and handled by SET_MULTIPLE_GUIDE_DAYS
    dispatch(setMultipleGuideDays(guideDayIds, language, guide))
  } catch (e) {
    logError(e)
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const { auth } = options
  const { guideDayId, language } = actionPayload
  try {
    const guide = await getGuideDay(guideDayId, { auth, language })
    dispatch(setGuideDay(guideDayId, language, guide))
  } catch (e) {
    logError(e)
    dispatch(setGuideDayError(guideDayId, language, e))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_MULTIPLE_GUIDE_DAYS:
          getMultiple(dispatch, action.payload, { auth })
          break

        case GET_GUIDE_DAY:
          getSingle(dispatch, action.payload, { auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
