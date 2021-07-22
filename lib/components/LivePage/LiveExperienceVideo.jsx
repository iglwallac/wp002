import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import LiveAccessSchedule from 'components/LiveAccessSchedule/LiveAccessSchedule'
import LiveVideoPlayer from 'components/LiveVideoPlayer'
import { scheduleKey } from 'services/live-access-events/reducers'
import { getSessionTimeout } from 'services/live-access-events'
import LiveExperienceControlBar from './LiveExperienceControlBar'

const LiveExperienceVideo = (props, context) => {
  const { staticText, language,
    getLiveAccessSessionDetails, timenowOverride,
    eventDetails, setLiveAccessScheduleVisible, scheduleVisible,
    poster, debug, sessionDetails, trackTitles } = props
  const { store } = context
  const [track, setTrack] = useState(0)
  const schedule = eventDetails.getIn(['tracks', track, 'schedule'])
  const sessionId = schedule && schedule.getIn([0, 'id'])
  const livePlaybackUrl = sessionDetails && sessionDetails.getIn([sessionId,
    language, 'data', 'session', 'playbackUrl'])
  const [nowTs, setNowTs] = useState(timenowOverride ? Date.parse(timenowOverride) : Date.now())
  const [lastTimer, setLastTimer] = useState(0)
  const [initialNowTs] = useState(Date.now())
  const timeoutRef = useRef()

  const getTimeNow = () => {
    return timenowOverride ?
      Date.parse(timenowOverride) + (Date.now() - initialNowTs) : Date.now()
  }

  useEffect(() => {
    getLiveAccessSessionDetails({ id: sessionId, language })
  }, [sessionId])
  useEffect(() => {
    clearTimeout(timeoutRef.current)
    const tempNowTs = getTimeNow()
    setNowTs(tempNowTs)
    const timeoutDurationMS = schedule && getSessionTimeout(schedule.toJS(), tempNowTs) + 1000
    if (timeoutDurationMS) {
      timeoutRef.current = setTimeout(() => {
        setNowTs(getTimeNow())
        setLastTimer(Date.now())
      }, timeoutDurationMS)
    }
  }, [schedule, lastTimer])
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])
  return (
    <div className="live-experience-video">
      <div className="live-experience-player-and-schedule">
        <div className="live-experience-player">
          {debug && livePlaybackUrl}
          {livePlaybackUrl &&
            <LiveVideoPlayer
              store={store}
              location={location}
              history={history}
              isLive
              track={track}
              playerSrc={livePlaybackUrl}
              posterOverride={poster}
              title={`Live - ${eventDetails.get('route')}`}
            />}
        </div>
        <LiveAccessSchedule
          header={staticText.getIn(['data', 'scheduleHeader'])}
          full
          language={language}
          nowTs={nowTs}
          sessionList={schedule}
          visible={scheduleVisible}
          buttonText={staticText.getIn(['data', 'seeSchedule'])}
          buttonUrl={eventDetails.get('route') && `/events/${eventDetails.get('route')}?default=2#event-information`}
          closeHandler={() => setLiveAccessScheduleVisible(false)}
        />
      </div>
      <LiveExperienceControlBar setTrack={setTrack} track={track} trackTitles={trackTitles} />
    </div>
  )
}

LiveExperienceVideo.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const eventDetails = state.liveAccessEvents.getIn(['eventDetails',
        language, 'data', 'event'])
      return {
        eventDetails,
        user: state.user,
        language,
        sessionDetails: state.liveAccessEvents.get('sessionDetails'),
        poster: eventDetails.get('posterUrl'),
        debug: state.resolver.getIn(['query', 'debug']) === 'true',
        scheduleVisible: state.liveAccessEvents.getIn([scheduleKey, 'visible']),
        trackTitles: eventDetails ? eventDetails.get('tracks').map(e => e.get('title')) : [],
        timenowOverride: state.resolver.getIn(['query', 'timenow']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
        getLiveAccessSessionDetails: actions.liveAccessEvents.getLiveAccessSessionDetails,
        setLiveAccessScheduleVisible: actions.liveAccessEvents.setLiveAccessScheduleVisible,
      }
    },
  ),
  connectStaticText({ storeKey: 'livePage' }),
)(LiveExperienceVideo)
