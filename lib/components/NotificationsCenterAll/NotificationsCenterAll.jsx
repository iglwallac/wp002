import React, { PureComponent } from 'react'
import { format } from 'date-fns'
import Link, { TextLink } from 'components/Link'
import { List, Map } from 'immutable'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import Icon from 'components/Icon'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import NotificationsWatchNow from 'components/NotificationsWatchNow'
import { NotificationsBell, BELL_TYPES } from 'components/NotificationsBell'
import { NOTIFICATION_TYPES, SUBSCRIPTION_TYPES } from 'services/notifications'
import VerticalNavigation, { NOTIFICATIONS } from 'components/VerticalNavigation'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import NotificationList from 'components/NotificationList'
import CommunityNotification from 'components/Getstream/CommunityNotification'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { WATCH_NOW_EVENT_DATA, ITEM_DATA } from 'services/event-tracking'
import { H2, HEADING_TYPES } from 'components/Heading'

function handleNewEpisode (notification) {
  const id = notification.get('id')
  const month = format(notification.get('startDate', ''), 'MMMM')
  const day = format(notification.get('startDate', ''), 'DD')
  const year = format(notification.get('startDate', ''), 'YYYY')
  const date = `${month} ${day}, ${year}`
  const label = notification.get('label', '')
  const imgUrl = notification.getIn(['node', 'keyart_16x9_withtext', 'keyart_304x171'], '')
  const path = notification.getIn(['node', 'path'], '')
  const title = notification.getIn(['node', 'title'], '')
  const seriesTitle = notification.getIn(['node', 'series', 'title'], '')
  const seriesPath = notification.getIn(['node', 'series', 'path'], '')
  const nid = notification.getIn(['node', 'nid'], '')
  const watchEventData = WATCH_NOW_EVENT_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)
    .set('contentId', nid)
  const titleEventData = ITEM_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)
    .set('contentId', nid)

  return (
    <li className="notif-center__item" key={id}>
      <Link className="notif-center__item-hero" to={path} data-id={id}>
        <img className="notif-center__item-img" src={imgUrl} alt="" />
      </Link>
      <div className="notif-center__item-body">
        <div className="notif-center__item-label-wrapper">
          <div className="notif-center__item-label">
            {label}
          </div>
        </div>
        <div className="notif-center__item-context">
          <Link to={seriesPath} data-id={id} eventData={titleEventData}>
            {seriesTitle}
          </Link>
        </div>
        <div className="notif-center__item-message">
          <Link className="notif-center__item-series" to={path} data-id={id}>
            {title}
          </Link>
        </div>
        <div className="notif-center__item-date">
          {date}
        </div>
        <Link
          className="notif-center__item-watch"
          to={`${path}?fullplayer=feature`}
          data-id={id}
          eventData={watchEventData}
        >
          <NotificationsWatchNow />
        </Link>
      </div>
    </li>
  )
}

function handleFreeForm (notification) {
  const id = notification.get('id')
  const month = format(notification.get('startDate', ''), 'MMMM')
  const day = format(notification.get('startDate', ''), 'DD')
  const year = format(notification.get('startDate', ''), 'YYYY')
  const date = `${month} ${day}, ${year}`
  const message = notification.get('message', '')
  const links = notification.get('links', List())
  const webLink = links.find(link => link.get('type') === 'WEB')
  const webTarget = webLink && webLink.get('external') ? '_blank' : '_self'
  const imgUrl = notification.getIn(['node', 'keyart_16x9_withtext', 'keyart_304x171'], '')
  const path = notification.getIn(['node', 'path'], '')
  const reason = notification.get('reason')
  const label = notification.get('label')

  return (
    <li className="notif-center__item" key={id}>
      {imgUrl ? (
        <Link className="notif-center__item-hero" to={path} data-id={id}>
          <img className="notif-center__item-img" src={imgUrl} alt="" />
        </Link>
      ) : (
        <div className="notif-center__item-bell">
          <NotificationsBell
            type={BELL_TYPES.STROKE_HEAVY}
            fill="#44576B"
            size={50}
          />
        </div>
      )}
      <div className="notif-center__item-body">
        {label && !imgUrl ? (
          <div className="notifications-menu__item-label">
            {label}
          </div>
        ) : null}
        {imgUrl ? (
          <div className="notifications-menu__item-context">
            {reason}
          </div>
        ) : null}
        <div className="notif-center__item-message">
          {webLink ? <Link to={webLink.get('path')} data-id={id} target={webTarget}>{message}</Link> : message }
        </div>
        <div className="notif-center__item-date">
          {date}
        </div>
      </div>
    </li>
  )
}

