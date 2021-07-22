import { get as apiGet, post as apiPost, TYPE_BROOKLYN_JSON } from 'api-client'
import { fromJS } from 'immutable'
import {
  setLocalPreferences,
} from 'services/local-preferences'
import {
  SET_V5_ONBOARDING_DATA,
  GET_V5_ONBOARDING_DATA,
  POST_V5_ONBOARDING_DATA,
  SET_ONBOARDING_COMPLETED,
  GET_RECOMMENDER_STATUS,
  SET_RECOMMENDER_STATUS,
  SET_V5_ONBOARDING_DATA_ERROR,
  GET_V14_ONBOARDING_CHOICES,
  SET_V14_ONBOARDING_DATA,
  SET_V14_ONBOARDING_DATA_ERROR,
  POST_V14_ONBOARDING_DATA,
  GET_USER_ONBOARDING_DATA,
  SET_SELECTED_USER_CHOICES,
  SET_V14_SELECTED_USER_CHOICES_COMPLETED,
} from './actions'

export function getV5Onboarding ({ takeEvery }) {
  return takeEvery(GET_V5_ONBOARDING_DATA, async ({ action }) => {
    let route = '/v5/user/onboard-choices'
    const { payload } = action
    const { language, isFmtv } = payload

    if (isFmtv) {
      route = '/v5-fmtv/user/onboard-choices'
    }

    try {
      const res = await apiGet(
        route,
        { language },
        { languageShouldBeString: true },
        TYPE_BROOKLYN_JSON,
      )

      const data = fromJS(res.body)
      return {
        type: SET_V5_ONBOARDING_DATA,
        payload: data,
      }
    } catch (e) {
      return {
        type: SET_V5_ONBOARDING_DATA_ERROR,
        payload: e,
      }
    }
  })
}

export function getv14OnboardingChoices ({ takeEvery }) {
  return takeEvery(GET_V14_ONBOARDING_CHOICES, async ({ action }) => {
    const route = '/user/onboard-choices/1.4'
    const { language } = action.payload

    try {
      const res = await apiGet(
        route,
        { language },
        { languageShouldBeString: true },
        TYPE_BROOKLYN_JSON,
      )

      const data = fromJS(res.body)
      return {
        type: SET_V14_ONBOARDING_DATA,
        payload: data,
      }
    } catch (e) {
      return {
        type: SET_V14_ONBOARDING_DATA_ERROR,
        payload: e,
      }
    }
  })
}

export function postV5Onboarding ({ takeEvery }) {
  let route = '/v5/user/onboard'

  return takeEvery(POST_V5_ONBOARDING_DATA, async ({ action }) => {
    const { payload } = action
    const { terms, auth, isFmtv } = payload
    if (isFmtv) {
      route = '/v5-fmtv/user/onboard'
    }
    try {
      apiPost(
        route,
        terms,
        { auth },
        TYPE_BROOKLYN_JSON,
      )
      const onboardVersion = '1.3'
      setLocalPreferences(auth.get('uid'), 'onboardingComplete', true, auth)
      setLocalPreferences(auth.get('uid'), 'onboardVersion', onboardVersion, auth)
      return {
        type: SET_ONBOARDING_COMPLETED,
        payload: { completed: true, onboardVersion },
      }
    } catch (e) {
      return {
        type: SET_ONBOARDING_COMPLETED,
        payload: { completed: false, onboardVersion: '' },
      }
    }
  })
}

export function getUserOnboardingData ({ takeEvery }) {
  const route = '/user/onboard'

  return takeEvery(GET_USER_ONBOARDING_DATA, async ({ action }) => {
    const { language, auth } = action.payload
    try {
      const result = await apiGet(
        route,
        { language },
        { auth },
        TYPE_BROOKLYN_JSON,
      )

      return {
        type: SET_SELECTED_USER_CHOICES,
        payload: fromJS({ status: 'success', result: result.body }),
      }
    } catch (e) {
      return {
        type: SET_SELECTED_USER_CHOICES,
        payload: fromJS({ status: 'error', result: {} }),
      }
    }
  })
}

export function postV14Onboarding ({ takeEvery }) {
  const route = '/user/onboard'

  return takeEvery(POST_V14_ONBOARDING_DATA, async ({ action }) => {
    const { payload } = action
    const { terms, auth } = payload
    const onboardVersion = '1.4'

    try {
      await apiPost(
        route,
        { terms, onboardVersion },
        { auth },
        TYPE_BROOKLYN_JSON,
      )

      return {
        type: SET_V14_SELECTED_USER_CHOICES_COMPLETED,
      }
    } catch (e) {
      return {
        type: SET_V14_SELECTED_USER_CHOICES_COMPLETED,
      }
    }
  })
}

export function getRecommenderStatus ({ takeEvery }) {
  return takeEvery(GET_RECOMMENDER_STATUS, async ({ action }) => {
    const { payload } = action
    const { auth } = payload
    try {
      const res = await apiGet(
        '/v2/recommender-status',
        null,
        { auth },
        TYPE_BROOKLYN_JSON,
      )

      const data = fromJS(res.body)
      const onboardVectorsLength = data.get('onboardVectorsLength', 0)

      return {
        type: SET_RECOMMENDER_STATUS,
        payload: onboardVectorsLength > 0,
      }
    } catch (e) {
      return {
        type: SET_RECOMMENDER_STATUS,
        payload: 0,
      }
    }
  })
}
