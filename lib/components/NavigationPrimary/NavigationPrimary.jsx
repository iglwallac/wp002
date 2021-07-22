import React from 'react'
import PropTypes from 'prop-types'
import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { createGaiaScreenModel } from 'services/resolver'
import { selectAuthAllowed } from 'services/getstream/selectors'
import { getAuthIsLoggedIn } from 'services/auth'
import { isPartialPathAllowed } from 'services/url'
import {
  SCREEN_TYPE_HEADER,
  CONTEXT_TYPE_NAV_PRIMARY,
  createUpstreamContext,
} from 'services/upstream-context'
import SearchForm from 'components/SearchForm'
import { TextLink, TARGET_BLANK, URL_JAVASCRIPT_VOID } from 'components/Link'
import { List, Map } from 'immutable'
import ToolTipArrow, { DIRECTION_UP, DIRECTION_LEFT } from 'components/ToolTipArrow'
import { headerAlertBarShouldRender } from 'components/AlertBar/connect'


function applyMobileBodyClass (props, remove = false) {
  const { document = {} } = global
  const { body } = document
  const { header } = props
  if (body && body.classList) {
    if (!remove && header.get('navigationOverlayVisible')) {
      body.classList.add('nav__mobile-open')
      return
    }
    body.classList.remove('nav__mobile-open')
  }
}

function applyAlertBarClass (props) {
  const className = ['nav__mobile']
  const { alertBar, auth, isMh, testarossa, resolver } = props
  const location = resolver.get('path')
  const alertBarVisible = alertBar.get('visible')
  const testarossaCampaigns = testarossa.getIn(['records'], Map())
  const ri97 = testarossaCampaigns.find(campaign => campaign.getIn(['campaign', 'friendlyId']) === 'RI-97')
  if (alertBarVisible && getAuthIsLoggedIn(auth) && isMh && ri97) {
    className.push('nav__mobile--alertBarRi97')
    return className.join(' ')
  } else if (location && headerAlertBarShouldRender(location) && alertBarVisible) {
    className.push('nav__mobile--alertBar')
    return className.join(' ')
  }
  return className
}

function getItemClassName (isActive, hasChildren, hasPopup, activeItem) {
  const className = ['nav__item']
  if (isActive) className.push('active')
  if (hasPopup) className.push('has-popup')
  if (activeItem) className.push('force-active')
  if (hasChildren) className.push('has-children')

  return className.join(' ')
}

function getItemRole (isMobile, hasChildren, hasPopup) {
  if (isMobile && hasChildren) return 'button'
  if (!isMobile && hasPopup) return 'button'
  return 'link'
}

function getKeyFromTarget (target) {
  if (target && target.tagName !== 'A') {
    return getKeyFromTarget(target.parentNode)
  }
  return target
    ? target.getAttribute('data-href')
    : null
}

function handleInviteFriendPopup (props) {
  const { userReferrals, showInviteFriendPopup, setNavigationOverlayVisible } = props
  const showingInviteFriendPopup = userReferrals.getIn(['showInviteFriendPopup'])
  showInviteFriendPopup(!showingInviteFriendPopup)
  setNavigationOverlayVisible(false)
}

// when the community item is no longer a test, remove updateNav functionality
function updateNav (nav) {
  const communityItem = Map({ label: 'Community', url: '/community', trackingId: '123456789' })
  const homeNavChildren = nav.getIn([1, 'children'], List())
  const updatedHomeNavChildren = homeNavChildren.push(communityItem)
  const updatedNav = nav.setIn([1, 'children'], updatedHomeNavChildren)
  return updatedNav
}

class NavigationPrimary extends React.PureComponent {
  //
  constructor (props) {
    super(props)
    this.state = {}
  }
  componentDidMount () {
    const { props } = this
    const { document } = global
    applyMobileBodyClass(props)
    if (document && document.addEventListener) {
      document.addEventListener(
        'mousedown', this.tryHidePopup, true)
      document.addEventListener(
        'touchstart', this.tryHidePopup, true)
    }
  }

  componentDidUpdate () {
    const { props } = this
    applyMobileBodyClass(props)
  }

  componentWillUnmount () {
    const { props } = this
    const { document } = global
    applyMobileBodyClass(props, true)
    if (document && document.removeEventListener) {
      document.removeEventListener(
        'mousedown', this.tryHidePopup, true)
      document.removeEventListener(
        'touchstart', this.tryHidePopup, true)
    }
  }

