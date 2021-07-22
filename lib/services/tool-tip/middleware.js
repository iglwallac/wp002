import { Map } from 'immutable'
import { createToolTipDataFromFeatureTrackingData } from '.'
import { initToolTipFeatureTracking } from './actions'

/**
 * Handle initializing tool tips when feature tracking data changes
 * @param {Immutable.Map} featureTrackingData The feature tracking data
 */
function handleFeatureTrackingDataChange (featureTrackingData, store) {
  const toolTipData = createToolTipDataFromFeatureTrackingData(featureTrackingData)
  store.dispatch(initToolTipFeatureTracking(toolTipData))
}

export default function middleware (store) {
  return next => (action) => {
    const { featureTracking: featureTrackingPrev } = store.getState()
    next(action)
    const { featureTracking: featureTrackingNext, toolTip } = store.getState()
    const featureTrackingDataPrev = featureTrackingPrev.get('data', Map())
    const featureTrackingDataNext = featureTrackingNext.get('data', Map())
    const featureTrackingDataChanged = !featureTrackingDataPrev.equals(featureTrackingDataNext)
    const boostrapDataReady = !toolTip.get('initializedFeatureTracking') && !featureTrackingDataNext.isEmpty()
    if (boostrapDataReady || featureTrackingDataChanged) {
      handleFeatureTrackingDataChange(featureTrackingDataNext, store)
    }
  }
}
