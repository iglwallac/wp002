import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { chatListStoreKey } from 'services/live-access-events/reducers'

const TrackSelector = (props) => {
  const { track, setTrack, trackTitles } = props
  return (
    <div className="live-experience-track-selector">
      {trackTitles.map((title, index) => (<div
        key={title}
        className={`live-experience-track-selector__track${
          track === index ? ' live-experience-track-selector__track--active' : ''}`}
        onClick={() => {
          if (track !== index) {
            setTrack(index)
          }
        }}
      >
        {title}
      </div>))}
    </div>
  )
}

const HeartsAndChat = (props) => {
  const { chatVisible, setChatVisible } = props
  return (
    <div className="live-experience-hearts-and-chat">
      <span className="live-experience-hearts-and-chat__hearts-icon" />
      <span className="live-experience-hearts-and-chat__chat-toggle">
        <svg
          className={`live-experience-hearts-and-chat__chat-icon${chatVisible ? ''
            : ' live-experience-hearts-and-chat__chat-icon--left'}`}
          onClick={() => { setChatVisible(!chatVisible) }}
        />
      </span>
    </div>
  )
}

export const HeartsAndChatHOC = compose(
  connectRedux(
    (state) => {
      return {
        chatVisible: state.liveAccessEvents.getIn([chatListStoreKey, 'visible']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setChatVisible: actions.liveAccessEvents.setChatVisible,
      }
    },
  ),
)(HeartsAndChat)

const LiveExperienceControlBar = (props) => {
  const { trackTitles } = props
  return (
    <div className="live-experience-control-bar">
      <HeartsAndChatHOC />
      {trackTitles.size > 1 &&
        <TrackSelector {...props} />
      }
    </div>
  )
}

export default LiveExperienceControlBar
