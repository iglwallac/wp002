/* eslint-disable no-bitwise */
import React, { Component } from 'react'
import { List } from 'immutable'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import Icon from 'components/Icon'
import {
  URL_ACCOUNT,
  URL_REFER,
  URL_ACCOUNT_SETTINGS,
  URL_ACCOUNT_PROFILE,
} from 'services/url/constants'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'

export const ACCOUNT = 'account'
export const ACCOUNT_3043 = 'account-3043'
export const NOTIFICATIONS = 'notifications'
export const NOTIFICATIONS_3043 = 'notifications-3043'

function getNavByType (navType, staticText, isTest) {
  let navItems = []
  let type = navType
  if (navType === ACCOUNT && isTest) type = ACCOUNT_3043
  else if (navType === NOTIFICATIONS && isTest) type = NOTIFICATIONS_3043
  switch (type) {
    case ACCOUNT:
      navItems = [
        { url: URL_ACCOUNT, text: staticText.getIn(['data', 'account']) },
        { url: URL_ACCOUNT_PROFILE, text: staticText.getIn(['data', 'profile']) },
        { url: URL_ACCOUNT_SETTINGS, text: staticText.getIn(['data', 'settings']) },
        { url: URL_REFER, text: staticText.getIn(['data', 'referrals']) },
      ]
      break
    case ACCOUNT_3043:
      navItems = [
        { url: URL_ACCOUNT, text: staticText.getIn(['data', 'account']) },
        { url: URL_ACCOUNT_PROFILE, text: staticText.getIn(['data', 'profile']) },
        { url: URL_ACCOUNT_SETTINGS, text: staticText.getIn(['data', 'settingsAndPreferences']) },
        { url: URL_REFER, text: staticText.getIn(['data', 'referrals']) },
      ]
      break
    case NOTIFICATIONS:
      navItems = [
        { url: '/notifications', text: staticText.getIn(['data', 'allNotifications']) },
        { url: '/notifications/manage', text: staticText.getIn(['data', 'manageNotifications']) },
      ]
      break
    case NOTIFICATIONS_3043:
      navItems = [
        { url: '/notifications', text: staticText.getIn(['data', 'allNotifications']) },
        { url: URL_ACCOUNT_SETTINGS, text: staticText.getIn(['data', 'manageNotifications']) },
      ]
      break
    default:
      break
  }
  return navItems
}

function navLinkClass (isActive) {
  const base = 'vertical-nav__link'
  const activeClass = `${base}--active`
  let className = List([base])
  if (isActive) {
    className = className.push(activeClass)
  }
  return className.join(' ')
}

class VerticalNav extends Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      drawerOpen: false,
      width: 0,
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.handleWindowSizeChange)
    this.setState(() => ({ // eslint-disable-line
      width: window.innerWidth,
      drawerOpen: false,
    }))
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleWindowSizeChange)
  }

  setDrawerOpen = () => {
    this.setState({
      drawerOpen: !this.state.drawerOpen,
    })
  }

  handleWindowSizeChange = () => {
    const { state } = this
    const drawerOpen = state.drawerOpen && window.innerWidth < 720
    this.setState({
      width: window.innerWidth,
      drawerOpen,
    })
  }

  hideContentTooltipOnClick = () => {
    this.setState({ showHideContentTooltip: false })
  }

  renderMobile = ({ variation } = {}) => {
    const { props, state } = this
    const { drawerOpen } = state
    const { navType, staticText, location } = props
    const navigationItems = getNavByType(navType, staticText, variation)
    const activeItem = navigationItems.find(item => item.url === location.pathname)

    return (
      drawerOpen ?
        <div className="vertical-nav" onClick={this.setDrawerOpen}>
          <Icon iconClass={['vertical-nav__icon', 'vertical-nav__icon-up']} />
          {navigationItems.map((item) => {
            const isActive = item.url === activeItem.url
            return (
              <Link
                key={`${item.url}`}
                className={`vertical-nav__link--mobile${isActive ? '-active' : ''}`}
                to={!isActive ? item.url : ''}
                onClick={this.setDrawerOpen}
              >
                {item.text}
              </Link>
            )
          })
          }
        </div> :
        <div onClick={this.setDrawerOpen} className="vertical-nav">
          <Icon iconClass={['vertical-nav__icon', 'vertical-nav__icon-down']} />
          <div className="vertical-nav__link--mobile-active-no-hover">
            {activeItem ? activeItem.text : ''}
          </div>
        </div>
    )
  }

  renderDesktop = ({ variation } = {}) => {
    const { props } = this
    const { navType, staticText, location } = props
    const navigationItems = getNavByType(navType, staticText, variation)
    const renderedItems = navigationItems.map((item) => {
      const isActive = item.url === location.pathname
      return (
        <Link
          key={`${item.url}`}
          className={navLinkClass(isActive)}
          to={item.url}
        >
          {item.text}
        </Link>
      )
    })
    return (
      <nav className="vertical-nav">
        {renderedItems}
      </nav>
    )
  }

  render () {
    const { state } = this
    const { width } = state
    const isMobile = width < 944

    return (
      <TestarossaSwitch>
        <TestarossaCase campaign="ME-3043" variation={[1]}>
          {(campaign, variation, subject) => (
            isMobile ?
              this.renderMobile({ variation, campaign, subject }) :
              this.renderDesktop({ variation, campaign, subject })
          )}
        </TestarossaCase>
        <TestarossaDefault unwrap>
          {isMobile ?
            this.renderMobile() :
            this.renderDesktop()}
        </TestarossaDefault>
      </TestarossaSwitch>
    )
  }
}

VerticalNav.propTypes = {
  navType: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        resolver: state.resolver,
        featureTracking: state.featureTracking,
        userStore: state.user,
      }
    },
  ),
  connectStaticText({ storeKey: 'verticalNavigation' }),
)(VerticalNav)
