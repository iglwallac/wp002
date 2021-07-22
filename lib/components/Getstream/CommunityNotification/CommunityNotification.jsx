import React from 'react'
import get from 'lodash/get'
import { fromNow } from 'services/date-time'
import Avatar from 'components/Getstream/Avatar'
import { TextLink } from 'components/Link'

function getAction (kind) {
  switch (kind) {
    case 'like':
      return 'liked your '
    case 'comment':
      return 'commented on your '
    case 'repost':
      return 'reposted your '
    case 'follow':
      return 'followed you '
    default:
      return 'acted on your '
  }
}

export default function (props) {
  const { notification, onClick, options } = props
  const activities = notification.activities
  const actorCount = notification.actor_count
  const { object, reaction, gaia } = activities[0]
  const { kind, user } = reaction
  const createdAt = reaction.created_at
  const date = new Date(createdAt)
  const time = fromNow(date)
  const relativeUrl = get(gaia, 'relativeReactionURL', '#')
  const url = options.isWebView ? `${relativeUrl}&webview=true` : relativeUrl

  return (
    <React.Fragment>
      <div
        className="cm1-community-notification__community-item-left-col"
      >
        <Avatar
          className="cm1-community-notification__community-item-profileimage"
          image={user.data.profileImage}
          alt={user.data.name}
          size={60}
        />
      </div>
      <div
        className="cm1-community-notification__community-item-right-col"
      >
        <div className="cm1-community-notification__community-item-right-col-1">
          <div className="cm1-community-notification__community-item-actor">
            {`${user.data.name} `}
          </div>
          <div className="cm1-community-notification__community-item-verb">
            {actorCount > 1 ? 'and others ' : ''}
            {`${getAction(kind)} `}
            <TextLink
              className="cm1-community-notification__community-item-object"
              onClick={() => onClick(notification.id)}
              text={object.verb}
              to={url}
            />
          </div>
        </div>
        <div className="cm1-community-notification__community-item-right-col-2">
          <span className="cm1-community-notification__community-item-date">
            {`${time} ago`}
          </span>
        </div>
      </div>
    </React.Fragment>
  )
}
