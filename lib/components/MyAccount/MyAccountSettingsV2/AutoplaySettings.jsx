import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ButtonToggle from 'components/ButtonToggle'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { Map } from 'immutable'
import { ENDSTATE_AUTOPLAY_TOGGLED } from 'services/event-tracking'

const AutoplaySettings = (props) => {
  const { autoPlayNextDisabled, staticText, setFeatureTrackingDataPersistent } = props

  const onAutoPlaySettingsChange = () => {
    setFeatureTrackingDataPersistent({
      data: Map({ disableAutoPlayNext: !autoPlayNextDisabled }),
    })
  }

  const eventData = ENDSTATE_AUTOPLAY_TOGGLED
    .set('eventLabel', !autoPlayNextDisabled ? 'off' : 'on')

  return (
    <div className="my-account-settings-V2__display-settings-controls">
      <div className="my-account-settings-V2__display-settings-text-container">
        <div className="my-account-settings-V2__display-settings-title">
          { staticText.getIn(['data', 'autoplayNextVideo']) }
        </div>
        <div className="my-account-settings-V2__display-settings-text">
          { staticText.getIn(['data', 'disableAutoplay']) }
        </div>
      </div>
      <div className="my-account-settings-V2__display-settings-toggle">
        <ButtonToggle
          checked={!autoPlayNextDisabled}
          onChange={onAutoPlaySettingsChange}
          showLabel
          gaEventData={eventData}
          round
        />
      </div>
    </div>
  )
}

AutoplaySettings.propTypes = {
  autoPlayNextDisabled: PropTypes.bool,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        autoPlayNextDisabled: state.featureTracking.getIn(['data', 'disableAutoPlayNext'], false),
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
)(AutoplaySettings)
