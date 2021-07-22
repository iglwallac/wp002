import React, { PureComponent } from 'react'
import get from 'lodash/get'
import { List, Map } from 'immutable'
import { get as getConfig } from 'config'
import { getBoundActions } from 'actions'
import Link, { TextLink } from 'components/Link'
import { connect as connectRedux } from 'react-redux'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import NotificationsWatchNow from 'components/NotificationsWatchNow'
import NotificationList from 'components/NotificationList'
import { NotificationsBell, BELL_TYPES } from 'components/NotificationsBell'
import CommunityNotification from 'components/Getstream/CommunityNotification'
import { NotificationsFollowButton, BUTTON_TYPES } from 'components/NotificationsFollowButton'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import ToolTipArrow, { DIRECTION_UP } from 'components/ToolTipArrow'
import { NOTIFICATION_TYPES, SUBSCRIPTION_TYPES } from 'services/notifications'
import { URL_ACCOUNT_SETTINGS } from 'services/url/constants'
import {
  BELL_EVENT_DATA,
  VIEW_ALL_EVENT_DATA,
  WATCH_NOW_EVENT_DATA,
  MANAGE_EVENT_DATA,
  ITEM_DATA,
} from 'services/event-tracking'

const EMPTY_LIST = List()
const EMPTY_MAP = Map()

const config = getConfig()


function handleFreeForm (notification) {
  const id = notification.get('id')
  const imgUrl = notification.getIn(['node', 'keyart_16x9_withtext', 'keyart_304x171'], '')
  const title = notification.getIn(['node', 'title'], '')
  const reason = notification.get('reason')
  const links = notification.get('links', List())
  const webLink = links.find(link => link.get('type') === 'WEB')
  const webTarget = webLink && webLink.get('external') ? '_blank' : '_self'
  const message = notification.get('message')

  return (
    <li
      key={id}
      className="notifications-menu__item"
    >
      <div className={`notifications-menu__item-left${imgUrl ? '' : ' has-bell'}`}>
        {imgUrl ? (
          <div className="notifications-menu__item-hero">
            <img
              className="notifications-menu__item-img"
              src={imgUrl}
              alt={title}
            />
          </div>
        ) : null }
        {imgUrl ? (
          <span className="notifications-menu__item-date">
            {notification.get('timeAsDistance', '')}
          </span>
        ) : null}
      </div>
      <div className={imgUrl ? 'notifications-menu__item-right' : 'notifications-menu__item-freeform'}>
        {imgUrl ? (
          <div className="notifications-menu__item-context">
            {reason}
          </div>
        ) : null}
        <p className="notifications-menu__item-freetext">
          {webLink ? (
            <TextLink
              data-id={id}
              to={webLink.get('path')}
              target={webTarget}
              text={message}
            />
          ) : message }
        </p>
        {!imgUrl ? (
          <span className="notifications-menu__item-date">
            {notification.get('timeAsDistance', '')}
          </span>
        ) : null}
      </div>
    </li>
  )
}

function handleRecommendation (notification, onClick) {
  const imgUrl = notification.getIn(['node', 'keyart_16x9_withtext', 'keyart_304x171'], '')
  const path = notification.getIn(['node', 'path'], '')
  const title = notification.getIn(['node', 'title'], '')
  const type = notification.getIn(['node', 'type'])
  const id = notification.get('id')
  const nid = notification.getIn(['node', 'nid'], '')
  const eventData = WATCH_NOW_EVENT_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)
    .set('contentId', nid)

  const itemEventData = ITEM_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)

  return (
    <li key={id} className="notifications-menu__item">
      <div className="notifications-menu__item-left">
        <div className="notifications-menu__item-hero">
          <img
            className="notifications-menu__item-img"
            src={imgUrl}
            alt={title}
          />
        </div>
        <span className="notifications-menu__item-date">
          {notification.get('timeAsDistance', '')}
        </span>
      </div>
      <div className="notifications-menu__item-right">
        <div className="notifications-menu__item-context">
          {notification.get('label', '')}
        </div>
        <div className="notifications-menu__item-message">
          <TextLink
            to={path}
            onClick={onClick}
            data-id={id}
            text={title}
            eventData={itemEventData}
          />
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
            onClick={onClick}
            eventData={eventData}
          >
            <NotificationsWatchNow />
          </Link>
        ) : null}
      </div>
    </li>
  )
}

