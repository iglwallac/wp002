import {
  URL_HELP_CENTER_ES,
  URL_WATCH_GAIA_ON_TV,
} from 'services/url/constants'
import { getPrimary } from 'services/languages'
import { ES } from 'services/languages/constants'
import PropTypes from 'prop-types'
import React from 'react'
import { List } from 'immutable'
import _partial from 'lodash/partial'
import _get from 'lodash/get'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import Menu from 'components/Menu'
import UserAvatar from 'components/UserAvatar'
import ToolTipArrow, { DIRECTION_UP } from 'components/ToolTipArrow'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { get as getConfig } from 'config'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import {
  isAccount,
  isAccountLanguage,
  isContact,
  isAccountProfile,
  isNotificationsPage,
  isRefer,
  isWatchGaiaOnTV,
  isManageProfilesPage,
} from 'services/url'

const { features } = getConfig()
const EMPTY_MENU = List()

function onClickWatchGaiaOnTv (props) {
  const { auth, setEventUserMenuClicked } = props
  const options = {
    auth,
    navItem: 'Watch Gaia on your TV',
    delay: 0, // We're leaving the page, so don't defer the POST
  }
  setEventUserMenuClicked(options)
}

export function getMenuItemStructure (props) {
  const {
    user,
    menu: menuProp,
    toggleUserMenuVisible,
  } = props
  const primaryLang = getPrimary(user.getIn(['data', 'language'], List()))
  const langIsEs = primaryLang === ES
  return menuProp.reduce((reduction, item) => {
    // don't render the language select link if there is a feature toggle
    // @TODO: uncomment feature toggle when appropriate
    // @NOTE: I think this toggle may be dangerous to turn off and remove the entire user menu.
    if (!features.languageSelect) {
      return reduction
    }
    if (!features.languageSelectDialog && isAccountLanguage(item.get('url'))) {
      return reduction
    }
    if (isAccountProfile(item.get('url'))) {
      return reduction
    }
    if (isRefer(item.get('url'))) {
      return reduction
    }

    const menuItem = item.withMutations((mutatableItem) => {
      const isContactUrl = isContact(mutatableItem.get('url'))
      mutatableItem.set('user-menu-item', true)
      if (mutatableItem.get('border')) {
        mutatableItem.set('user-menu-border', true)
      }
      if (isRefer(mutatableItem.get('url'))) {
        mutatableItem
          .set('onClick', () => {
            toggleUserMenuVisible()
          })
      }
      if (
        isAccount(mutatableItem.get('url')) ||
        isAccountProfile(mutatableItem.get('url')) ||
        isManageProfilesPage(mutatableItem.get('url')) ||
        isNotificationsPage(mutatableItem.get('url'))
      ) {
        mutatableItem.set('onClick', () => toggleUserMenuVisible())
      } else if (isWatchGaiaOnTV(mutatableItem.get('url'))) {
        mutatableItem
          .set('onClick', _partial(onClickWatchGaiaOnTv, props))
          .set('url', URL_WATCH_GAIA_ON_TV)
      } else if (
        isContactUrl &&
        langIsEs &&
        _get(features, ['userLanguage', 'esZendeskHelpLink'])
      ) {
        mutatableItem.set('url', URL_HELP_CENTER_ES)
      }
      return mutatableItem
    })
    return reduction.push(menuItem)
  }, List())
}

export function renderMenu (props) {
  const { user, userProfiles } = props
  const portalUrl = user.getIn(['data', 'portal', 'url'])
  const profiles = userProfiles.get('data', List())
  const className = `menu--user menu--profiles-${profiles.size}`
  return (
    <TestarossaSwitch>
      <TestarossaCase campaign="ME-2875" unwrap>
        {(campaign, variation, subject) => (
          <Menu
            location={location}
            portalUrl={portalUrl}
            className={className}
            profiles={userProfiles}
            itemClassName="menu-item--user"
            itemLinkClassName="menu-item__link--user"
            toggleUserMenuVisible={props.toggleUserMenuVisible}
            menu={getMenuItemStructure(props)}
            campaign={campaign}
            variation={variation}
            subject={subject}
          />
        )}
      </TestarossaCase>
      <TestarossaDefault unwrap>
        {() => (
          <Menu
            location={location}
            portalUrl={portalUrl}
            className={className}
            profiles={userProfiles}
            itemClassName="menu-item--user"
            itemLinkClassName="menu-item__link--user"
            toggleUserMenuVisible={props.toggleUserMenuVisible}
            menu={getMenuItemStructure(props)}
          />
        )}
      </TestarossaDefault>
    </TestarossaSwitch>
  )
}

