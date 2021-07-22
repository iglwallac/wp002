import _get from 'lodash/get'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { getMultiplePmSections } from 'services/pm-section/actions'
import {
  setPmScreen,
  setPmScreenError,
  GET_PM_SCREEN,
} from './actions'

async function get (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { screenType, language } = actionPayload
  try {
    const response = await apiGet(`page-manager/screen/${screenType}`, { language, peopleRowFeature: 'true' }, { auth }, TYPE_BROOKLYN)
    const pmScreen = _get(response, 'body', {})
    dispatch(setPmScreen(screenType, language, pmScreen))

    const sectionIds = _get(pmScreen, 'sectionIds', [])
    dispatch(getMultiplePmSections(sectionIds))
  } catch (e) {
    dispatch(setPmScreenError(screenType, language, e))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_PM_SCREEN:
          get(dispatch, action.payload, { auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
