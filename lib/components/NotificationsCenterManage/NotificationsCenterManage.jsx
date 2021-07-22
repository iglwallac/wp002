import React, { PureComponent } from 'react'
import { List, Map } from 'immutable'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { SUBSCRIPTION_TYPES } from 'services/notifications'
import VerticalNavigation, { NOTIFICATIONS } from 'components/VerticalNavigation'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import Link from 'components/Link'
import { H2, HEADING_TYPES } from 'components/Heading'

class NotificationsCenterManage extends PureComponent {
  //
  componentDidMount () {
    const { props } = this
    const { getSubscriptions } = props
    getSubscriptions()
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { user, getSubscriptions } = props
    const { user: prevUser } = prevProps
    const language = user.getIn(['data', 'language', 0], 'en')
    const prevLanguage = prevUser.getIn(['data', 'language', 0], 'en')
    if (language !== prevLanguage) {
      getSubscriptions()
    }
  }

  getDescriptionText () {
    const { props } = this
    const { subscriptions, staticText } = props
    return subscriptions.size
      ? staticText.getIn(['data', 'followingDesc'])
      : staticText.getIn(['data', 'followingEmpty'])
  }

  renderSeries (subscription) {
    const { props } = this
    const { staticText } = props
    const subscriptionId = subscription.get('id')
    const imgUrl = subscription.getIn(['node', 'keyart_16x9_withtext', 'keyart_304x171'], '')
    const path = subscription.getIn(['node', 'path'], '')
    const title = subscription.getIn(['node', 'title'], '')
    const countSeasons = subscription.getIn(['node', 'total_seasons'], '')
    const countEpisodes = subscription.getIn(['node', 'total_episodes'], '')
    const textSeasons = countSeasons > 1
      ? staticText.getIn(['data', 'season'], '')
      : staticText.getIn(['data', 'seasons'], '')
    const textEpisodes = countEpisodes > 1
      ? staticText.getIn(['data', 'episode'], '')
      : staticText.getIn(['data', 'episodes'], '')

    return (
      <li className="notif-manage__item" key={subscriptionId}>
        <div className="notif-manage__item-hero-container">
          <Link className="notif-manage__item-hero" to={path}>
            <img className="notif-manage__item-img" src={imgUrl} alt="" />
          </Link>
        </div>
        <div className="notif-manage__item-meta">
          <div className="notif-manage__item-meta-title">
            {title}
          </div>
          <div className="notif-manage__item-meta-counts">
            {`${countSeasons} ${textSeasons}, ${countEpisodes} ${textEpisodes}`}
          </div>
        </div>
        <div className="notif-manage__fb">
          <NotificationsFollowButton
            subscriptionType={SUBSCRIPTION_TYPES.SERIES}
            contentId={subscription.get('contentId')}
            type={BUTTON_TYPES.PRIMARY_SMALL}
          />
        </div>
      </li>
    )
  }
  // eslint-disable-next-line
  renderTerm (subscription) {
    const subscriptionId = subscription.get('id')
    const imgUrl = subscription.getIn(['term', 'termImages', 'tile', 'tile_374x156'], '')
    const title = subscription.getIn(['term', 'name'], '')
    const termType = subscription.getIn(['contentType'], '')
    const pathName = title.split(' ').join('-').toLowerCase()
    const path = (termType !== 'topic') ? `/person/${pathName}` : `/topic/${pathName}`

    return (
      <li className="notif-manage__item notif-manage__item--term" key={subscriptionId}>
        <div className="notif-manage__item-hero-container">
          <Link className="notif-manage__item-hero" to={path}>
            <img className="notif-manage__item-img" src={imgUrl} alt="" />
          </Link>
        </div>
        <div className="notif-manage__item-meta">
          <div className="notif-manage__item-meta-title">
            {title}
          </div>
          <div className="notif-manage__item-meta-counts">
            {termType}
          </div>
        </div>
        <div className="notif-manage__fb">
          <NotificationsFollowButton
            subscriptionType={SUBSCRIPTION_TYPES.TERM}
            contentId={subscription.get('contentId')}
            type={BUTTON_TYPES.PRIMARY_SMALL}
            title={termType}
          />
        </div>
      </li>
    )
  }
  // eslint-disable-next-line
  renderMember (subscription, staticText) {
    const subscriptionId = subscription.get('id')
    const imgUrl = subscription.getIn(['member', 'image'], '')
    const title = subscription.getIn(['member', 'title'], '')
    const pathName = subscription.getIn(['member', 'url'], '')

    return (
      <li className="notif-manage__item notif-manage__item--member" key={subscriptionId}>
        <div className="notif-manage__item-hero-container">
          <Link className={imgUrl ? 'notif-manage__item-hero' : 'notif-manage__item-hero notif-manage__no-avatar'} to={pathName}>
            <img className="notif-manage__item-img" src={imgUrl} alt="" />
          </Link>
        </div>
        <div className="notif-manage__item-meta">
          <div className="notif-manage__item-meta-title">
            {title}
          </div>
          <div className="notif-manage__item-meta-counts">
            {staticText.getIn(['data', 'member'])}
          </div>
        </div>
        <div className="notif-manage__fb">
          <NotificationsFollowButton
            subscriptionType={SUBSCRIPTION_TYPES.MEMBER}
            contentId={subscription.get('contentId')}
            type={BUTTON_TYPES.PRIMARY_SMALL}
          />
        </div>
      </li>
    )
  }

  renderSubscriptions () {
    const { props } = this
    const { subscriptions, processing, staticText } = props

    if (processing !== false) return <Sherpa type={TYPE_LARGE} />
    if (subscriptions.isEmpty()) return null

    return subscriptions.map((s) => {
      switch (s.get('type')) {
        case SUBSCRIPTION_TYPES.SERIES:
          return this.renderSeries(s)
        case SUBSCRIPTION_TYPES.TERM:
          return this.renderTerm(s)
        case SUBSCRIPTION_TYPES.MEMBER:
          return this.renderMember(s, staticText)
        default:
          return null
      }
    })
  }

  render () {
    const { props } = this
    const { location, staticText, processing } = props
    return (
      <div className="notif-manage__grid notif-manage">
        <VerticalNavigation location={location} navType={NOTIFICATIONS} />
        <div className="notif-manage__content-box notif-manage__main">
          <H2 as={HEADING_TYPES.H4} className="notif-manage__header">
            {staticText.getIn(['data', 'following'])}
          </H2>
          <div className="notif-manage__desc">
            {(processing !== false)
              ? null
              : this.getDescriptionText()}
          </div>
          <ul className="notif-manage__list">
            {this.renderSubscriptions()}
          </ul>
          <Link
            className="notif-manage__find-more"
            to="/seeking-truth/original-programs"
          >{staticText.getIn(['data', 'findMoreOriginalPrograms'])}
          </Link>
        </div>
      </div>
    )
  }
}

export default connectRedux(
  state => ({
    user: state.user,
    processing: state.notifications.getIn(['subscriptions', 'processing']),
    subscriptions: state.notifications.getIn(['subscriptions', 'data'], List()),
    staticText: state.staticText.getIn(['data', 'notificationsCenterManage'], Map()),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      createSubscriber: actions.notifications.createSubscriber,
      removeSubscriber: actions.notifications.removeSubscriber,
      getSubscriptions: actions.notifications.getSubscriptions,
    }
  },
)(NotificationsCenterManage)