  handleItemClick = () => {
    const { props, resetMobileNav } = this
    const {
      clearUpstreamContext,
      resolver,
      language,
      auth,
    } = props

    const location = resolver.get('path')
    const gaiaScreen = createGaiaScreenModel({ resolver })
    const upstreamContext = createUpstreamContext({
      contextType: CONTEXT_TYPE_NAV_PRIMARY,
      screenParam: gaiaScreen.get('screenParam'),
      screenType: gaiaScreen.get('screenType', SCREEN_TYPE_HEADER),
    })

    if (upstreamContext && auth && location && language) {
      clearUpstreamContext()
    }
    resetMobileNav()
  }

  tryHidePopup = (e) => {
    const { document } = global
    const { target } = e

    let node = target

    while (node && node !== document) {
      if (node && toLower(node.tagName) === 'ul'
        && (/menu--user/.test(node.className)
          || (/nav__secondary/.test(node.className) && /has-popup/.test(node.parentNode.className))
        )) {
        return
      }
      if (node && (/notifications-menu/.test(node.className))) {
        return
      }
      if (node && (/user-menu/.test(node.className))) {
        return
      }
      node = node.parentNode
    }
    this.hidePopup()
  }

  hidePopup = () => {
    const { props } = this
    const { header, setUserMenuVisible, setNotificationsMenuVisible } = props
    if (header.get('userMenuVisible')) {
      setUserMenuVisible(false)
    }
    if (header.get('notificationsMenuVisible')) {
      setNotificationsMenuVisible(false)
    }
    this.setState(() => ({
      activeDesktopItem: null,
    }))
  }

  blurItem = (e) => {
    const { target, relatedTarget } = e
    if (relatedTarget && target && target.parentNode) {
      const children = target.parentNode.getElementsByTagName('A')
      const match = find(children, c => c === relatedTarget)
      if (!match) {
        this.hidePopup()
      }
    }
  }

  resetMobileNav = () => {
    const { props } = this
    const { setNavigationOverlayVisible } = props
    setNavigationOverlayVisible(false)
    this.setState(() => ({
      activeMobileItem: null,
      activeDesktopItem: null,
    }))
  }

  isAuthorized (item = Map()) {
    const { props } = this
    const { auth = Map() } = props
    const isAuthorized = auth.get('uid', null)
    const authorize = item.get('auth', null)
    return authorize === null
      || (authorize === true && isAuthorized)
      || (authorize === false && !isAuthorized)
  }

  isActiveItem (item = Map()) {
    const { props } = this
    const { resolver } = props
    const pathname = resolver.get('path')

    if (this.isAuthorized(item)) {
      const itemUrl = item.get('url')
      const isActive = itemUrl === pathname || isPartialPathAllowed(pathname, itemUrl)
      const children = item.get('children', List())
      if (!isActive && children && children.size) {
        return children.find(child => this.isActiveItem(child))
      }
      return isActive
    }
    return false
  }

  showMobileSecondaryNav = (e) => {
    const { target } = e
    const { props } = this
    const { menu, getstream } = props
    const key = getKeyFromTarget(target)

    const nav = getstream ? updateNav(menu.getIn(['data', 'nav'], List())) : menu.getIn(['data', 'nav'], List())
    const activeMobileItem = nav.find((item) => {
      if (this.isAuthorized(item)) {
        const url = item.get('url') || ''
        return url === key
      }
      return false
    }) || null
    e.preventDefault()

    this.setState(() => ({
      activeMobileItem,
    }))
  }

  showDesktopPopup = (e) => {
    const { target } = e
    const { props, state } = this
    const { activeDesktopItem = null } = state
    const { menu, getstream } = props
    const href = target.getAttribute('data-href')
    // when the community item is no longer a test, remove updateNav functionality
    const nav = getstream ? updateNav(menu.getIn(['data', 'nav'], List())) : menu.getIn(['data', 'nav'], List())

    const activeItem = nav.find((item) => {
      if (this.isAuthorized(item)) {
        const url = item.get('url') || ''
        return url === href
      }
      return false
    }) || null

    e.preventDefault()
    if (activeDesktopItem
      && activeDesktopItem === activeItem) {
      this.hidePopup()
      return
    }
    this.setState(() => ({
      activeDesktopItem: activeItem,
    }))
  }

