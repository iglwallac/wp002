import React from 'react'
import Icon from 'components/Icon'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'

function NotificationsWatchNow (props) {
  const { staticText } = props
  return (
    <div className="notifications-watch-now">
      <Icon
        element="play-button"
        iconClass={['icon--play-fill', 'notifications-watch-now__play']}
      />
      <span className="notifications-watch-now__label">
        {staticText.getIn(['data', 'watchNow'])}
      </span>
    </div>
  )
}

export default compose(
  connectStaticText({ storeKey: 'notificationsWatchNow' }),
)(NotificationsWatchNow)
