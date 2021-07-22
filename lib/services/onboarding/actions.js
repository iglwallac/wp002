import isBoolean from 'lodash/isBoolean'
import {
  getLocalPreferences,
  setLocalPreferences,
} from 'services/local-preferences'
import {
  apiGetRecommenderStatus,
  apiGetOnboardingStatus,
} from '.'

/**
 * Onboarding Processing:
 */

export const GET_RECOMMENDER_STATUS = 'GET_RECOMMENDER_STATUS'
export function getRecommenderStatus (auth) {
  return {
    type: GET_RECOMMENDER_STATUS,
    payload: { auth },
  }
}

export const SET_RECOMMENDER_STATUS = 'SET_RECOMMENDER_STATUS'
export function setRecommenderStatus (data) {
  return {
    type: SET_RECOMMENDER_STATUS,
    payload: { data },
  }
}

export const GET_V5_ONBOARDING_DATA = 'GET_V5_ONBOARDING_DATA'
export function getV5OnboardingData (language, isFmtv) {
  return {
    type: GET_V5_ONBOARDING_DATA,
    payload: { language, isFmtv },
  }
}

export const SET_V14_ONBOARDING_DATA = 'SET_V14_ONBOARDING_DATA'
export const SET_V14_ONBOARDING_DATA_ERROR = 'SET_V14_ONBOARDING_DATA_ERROR'

export const GET_V14_ONBOARDING_CHOICES = 'GET_V14_ONBOARDING_CHOICES'
export function getV14OnboardingChoices (language) {
  return {
    type: GET_V14_ONBOARDING_CHOICES,
    payload: { language },
  }
}

export const SET_V5_ONBOARDING_DATA = 'SET_V5_ONBOARDING_DATA'
export const SET_V5_ONBOARDING_DATA_ERROR = 'SET_V5_ONBOARDING_DATA_ERROR'

export const POST_V5_ONBOARDING_DATA = 'POST_V5_ONBOARDING_DATA'
export function postV5OnboardingData (data) {
  return {
    type: POST_V5_ONBOARDING_DATA,
    payload: data,
  }
}

export const POST_V14_ONBOARDING_DATA = 'POST_V14_ONBOARDING_DATA'
export function postV14OnboardingData (data) {
  return {
    type: POST_V14_ONBOARDING_DATA,
    payload: data,
  }
}

export const SET_V14_SELECTED_USER_CHOICES = 'SET_V14_SELECTED_USER_CHOICES'
export const SET_V14_SELECTED_USER_CHOICES_COMPLETED = 'SET_V14_SELECTED_USER_CHOICES_COMPLETED'
export const SET_V14_SELECTED_USER_CHOICES_CLEAR = 'SET_V14_SELECTED_USER_CHOICES_CLEAR'
export function setV14SelectedChoicesClear () {
  return {
    type: SET_V14_SELECTED_USER_CHOICES_CLEAR,
    payload: {},
  }
}


export const GET_USER_ONBOARDING_DATA = 'GET_USER_ONBOARDING_DATA'
export const SET_SELECTED_USER_CHOICES = 'SET_SELECTED_USER_CHOICES'
export function getUserOnboardingData (language, auth) {
  return {
    type: GET_USER_ONBOARDING_DATA,
    payload: { language, auth },
  }
}

export const POST_V5_ONBOARDING_SUCCESS = 'POST_V5_ONBOARDING_SUCCESS'
export function postV5OnboardingSucess (res) {
  return {
    type: POST_V5_ONBOARDING_SUCCESS,
    payload: res,
  }
}


export const SET_ONBOARDING_PROCESSING = 'SET_ONBOARDING_PROCESSING'
function setOnboardingProcessing (data) {
  return {
    type: SET_ONBOARDING_PROCESSING,
    payload: data,
  }
}


/**
 * Selection:
 */

export const SET_ONBOARDING_COMPLETED = 'SET_ONBOARDING_COMPLETED'
function setOnboardingCompleted (completed, onboardVersion, processing = false) {
  return {
    type: SET_ONBOARDING_COMPLETED,
    payload: { completed, onboardVersion, processing },
  }
}

/**
 * Recommender Status:
 */

export function getOnboardingRecommederStatus (auth) {
  return function getOnboardingRecommederStatusThunk (dispatch, getState) {
    const startTime = new Date().getTime()
    // We hit the max number of attempts give up and let the user move on.
    const state = getState().onboarding
    if (state.get('recommenderAttempts') > 20) {
      return dispatch(
        setOnboardingRecommederStatusComplete(
          true,
          getState().onboarding.get('recommenderAttempts'),
        ),
      )
    }
    return apiGetRecommenderStatus({ auth })
      .then((data) => {
        const endTime = new Date().getTime()
        const responseTime = endTime - startTime
        let timeout = 0
        if (responseTime < 1000) {
          timeout = responseTime - 1000
        }
        if (data.multFactor === 1 || data.onboardVectorsLength > 0) {
          return dispatch(setOnboardingRecommederStatusComplete(true))
        }
        dispatch(incrementOnboardingRecommederStatusAttempts())
        return setTimeout(() => {
          dispatch(getOnboardingRecommederStatus(auth))
        }, timeout)
      })
  }
}

export const SET_ONBOARDING_RECOMMENDER_STATUS_COMPLETE = 'SET_ONBOARDING_RECOMMENDER_STATUS_COMPLETE'
function setOnboardingRecommederStatusComplete (complete, attempts = 0) {
  return {
    type: SET_ONBOARDING_RECOMMENDER_STATUS_COMPLETE,
    payload: {
      complete,
      attempts,
    },
  }
}

export const INCREMENT_ONBOARDING_RECOMMENDER_STATUS_ATTEMPTS = 'INCREMENT_ONBOARDING_RECOMMENDER_STATUS_ATTEMPTS'
function incrementOnboardingRecommederStatusAttempts () {
  return {
    type: INCREMENT_ONBOARDING_RECOMMENDER_STATUS_ATTEMPTS,
  }
}

/**
 * Onboarding Status:
 */

export function getOnboardingStatus ({ auth }) {
  return function getOnboardingStatusThunk (dispatch) {
    dispatch(setOnboardingProcessing(true))

    // Check local storgage first and use it to initialize the store.
    const localComplete = getLocalPreferences(auth.get('uid'), 'onboardingComplete')
    if (isBoolean(localComplete)) {
      const onboardVersion = getLocalPreferences(auth.get('uid'), 'onboardVersion')
      dispatch(setOnboardingCompleted(localComplete, onboardVersion))
      return localComplete
    }

    return apiGetOnboardingStatus({ auth })
      .then((data) => {
        const onboardComplete = data.onboardComplete === 'error'
          ? false
          : data.onboardComplete
        const onboardVersion = data.onboardComplete === 'error'
          ? ''
          : data.onboardVersion

        // Save value in local storage.
        setLocalPreferences(auth.get('uid'), 'onboardingComplete', onboardComplete, auth)
        setLocalPreferences(auth.get('uid'), 'onboardVersion', onboardVersion, auth)

        dispatch(setOnboardingCompleted(onboardComplete, onboardVersion))
        return onboardComplete
      })
  }
}

/**
 * Reset Onboarding:
 */

export const RESET_ONBOARDING = 'RESET_ONBOARDING'
export function resetOnboarding () {
  return {
    type: RESET_ONBOARDING,
  }
}
