/* eslint-disable import/prefer-default-export */
import { addToasty } from 'services/toasty/actions'
import {
  SET_FEATURE_TRACKING_DATA,
} from 'services/feature-tracking/actions'

export function videoOverlayToggleAddToasty ({ after }) {
  return after(SET_FEATURE_TRACKING_DATA, async ({ action, state, dispatch }) => {
    const { staticText } = state
    const { payload } = action
    const { data } = payload
    const shownOrHidden = data.get('disableVideoInfo') ? 'videoInformationHidden' : 'videoInformationShown'
    const message = staticText.getIn(['data', 'myAccountSettingsV2', 'data', shownOrHidden])
    dispatch(addToasty(message))
  }).when(({ state, action }) => {
    const { resolver } = state
    const { payload } = action
    const { data } = payload
    return resolver.get('path').includes('video/')
      && data.has('disableVideoInfo')
  })
}