function handleRecommendation (notification) {
  const id = notification.get('id')
  const month = format(notification.get('startDate', ''), 'MMMM')
  const day = format(notification.get('startDate', ''), 'DD')
  const year = format(notification.get('startDate', ''), 'YYYY')
  const date = `${month} ${day}, ${year}`
  const label = notification.get('label', '')
  const imgUrl = notification.getIn(['node', 'keyart_16x9_withtext', 'keyart_304x171'], '')
  const path = notification.getIn(['node', 'path'], '')
  const title = notification.getIn(['node', 'title'], '')
  const type = notification.getIn(['node', 'type'])
  const nid = notification.getIn(['node', 'nid'], '')
  const watchEventData = WATCH_NOW_EVENT_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)
    .set('contentId', nid)
  const titleEventData = ITEM_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)
    .set('contentId', nid)

  return (
    <li className="notif-center__item" key={id}>
      <Link className="notif-center__item-hero" to={path} data-id={id}>
        <img className="notif-center__item-img" src={imgUrl} alt="" />
      </Link>
      <div className="notif-center__item-body">
        <div className="notif-center__item-context">
          {label}
        </div>
        <div className="notif-center__item-message">
          <Link to={path} data-id={id} eventData={titleEventData}>
            {title}
          </Link>
        </div>
        <div className="notif-center__item-date">
          {date}
        </div>
        {type === 'product_series' ? (
          <NotificationsFollowButton
            type={BUTTON_TYPES.PRIMARY_SMALL}
            contentId={notification.get('contentId')}
            subscriptionType={SUBSCRIPTION_TYPES.SERIES}
          />
        ) : null}
        {type !== 'product_series' ? (
          <Link
            className="notifications-menu__item-watch"
            to={`${path}?fullplayer=feature`}
            data-id={id}
            eventData={watchEventData}
          >
            <NotificationsWatchNow />
          </Link>
        ) : null}
      </div>
    </li>
  )
}

function handleFollow (notification) {
  const id = notification.get('id')
  const month = format(notification.get('startDate', ''), 'MMMM')
  const day = format(notification.get('startDate', ''), 'DD')
  const year = format(notification.get('startDate', ''), 'YYYY')
  const date = `${month} ${day}, ${year}`
  const imgUrl = notification.getIn(['member', 'image'], '')
  const title = notification.getIn(['member', 'title'], '')
  const url = notification.getIn(['member', 'url'], '')
  const type = notification.getIn(['node', 'type'])
  const label = notification.get('label', '')
  const image = imgUrl ? (
    <img
      className="notif-center__item-img"
      alt={title}
      src={imgUrl}
    />
  ) : null

  return (
    <li className="notif-center__item notif-center__item--member" key={id}>
      {url ? (
        <Link
          className={imgUrl ? 'notif-center__item-hero' : 'notif-center__item-hero notif-center__no-avatar'}
          to={url}
          data-id={id}
        >
          {image}
        </Link>
      ) : (
        <div className={imgUrl ? 'notif-center__item-hero' : 'notif-center__item-hero notif-center__no-avatar'} >
          {image}
        </div>
      )}
      <div className="notif-center__item-body">
        <div className="notifications-menu__item-label">
          {label}
        </div>
        <div className="notif-center__item-message">
          {url ? (
            <Link to={url} data-id={id}>
              {title}
            </Link>
          ) : (
            <span>{title}</span>
          )}
        </div>
        <div className="notif-center__item-date">
          {date}
        </div>
        {type === 'product_series' ? (
          <NotificationsFollowButton
            type={BUTTON_TYPES.PRIMARY_SMALL}
            contentId={notification.get('contentId')}
            subscriptionType={SUBSCRIPTION_TYPES.SERIES}
          />
        ) : null}
      </div>
    </li>
  )
}

