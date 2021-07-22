import _get from 'lodash/get'
import _map from 'lodash/map'
import _forEach from 'lodash/forEach'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { getPrimary } from 'services/languages'
import { getMultiplePmLists } from 'services/pm-list/actions'
import { getPmPlacement } from 'services/pm-placement/actions'
import { getMultipleSeries } from 'services/series/actions'
import { getMultipleVideos } from 'services/videos/actions'

import {
  setPmSection,
  setPmSectionError,
  GET_MULTIPLE_PM_SECTIONS,
  GET_PM_SECTION,
} from './actions'
import {
  TYPE_CONTENT_LIST,
  TYPE_PEOPLE_LIST,
  TYPE_PLACEMENT,
  TYPE_PORTALS,
} from '.'

async function getMultiple (dispatch, actionPayload, options = {}) {
  try {
    const sectionIds = actionPayload
    _forEach(sectionIds, sectionId => getSingle(dispatch, sectionId, options))
  } catch (e) {
    // Do nothing
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const {
    language,
    auth,
  } = options
  const sectionId = actionPayload
  try {
    const response = await apiGet(`page-manager/section/${sectionId}`, {
      language,
      // Remove disableMerchImpressionCount when web-app uses the section data for spotlight
      // and stops calling placement-content/:placementName from pm-placement
      disableMerchImpressionCount: true,
    }, { auth }, TYPE_BROOKLYN)
    const pmSection = _get(response, 'body', {})
    dispatch(setPmSection(sectionId, pmSection))
    if (pmSection.type === TYPE_PLACEMENT) {
      const placementName = _get(pmSection, 'data.placement')
      dispatch(getPmPlacement(placementName, language, sectionId))
    } else if (pmSection.type === TYPE_CONTENT_LIST
      || pmSection.type === TYPE_PEOPLE_LIST
      || pmSection.type === TYPE_PORTALS) {
      const listIds = _map(_get(pmSection, 'data.content', []), 'listId')
      dispatch(getMultiplePmLists(listIds))
    } else {
      const tabs = _get(pmSection, ['data', 'tabs'])
      _forEach(tabs, (tab) => {
        const contentList = _get(tab, 'tabContent', [])
        const videoIds = contentList
          .filter(i => i.contentType === 'video')
          .map(i => i.contentId)
        const seriesIds = contentList
          .filter(i => i.contentType === 'series')
          .map(i => i.contentId)
        if (seriesIds.length) {
          dispatch(getMultipleSeries(seriesIds, language))
        }
        if (videoIds.length) {
          dispatch(getMultipleVideos(videoIds, language))
        }
      })
    }
  } catch (e) {
    dispatch(setPmSectionError(sectionId, e))
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
        case GET_MULTIPLE_PM_SECTIONS:
          getMultiple(dispatch, action.payload, { language, auth })
          break

        case GET_PM_SECTION:
          getSingle(dispatch, action.payload, { language, auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
