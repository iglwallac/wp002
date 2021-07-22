import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { scheduleKey } from 'services/live-access-events/reducers'
import { getBoundActions } from 'actions'

const LiveVideoPlayerOverlay = (props) => {
  const { title, speakerName, staticText,
    setLiveAccessScheduleVisible, scheduleVisible, active } = props
  return (
    <div className={`live-video-player-overlay${active ? ' live-video-player-overlay--active' : ''}`}>
      <div className="live-video-player-overlay__title">
        {title}
        {!scheduleVisible &&
          <span className="live-video-player-overlay__view-schedule" onClick={() => setLiveAccessScheduleVisible(true)}>
            {staticText.getIn(['data', 'viewSchedule'])}
            <span className="live-video-player-overlay__view-schedule-icon" />
          </span>
        }
      </div>
      <div className="live-video-player-overlay__speaker">
        {speakerName}
      </div>
    </div>
  )
}

LiveVideoPlayerOverlay.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const eventDetails = state.liveAccessEvents.getIn(['eventDetails', language,
        'data', 'event'])
      return {
        title: eventDetails && eventDetails.get('title'),
        speakerName: eventDetails && eventDetails.get('speakerName'),
        scheduleVisible: state.liveAccessEvents.getIn([scheduleKey, 'visible']),
        active: state.videoPlayer.get('metaVisible'),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setLiveAccessScheduleVisible: actions.liveAccessEvents.setLiveAccessScheduleVisible,
      }
    },
  ),
  connectStaticText({ storeKey: 'liveAccessSchedule' }),
)(LiveVideoPlayerOverlay)
