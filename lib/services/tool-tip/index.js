import { Map } from 'immutable'
import _isNil from 'lodash/isNil'
import {
  STORE_KEY_VIDEO_PLAYER_HEARTS_TOOL_TIP,
  STORE_KEY_VIDEO_PLAYER_COMMENTS_TOOL_TIP,
  STORE_KEY_MEMBER_HOME_TILE_HERO_TOOL_TIP,
} from 'services/store-keys'

const TOOL_TIP_TO_FEATURE_TRACKING_MAP = Map({
  [STORE_KEY_MEMBER_HOME_TILE_HERO_TOOL_TIP]: 'explainerMoreDetails',
  [STORE_KEY_VIDEO_PLAYER_COMMENTS_TOOL_TIP]: 'explainerVideoPlayerComments',
  [STORE_KEY_VIDEO_PLAYER_HEARTS_TOOL_TIP]: 'explainerVideoPlayerHearts',
})

/**
 * Create ToolTip Data using a Feature Tracking Data
 */
export function createToolTipDataFromFeatureTrackingData (featureTrackingData) {
  return TOOL_TIP_TO_FEATURE_TRACKING_MAP.reduce(
    (reduction, featureTrackingKey, toolTipKey) => {
      const featureTrackingVal = featureTrackingData.get(featureTrackingKey)
      // If we have a date as the feature tracking value we should not show the tool tip
      // it has already been seen once.
      if (!_isNil(featureTrackingVal)) {
        return reduction.set(toolTipKey, Map({ visible: false }))
      }
      return reduction
    },
    Map(),
  )
}

export function getFeatureTrackingKey (toolTipKey) {
  return TOOL_TIP_TO_FEATURE_TRACKING_MAP.get(toolTipKey)
}
