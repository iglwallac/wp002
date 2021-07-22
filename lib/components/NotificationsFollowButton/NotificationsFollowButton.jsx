import React, { PureComponent } from 'react'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import { NotificationsBell, BELL_TYPES } from 'components/NotificationsBell'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'

const BUTTON_TYPES = {
  PRIMARY_SMALL: 'PRIMARY_SMALL',
  SECONDARY: 'SECONDARY',
  PRIMARY: 'PRIMARY',
  PILL: 'PILL',
  LINK: 'LINK',
  ROUND: 'ROUND',
}

class FollowButton extends PureComponent {
  //
  constructor (props) {
    super(props)
    this.state = {
      focused: false,
    }
  }

  componentDidMount () {
    const { props } = this
    const {
      contentId,
      subscriptionType,
      getSubscribableEntity,
    } = props
    getSubscribableEntity({
      type: subscriptionType,
      contentId,
    })
  }
  // TODO: add back later
  // there is a bug when multiple components use the same
  // subscription entity and one of them unmounts
  // componentWillUnmount () {
  //   const { props } = this
  //   const {
  //     contentId,
  //     subscriptionType,
  //     clearSubscribableEntity,
  //   } = props
  //   clearSubscribableEntity({
  //     type: subscriptionType,
  //     contentId,
  //   })
  // }

  onFocus = () => {
    this.setState(() => ({
      focused: true,
    }))
  }

  onBlur = () => {
    this.setState(() => ({
      focused: false,
    }))
  }

  onFollow = () => {
    const { props } = this
    const { subscription, removeSubscriber, createSubscriber } = props
    const isSubscribed = subscription.get('subscriber')
    if (isSubscribed) removeSubscriber(subscription)
    else createSubscriber(subscription)
  }

  getIcon () {
    const { props, state } = this
    const { type } = props
    const { subscription } = props
    const isSubscribed = subscription.get('subscriber')
    const { focused } = state
    const subscribedAndFocused = isSubscribed && focused

    switch (type) {
      case BUTTON_TYPES.PILL:
      case BUTTON_TYPES.ROUND:
        return <IconV2 type={subscribedAndFocused ? ICON_TYPES.BELL_OFF : ICON_TYPES.BELL} />
      case BUTTON_TYPES.LINK:
        return (
          <IconV2
            className="episode-button"
            type={isSubscribed
              ? ICON_TYPES.CIRCULAR_BELL_OFF
              : ICON_TYPES.CIRCULAR_FOLLOW_BELL
            }
          />
        )
      default:
        return (
          <NotificationsBell
            type={BELL_TYPES.STROKE_HEAVY}
            fill="#ffffff"
            size={19}
          />
        )
    }
  }

  getRootClass () {
    const { props } = this
    const { type } = props
    switch (type) {
      case BUTTON_TYPES.SECONDARY:
        return 'nfb nfb--block'
      default:
        return 'nfb'
    }
  }

  getButtonClass () {
    const { props } = this
    const { type } = props
    const { subscription } = props
    const isSubscribed = subscription.get('subscriber')

    switch (type) {
      case BUTTON_TYPES.PRIMARY:
        return 'nfb__primary'
      case BUTTON_TYPES.PRIMARY_SMALL:
        return 'nfb__primary-small'
      case BUTTON_TYPES.SECONDARY:
        return 'nfb__secondary'
      case BUTTON_TYPES.LINK:
        return 'nfb__link'
      case BUTTON_TYPES.PILL:
        return isSubscribed
          ? 'nfb__pill--following'
          : 'nfb__pill--not-following'
      case BUTTON_TYPES.ROUND:
        return 'nfb__round'
      default:
        return ''
    }
  }

  getMemberLabel () {
    const { props, state } = this
    const { staticText, subscription } = props
    const isSubscribed = subscription.get('subscriber')
    const { focused } = state

    if (isSubscribed && focused) {
      return staticText.getIn(['data', 'unfollow'])
    }

    return isSubscribed
      ? staticText.getIn(['data', 'following'])
      : staticText.getIn(['data', 'follow'])
  }

  getTermLabel () {
    const { props, state } = this
    const { title, type, staticText, subscription } = props
    const isSubscribed = subscription.get('subscriber')
    const isSmall = type === BUTTON_TYPES.PRIMARY_SMALL
    const labelTitle = isSmall ? '' : ` ${title}`
    const { focused } = state

    let label = staticText.getIn(['data', 'follow'])

    if (isSubscribed) {
      label = focused
        ? staticText.getIn(['data', 'unfollow'])
        : staticText.getIn(['data', 'following'])
    }
    return `${label}${isSmall ? '' : labelTitle}`
  }

  getSeriesLabel () {
    const { props, state } = this
    const { type, staticText, subscription } = props
    const isSubscribed = subscription.get('subscriber')
    const isSmall = type === BUTTON_TYPES.PRIMARY_SMALL
    const { focused } = state

    if (isSubscribed) {
      if (isSmall) {
        return focused
          ? staticText.getIn(['data', 'unfollow'])
          : staticText.getIn(['data', 'following'])
      }
      return focused
        ? staticText.getIn(['data', 'unfollowSeries'])
        : staticText.getIn(['data', 'followingSeries'])
    }
    return staticText.getIn(['data', 'followSeries'])
  }

  getLabel () {
    const { props } = this
    const { subscription } = props
    const type = subscription.get('type')
    switch (type) {
      case SUBSCRIPTION_TYPES.SERIES:
        return this.getSeriesLabel()
      case SUBSCRIPTION_TYPES.MEMBER:
        return this.getMemberLabel()
      case SUBSCRIPTION_TYPES.TERM:
        return this.getTermLabel()
      default:
        return null
    }
  }

  render () {
    const { props } = this
    const { subscription, noLabel } = props
    const isSubscribable = subscription.get('isSubscribable')
    if (!isSubscribable) {
      return null
    }

    return (
      <div className={this.getRootClass()}>
        <button
          className={this.getButtonClass()}
          onMouseOver={this.onFocus}
          onMouseOut={this.onBlur}
          onClick={this.onFollow}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        >
          <span className="nfb__text">
            <span
              className="nfb__bell"
              role="presentation"
            >{this.getIcon()}
            </span>
            {!noLabel ? this.getLabel() : null }
          </span>
        </button>
      </div>
    )
  }
}

FollowButton.propTypes = {
  subscriptionType: PropTypes.string.isRequired,
  contentId: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
}

const connected = connectRedux(
  (state, props) => {
    const { subscriptionType, contentId } = props
    const staticText = state.staticText.getIn(['data', 'NotificationsFollowButton'])
    const subscription = state.notifications.getIn(
      ['subscribables', subscriptionType, contentId], Map())
    return { subscription, staticText }
  },
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      clearSubscribableEntity: actions.notifications.clearSubscribableEntity,
      getSubscribableEntity: actions.notifications.getSubscribableEntity,
      removeSubscriber: actions.notifications.removeSubscriber,
      createSubscriber: actions.notifications.createSubscriber,
    }
  },
)(FollowButton)

export default {
  NotificationsFollowButton: connected,
  BUTTON_TYPES,
}