  renderItemChildren ({ children, id, isActive, options = {}, path }) {
    const { handleItemClick } = this
    const { isMobile = false } = options

    return (
      <ul className="nav__secondary" id={id} aria-expanded={isActive}>
        {children.map((child, childIndex) => {
          const kids = child.get('children', List())
          if (kids && kids.size) {
            const items = kids.map((kid, kidIndex) => this.renderItem(kid || Map(), {
              onBlur: !isMobile && childIndex === children.size - 1
                && kidIndex === kids.size - 1 ? this.hidePopup : null,
              onClick: handleItemClick,
            }))
            return items.unshift((
              <li
                key={child.get('trackingId')}
                className="nav__item"
                role="heading"
              >{child.get('label')}
              </li>
            )).toJS()
          }

          if ((childIndex === 0) && (path === child.get('url'))) {
            return (
              <li
                key={child.get('trackingId')}
                className={getItemClassName(true, null, null, null)}
                role="heading"
              >
                <TextLink
                  to={child.get('url')}
                  text={child.get('label')}
                  data-href={child.get('url')}
                />
              </li>
            )
          } else if (child.get('url')) {
            return (
              <li
                key={child.get('trackingId')}
                className="nav__item nav__item--url"
                role="heading"
              >
                <TextLink
                  to={child.get('url')}
                  text={child.get('label')}
                  data-href={child.get('url')}
                />
              </li>
            )
          }
          return this.renderItem(child, {
            onClick: handleItemClick,
            onBlur: this.hidePopup,
          })
        }).toJS()}
      </ul>
    )
  }

  // eslint-disable-next-line class-methods-use-this
  renderToolTipArrow (itemLabel, isMobile) {
    if (itemLabel === 'Series') {
      if (isMobile) {
        return (
          <ToolTipArrow
            direction={DIRECTION_LEFT}
            activeArrow="series-active-arrow"
            className="mobile-series-menu-arrow"
          />
        )
      }
      return (
        <ToolTipArrow
          direction={DIRECTION_UP}
          activeArrow="series-active-arrow"
          className="desktop-series-menu-arrow"
        />
      )
    } else if (itemLabel === 'Yoga') {
      if (isMobile) {
        return (
          <ToolTipArrow
            direction={DIRECTION_LEFT}
            activeArrow="yoga-meditation-arrow"
            className="mobile-yoga-meditation-arrow"
          />
        )
      }

      return (
        <ToolTipArrow
          direction={DIRECTION_UP}
          activeArrow="yoga-meditation-arrow"
          className="desktop-yoga-meditation-arrow"
        />
      )
    } else if (itemLabel === 'Topics') {
      if (isMobile) {
        return (
          <ToolTipArrow
            direction={DIRECTION_LEFT}
            activeArrow="topics-arrow"
            className="mobile-topics-arrow"
          />
        )
      }

      return (
        <ToolTipArrow
          direction={DIRECTION_UP}
          activeArrow="topics-arrow"
          className="desktop-topics-arrow"
        />
      )
    } else if (itemLabel === 'Docs & Films') {
      return (
        <ToolTipArrow
          direction={isMobile ? DIRECTION_LEFT : DIRECTION_UP}
          activeArrow="docs-films-arrow"
          className={isMobile ? 'mobile-docs-films-arrow' : 'desktop-docs-films-arrow'}
        />
      )
    }

    return null
  }

  renderItem (item = Map(), options = {}) {
    if (this.isAuthorized(item)) {
      const { onClick, onBlur, isMobile, activeItem, includeChildren } = options
      const isTopics = item.get('url') === '/topics'
      const isActive = activeItem ? item.equals(activeItem) : this.isActiveItem(item)
      const children = item.get('children', List()) || List()
      const hasChildren = includeChildren && children.size > 0
      const hasPopup = item.get('hasPopup', false)
      const role = getItemRole(isMobile, hasChildren, hasPopup)
      const name = getItemClassName(isActive, hasChildren, hasPopup, activeItem)
      const className = isTopics ? `${name} topics-nav-item` : name
      const trackingId = item.get('trackingId', -1)
      const label = item.get('label') || ''
      const url = item.get('url') || ''
      const id = isMobile ? `mobilenav-${trackingId}` : `nav-${trackingId}`

      return (
        <li key={id} className={className}>
          { this.renderToolTipArrow(item.get('label'), isMobile) }
          <TextLink
            to={url}
            role={role}
            text={label}
            onBlur={onBlur}
            data-href={url}
            onClick={onClick}
            data-id={trackingId}
            aria-haspopup={hasChildren}
            aria-controls={hasChildren ? id : null}
          >
            {hasPopup ? <span>{label}</span> : null}
          </TextLink>
          {hasChildren
            ? this.renderItemChildren({ children, id, isActive, options })
            : null}
        </li>
      )
    }
    return null
  }

  renderMobileNavItem (item = Map()) {
    const { showMobileSecondaryNav, handleItemClick, state } = this
    const { activeMobileItem } = state
    const children = item.get('children', List())
    const hasChildren = children && children.size > 1

    return this.renderItem(item, {
      includeChildren: hasChildren,
      activeItem: activeMobileItem,
      onClick: hasChildren
        ? showMobileSecondaryNav
        : handleItemClick,
      isMobile: true,
    })
  }

