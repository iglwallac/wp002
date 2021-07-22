import PUBNUB from 'pubnub'
import { v4 as uuidv4 } from 'uuid'
import _map from 'lodash/map'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import _isFunction from 'lodash/isFunction'
import { List, Map, fromJS } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { getLogger } from 'log'
import { blockedChatUsersKey } from 'services/live-access-events/reducers'
import ChatHistory from './ChatHistory'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import ChatCTA from './ChatCTA'

export const MAIN_CHAT_CHANNEL_POSTFIX = '-main'
export const TECH_CHAT_CHANNEL_POSTFIX = '-tech'

const ANON_USERNAME_PREFIX = 'zzz'
const EMPTY_AVATAR_URL = 'https://brooklyn.gaia.com/v1/image-render/3c0095e7-1eff-467f-942a-61039e9cf6d0/test'

class Chat extends Component {
  //
  constructor (props) {
    super(props)
    const {
      pubNubMainChannel,
      pubNubTechChannel,
    } = props

    this.PubNub = null
    this.lastMessageTimestamp = {}

    this.listener = {
      message: this.handleMessageReceived,
      signal: this.handleSignalReceived,
    }

    this.state = {
      currentChat: pubNubMainChannel,
      [pubNubMainChannel]: List(),
      [pubNubTechChannel]: List(),
    }
  }

  componentDidMount = () => {
    const { props } = this
    const { getBlockedUsers, pubNubMainChannel } = props
    getBlockedUsers(pubNubMainChannel)
    this.initPubNub()
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { username } = props
    const { username: prevUsername } = prevProps
    // do we need this ??
    if (prevUsername !== username) {
      this.initPubNub()
    }
  }

  componentWillUnmount () {
    this.closePubNub()
  }

  onFetchHistory = () => {
    const { state } = this
    const { currentChat } = state
    this.fetchHistory(currentChat)
  }

  resetHistory () {
    const { props } = this
    const { pubNubMainChannel, pubNubTechChannel } = props
    this.lastMessageTimestamp = {}
    this.setState(() => ({
      [pubNubMainChannel]: List(),
      [pubNubTechChannel]: List(),
    }))
  }

  initPubNub () {
    const { props } = this
    const {
      pubNubSubscribeKey,
      pubNubTechChannel,
      pubNubMainChannel,
      pubNubPublishKey,
      username,
    } = props

    this.PubNub = new PUBNUB({
      publish_key: pubNubPublishKey,
      subscribe_key: pubNubSubscribeKey,
      ssl: true,
    })

    this.PubNub.addListener(this.listener)
    this.username = username || `${ANON_USERNAME_PREFIX}-${uuidv4()}`

    if (!global.BROWSER_TEST) {
      this.PubNub.subscribe({
        channels: [
          pubNubMainChannel,
          pubNubTechChannel,
        ],
      })
      this.fetchHistory(pubNubMainChannel)
      this.fetchHistory(pubNubTechChannel)
    }
  }

  closePubNub () {
    const { props } = this
    const { pubNubMainChannel, pubNubTechChannel } = props
    this.PubNub.removeListener(this.listener)
    this.PubNub.unsubscribe({
      channels: [
        pubNubMainChannel,
        pubNubTechChannel,
      ],
    })
    this.PubNub = null
  }

  fetchHistory (channel) {
    this.PubNub.history({
      start: this.lastMessageTimestamp[channel],
      stringifiedTimeToken: true,
      count: 15,
      channel,
    },
    (status, response) => {
      //
      if (status.error) {
        getLogger().error(`
          Chat: Error fetching history for username: ${this.username} 
          channel: ${channel} 
          with subscribe key: ${this.props.pubNubSubscribeKey}
        `)
        return
      }

      const {
        startTimeToken,
        messages,
      } = response

      if (messages.length) {
        const { state } = this
        const existing = state[channel]
        const entries = _map(messages, m => m.entry)
        const messageList = fromJS(entries)

        this.lastMessageTimestamp[channel] = startTimeToken
        this.setState(() => ({
          [channel]: messageList.concat(existing),
        }))
      }
    })
  }

