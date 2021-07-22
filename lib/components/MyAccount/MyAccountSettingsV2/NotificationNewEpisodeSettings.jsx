import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ButtonToggle from 'components/ButtonToggle'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { Map } from 'immutable'
import { NOTIFICATIONS_NEW_CONTENT_TOGGLE_EVENT } from 'services/event-tracking'

function componentFromHTML (html) {
  // eslint-disable-next-line react/no-danger
  return <p dangerouslySetInnerHTML={{ __html: html }} />
}
const NotificationRecommendedSettings = (props) => {
  const { newEpisodeNotificationsEnabled, staticText, setFeatureTrackingDataPersistent } = props

  const onSettingsChange = () => {
    setFeatureTrackingDataPersistent({
      data: Map({ newEpisodeNotificationsEnabled: !newEpisodeNotificationsEnabled }),
    })
  }

  const eventData = NOTIFICATIONS_NEW_CONTENT_TOGGLE_EVENT
    .set('eventLabel', !newEpisodeNotificationsEnabled ? 'toggled on' : 'toggled off ')

  return (
    <div className="my-account-settings-V2__notification-settings-controls">
      <div className="my-account-settings-V2__notification-settings-text-container">
        <div className="my-account-settings-V2__notification-settings-title">
          { staticText.getIn(['data', 'notificationsNewEpisodeHeader']) }
        </div>
        <div className="my-account-settings-V2__notification-settings-text">
          {componentFromHTML(staticText.getIn(['data', 'notificationsNewEpisodeBody']))}
        </div>
      </div>
      <div className="my-account-settings-V2__notification-settings-toggle">
        <ButtonToggle
          checked={newEpisodeNotificationsEnabled}
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
  newEpisodeNotificationsEnabled: PropTypes.bool,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        newEpisodeNotificationsEnabled: state.featureTracking.getIn(['data', 'newEpisodeNotificationsEnabled'], false),
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