  renderMobileNav () {
    // The functionality around the link with className="header__popup-link" is fragile,
    // if the className changes, edit the handleClick function inside InviteFriendPopup.jsx
    const { props, context, resetMobileNav } = this
    const { menu, header, staticTextHeader, auth, getstream } = props
    const { history } = context
    const isLoggedIn = !!auth.get('jwt')
    // when the community item is no longer a test, remove updateNav functionality
    const nav = getstream ? updateNav(menu.getIn(['data', 'nav'], List())) : menu.getIn(['data', 'nav'], List())
    if (header.get('navigationOverlayVisible')) {
      return (
        <div
          id="nav__mobile"
          className={applyAlertBarClass(props)}
          aria-expanded="true"
        >
          <SearchForm
            onSubmit={resetMobileNav}
            history={history}
            resetOnSubmit
            hasButton
            isNav
          />
          <ul className="nav__primary">
            {nav.map(item => this.renderMobileNavItem(item || Map())).toJS()}
            <li className="nav__header-links">
              <TextLink
                to={'/careers'}
                text={staticTextHeader.getIn(['data', 'careers'])}
                data-href="/careers"
                target={TARGET_BLANK}
                directLink
              />
            </li>
            <li className="nav__header-links">
              { isLoggedIn ?
                <span>
                  <TextLink
                    text={staticTextHeader.getIn(['data', 'invite'])}
                    className="header__invite-link"
                    to={URL_JAVASCRIPT_VOID}
                    onClick={() => handleInviteFriendPopup(props)}
                  />
                </span> : null
              }
            </li>
          </ul>
        </div>
      )
    }
    return (
      <nav
        id="nav__mobile"
        className={applyAlertBarClass(props)}
        aria-expanded="false"
      />
    )
  }

  renderDesktopNavItem (item = Map()) {
    const { state, showDesktopPopup, handleItemClick, blurItem } = this
    const { activeDesktopItem } = state
    const hasPopup = item.get('hasPopup', false)
    return this.renderItem(item, {
      onClick: hasPopup ? showDesktopPopup : handleItemClick,
      onBlur: hasPopup ? blurItem : null,
      activeItem: activeDesktopItem,
      includeChildren: hasPopup,
      isMobile: false,
    })
  }

  renderDesktopNav () {
    const { props, context, resetMobileNav } = this
    const { history } = context
    const { menu, resolver, getstream } = props
    const path = resolver.get('path')
    // when the community item is no longer a test, remove updateNav functionality
    const nav = getstream ? updateNav(menu.getIn(['data', 'nav'], List())) : menu.getIn(['data', 'nav'], List())
    const activeItem = nav.find(i => this.isActiveItem(i))
    const children = (activeItem && activeItem.get('children', null)) || null
    const childrenShouldRender = children && children.size > 1
      && activeItem.get('hasPopup', false) !== true
    const secondaryNav = childrenShouldRender
      ? this.renderItemChildren({ children, path }) : null

    return (
      <div id="nav__desktop" className="nav__desktop">
        <ToolTipArrow
          direction={DIRECTION_UP}
          activeArrow="navigation-menu-arrow"
        />
        <ul className="nav__primary">
          {nav.map(item => this.renderDesktopNavItem(item || Map())).toJS()}
          <li className="nav__item nav__item--search">
            <SearchForm
              onSubmit={resetMobileNav}
              history={history}
              resetOnSubmit
              hasButton
              isNav
            />
          </li>
        </ul>
        {secondaryNav}
      </div>
    )
  }

  render () {
    return (
      <nav className="nav default">
        {this.renderDesktopNav()}
        {this.renderMobileNav()}
      </nav>
    )
  }
}

NavigationPrimary.contextTypes = {
  history: PropTypes.object.isRequired,
}

export default connectRedux(state => ({
  staticTextHeader: state.staticText.getIn(['data', 'header']),
  language: state.user.getIn(['data', 'language']),
  getstream: selectAuthAllowed(state.getstream),
  width: state.app.getIn(['viewport', 'width']),
  isMh: state.resolver.get('path') === '/',
  userReferrals: state.userReferrals,
  testarossa: state.testarossa,
  alertBar: state.alertBar,
  resolver: state.resolver,
  header: state.header,
  auth: state.auth,
  menu: state.menu,
}), (dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    setNavigationOverlayVisible: actions.header.setNavigationOverlayVisible,
    setNotificationsMenuVisible: actions.header.setNotificationsMenuVisible,
    showInviteFriendPopup: actions.userReferrals.showInviteFriendPopup,
    clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
    setUserMenuVisible: actions.header.setUserMenuVisible,
  }
})(NavigationPrimary)
