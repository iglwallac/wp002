import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import { List, Map } from 'immutable'
import { getBoundActions } from 'actions'
import Button from 'components/Button'
import { TYPE_LOGIN } from 'services/dialog'
import { isBrowser } from 'config/environment'
import LiveAccessSchedule from 'components/LiveAccessSchedule/LiveAccessSchedule'
import { getChatInfo } from 'components/LivePage/LiveExperience'
import Chat, { MAIN_CHAT_CHANNEL_POSTFIX, TECH_CHAT_CHANNEL_POSTFIX } from 'components/EventsPage/Chat'
import { scheduleKey, trackKey } from 'services/live-access-events/reducers'
import { historyRedirect, HISTORY_METHOD_REPLACE } from 'services/navigation'
import LiveVideoPlayer from 'components/LiveVideoPlayer'
import { getSessionTimeout, isInSession } from 'services/live-access-events'
import { getLocalStorage, setLocalStorage } from 'services/local-preferences'
import EmailCapture from './EmailCapture'

const SIGN_UP_CTA_TIMEOUT = 60 * 1000 * 60 * 2
const TIME_USED_INTERVAL = 60 * 1000
const GaiaStreamTrackId = 'e1ac4473-89eb-40ca-921e-d85cecd4aa0b'
const GaiaLiveChannel = 'Live - Gaia-Linear-Stream'
const EmailCaptureKey = 'Live-Channel'
const GNFreeTimeUsedKey = 'GN-FreeTimeUsed'
const CTA_LINK = '/plan-selection/plans'
const BECOMING_SUPERNATURAL_EVENT_ID = 'e3294a4c-7ae0-42f9-b28a-5b3b0c35eec1'

function renderSignup (staticText) {
  return (
    <div className="live-channel-page-sign-up-cta">
      <div className="live-channel-page-sign-up-cta__text">
        {staticText.getIn(['data', 'ctaText'])}
      </div>
      <Button
        buttonClass={'button button--primary'}
        text={staticText.getIn(['data', 'ctaButtonText'])}
        url={CTA_LINK}
      />
    </div>
  )
}

function isEmailCaptured (emailSignup, resolver) {
  if (isBrowser()) {
    const captured = getLocalStorage(EmailCaptureKey) === 'yes'
      || emailSignup.get('success') === true
    const haveEmail = resolver.getIn(['query', 'haveEmail']) === 'true'
    return captured || haveEmail
  }
  return false
}

