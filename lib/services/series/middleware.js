import {
  SET_EVENT_SERIES_IMPRESSED,
} from 'services/event-tracking/actions'
import {
  setMultipleSeries,
  setSeries,
  setSeriesError,
  setSeriesImpressionData,
  GET_MULTIPLE_PM_SERIES,
  GET_PM_SERIES,
} from './actions'
import {
  getMany as getManySeries,
  get as getSeries,
} from '.'

async function getMultiple (dispatch, actionPayload, options = {}) {
  const { auth } = options
  try {
    const { seriesIds, language } = actionPayload
    const pmSeries = await getManySeries(seriesIds, { auth, language })
    // Errors on individual series are returned inside pmSeries
    // and handled by SET_PM_MULTIPLE_SERIES
    dispatch(setMultipleSeries(seriesIds, language, pmSeries))
  } catch (e) {
    // Do Nothing
  }
}

async function getSingle (dispatch, actionPayload, options = {}) {
  const { auth } = options
  const { seriesId, language } = actionPayload
  try {
    const pmSeries = await getSeries(seriesId, { auth, language })
    dispatch(setSeries(seriesId, language, pmSeries))
  } catch (e) {
    dispatch(setSeriesError(seriesId, language, e))
  }
}

async function handleSeriesImpression (dispatch, actionPayload) {
  const { event, language } = actionPayload
  const seriesId = event.getIn(['properties', 'contentId'])
  dispatch(setSeriesImpressionData(seriesId, language.get(0)))
}
export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_MULTIPLE_PM_SERIES:
          getMultiple(dispatch, action.payload, { auth })
          break

        case GET_PM_SERIES:
          getSingle(dispatch, action.payload, { auth })
          break

        case SET_EVENT_SERIES_IMPRESSED:
          handleSeriesImpression(dispatch, action.payload)
          break

        default:
          break
      }
    }
    next(action)
  }
}
