import { log as logError } from 'log/error'
import {
  setAssetsList,
  setAsset,
  setAssetError,
  GET_ASSETS_LIST,
  GET_ASSET,
} from './actions'
import {
  getMany as getAssetsList,
  get as getAsset,
} from '.'

async function getMultiple (dispatch, actionPayload, options = {}) {
  const { auth } = options
  try {
    const { params } = actionPayload
    const { language } = params
    const data = await getAssetsList(params, { auth, language })
    // Errors on individual guide are returned inside guide
    // and handled by SET_ASSET
    dispatch(setAssetsList(data, language))
  } catch (e) {
    logError(e)
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const { auth } = options
  const { guideDayId, language } = actionPayload
  try {
    const guide = await getAsset(guideDayId, { auth, language })
    dispatch(setAsset(guideDayId, language, guide))
  } catch (e) {
    logError(e)
    dispatch(setAssetError(guideDayId, language, e))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_ASSETS_LIST:
          getMultiple(dispatch, action.payload, { auth })
          break

        case GET_ASSET:
          getSingle(dispatch, action.payload, { auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
