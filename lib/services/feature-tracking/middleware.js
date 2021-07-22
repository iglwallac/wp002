import { Map, List } from 'immutable'
import { setUserDataLanguage } from 'services/user/actions'
import { resetToolTip } from 'services/tool-tip/actions'
// import { SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import {
  getFeatureTrackingData,
  RESET_FEATURE_TRACKING,
  setFeatureTrackingCount,
  SET_FEATURE_TRACKING_DATA,
  INCREMENT_FEATURE_IMPRESSION_COUNT,
  RESET_FEATURE_IMPRESSION_COUNT,
} from './actions'
import { incrementImpressionCount, resetImpressionCount } from '.'

/**
 * Handle the reset feature tracking for authenticated users
 * by reload their data. Usually happens at login.
 */
async function onResetFeatureTracking ({ store }) {
  const {
    auth,
  } = store.getState()
  if (auth.get('jwt')) {
    await store.dispatch(getFeatureTrackingData({ auth }))
    store.dispatch(resetToolTip())
  }
}

/**
 * Handle set feature tracking data and update user language
 * data
 */
function onSetFeatureTrackingData ({ action, store }) {
  const { user = Map() } = store.getState()
  const { data: featureTracking = Map() } = action.payload
  const featureTrackingLanguage = featureTracking.get(
    'userLanguages',
    List(),
  )
  const userLanguage = user.getIn(['data', 'language'], List())
  if (
    featureTrackingLanguage.size > 0 &&
    !featureTrackingLanguage.equals(userLanguage)
  ) {
    // We have languages and they are different then the current
    // user languages update teh user store
    store.dispatch(setUserDataLanguage(featureTrackingLanguage))
  }
}

async function onIncrementFeatureImpressionCount ({ action, store }) {
  const state = store.getState()
  const { auth } = state
  const { featureName } = action.payload

  try {
    const response = await incrementImpressionCount(featureName, auth)
    const { impressions } = response
    const data = { featureImpressions: { [featureName]: impressions } }
    store.dispatch(setFeatureTrackingCount(data))
  } catch (e) {
    // ignoring errors here
  }
}

async function onResetFeatureImpressionCount ({ action, store }) {
  const state = store.getState()
  const { auth } = state
  const { featureName } = action.payload

  try {
    await resetImpressionCount(featureName, auth)
    const data = { featureImpressions: { [featureName]: 0 } }
    store.dispatch(setFeatureTrackingCount(data))
  } catch (e) {
    // ignoring errors here
  }
}

export default function middleware (store) {
  return next => (action) => {
    switch (action.type) {
      case RESET_FEATURE_TRACKING:
      // case SET_AUTH_LOGIN_SUCCESS:
        onResetFeatureTracking({ store })
        break
      case SET_FEATURE_TRACKING_DATA:
        onSetFeatureTrackingData({ action, store })
        break
      case INCREMENT_FEATURE_IMPRESSION_COUNT:
        onIncrementFeatureImpressionCount({ action, store })
        break
      case RESET_FEATURE_IMPRESSION_COUNT:
        onResetFeatureImpressionCount({ action, store })
        break
      default:
        break
    }
    next(action)
  }
}
