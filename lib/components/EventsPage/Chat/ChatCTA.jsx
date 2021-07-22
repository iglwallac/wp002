import React from 'react'
import compose from 'recompose/compose'
import Button from 'components/Button'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import { JOIN_NOW_URL, JOIN_NOW_QUERY, UPGRADE_NOW_URL } from 'components/EventsPage/constants'

const ChatCTA = (props) => {
  const { subscriptions, staticText, joinChatText } = props
  const isEntitled = subscriptions && subscriptions.size
  const buttonText = staticText.getIn(['data', isEntitled ? 'upgradeNow' : 'joinNow']) || ''
  const buttonURL = !isEntitled ? JOIN_NOW_URL : UPGRADE_NOW_URL
  const buttonQuery = isEntitled ? null : JOIN_NOW_QUERY
  return (
    <div className="chat__anonCTA">
      {joinChatText || staticText.getIn(['data', 'joinChat'])}
      <Button
        text={buttonText}
        url={buttonURL}
        query={buttonQuery}
        buttonClass="button button--primary"
      />
    </div>
  )
}

export default compose(
  connectRedux(
    (state) => {
      return {
        subscriptions: state.auth.get('subscriptions'),
      }
    },
  ),
  connectStaticText({ storeKey: 'eventsPage' }),
)(ChatCTA)
