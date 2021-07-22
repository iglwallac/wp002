/* eslint-disable max-len */
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { List } from 'immutable'
import _partial from 'lodash/partial'
import _get from 'lodash/get'
import NavigationPrimary from 'components/NavigationPrimary'
import NotificationsMenu from 'components/NotificationsMenu'
import Hamburger from 'components/Hamburger'
import Button from 'components/Button'
import { Button as ButtonV2, TYPES, SIZES } from 'components/Button.v2'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_BUTTON } from 'components/ButtonSignUp'
import MenuUser from 'components/MenuUser'
import LanguageSelectGlobe from 'components/LanguageSelectGlobe'
import AlertBarLoader from 'components/AlertBarLoader'
import InviteFriendPopup from 'components/InviteFriend/InviteFriendPopup'
import GaiaLogo, { TYPE_TEAL } from 'components/GaiaLogo'
import { TextLink, TARGET_BLANK, URL_JAVASCRIPT_VOID } from 'components/Link'
import WithAuth from 'components/WithAuth'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import { TYPE_LOGIN, TYPE_DAYTONA_WA_10 } from 'services/dialog'
import { deactivateSubject } from 'services/testarossa'
import { get as getConfig } from 'config'
import { URL_CART_BILLING, URL_CART_BILLING_PAYMENT, URL_CART_CONFIRMATION } from 'services/url/constants'
import { DaytonaCampaign } from 'components/Daytona'
import Icon from 'components/Icon'
import { ICON_TYPES } from 'components/Icon.v2'
import ToolTip from 'components/ToolTip'
import { FEATURE_NAME_SETTINGS_TOOLTIP } from 'services/feature-tracking/constants'
import { isMemberCustomizationToolTipEligible } from 'services/feature-tracking'
import { NAVIGATION_GEAR_CLICK_EVENT } from 'services/event-tracking'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import StaticTextToHtml from 'components/StaticTextToHtml'
import { H4, HEADING_TYPES } from 'components/Heading'

const config = getConfig()
const EMPTY_LIST = List()

function renderLoginButton (
  auth,
  onClickLoginButton,
  setOverlayDialogVisible,
  dialogName,
  text,
  userLanguage,
) {
  if (auth.get('jwt')) {
    return null
  }

  const baseClassName = 'header__action-button'
  const buttonClassName = [
    'button--x-small',
    'button--secondary',
    'button--test',
    baseClassName,
    `${baseClassName}--left`,
  ].concat(userLanguage ? `${baseClassName}--${userLanguage}` : [])
  return (
    <Button
      text={text}
      buttonClass={buttonClassName}
      onClick={_partial(
        onClickLoginButton,
        _partial.placeholder,
        setOverlayDialogVisible,
        dialogName,
      )}
    />
  )
}

function renderButtonSignUp (auth, text, userLanguage) {
  if (auth.get('jwt')) {
    return null
  }
  const baseClassName = 'header__action-button'
  const buttonClassName = [
    'button--last',
    'button--x-small',
    'button--primary',
    'header__button--signup',
    baseClassName,
  ].concat(userLanguage ? `${baseClassName}--${userLanguage}` : [])
  return (
    <ButtonSignUp
      text={text}
      buttonClass={buttonClassName}
      type={BUTTON_SIGN_UP_TYPE_BUTTON}
      scrollToTop
    />
  )
}

function handleInviteFriendPopup (props) {
  const { userReferrals, showInviteFriendPopup, setNavigationOverlayVisible } = props
  const showingInviteFriendPopup = userReferrals.getIn(['showInviteFriendPopup'])

  showInviteFriendPopup(!showingInviteFriendPopup)
  setNavigationOverlayVisible(false)
}

function renderInviteLink (props) {
  // The functionality around the link with className="header__popup-link" is fragile,
  // if the className changes, edit the handleClick function inside InviteFriendPopup.jsx
  const { auth, staticTextHeader } = props

  if (auth.get('jwt')) {
    return (
      <div className="header__popup-link-wrapper">
        <TextLink
          text={staticTextHeader.getIn(['data', 'invite'])}
          className="header__popup-link"
          to={URL_JAVASCRIPT_VOID}
          onClick={() => handleInviteFriendPopup(props)}
        />
      </div>
    )
  }
  return null
}

