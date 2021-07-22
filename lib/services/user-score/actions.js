import { getUserScore as apiGetUserScore } from 'services/user-score'
import _get from 'lodash/get'

export const SET_YOGA_SCORE_PROCESSING = 'SET_YOGA_SCORE_PROCESSING'
export const SET_YOGA_SCORE_DATA = 'SET_YOGA_SCORE_DATA'
export const SET_YOGA_SCORE_ERROR = 'SET_YOGA_SCORE_ERROR'

export function getUserScore (options = {}) {
  return function getUserScoreThunk (dispatch, getState) {
    const { auth = Map() } = getState()
    const { nids, scoreType } = options
    dispatch(setgetUserScoreProcessing(true))
    return apiGetUserScore({ auth, nids })
      .then((res) => {
        const score = _get(res, ['body', 'data', 'score'])
        dispatch(setUserScoreData(score, scoreType))
        dispatch(setgetUserScoreProcessing(false))
        return res
      })
      .catch((err) => {
        dispatch(setUserScoreError(err))
        dispatch(setgetUserScoreProcessing(false))
        throw err
      })
  }
}

export function setgetUserScoreProcessing (data) {
  return {
    type: SET_YOGA_SCORE_PROCESSING,
    payload: data,
  }
}
export function setUserScoreData (score, scoreType) {
  return {
    type: SET_YOGA_SCORE_DATA,
    payload: {
      score,
      scoreType,
    },
  }
}

export function setUserScoreError (data) {
  return {
    type: SET_YOGA_SCORE_ERROR,
    payload: data,
  }
}
