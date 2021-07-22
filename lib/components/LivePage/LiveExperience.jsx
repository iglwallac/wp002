import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { chatListStoreKey } from 'services/live-access-events/reducers'
import { LIVE_ACCESS_SUBSCRIPTION_CODE } from 'services/live-access-events/constants'
import { setLocalStorage, getLocalStorage } from 'services/local-preferences'
import Chat from 'components/EventsPage/Chat'
import { isBrowser } from 'config/environment'
import LiveExperienceVideo from './LiveExperienceVideo'
import EmailCapture, { isEmailCaptured, getEventEmailCaptureKey } from './EmailCapture'
import OnDemandRibbon from './OnDemandRibbon'

export function getChatInfo (chatInfos) {
  const info = {}
  if (chatInfos) {
    const sendbirdChatInfo = chatInfos.find(e => !e.get('sendbirdAppId').includes('|'))
    const pubNubChatInfo = chatInfos.find(e => e.get('sendbirdAppId').includes('|'))
    if (pubNubChatInfo) {
      const pubNubKeys = pubNubChatInfo.get('sendbirdAppId')
      const pubNubChannels = pubNubChatInfo.get('sendbirdChannelId')
      if (pubNubKeys) {
        [info.pubNubPublishKey, info.pubNubSubscribeKey] = pubNubKeys.split('|')
      }
      if (pubNubChannels) {
        [info.pubNubMainChannel, info.pubNubTechChannel] = pubNubChannels.split('|')
      }
    }
    info.sendbirdAppId = sendbirdChatInfo && sendbirdChatInfo.get('sendbirdAppId')
  }
  return info
}

const isRibbonDisabled = (key) => {
  return key && isBrowser() ?
    getLocalStorage(key) === 'yes' : true
}

const LiveExperience = (props) => {
  const { getChatList, uid, auth, chatInfo, staticText, user,
    eventId, username, isLiveAccessMember, showEmailCapture,
    onDemandRibbonKey, onDemandRibbonText, chatVisible, setChatVisible } = props
  useEffect(() => {
    getChatList(eventId)
  }, [eventId])
  useEffect(() => {
    setChatVisible(true)
    return () => {}
  }, [])
  const [showRibbon, setShowRibbon] = useState(!isRibbonDisabled(onDemandRibbonKey))

  const onDemandRibbonHandler = () => {
    setLocalStorage(onDemandRibbonKey, 'yes', uid, auth)
    setShowRibbon(!isRibbonDisabled(onDemandRibbonKey))
  }

  const imageUrl = user.getIn(['data', 'profile', 'picture', 'hdtv_190x266'])

  return (
    <div className="live-experience">
      {showRibbon && isLiveAccessMember && onDemandRibbonText &&
        <OnDemandRibbon onClick={onDemandRibbonHandler} ribbonText={onDemandRibbonText} />}
      <LiveExperienceVideo />
      {
        showEmailCapture && <EmailCapture />
      }
      <div className={`live-experience-chat ${chatVisible ? '' : 'live-experience-chat--hidden'}`}>
        {chatInfo.pubNubSubscribeKey ?
          <Chat
            username={isLiveAccessMember ? username : ''}
            imageUrl={imageUrl}
            pubNubMainChannel={chatInfo.pubNubMainChannel}
            pubNubPublishKey={chatInfo.pubNubPublishKey}
            pubNubSubscribeKey={chatInfo.pubNubSubscribeKey}
            pubNubTechChannel={chatInfo.pubNubTechChannel}
            staticText={staticText}
            testing={global.BROWSER_TEST}
          />
          : `chatInfo for this event is missing!  ${chatInfo.toString()}`
        }
      </div>
    </div>
  )
}

LiveExperience.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const eventDetails = state.liveAccessEvents.getIn(['eventDetails', language,
        'data', 'event'])
      const eventId = eventDetails && eventDetails.get('id')
      const hasEntitlements = state.auth.get('subscriptions') && state.auth.get('subscriptions').size > 0
      const isLiveAccessMember = hasEntitlements && !!state.auth.get('subscriptions') &&
        state.auth.get('subscriptions').includes(LIVE_ACCESS_SUBSCRIPTION_CODE)
      const isPublicStream = eventDetails.get('publicStream')
      const showEmailCapture = !isLiveAccessMember && !isPublicStream &&
        !isEmailCaptured(getEventEmailCaptureKey(eventDetails))
      const onDemandRibbonKey = `ribbon-${eventDetails.get('route')}`
      const onDemandRibbonText = eventDetails.get('onDemandRibbonText')
      return {
        user: state.user,
        language,
        eventId,
        username: state.auth.get('username'),
        isLiveAccessMember,
        haveEmail: state.resolver.getIn(['query', 'haveEmail']) === 'true',
        showEmailCapture,
        chatVisible: state.liveAccessEvents.getIn([chatListStoreKey, 'visible']),
        chatInfo: getChatInfo(state.liveAccessEvents.getIn(['chatList',
          eventId,
          'data', 'chatInfo'])),
        onDemandRibbonKey,
        onDemandRibbonText,
        auth: state.auth,
        uid: (state.auth) ? state.auth.get('uid') : -1,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPageSeo: actions.page.setPageSeo,
        getLiveAccessSchedule: actions.liveAccessEvents.getLiveAccessSchedule,
        getChatList: actions.liveAccessEvents.getLiveAccessChatList,
        getLiveAccessSessionDetails: actions.liveAccessEvents.getLiveAccessSessionDetails,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setChatVisible: actions.liveAccessEvents.setChatVisible,
      }
    },
  ),
  connectStaticText({ storeKey: 'livePage' }),
)(LiveExperience)