function renderCareerLink (props) {
  const { staticTextHeader } = props
  return (
    <div className="header__career-link-wrapper">
      <TextLink
        text={staticTextHeader.getIn(['data', 'careers'])}
        className="header__career-link"
        to={'/careers'}
        target={TARGET_BLANK}
        directLink
      />
    </div>
  )
}

function renderLanguageSelectGlobe (props) {
  const { location } = props

  if (
    location.pathname === URL_CART_BILLING ||
    location.pathname === URL_CART_BILLING_PAYMENT ||
    location.pathname === URL_CART_CONFIRMATION
  ) {
    return null
  }

  return (
    <LanguageSelectGlobe />
  )
}

function renderNavigation () {
  return (
    <NavigationPrimary />
  )
}

class Header extends PureComponent {
  //
  constructor (props) {
    super(props)
    this.state = {
      tooltipHidden: false,
    }

    const showLogin = _get(props, ['location', 'query', 'login'])
    if (showLogin) {
      props.setOverlayDialogVisible(TYPE_LOGIN)
    }
    this.toolTipEligible =
      isMemberCustomizationToolTipEligible(props.featureTracking, props.userStore,
        FEATURE_NAME_SETTINGS_TOOLTIP)
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { path, resetHeaderNav } = props
    const { path: prevPath } = prevProps
    if (path !== prevPath) {
      resetHeaderNav()
    }
  }

  onClickHamburger = (e) => {
    e.stopPropagation()
    const { props } = this
    const { toggleNavigationOverlayVisible, showInviteFriendPopup, userReferrals } = props
    const shouldCloseInviteFriendPopup = userReferrals.getIn(['showInviteFriendPopup'])
    toggleNavigationOverlayVisible()
    if (shouldCloseInviteFriendPopup) {
      showInviteFriendPopup(false)
    }
  }

  onClickLoginButton = (e, setOverlayDialogVisible, dialogName) => {
    e.stopPropagation()
    e.preventDefault()
    setOverlayDialogVisible(dialogName)
  }

  closeModal = () => {
    deactivateSubject({ campaign: 'WA-10' })
  }

  renderDebugUsername = () => {
    const { props } = this
    const { auth } = props
    const showDebugUsername = _get(config, ['debug', 'showUsername']) > 0
    if (showDebugUsername) {
      const username = auth.get('username', '<anonymous>')
      return <div className="header__debug-username">{username}</div>
    }
    return null
  }