function handleNewEpisode (notification, onClick) {
  const seriesPath = notification.getIn(['node', 'series', 'path'], '')
  const imgUrl = notification.getIn(['node', 'keyart_16x9_withtext', 'keyart_304x171'], '')
  const path = notification.getIn(['node', 'path'], '')
  const title = notification.getIn(['node', 'title'], '')
  const id = notification.get('id')
  const nid = notification.getIn(['node', 'nid'], '')
  const eventData = WATCH_NOW_EVENT_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)
    .set('contentId', nid)
  const itemEventData = ITEM_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)

  return (
    <li key={id} className="notifications-menu__item">
      <div className="notifications-menu__item-left">
        <div className="notifications-menu__item-hero">
          <img
            className="notifications-menu__item-img"
            alt={title}
            src={imgUrl}
          />
        </div>
        <div className="notifications-menu__item-date">
          {notification.get('timeAsDistance', '')}
        </div>
      </div>
      <div className="notifications-menu__item-right">
        <div className="notifications-menu__item-label">
          {notification.get('label', '')}
        </div>
        <div className="notifications-menu__item-context">
          <TextLink
            text={notification.getIn(['node', 'series', 'title'], '')}
            to={seriesPath}
            onClick={onClick}
            data-id={id}
          />
        </div>
        <div className="notifications-menu__item-message">
          <TextLink
            to={path}
            onClick={onClick}
            data-id={id}
            text={title}
            eventData={itemEventData}
          />
        </div>
        <Link
          onClick={onClick}
          data-id={id}
          className="notifications-menu__item-watch"
          to={`${path}?fullplayer=feature`}
          eventData={eventData}
        >
          <NotificationsWatchNow />
        </Link>
      </div>
    </li>
  )
}

function renderFollow (notification, onClick) {
  const imgUrl = notification.getIn(['member', 'image'], '')
  const title = notification.getIn(['member', 'title'], '')
  const url = notification.getIn(['member', 'url'], '')
  const id = notification.get('id')
  const itemEventData = ITEM_DATA
    .set('notificationId', id)
    .set('notificationTitle', title)

  return (
    <li key={id} className="notifications-menu__item notifications-menu__item--member">
      <div className="notifications-menu__item-left">
        <div className="notifications-menu__item-hero">
          <img
            className="notifications-menu__item-img"
            alt={''} // title
            src={imgUrl}
          />
        </div>
      </div>
      <div className="notifications-menu__item-right">
        <div className="notifications-menu__item-label">
          {notification.get('label', '')}
        </div>
        <div className="notifications-menu__item-message">
          {url ? (
            <TextLink
              to={url}
              onClick={onClick}
              text={title}
              data-id={id}
              eventData={itemEventData}
            />
          ) : (
            <span>{title}</span>
          )}
        </div>
        <aside className="notifications-menu__item-date">
          {notification.get('timeAsDistance', '')}
        </aside>
      </div>
    </li>
  )
}

function renderNotifications (notifications = List(), onClick) {
  return notifications.map((n = Map()) => {
    switch (n.get('type')) {
      case NOTIFICATION_TYPES.MEMBER_FOLLOWING:
      case NOTIFICATION_TYPES.ACCOUNT_FOLLOWED:
        return renderFollow(n, onClick)
      case NOTIFICATION_TYPES.SUBSCRIPTION_NEW_EPISODE:
      case NOTIFICATION_TYPES.SUBSCRIPTION_NEW_SEASON:
        return handleNewEpisode(n, onClick)
      case NOTIFICATION_TYPES.MEMBER_RECOMMENDATION:
      case NOTIFICATION_TYPES.GENERAL_RECOMMENDATION:
      case NOTIFICATION_TYPES.SUBSCRIPTION_RECOMMENDATION:
        return handleRecommendation(n, onClick)
      case NOTIFICATION_TYPES.MEMBER_FREE_FORM:
      case NOTIFICATION_TYPES.GENERAL_FREE_FORM:
      case NOTIFICATION_TYPES.GENERAL_NEW_FEATURE:
      case NOTIFICATION_TYPES.SUBSCRIPTION_FREE_FORM:
        return handleFreeForm(n, onClick)
      default:
        return null
    }
  })
}