function LiveChannelPage ({
  setLiveAccessScheduleVisible,
  getLiveAccessSessionDetails,
  setOverlayDialogVisible,
  getLiveAccessSchedule,
  getLiveAccessTrack,
  livePlaybackUrl,
  scheduleVisible,
  getChatList,
  emailSignup,
  chatEnabled,
  chatChannel,
  staticText,
  sessionId,
  schedule,
  chatInfo,
  resolver,
  history,
  user,
  auth,
}, context) {
  //
  const { store } = context
  const isAnonymous = !auth.get('jwt')
  const username = auth.get('username')
  const language = user.getIn(['data', 'language', 0], 'en')
  const imageUrl = user.getIn(['data', 'profile', 'picture', 'hdtv_190x266'])
  const hasEntitlements = auth.get('subscriptions') && auth.get('subscriptions').size > 0
  const showEmailCapture = (isAnonymous || !hasEntitlements)
    && !isEmailCaptured(emailSignup, resolver)

  const timeoutRef = useRef()
  const signUpCTATimeoutRef = useRef()
  const [nowTs, setNowTs] = useState((new Date()).getTime())
  const [timeUsed, setTimeUsed] = useState(getLocalStorage(GNFreeTimeUsedKey) || 0)

  const onRefresh = useCallback(() => (
    getLiveAccessTrack({ id: GaiaStreamTrackId, language })
  ), [GaiaStreamTrackId, language])

  const showOverlay = useCallback(() => (
    setOverlayDialogVisible(TYPE_LOGIN)
  ), [])

  const showSchedule = useCallback(() => (
    setLiveAccessScheduleVisible(false)
  ), [])

  useEffect(() => {
    getChatList(BECOMING_SUPERNATURAL_EVENT_ID)
    return () => {
      clearTimeout(timeoutRef.current)
      clearInterval(signUpCTATimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    getLiveAccessTrack({ id: GaiaStreamTrackId, language })
    getLiveAccessSchedule({ trackId: GaiaStreamTrackId, language })
  }, [language])

  useEffect(() => {
    if (sessionId) {
      getLiveAccessSessionDetails({ id: sessionId, language })
    }
  }, [sessionId])

  // this effect is exceptionally bad practice
  // but I do not have the time to convert all of this over
  // to using a watcher. There was a LARGE bug in here causing
  // the timeout to execute immediately, over and over,
  // which makes the entire page re-render constantly.
  useEffect(() => {
    const scheduleJS = schedule && schedule.size ? schedule.toJS() : null
    const sessionTimeout = getSessionTimeout(scheduleJS, nowTs) + 1000
    const delay = sessionTimeout > 2147483647 ? 2147483647 : sessionTimeout

    clearTimeout(timeoutRef.current)

    if (scheduleJS && !isInSession(scheduleJS, nowTs)) {
      historyRedirect({
        historyMethod: HISTORY_METHOD_REPLACE,
        url: '/',
        language,
        history,
        auth,
      })
      return
    }
    timeoutRef.current = setTimeout(() => {
      setNowTs((new Date()).getTime())
    }, delay)
  }, [nowTs, schedule])

  useEffect(() => {
    clearInterval(signUpCTATimeoutRef.current)
    if (isAnonymous || !hasEntitlements) {
      signUpCTATimeoutRef.current = setInterval(() => {
        setTimeUsed(curTimeUsed => curTimeUsed + TIME_USED_INTERVAL)
      }, TIME_USED_INTERVAL)
    }
  }, [isAnonymous, hasEntitlements])

  useEffect(() => {
    setLocalStorage(GNFreeTimeUsedKey, timeUsed, auth ? auth.get('uid') : -1, auth)
  }, [timeUsed])

  return (
    <div className="live-channel-page">
      <div className={`live-channel-player-and-schedule ${chatEnabled ? '' : 'live-channel-player-and-schedule--full-height'}`}>
        <div className="live-channel-player">
          {livePlaybackUrl && !showEmailCapture ? (
            <LiveVideoPlayer
              playerSrc={livePlaybackUrl}
              title={GaiaLiveChannel}
              location={location}
              history={history}
              store={store}
            />
          ) : null}
          {timeUsed > SIGN_UP_CTA_TIMEOUT ? (
            <div className="live-channel-player__video-overlay live-channel-player__video-overlay--blocking">
              {renderSignup(staticText)}
            </div>
          ) : null}
        </div>
        <LiveAccessSchedule
          buttonText={staticText.getIn(['data', 'seeFullSchedule'])}
          header={staticText.getIn(['data', 'schedule'])}
          closeHandler={showSchedule}
          visible={scheduleVisible}
          sessionList={schedule}
          language={language}
          nowTs={nowTs}
          full
        />
      </div>
      {showEmailCapture ? (
        <div className="live-channel-player__video-overlay live-channel-player__video-overlay--blocking">
          <div className="live-channel-page__email-capture">
            <EmailCapture captureKey={EmailCaptureKey} />
            <div className="live-channel-page__email-capture__label">
              {staticText.getIn(['data', 'loginLabel'])}
            </div>
            <Button
              text={staticText.getIn(['data', 'login'])}
              buttonClass={'button button--primary'}
              onClick={showOverlay}
            />
          </div>
        </div>
      ) : null}
      <div className={[`live-channel-page__chat ${chatEnabled ? '' : 'live-channel-page__chat--hidden'}`]}>
        {chatChannel && chatInfo.pubNubSubscribeKey ?
          <Chat
            pubNubMainChannel={chatChannel + MAIN_CHAT_CHANNEL_POSTFIX}
            pubNubTechChannel={chatChannel + TECH_CHAT_CHANNEL_POSTFIX}
            joinChatText={staticText.getIn(['data', 'joinChat'])}
            pubNubSubscribeKey={chatInfo.pubNubSubscribeKey}
            pubNubPublishKey={chatInfo.pubNubPublishKey}
            username={hasEntitlements && username}
            testing={global.BROWSER_TEST}
            staticText={staticText}
            onRefresh={onRefresh}
            imageUrl={imageUrl}
          />
          : `chatInfo for this event is missing!  ${chatInfo.toString()}`
        }
      </div>
    </div>
  )
}

LiveChannelPage.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connectRedux(
  ({ user, auth, resolver, emailSignup, staticText, liveAccessEvents }) => {
    const language = user.getIn(['data', 'language', 0], 'en')
    const track = liveAccessEvents.getIn([trackKey, GaiaStreamTrackId, language, 'data'])
    const schedule = liveAccessEvents.getIn([scheduleKey, GaiaStreamTrackId, 'data', 'schedule'], List())
    const sessionId = schedule && schedule.getIn([0, 'id'])
    return {
      livePlaybackUrl: liveAccessEvents.getIn(['sessionDetails', sessionId, language, 'data', 'session', 'playbackUrl']),
      chatInfo: getChatInfo(liveAccessEvents.getIn(['chatList', BECOMING_SUPERNATURAL_EVENT_ID, 'data', 'chatInfo'])),
      scheduleVisible: liveAccessEvents.getIn([scheduleKey, 'visible']),
      staticText: staticText.getIn(['data', 'liveChannelPage'], Map()),
      chatEnabled: track && track.get('liveStreamActive'),
      chatChannel: track && track.get('channelId'),
      emailSignup,
      sessionId,
      resolver,
      schedule,
      track,
      user,
      auth,
    }
  },
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setLiveAccessScheduleVisible: actions.liveAccessEvents.setLiveAccessScheduleVisible,
      getLiveAccessSessionDetails: actions.liveAccessEvents.getLiveAccessSessionDetails,
      getLiveAccessSchedule: actions.liveAccessEvents.getLiveAccessSchedule,
      getLiveAccessTrack: actions.liveAccessEvents.getLiveAccessTrack,
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      getChatList: actions.liveAccessEvents.getLiveAccessChatList,
      setPageSeo: actions.page.setPageSeo,
    }
  },
)(LiveChannelPage)