  render () {
    const { props } = this
    const {
      setOverlayDialogVisible,
      staticTextHeader,
      toolTipActivated,
      overlayVisible,
      userLanguage,
      dismissModal,
      hideUserMenu,
      hideNavBar,
      hideLogin,
      location,
      history,
      auth,
    } = props

    const language = userLanguage.get(0, _get(config, ['appLang']))
    const isLoggedIn = auth.get('jwt')
    const showTooltip = toolTipActivated && this.toolTipEligible && !this.state.tooltipHidden

    return (
      <header className="header" role="banner">
        <AlertBarLoader history={history} location={location} />
        <div className="header__top">
          {hideNavBar ? null : (
            <Hamburger
              navigationOverlayVisible={overlayVisible}
              className="header__hamburger header__hamburger--nav"
              onClick={this.onClickHamburger}
            />
          )}
          <div className="header__branding">
            <GaiaLogo
              type={TYPE_TEAL}
              className={['header__logo']}
              isHref
            />
            {this.renderDebugUsername()}
          </div>
          <div className="header__actions">
            {hideNavBar
              ? null
              : renderCareerLink(props)
            }
            {hideNavBar
              ? null
              : renderInviteLink(props)
            }
            {/* If a user is checking out, the language select globe does not show */}
            {renderLanguageSelectGlobe(props)}
            {/* If a user is logged out, show login and signup buttons */}
            {hideLogin
              ? null
              : renderLoginButton(
                auth,
                this.onClickLoginButton,
                setOverlayDialogVisible,
                TYPE_LOGIN,
                staticTextHeader.getIn(['data', 'login']),
                language,
                location,
              )}
            {hideNavBar
              ? null
              : renderButtonSignUp(
                auth,
                staticTextHeader.getIn(['data', 'signUp']),
                language,
              )}
            {hideNavBar ? null : (
              <WithAuth>
                <NotificationsMenu />
              </WithAuth>
            )}
            {hideNavBar ? null : (
              <WithAuth>
                <TestarossaSwitch>
                  <TestarossaCase campaign="ME-3043" variation={1} unwrap>
                    {() => (
                      <div className="settings-link">
                        <TextLink
                          eventData={NAVIGATION_GEAR_CLICK_EVENT}
                          to="/account/settings"
                        >
                          <Icon iconClass={['icon--settings']} />
                        </TextLink>
                        {showTooltip &&
                        <ToolTip
                          visible
                          className={[
                            'tool-tip__outer--settings-link',
                            'tool-tip-settings-link',
                          ]}
                          arrowClassName={[
                            'tool-tip__arrow--right-top',
                          ]}
                          featureName={FEATURE_NAME_SETTINGS_TOOLTIP}
                        >
                          <ButtonV2
                            icon={ICON_TYPES.CLOSE}
                            onClick={() => this.setState({ tooltipHidden: true })}
                            size={SIZES.DEFAULT}
                            type={TYPES.ICON}
                          />
                          <H4 as={HEADING_TYPES.H6}>{staticTextHeader.getIn(['data', 'settingsAndPreferences'])}</H4>
                          <StaticTextToHtml staticText={staticTextHeader} staticTextKey={['data', 'tooltipText']} />
                        </ToolTip>
                        }
                      </div>
                    )}
                  </TestarossaCase>
                  <TestarossaDefault unwrap>
                    {() => (
                      null
                    )}
                  </TestarossaDefault>
                </TestarossaSwitch>
              </WithAuth>
            )}
            {/* If a user is logged in, the user menu shows */}
            {hideLogin ? null : (
              <MenuUser hideUserMenu={hideUserMenu} />
            )}
          </div>
        </div>
        {hideNavBar ? null : renderNavigation(props)}
        <DaytonaCampaign id="WA-10">
          {(c, v) => {
            props.renderModal(TYPE_DAYTONA_WA_10, {
              onDismiss: () => this.closeModal(),
              className: 'wa-10',
              close: dismissModal,
              title: _get(v, ['data', 'title', 'value'], ''),
              c,
              v,
            })
          }}
        </DaytonaCampaign>
        {isLoggedIn ? <InviteFriendPopup /> : null}
      </header>
    )
  }
}

Header.propTypes = {
  hideUserMenu: PropTypes.bool.isRequired,
  hideNavBar: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  hideLogin: PropTypes.bool.isRequired,
  history: PropTypes.object,
}

export default connectRedux(

  state => ({
    auth: state.auth,
    path: state.resolver.get('path'),
    overlayVisible: state.header.get('navigationOverlayVisible'),
    staticTextHeader: state.staticText.getIn(['data', 'header']),
    userLanguage: state.user.getIn(['data', 'language'], EMPTY_LIST),
    toolTipActivated: state.user.getIn(['data', 'mcttActivated'], false),
    userReferrals: state.userReferrals,
    userStore: state.user,
    featureTracking: state.featureTracking,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      renderModal: actions.dialog.renderModal,
      dismissModal: actions.dialog.dismissModal,
      resetHeaderNav: actions.header.resetHeaderNav,
      toggleNavigationOverlayVisible: actions.header.toggleNavigationOverlayVisible,
      setNavigationOverlayVisible: actions.header.setNavigationOverlayVisible,
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      showInviteFriendPopup: actions.userReferrals.showInviteFriendPopup,
    }
  },
)(Header)
