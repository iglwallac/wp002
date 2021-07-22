import _get from 'lodash/get'
import _forEach from 'lodash/forEach'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { get as getConfig } from 'config'
import { getSeries, getMultipleSeries } from 'services/series/actions'
import { getVideo, getMultipleVideos } from 'services/videos/actions'
import { isTypeSeriesAll, isTypeVideoAll, isTypeEpisodeAll } from 'services/content-type'
import { setEventSeriesImpressed, setEventVideoImpressed } from 'services/event-tracking/actions'
import { Map, List } from 'immutable'
import { SCREEN_TYPE_MEMBER_HOME } from 'services/upstream-context'
import { handleMerchImpressionEvents } from 'services/event-tracking'
import { PM_PLACEMENT_SPOTLIGHT_LIVE_ACCESS } from 'services/pm-placement/constants'
import {
  getPmPlacement,
  setPmPlacement,
  setPmPlacementError,
  GET_MULTIPLE_PM_PLACEMENTS,
  GET_PM_PLACEMENT,
  SET_PM_PLACEMENT,
} from './actions'

const config = getConfig()

// Code must be compatible with all features up to the given version:
export const API_VERSION = '1.252.1'

/**
 * Get PM Placement singleton to limit the amount
 * of timeouts to 1
 */
let _getPmPlacementTimeout

async function getMultiple (dispatch, actionPayload, options = {}) {
  try {
    const { placementNames, language } = actionPayload
    _forEach(placementNames, placementName =>
      getSingle(dispatch, { placementName, language }, options),
    )
  } catch (e) {
    // Do nothing
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const {
    auth,
    app,
    page,
    videos,
  } = options
  const { placementName, language, sectionId } = actionPayload
  const LASpotlightOption = true

  try {
    const { disableImpressionCap } = config.features
    const apiGetOptions = {
      apiVersion: API_VERSION,
      language,
      disableImpressionCap: disableImpressionCap ? 1 : undefined,
      LASpotlightOption,
    }
    const response = await apiGet(`placement-content/${placementName}`, apiGetOptions, { auth }, TYPE_BROOKLYN)
    const pmPlacement = _get(response, 'body', {})
    const isMerch = pmPlacement.payloadType === 'merchandising-content'

    dispatch(setPmPlacement(placementName, language, pmPlacement))

    const payload = _get(pmPlacement, 'payload')

    if (payload) {
      const contentId = isMerch ?
        _get(payload, ['contentItems', 0, 'contentId']) :
        _get(payload, 'id')

      const contentType = isMerch ?
        _get(payload, ['contentItems', 0, 'contentType']) :
        _get(payload, 'type')

      const impressed = videos.getIn([contentId, language, 'impressed'])
      const isVideo = isTypeVideoAll(contentType)
      const isEpisode = isTypeEpisodeAll(contentType)
      const isSeries = isTypeSeriesAll(contentType)
      const videoEvent = isVideo || isEpisode
      const typeId = isSeries ? 'seriesId' : 'videoId'

      const upstreamContext = Map({
        contentId,
        contentType,
        contextType: 'pm/spotlight',
        merchEventId: _get(pmPlacement, 'merchEventId'),
        score: _get(payload, 'pineScore', null),
        screenType: placementName === 'member-home-spotlight-a-v1' ? SCREEN_TYPE_MEMBER_HOME : null,
        sectionId,
        sectionIndex: 0,
        source: _get(payload, 'pineSource', null),
        typeId: contentId,
      })

      const eventOptions = {
        auth,
        location,
        page,
        app,
        language: List([language]),
      }

      if (!impressed) {
        if (videoEvent && !isMerch) {
          eventOptions.upstreamContext = upstreamContext
          dispatch(setEventVideoImpressed(eventOptions))
        }
        if (isSeries && !isMerch) {
          eventOptions.upstreamContext = upstreamContext
          dispatch(setEventSeriesImpressed(eventOptions))
        }

        if (isMerch) {
          const newContext = upstreamContext
            .set('campaignId', _get(payload, 'id'))
            .set(typeId, contentId)

          eventOptions.upstreamContext = newContext
          if (videoEvent) {
            dispatch(setEventVideoImpressed(eventOptions))
          }
          if (isSeries) {
            dispatch(setEventSeriesImpressed(eventOptions))
          }
        }
      }
    }

    if (pmPlacement.payloadType === 'featured-content-impression') {
      dispatchFeatureContentImpressionActions(dispatch, pmPlacement, { language })
    }

    if (pmPlacement.payloadType === 'pine-top-video') {
      dispatchPineTopVideoActions(dispatch, pmPlacement, { language })
    }

    if (pmPlacement.payloadType === PM_PLACEMENT_SPOTLIGHT_LIVE_ACCESS) {
      const countdown = _get(pmPlacement, 'payload.countdown')
      if (countdown) {
        if (_getPmPlacementTimeout) {
          clearTimeout(_getPmPlacementTimeout)
        }
        _getPmPlacementTimeout = setTimeout(() => {
          dispatch(getPmPlacement(placementName, language, sectionId))
          _getPmPlacementTimeout = undefined
        }, countdown + 1000)
      }
    }

    if (isMerch) {
      dispatchMerchandisingContentActions(dispatch, pmPlacement, { language })
    }
  } catch (e) {
    dispatch(setPmPlacementError(placementName, language, e))
  }
}

function dispatchFeatureContentImpressionActions (dispatch, pmPlacement, options = {}) {
  const { language } = options
  const id = _get(pmPlacement, 'payload.id')
  const type = _get(pmPlacement, 'payload.type')
  if (id && type === 'video') {
    dispatch(getVideo(id, language))
  }
  if (id && type === 'series') {
    dispatch(getSeries(id, language))
  }
}

function dispatchPineTopVideoActions (dispatch, pmPlacement, options = {}) {
  const { language } = options
  const videoId = _get(pmPlacement, 'payload.id')
  if (videoId) {
    dispatch(getVideo(videoId, language))
  }
}

function dispatchMerchandisingContentActions (dispatch, pmPlacement, options = {}) {
  const { language } = options
  const contentItems = _get(pmPlacement, 'payload.contentItems', [])

  const videoIds = contentItems
    .filter(i => i.contentType === 'video')
    .map(i => i.contentId)

  const seriesIds = contentItems
    .filter(i => i.contentType === 'series')
    .map(i => i.contentId)

  if (videoIds.length) {
    dispatch(getMultipleVideos(videoIds, language))
  }

  if (seriesIds.length) {
    dispatch(getMultipleSeries(seriesIds, language))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      const app = state.app
      const page = state.page
      const videos = state.videos

      switch (action.type) {
        case GET_MULTIPLE_PM_PLACEMENTS:
          getMultiple(dispatch, action.payload, { auth })
          break

        case GET_PM_PLACEMENT:
          getSingle(dispatch, action.payload, { auth, app, page, videos })
          break

        case SET_PM_PLACEMENT:
          handleMerchImpressionEvents(dispatch, action.payload, true)
          break

        default:
          break
      }
    }
    next(action)
  }
}
