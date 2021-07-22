import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ButtonToggle from 'components/ButtonToggle'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { Map } from 'immutable'
import { VIDEOINFO_TOGGLED } from 'services/event-tracking'

const VideoPlayerInfo = (props) => {
  const {
    videoPlayerInfoDisabled,
    staticText,
    setFeatureTrackingDataPersistent,
  } = props

  const title = 'videoPlayerInfo'
  const description = 'videoPlayerInfoDesc'
  const onVideoPlayerInfoChange = () => {
    setFeatureTrackingDataPersistent({
      data: Map({ disableVideoInfo: !videoPlayerInfoDisabled }),
    })
  }

  const eventData = VIDEOINFO_TOGGLED.set(
    'eventLabel',
    !videoPlayerInfoDisabled ? 'off' : 'on',
  )

  return (
    <div className="my-account-settings-V2__display-settings-controls">
      <div className="my-account-settings-V2__display-settings-text-container">
        <div className="my-account-settings-V2__display-settings-title">
          {staticText.getIn(['data', title])}
        </div>
        <div className="my-account-settings-V2__display-settings-text">
          {staticText.getIn(['data', description])}
        </div>
      </div>
      <div className="my-account-settings-V2__display-settings-toggle">
        <ButtonToggle
          checked={!videoPlayerInfoDisabled}
          onChange={onVideoPlayerInfoChange}
          showLabel
          gaEventData={eventData}
          round
        />
      </div>
    </div>
  )
}

VideoPlayerInfo.propTypes = {
  videoPlayerInfoDisabled: PropTypes.bool.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        videoPlayerInfoDisabled: state.featureTracking.getIn(
          ['data', 'disableVideoInfo'],
          false,
        ),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
      }
    },
  ),
  connectStaticText({ storeKey: 'myAccountSettingsV2' }),
)(VideoPlayerInfo)
