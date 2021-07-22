import { List, fromJS } from 'immutable'
import { setConsolidatedContinueWatchingData } from 'services/member-home/actions'
import { getContinueWatching } from '.'

export const SET_CONTINUE_WATCHING_PROCESSING = 'SET_CONTINUE_WATCHING_PROCESSING'
export const SET_CONTINUE_WATCHING_DATA = 'SET_CONTINUE_WATCHING_DATA'
export const RESET_CONTINUE_WATCHING_DATA = 'RESET_CONTINUE_WATCHING_DATA'

export function setContinueWatchingProcessing (processing) {
  return {
    type: SET_CONTINUE_WATCHING_PROCESSING,
    payload: processing,
  }
}

export function setContinueWatchingData (data, processing = false) {
  return {
    type: SET_CONTINUE_WATCHING_DATA,
    payload: { data, processing },
  }
}

export function resetContinueWatchingData () {
  return {
    type: RESET_CONTINUE_WATCHING_DATA,
  }
}

export function getContinueWatchingData (options) {
  const { auth, user } = options
  const userLanguage = user.getIn(['data', 'language'], List())
  const language = userLanguage.size > 0 ? userLanguage.toJS() : undefined

  return function getContinueWatchingDataThunk (dispatch) {
    const requestOptions = {
      language,
      user,
      auth,
      limit: 12,
    }
    dispatch(setContinueWatchingProcessing(true))
    return getContinueWatching(requestOptions)
      .then((result) => {
        const data = fromJS(result)
        dispatch(setContinueWatchingData(data))
        dispatch(setConsolidatedContinueWatchingData(data.get('titles', List())))
      })
  }
}
