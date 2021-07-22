import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ButtonToggle from 'components/ButtonToggle'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { Map } from 'immutable'
import { SPOTLIGHT_TOGGLE_EVENT } from 'services/event-tracking'

function componentFromHTML (html) {
  // eslint-disable-next-line react/no-danger
  return <p dangerouslySetInnerHTML={{ __html: html }} />
}
const MinimizeSpotlightSettings = (props) => {
  const { mhSpotlightCollapsed, staticText, setFeatureTrackingDataPersistent } = props

  const onMinimizeSpotlightSettingsChange = () => {
    setFeatureTrackingDataPersistent({
      data: Map({ mhSpotlightCollapsed: !mhSpotlightCollapsed }),
    })
  }

  const eventData = SPOTLIGHT_TOGGLE_EVENT
    .set('eventLabel', !mhSpotlightCollapsed ? 'off' : 'on')

  return (
    <div className="my-account-settings-V2__display-settings-controls">
      <div className="my-account-settings-V2__display-settings-text-container">
        <div className="my-account-settings-V2__display-settings-title">
          { staticText.getIn(['data', 'homepagePromotions']) }
        </div>
        <div className="my-account-settings-V2__display-settings-text">
          {componentFromHTML(staticText.getIn(['data', 'homepagePromotionsDesc']))}
        </div>
      </div>
      <div className="my-account-settings-V2__display-settings-toggle">
        <ButtonToggle
          checked={!mhSpotlightCollapsed}
          onChange={onMinimizeSpotlightSettingsChange}
          showLabel
          gaEventData={eventData}
          round
        />
      </div>
    </div>
  )
}

MinimizeSpotlightSettings.propTypes = {
  mhSpotlightCollapsed: PropTypes.bool,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}


export default compose(
  connectRedux(
    (state) => {
      return {
        mhSpotlightCollapsed: state.featureTracking.getIn(['data', 'mhSpotlightCollapsed'], false),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
      }
    },
  ),
  connectStaticText({ storeKey: 'myAccountSettingsV2' }),
)(MinimizeSpotlightSettings)