export function onClickMenuWrapper (e) {
  e.stopPropagation()
}

export function showUserMenu (
  e,
  toggleUserMenuVisible,
  setNavigationOverlayVisible,
  setNotificationsMenuVisible,
) {
  e.stopPropagation()
  toggleUserMenuVisible()
  setNavigationOverlayVisible(false)
  setNotificationsMenuVisible(false)
}

export function renderUserAvatar (props) {
  const { user } = props
  if (!user.get('data')) {
    return <div className="user-menu__user-avatar-placeholder" />
  }
  return (
    <UserAvatar
      path={user.getIn(['data', 'avatar', 'small'], '')}
      className={['user-menu__avatar']}
    />
  )
}

export function getClassName (hideUserMenu) {
  const className = ['user-menu__user']
  if (hideUserMenu) {
    className.push('user-menu__user--disabled')
  }
  return className.join(' ')
}

const UserMenu = (props) => {
  const {
    auth,
    menuVisible,
    hideUserMenu,
    toggleUserMenuVisible,
    setNavigationOverlayVisible,
    setNotificationsMenuVisible,
  } = props
  const baseWrapperClass = 'user-menu__menu-wrapper'
  const wrapperClass = menuVisible
    ? `${baseWrapperClass} user-menu__menu-wrapper--visible`
    : baseWrapperClass
  if (auth.get('jwt')) {
    return (
      <div className="user-menu">
        <ToolTipArrow
          direction={DIRECTION_UP}
          activeArrow="user-menu-arrow"
        />
        <Link
          className={getClassName(hideUserMenu)}
          to={URL_JAVASCRIPT_VOID}
          role="button"
          aria-haspopup="true"
          aria-controls="user-menu-wrapper"
          onClick={
            hideUserMenu
              ? null
              : _partial(
                showUserMenu,
                _partial.placeholder,
                toggleUserMenuVisible,
                setNavigationOverlayVisible,
                setNotificationsMenuVisible,
              )
          }
        >
          {renderUserAvatar(props)}
        </Link>
        {menuVisible ? (
          <div id="user-menu-wrapper" className={wrapperClass} onClick={onClickMenuWrapper}>
            <span className="user-menu__arrow" />
            {renderMenu(props)}
          </div>
        ) : null}
      </div>
    )
  }
  return null
}

UserMenu.props = {
  menu: ImmutablePropTypes.map.isRequired,
  menuVisible: PropTypes.bool.isRequired,
  toggleUserMenuVisible: PropTypes.func.isRequired,
  setNavigationOverlayVisible: PropTypes.func.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  paytrack: ImmutablePropTypes.map.isRequired,
  getUserData: PropTypes.func.isRequired,
  hideUserMenu: PropTypes.bool.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setEventUserInteraction: PropTypes.func.isRequired,
  setEventUserMenuClicked: PropTypes.func.isRequired,
}

export default connectRedux(
  state => ({
    auth: state.auth,
    user: state.user,
    paytrack: state.paytrack,
    userAccount: state.userAccount,
    userProfiles: state.userProfiles,
    menuVisible: state.header.get('userMenuVisible'),
    menu: state.menu.getIn(['data', 'user'], EMPTY_MENU),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setEventUserMenuClicked: actions.eventTracking.setEventUserMenuClicked,
      toggleUserMenuVisible: actions.header.toggleUserMenuVisible,
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      setNotificationsMenuVisible: actions.header.setNotificationsMenuVisible,
      setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
      setNavigationOverlayVisible: actions.header.setNavigationOverlayVisible,
    }
  },
)(UserMenu)
