import _get from 'lodash/get'
import _forEach from 'lodash/forEach'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { getPrimary } from 'services/languages'
import { getMultipleSeries } from 'services/series/actions'
import { getMultipleVideos } from 'services/videos/actions'
import { getMultipleTerms } from 'services/term/actions'
import { getPortalCommunityPM } from 'services/portal/actions'

import {
  setPmList,
  setPmListError,
  GET_MULTIPLE_PM_LISTS,
  GET_PM_LIST,
} from './actions'

async function getMultiple (dispatch, actionPayload, options = {}) {
  try {
    const listIds = actionPayload
    _forEach(listIds, listId => getSingle(dispatch, listId, options))
  } catch (e) {
    // Do nothing
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const {
    language,
    auth,
  } = options
  const listId = actionPayload
  try {
    const response = await apiGet(`page-manager/list/${listId}`, { language }, { auth }, TYPE_BROOKLYN)
    const pmList = _get(response, 'body', {})
    dispatch(setPmList(listId, pmList))

    if (['content', 'content-people', 'content-tags'].includes(pmList.type)) {
      const listItems = _get(pmList, 'listItems', [])

      const videoIds = listItems
        .filter(i => i.type === 'video')
        .map(i => i.id)

      const seriesIds = listItems
        .filter(i => i.type === 'series')
        .map(i => i.id)

      const termIds = listItems
        .filter(i => ['person', 'tag'].includes(i.type))
        .map(i => i.id)

      if (seriesIds.length) {
        dispatch(getMultipleSeries(seriesIds, language))
      }
      if (videoIds.length) {
        dispatch(getMultipleVideos(videoIds, language))
      }
      if (termIds.length) {
        dispatch(getMultipleTerms(termIds, language))
      }
    }

    if (pmList.type === 'portals') {
      const listItems = _get(pmList, 'listItems', []).reduce((acc, item) => {
        return acc.concat(item.uuid)
      }, [])
      dispatch(getPortalCommunityPM(listItems))
    }

    // TODO support pmList.type === 'people'
  } catch (e) {
    dispatch(setPmListError(listId, e))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      const languages = state.user.getIn(['data', 'language'])
      const language = getPrimary(languages)
      switch (action.type) {
        case GET_MULTIPLE_PM_LISTS:
          getMultiple(dispatch, action.payload, { language, auth })
          break

        case GET_PM_LIST:
          getSingle(dispatch, action.payload, { language, auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