class NotificationsMenu extends PureComponent {
  componentDidMount () {
    const { props } = this
    const { getRecentNotifications, getCommunityNotifications } = props
    getRecentNotifications()
    getCommunityNotifications()
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const {
      uid,
      language,
      visible,
      activeSection,
      getRecentNotifications,
      getCommunityNotifications,
      setCommunityNotificationsSeen,
    } = props
    const {
      uid: prevUid,
      language: prevLanguage,
      activeSection: prevActiveSection,
      visible: prevVisible,
    } = prevProps

    if (uid !== prevUid || language !== prevLanguage) {
      getRecentNotifications()
      getCommunityNotifications()
    }

    if (!prevVisible && visible && activeSection === 'community') {
      setCommunityNotificationsSeen()
    } else if (
      visible &&
      prevActiveSection !== 'community' &&
      activeSection === 'community'
    ) {
      setCommunityNotificationsSeen()
    }
  }

  getUnseen () {
    const { props } = this
    const { recent } = props
    return recent.filter(n => (
      n.get('received') !== true
    ))
  }

  setNotificationsMenuSection = (newSection) => {
    this.props.setNotificationsMenuSection(newSection)
  }

  toggleMenu = (e) => {
    e.preventDefault()
    const { props } = this
    const {
      toggleNotificationsMenuVisible,
      setNavigationOverlayVisible,
      setNotificationsReceived,
      setUserMenuVisible,
    } = props

    const unseen = this.getUnseen()
    const ids = unseen.map(n => n.get('id')).toJS()
    const impressed = unseen.map((n) => {
      return Map({
        id: n.get('id'),
        name: n.get('name'),
      })
    })

    setNotificationsReceived({ ids, impressed })
    toggleNotificationsMenuVisible()
    setNavigationOverlayVisible(false)
    setUserMenuVisible(false)
  }

  closeMenu = () => {
    const { props } = this
    const { toggleNotificationsMenuVisible } = props
    toggleNotificationsMenuVisible()
  }

  goToActivityDetails = (notificationId) => {
    const { closeMenu, props } = this
    const { setCommunityNotificationRead } = props
    setCommunityNotificationRead(notificationId)
    closeMenu()
  }

  renderDropdownSection () {
    const { activeSection } = this.props
    if (activeSection === 'community') {
      return this.renderDropdownCommunitySection()
    }
    return this.renderDropdownContentSection()
  }

  renderDropdownCommunitySection () {
    const { props, goToActivityDetails } = this
    const {
      staticText,
      processingCommunityFetch,
      communityNotificationGroups,
      isWebView,
    } = props

    if (processingCommunityFetch) {
      return <Sherpa type={TYPE_LARGE} />
    }
    if (communityNotificationGroups.length < 1) {
      return (
        <div className="cm1-notifications-menu__empty">
          {staticText.getIn(['data', 'youHaveNoNewNotifications'])}
        </div>
      )
    }


    return (
      <ul className="cm1-notifications-menu__list">
        <NotificationList
          className={'cm1-notification-menu__list-item'}
          notificationComponent={CommunityNotification}
          notifications={communityNotificationGroups}
          onClick={goToActivityDetails}
          options={{ isWebView }}
        />
      </ul>
    )
  }

