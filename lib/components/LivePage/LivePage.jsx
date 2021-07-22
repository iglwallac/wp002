import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import _get from 'lodash/get'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getSessionTimeout, getActiveSession, hasFreeSession as getHasFreeSession } from 'services/live-access-events'
import { LIVE_ACCESS_SUBSCRIPTION_CODE } from 'services/live-access-events/constants'
import LiveExperience from './LiveExperience'
import Countdown from './Countdown'
import Preview from './Preview'
import PreviewDone from './PreviewDone'

function dhm (ms) {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const daysms = ms % (24 * 60 * 60 * 1000)
  const hours = Math.floor((daysms) / (60 * 60 * 1000))
  const hoursms = ms % (60 * 60 * 1000)
  const minutes = Math.floor((hoursms) / (60 * 1000))
  const minutesms = ms % (60 * 1000)
  const sec = Math.floor((minutesms) / (1000))
  return `${days} days ${hours} hours ${minutes} minutes ${sec} seconds`
}

// eslint-disable-next-line no-unused-vars
const Debug = (props) => {
  const { isAnonymous, hasEntitlements,
    nowTs, isLive, isLiveAccessMember, eventDetails, videoEnded,
    livePlaybackUrl, timeout } = props
  const username = props.auth && props.auth.get('username')
  const schedule = eventDetails && eventDetails.getIn(['tracks', 0, 'schedule'])
  const eventId = eventDetails && eventDetails.getIn(['id'])
  const sessions = schedule && schedule.toJS()
  const sessionId = _get(getActiveSession(sessions, nowTs), 'id')
  const isFreeSession = _get(getActiveSession(sessions, nowTs), 'isFree') !== false
  const previewUrl = eventDetails && eventDetails.get('previewUrl')
  return (
    <pre>
      {isAnonymous && <div>I am anonymous user</div>}
      {username && <div>I am {username} with subscriptions: {props.auth && props.auth.get('subscriptions').toJS().join(':')}</div>}
      Has Entitlements: {String(hasEntitlements)}<br />
      <div>Session is {!isFreeSession && 'not'} free</div>
      <div>Event id: {eventId}</div>
      <div>ActiveSessionId is {sessionId} </div>
      <div>Refresh in {dhm(timeout)}</div>
      I am {!isLiveAccessMember && <span>not</span>} a live access member
      <div>Live URL {livePlaybackUrl}</div>
      <div>Preview URL {previewUrl}</div>
      <div>PreviewPlay is {!videoEnded && 'not'} complete</div>
      nowTs: {new Date(nowTs).toLocaleString()}<br />
      live: {String(isLive)}<br />
    </pre>
  )
}

const LivePage = (props) => {
  const { language, nowTs, eventDetails, livePlaybackUrl,
    getLiveAccessSessionDetails,
    // eslint-disable-next-line no-unused-vars
    getLiveAccessNextEvent, isLive, debug, isCountdown,
    isLiveAccessMember, isFreeSession, isLiveOverride, isPublicStream,
    hasFreeSession, staticText } = props
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    getLiveAccessNextEvent({ language, isLiveOverride, nowTs })
  }, [language])
  useEffect(() => {
    if (eventDetails) {
      setIsReady(true)
    }
  }, [eventDetails])
  useEffect(() => {
    if (isLive && eventDetails && !livePlaybackUrl) {
      const tracks = eventDetails.get('tracks')
      tracks.forEach((track) => {
        getLiveAccessSessionDetails({ id: track.getIn(['schedule', 0, 'id']), language })
      })
    }
  }, [language, isLive, eventDetails, livePlaybackUrl])

  if (!isReady) {
    return null
  }
  if (isCountdown) {
    return <Countdown />
  }
  if (!isLiveAccessMember && !isPublicStream) {
    if (!hasFreeSession) {
      return (<PreviewDone
        line1={staticText.getIn(['data', 'anonCLELine1'])}
        line2={staticText.getIn(['data', 'anonCLELine2'])}
      />)
    }
    if (!isFreeSession) {
      return <Preview />
    }
  }
  return <LiveExperience />
}

LivePage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const eventDetails = state.liveAccessEvents.getIn(['eventDetails', language,
        'data', 'event'])
      const eventId = eventDetails && eventDetails.get('id')
      const sessionId = eventDetails && eventDetails.getIn(['tracks', 0, 'schedule', 0, 'id'])
      const isPublicStream = eventDetails && eventDetails.get('publicStream')
      const isAnonymous = !state.auth.get('username')
      const hasEntitlements = state.auth.get('subscriptions') && state.auth.get('subscriptions').size > 0
      const query = state.resolver.get('query')
      const { timenow } = query.toJS()
      const nowTs = timenow ? Date.parse(timenow) : (new Date()).getTime()
      const isCountdown = !Number.isNaN(state.liveAccessEvents.getIn(['eventDetails', language, 'data', 'countdown'])) &&
        state.liveAccessEvents.getIn(['eventDetails', language, 'data', 'countdown']) !== 0
      const schedule = eventDetails && eventDetails.getIn(['tracks', 0, 'schedule'])
      const sessions = schedule && schedule.toJS()
      const timeout = getSessionTimeout(sessions, nowTs)
      const isLiveOverride = state.resolver.getIn(['query', 'live']) !== undefined
        ? state.resolver.getIn(['query', 'live']) === 'true' : undefined
      const isFreeSession = _get(getActiveSession(sessions, nowTs), 'isFree') !== false
      return {
        isCountdown,
        isAnonymous,
        user: state.user,
        isLiveOverride,
        isLive: !isCountdown,
        language,
        hasEntitlements,
        hasFreeSession: getHasFreeSession(sessions),
        timeout,
        sessionId,
        query,
        nowTs,
        livePlaybackUrl: state.liveAccessEvents.getIn(['sessionDetails', sessionId,
          language, 'data', 'session', 'playbackUrl']),
        haveEmail: state.resolver.getIn(['query', 'haveEmail']) === 'true',
        auth: state.auth,
        app: state.app,
        debug: state.resolver.getIn(['query', 'debug']) === 'true',
        isLiveAccessMember: !!state.auth.get('subscriptions') && state.auth.get('subscriptions').includes(LIVE_ACCESS_SUBSCRIPTION_CODE),
        videoEnded: state.videoPlayer.get('ended'),
        liveAccessEvents: state.liveAccessEvents,
        eventsList: state.liveAccessEvents.getIn(['eventsList',
          language,
          'data', 'events']),
        path: state.resolver.get('path'),
        eventDetails,
        eventId,
        isFreeSession,
        isPublicStream,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
        getLiveAccessSchedule: actions.liveAccessEvents.getLiveAccessSchedule,
        getLiveAccessSessionDetails: actions.liveAccessEvents.getLiveAccessSessionDetails,
        getLiveAccessNextEvent: actions.liveAccessEvents.getLiveAccessNextEvent,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      }
    },
  ),
  connectStaticText({ storeKey: 'livePage' }),
)(LivePage)
