import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ButtonToggle from 'components/ButtonToggle'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { Map } from 'immutable'
import { NOTIFICATIONS_RECOMMENDED_TOGGLE_EVENT } from 'services/event-tracking'

const NotificationRecommendedSettings = (props) => {
  const { recommendedNotificationsEnabled, staticText, setFeatureTrackingDataPersistent } = props

  const onSettingsChange = () => {
    setFeatureTrackingDataPersistent({
      data: Map({ recommendedNotificationsEnabled: !recommendedNotificationsEnabled }),
    })
  }

  const eventData = NOTIFICATIONS_RECOMMENDED_TOGGLE_EVENT
    .set('eventLabel', !recommendedNotificationsEnabled ? 'toggled on' : 'toggled off')

  return (
    <div className="my-account-settings-V2__notification-settings-controls">
      <div className="my-account-settings-V2__notification-settings-text-container">
        <div className="my-account-settings-V2__notification-settings-title">
          { staticText.getIn(['data', 'notificationsRecommendedHeader']) }
        </div>
        <div className="my-account-settings-V2__notification-settings-text">
          { staticText.getIn(['data', 'notificationsRecommendedBody']) }
        </div>
      </div>
      <div className="my-account-settings-V2__notification-settings-toggle">
        <ButtonToggle
          checked={recommendedNotificationsEnabled}
          onChange={onSettingsChange}
          showLabel
          gaEventData={eventData}
          round
        />
      </div>
    </div>
  )
}

NotificationRecommendedSettings.propTypes = {
  recommendedNotificationsEnabled: PropTypes.bool,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        recommendedNotificationsEnabled: state.featureTracking.getIn(['data', 'recommendedNotificationsEnabled'], false),
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
)(NotificationRecommendedSettings)