function renderNotifications (notifications = List(), notificationsProcessing = false) {
  if (notificationsProcessing) {
    return <Sherpa type={TYPE_LARGE} />
  }
  if (notifications.isEmpty()) {
    return null
  }
  return notifications.map((n = Map()) => {
    switch (n.get('type')) {
      case NOTIFICATION_TYPES.ACCOUNT_FOLLOWED:
      case NOTIFICATION_TYPES.MEMBER_FOLLOWING:
        return handleFollow(n)
      case NOTIFICATION_TYPES.SUBSCRIPTION_NEW_EPISODE:
      case NOTIFICATION_TYPES.SUBSCRIPTION_NEW_SEASON:
        return handleNewEpisode(n)
      case NOTIFICATION_TYPES.MEMBER_RECOMMENDATION:
      case NOTIFICATION_TYPES.SUBSCRIPTION_RECOMMENDATION:
      case NOTIFICATION_TYPES.GENERAL_RECOMMENDATION:
        return handleRecommendation(n)
      case NOTIFICATION_TYPES.MEMBER_FREE_FORM:
      case NOTIFICATION_TYPES.SUBSCRIPTION_FREE_FORM:
      case NOTIFICATION_TYPES.GENERAL_NEW_FEATURE:
      case NOTIFICATION_TYPES.GENERAL_FREE_FORM:
        return handleFreeForm(n)
      default:
        return null
    }
  })
}

function renderPaginationTotals (notifications, processing, staticText) {
  const p = notifications.get('p', 1)
  const pp = notifications.get('pp', 10)
  const total = notifications.get('total', 10)
  const rows = notifications.get('rows', List())

  if (processing || rows.size < 1) {
    return null
  }

  const start = p > 1 ? (p * pp) + 1 : 1
  const end = total < pp ? total : pp
  const showing = staticText.getIn(['data', 'showing'])
  const of = staticText.getIn(['data', 'of'])

  return `${showing} ${start}-${end} ${of} ${total}`
}

class NotificationsCenterAll extends PureComponent {
  //
  componentDidMount () {
    const { props } = this
    const { getNotifications, getCommunityNotifications } = props
    getNotifications()
    getCommunityNotifications()
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const {
      userLanguage,
      activeSection,
      getNotifications,
      getCommunityNotifications,
      setCommunityNotificationsSeen,
    } = props
    const { userLanguage: prevUserLanguage } = prevProps

    if (userLanguage !== prevUserLanguage) {
      getNotifications()
      getCommunityNotifications()
    }

    if (activeSection === 'community') {
      setCommunityNotificationsSeen()
    }
  }

  componentWillUnmount () {
    const { props } = this
    const { clearNotifications } = props
    clearNotifications()
  }

  setNotificationsMenuSection = (newSection) => {
    this.props.setNotificationsMenuSection(newSection)
  }

  renderSection () {
    const { activeSection, processing, notifications } = this.props
    const rows = notifications.get('rows', List())
    if (activeSection === 'community') {
      return this.renderCommunitySection()
    }
    return renderNotifications(rows, processing)
  }

  renderCommunitySection () {
    const {
      processingCommunityFetch,
      communityNotificationGroups,
      isWebView,
    } = this.props

    if (processingCommunityFetch) {
      return <Sherpa type={TYPE_LARGE} />
    }

    if (communityNotificationGroups && communityNotificationGroups.length < 1) {
      return null
    }

    return (
      <ul className="cm1-notifications-page__list">
        <NotificationList
          className={'cm1-notification-page__list-item'}
          notificationComponent={CommunityNotification}
          notifications={communityNotificationGroups}
          onClick={this.props.setCommunityNotificationRead}
          options={{ isWebView }}
        />
      </ul>
    )
  }