  renderDropdownContentSection () {
    const { staticText, processing, recent } = this.props

    if (processing) {
      return <Sherpa type={TYPE_LARGE} />
    }
    if (recent.isEmpty()) {
      return (
        <div className="cm1-notifications-menu__empty">
          {staticText.getIn(['data', 'youHaveNoNewNotifications'])}
        </div>
      )
    }
    return (
      <ul className="cm1-notifications-menu__list">
        {renderNotifications(recent, this.closeMenu)}
      </ul>
    )
  }

  renderDropdownContent () {
    const { staticText, processing, recent } = this.props

    if (processing) {
      return <Sherpa type={TYPE_LARGE} />
    }
    if (recent.isEmpty()) {
      return (
        <div className="notifications-menu__empty">
          {staticText.getIn(['data', 'youHaveNoNewNotifications'])}
        </div>
      )
    }
    return (
      <ul className="notifications-menu__list">
        {renderNotifications(recent, this.closeMenu)}
      </ul>
    )
  }

  renderViewAll () {
    const { staticText, activeSection, isWebView } = this.props
    const webViewQueryParam = isWebView ? '&webview=true' : ''
    return (
      <div className="cm1-notifications-menu__bottom">
        <TextLink
          className="cm1-notifications-menu__viewall"
          text={staticText.getIn(['data', 'viewAll'], '')}
          onClick={this.closeMenu}
          to={`/notifications?section=${activeSection}${webViewQueryParam}`}
          eventData={VIEW_ALL_EVENT_DATA}
        />
      </div>
    )
  }

  renderBell () {
    const unseen = this.getUnseen()
    const unseenCount = unseen.size || (this.props.unseenCommunityCount > 0)
    const modifier = unseenCount ? ' ringing' : ''
    return (
      <span className={`notifications-menu__bell${modifier}`}>
        {unseenCount ? (
          <span className="notifications-menu__received" />
        ) : null}
        <NotificationsBell
          type={BELL_TYPES.STROKE_HEAVY}
          fill="#44576B"
          size={27}
        />
      </span>
    )
  }

