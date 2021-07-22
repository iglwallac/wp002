import { get as getFeatureTacking, set as setFeatureTracking } from './index'

export const SET_FEATURE_TRACKING_DATA = 'SET_FEATURE_TRACKING_DATA'
export const SET_FEATURE_TRACKING_PROCESSING = 'SET_FEATURE_TRACKING_PROCESSING'
export const RESET_FEATURE_TRACKING = 'RESET_FEATURE_TRACKING'
export const INCREMENT_FEATURE_IMPRESSION_COUNT = 'INCREMENT_FEATURE_IMPRESSION_COUNT'
export const RESET_FEATURE_IMPRESSION_COUNT = 'RESET_FEATURE_IMPRESSION_COUNT'
export const SET_FEATURE_TRACKING_COUNT = 'SET_FEATURE_TRACKING_COUNT'
export const ADD_HIDDEN_PM_SECTION = 'ADD_HIDDEN_PM_SECTION'

export function setFeatureTrackingProcessing (value) {
  return {
    type: SET_FEATURE_TRACKING_PROCESSING,
    payload: value,
  }
}

export function setFeatureTrackingData (data, processing = false) {
  return {
    type: SET_FEATURE_TRACKING_DATA,
    payload: { data, processing },
  }
}

export function resetFeatureTracking () {
  return {
    type: RESET_FEATURE_TRACKING,
  }
}

export function incrementFeatureImpressionCount (featureName) {
  return {
    type: INCREMENT_FEATURE_IMPRESSION_COUNT,
    payload: { featureName },
  }
}

export function resetFeatureImpressionCount (featureName) {
  return {
    type: RESET_FEATURE_IMPRESSION_COUNT,
    payload: { featureName },
  }
}

export function setFeatureTrackingCount (data) {
  return {
    type: SET_FEATURE_TRACKING_COUNT,
    payload: { data },
  }
}

export function getFeatureTrackingData (options) {
  const { auth } = options
  return async function getFeatureTrackingDataThunk (dispatch) {
    dispatch(setFeatureTrackingProcessing(true))
    const data = await getFeatureTacking({ auth })
    dispatch(setFeatureTrackingData(data))
    return data
  }
}

export function setFeatureTrackingDataPersistent (options) {
  const { data } = options
  return async function setFeatureTrackingDataPersistentThunk (dispatch, getState) {
    const { auth } = getState()
    // Set the data right away since we have it all.
    dispatch(setFeatureTrackingData(data, true))
    // Can't save data to the endpoint without auth so just update the store.
    if (!auth.get('jwt')) {
      dispatch(setFeatureTrackingProcessing(false))
      return true
    }
    await setFeatureTracking({ auth, data })
    // Mark processing as finished.
    dispatch(setFeatureTrackingProcessing(false))
    return true
  }
}