  toggleChannel = (e) => {
    e.preventDefault()
    const { props } = this
    const { pubNubMainChannel, pubNubTechChannel } = props
    this.setState(state => ({
      currentChat: state.currentChat === pubNubMainChannel
        ? pubNubTechChannel
        : pubNubMainChannel,
    }))
  }

  handleSignalReceived = (response) => {
    const { props } = this
    const { channel, message } = response
    const { pubNubMainChannel, pubNubTechChannel, getBlockedUsers, onRefresh } = props
    if (channel === pubNubMainChannel && message === 'refresh') {
      this.resetHistory()
      this.fetchHistory(pubNubMainChannel)
      this.fetchHistory(pubNubTechChannel)
      getBlockedUsers(pubNubMainChannel)

      if (_isFunction(onRefresh)) {
        onRefresh()
      }
    }
  }

  handleMessageReceived = (response) => {
    this.setState((state) => {
      const { channel, message } = response
      const prev = state[channel] || List()
      const next = prev.push(fromJS(message))
      return { [channel]: next }
    })
  }

  sendMessage = (message) => {
    const messageObj = {
      ImageUrl: this.props.imageUrl || EMPTY_AVATAR_URL,
      When: new Date().valueOf(),
      Who: this.username,
      What: message,
    }
    this.PubNub.publish({
      channel: this.state.currentChat,
      message: messageObj,
    }, (status) => {
      if (status.error) {
        getLogger().error(`
          Chat:  Error publishing message for username: ${this.username} 
          channel: ${this.state.currentChat} with publish 
          key: ${this.props.pubNubPublishKey}
        `)
      }
    })
  }

  render () {
    const { state, props } = this
    const {
      pubNubTechChannel,
      pubNubMainChannel,
      blockedUsers,
      joinChatText,
      staticText,
      username,
      imageUrl,
    } = props

    const mainBlockedUsers = blockedUsers && blockedUsers.getIn([pubNubMainChannel, 'data', 'usernames'])
    const mainChatClassname = `main-chat${state.currentChat === props.pubNubMainChannel ? ' main-chat--active' : ''}`
    const mainMessages = state[pubNubMainChannel]
    const techMessages = state[pubNubTechChannel]

    return (
      <div className="chat">
        <div className="main-and-tech__container">
          <div className="main-and-tech">
            <div className={mainChatClassname}>
              <ChatHeader
                onToggle={this.toggleChannel}
                staticText={staticText}
                isMain
              />
              <ChatHistory
                fetchHistory={this.onFetchHistory}
                messageList={mainMessages}
                username={this.username}
              />
            </div>
            <div className="tech-chat">
              <ChatHeader
                onToggle={this.toggleChannel}
                staticText={staticText}
              />
              <ChatHistory
                fetchHistory={this.onFetchHistory}
                messageList={techMessages}
                username={this.username}
              />
            </div>
          </div>
        </div>
        <div className="chat-input-container">
          {
            username && !(mainBlockedUsers && mainBlockedUsers.find(x => x === username)) ?
              <ChatInput
                imageUrl={imageUrl || EMPTY_AVATAR_URL}
                sendMessage={this.sendMessage}
                staticText={staticText}
              />
              :
              <ChatCTA joinChatText={joinChatText} />
          }
        </div>
      </div>
    )
  }
}

Chat.propTypes = {
  pubNubSubscribeKey: PropTypes.string.isRequired,
  pubNubMainChannel: PropTypes.string.isRequired,
  pubNubTechChannel: PropTypes.string.isRequired,
  pubNubPublishKey: PropTypes.string.isRequired,
  joinChatText: PropTypes.string,
  username: PropTypes.string,
  imageUrl: PropTypes.string,
  onRefresh: PropTypes.func,
}

export default connectRedux(
  ({ liveAccessEvents, staticText }) => ({
    blockedUsers: liveAccessEvents.get(blockedChatUsersKey),
    staticText: staticText.getIn(['data', 'liveChat'], Map()),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return { getBlockedUsers: actions.liveAccessEvents.getLiveAccessChatBlockedUsers }
  },
)(Chat)