  render () {
    const { props } = this
    const {
      location,
      processing,
      staticText,
      notifications,
      activeSection,
      staticTextMenu,
      unseenCommunityCount,
    } = props
    notifications.isEmpty()
    const rows = notifications.get('rows', List())
    const hideContentIcon = (activeSection === 'content' || notifications.isEmpty())
    const hideCommunityIcon = (activeSection === 'community' || unseenCommunityCount < 1)
    let sectionContentClassname = 'cm1-notifications-page__sections--content'
    let sectionCommunityClassname = 'cm1-notifications-page__sections--community'

    if (activeSection === 'community') {
      sectionCommunityClassname = 'cm1-notifications-page__sections--community active'
    } else {
      sectionContentClassname = 'cm1-notifications-page__sections--content active'
    }

    return (
      <div className="notif-center__grid notif-center">
        <VerticalNavigation location={location} navType={NOTIFICATIONS} />
        <div className="notif-center__content-box notif-center__main">
          <TestarossaSwitch>
            <TestarossaCase campaign="CM-1" variation={1} unwrap>
              <div className="cm1-notifications-page__top">
                <div className={'cm1-notifications-page__header'}>
                  <div className="cm1-notifications-page__header-title">
                    {staticTextMenu.getIn(['data', 'notifications'], '')}
                  </div>
                  <div className={'cm1-notifications-page__header-link-settings'}>
                    <TextLink
                      text={staticText.getIn(['data', 'settings'], '')}
                      to="/account/settings"
                    />
                    <Icon iconClass={['vertical-nav__icon--link-settings', 'vertical-nav__icon-right']} />
                  </div>
                </div>
              </div>
              <div className="cm1-notifications-page__sections">
                <div onClick={() => this.setNotificationsMenuSection('content')} className={sectionContentClassname}>
                  {staticText.getIn(['data', 'content'], 'Content')}
                  <span className={`cm1-notifications-page__sections-unread-alert${hideContentIcon}`} />
                </div>
                <div onClick={() => this.setNotificationsMenuSection('community')} className={sectionCommunityClassname}>
                  {staticText.getIn(['data', 'community'], 'Community')}
                  <span className={`cm1-notifications-page__sections-unread-alert${hideCommunityIcon}`} />
                </div>
              </div>
              {this.renderSection()}
            </TestarossaCase>
            <TestarossaDefault unwrap>
              <H2 as={HEADING_TYPES.H4} className="notif-center__header">
                {staticText.getIn(['data', 'allNotifications'])}
              </H2>
              <div className="notif-center__pagination-title">
                {renderPaginationTotals(notifications, processing, staticText)}
              </div>
              <ul className="notif-center__list">
                {renderNotifications(rows, processing)}
              </ul>
            </TestarossaDefault>
          </TestarossaSwitch>
        </div>
      </div>
    )
  }
}

export default connectRedux(
  state => ({
    activeSection: state.header.get('notificationsMenuSection'),
    unseenCommunityCount: state.getstream.getIn(['notifications', 'unseen'], 0),
    processingCommunityFetch: state.getstream.getIn(['notifications', 'processing']),
    communityNotificationGroups: state.getstream.getIn(['notifications', 'activityGroups'], List()),
    userLanguage: state.user.getIn(['data', 'language', 0], 'en'),
    processing: state.notifications.getIn(['user', 'processing']),
    notifications: state.notifications.getIn(['user', 'data'], Map()),
    staticText: state.staticText.getIn(['data', 'notificationsCenterAll'], Map()),
    staticTextMenu: state.staticText.getIn(['data', 'notificationsMenu'], Map()),
    isWebView: state.app.get('isWebView', false),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getNotifications: actions.notifications.getNotifications,
      clearNotifications: actions.notifications.clearNotifications,
      getCommunityNotifications: actions.getstream.getCommunityNotifications,
      setCommunityNotificationsSeen: actions.getstream.setCommunityNotificationsSeen,
      setCommunityNotificationRead: actions.getstream.setCommunityNotificationRead,
      setNotificationsMenuSection: actions.header.setNotificationsMenuSection,
    }
  })(NotificationsCenterAll)