  render () {
    const { props, toggleMenu } = this
    const { visible, staticText, activeSection, unseenCommunityCount, isWebView } = props
    const hideContentIcon = (activeSection === 'content' || this.getUnseen().size < 1) ? '--hide' : ''
    const hideCommunityIcon = (activeSection === 'community' || unseenCommunityCount < 1) ? '--hide' : ''
    const contentActive = activeSection === 'content' ? 'active' : ''
    const communityActive = activeSection === 'community' ? 'active' : ''
    const webViewQueryParam = isWebView ? '?webview=true' : ''

    return (
      <div className="notifications-menu">
        <ToolTipArrow
          direction={DIRECTION_UP}
          activeArrow="notifications-bell-arrow"
        />
        <Link
          aria-controls="notifications-menu__popup"
          title="Click to view your notifications"
          className="notifications-menu__icon"
          onClick={toggleMenu}
          to="/notifications"
          role="button"
          aria-haspopup
          eventData={BELL_EVENT_DATA}
        >{this.renderBell()}
        </Link>
        <div className="notifications-menu__container">
          <div
            id="notifications-menu__popup"
            className="notifications-menu__dropdown"
            aria-expanded={visible}
          >
            <TestarossaSwitch>
              <TestarossaCase campaign="CM-1" variation={1} unwrap>
                <div className="cm1-notifications-menu__top">
                  <div className={'cm1-notifications-menu__header'}>
                    <span className="cm1-notifications-menu__header-title">
                      {staticText.getIn(['data', 'notifications'], '')}
                    </span>
                    <span className={'cm1-notifications-menu__header-link'}>
                      <TextLink
                        onClick={this.closeMenu}
                        text={staticText.getIn(['data', 'manage'], '')}
                        className="cm1-notifications-menu__header-link-manage"
                        to={`/notifications/manage${webViewQueryParam}`}
                        eventData={MANAGE_EVENT_DATA}
                      />
                    </span>
                  </div>
                </div>
                <div className="cm1-notifications-menu__sections">
                  <div onClick={() => this.setNotificationsMenuSection('content')} className={`cm1-notifications-menu__sections--content ${contentActive}`}>
                    {staticText.getIn(['data', 'content'], 'Content')}
                    <span className={`cm1-notifications-menu__sections-unread-alert${hideContentIcon}`} />
                  </div>
                  <div onClick={() => this.setNotificationsMenuSection('community')} className={`cm1-notifications-menu__sections--community ${communityActive}`}>
                    {staticText.getIn(['data', 'community'], 'Community')}
                    <span className={`cm1-notifications-menu__sections-unread-alert${hideCommunityIcon}`} />
                  </div>
                </div>
                {visible ? (
                  <section className="cm-1-notifications-menu__main">
                    {this.renderDropdownSection()}
                  </section>
                ) : null}
                {this.renderViewAll()}
              </TestarossaCase>
              <TestarossaDefault unwrap>
                <div className="notifications-menu__top">
                  <span className="notifications-menu__title">
                    {staticText.getIn(['data', 'notifications'], '')}
                  </span>
                  <TestarossaSwitch>
                    <TestarossaCase campaign="ME-3043" variation={1} >
                      <TextLink
                        onClick={this.closeMenu}
                        text={staticText.getIn(['data', 'manage'], '')}
                        className="notifications-menu__manage"
                        to={URL_ACCOUNT_SETTINGS}
                        eventData={MANAGE_EVENT_DATA}
                      />
                    </TestarossaCase>
                    <TestarossaDefault unwrap>
                      <TextLink
                        onClick={this.closeMenu}
                        text={staticText.getIn(['data', 'manage'], '')}
                        className="notifications-menu__manage"
                        to="/notifications/manage"
                        eventData={MANAGE_EVENT_DATA}
                      />
                    </TestarossaDefault>
                  </TestarossaSwitch>
                </div>
                {visible ? (
                  <section className="notifications-menu__main">
                    {this.renderDropdownContent()}
                  </section>
                ) : null}
                <div className="notifications-menu__bottom">
                  <TextLink
                    className="notifications-menu__viewall"
                    text={staticText.getIn(['data', 'viewAll'], '')}
                    onClick={this.closeMenu}
                    to="/notifications"
                    eventData={VIEW_ALL_EVENT_DATA}
                  />
                </div>
              </TestarossaDefault>
            </TestarossaSwitch>
          </div>
        </div>
      </div>
    )
  }
}

export default connectRedux(
  state => ({
    uid: state.user.getIn(['data', 'uid']),
    visible: state.header.get('notificationsMenuVisible'),
    activeSection: state.header.get('notificationsMenuSection') || 'content',
    processing: state.notifications.getIn(['recent', 'processing']),
    processingCommunityFetch: state.getstream.getIn(['notifications', 'processing']),
    recent: state.notifications.getIn(['recent', 'data'], EMPTY_LIST),
    communityNotificationGroups: state.getstream.getIn(['notifications', 'activityGroups'], EMPTY_LIST),
    unseenCommunityCount: state.getstream.getIn(['notifications', 'unseen'], 0),
    language: state.user.getIn(['data', 'language', 0], get(config, 'appLang')),
    staticText: state.staticText.getIn(['data', 'notificationsMenu'], EMPTY_MAP),
    isWebView: state.app.get('isWebView', false),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setUserMenuVisible: actions.header.setUserMenuVisible,
      setNavigationOverlayVisible: actions.header.setNavigationOverlayVisible,
      toggleNotificationsMenuVisible: actions.header.toggleNotificationsMenuVisible,
      setNotificationsMenuSection: actions.header.setNotificationsMenuSection,
      setNotificationsReceived: actions.notifications.setNotificationsReceived,
      getRecentNotifications: actions.notifications.getRecentNotifications,
      getCommunityNotifications: actions.getstream.getCommunityNotifications,
      setCommunityNotificationsSeen: actions.getstream.setCommunityNotificationsSeen,
      setCommunityNotificationRead: actions.getstream.setCommunityNotificationRead,
    }
  },
)(NotificationsMenu)
