import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, fromJS } from 'immutable'
import _startsWith from 'lodash/startsWith'
import { connect as connectRedux } from 'react-redux'
import FooterEmailCapture from 'components/FooterEmailCapture'
import Menu from 'components/Menu'
import SocialButton, { SOCIAL_BUTTON_TYPES, SOCIAL_BUTTON_SIZES } from 'components/SocialButton'
import AppLinks from 'components/AppLinks'
import LanguageQuickSelect from 'components/LanguageQuickSelect'
import { CONTEXT_TYPE_FOOTER } from 'services/upstream-context'
import { isLiveEvents, isLiveAccessPage } from 'services/url'
import { URL_REFER_JOIN } from 'services/url/constants'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { TARGET_BLANK } from 'components/Link/constants'


const EMPTY_LIST = List()

function appendGaiaStoreItem (menuItem) {
  // append Gaia Store Link from Testarossa campaign: "ME-2875"
  // when campaign is finished, remove this function
  const listOfChildren = menuItem.get('children')
  if (menuItem.get('label') === 'More from Gaia') {
    return listOfChildren.set(listOfChildren.size, fromJS(
      {
        url: 'https://shop.gaia.com',
        label: 'Gaia Store',
        target: TARGET_BLANK,
        trackingId: '181',
      },
    ))
  }
  return menuItem.get('children', EMPTY_LIST)
}

function getFooterMenuId (i) {
  return (`footer__menu-label-${i}`)
}

function renderMenu (props) {
  const { menu, location } = props
  return menu.map((menuItem, index) => (
    <div className={getMenuClassName(index)} key={menuItem.get('label')}>
      <div id={getFooterMenuId(index)} className="footer__menu-title">{menuItem.get('label')}</div>
      <TestarossaSwitch>
        <TestarossaCase campaign="ME-2875" unwrap>
          {(campaign, variation, subject) => (
            <Menu
              location={location}
              className="menu-footer"
              itemClassName="menu-item--footer"
              itemLinkClassName="menu-item__link--footer"
              menu={appendGaiaStoreItem(menuItem)}
              contextType={CONTEXT_TYPE_FOOTER}
              campaign={campaign}
              variation={variation}
              subject={subject}
              ariaId={getFooterMenuId(index)}
            />
          )}
        </TestarossaCase>
        <TestarossaDefault unwrap>
          {() => (
            <Menu
              location={location}
              className="menu-footer"
              itemClassName="menu-item--footer"
              itemLinkClassName="menu-item__link--footer"
              menu={menuItem.get('children', EMPTY_LIST)}
              contextType={CONTEXT_TYPE_FOOTER}
              ariaId={getFooterMenuId(index)}
            />
          )}
        </TestarossaDefault>
      </TestarossaSwitch>
    </div>
  ))
}

function getMenuClassName (index) {
  switch (index) {
    case 1: return 'footer__menu-second'
    case 2: return 'footer__menu-third'
    default: return 'footer__menu-first'
  }
}

function renderLanguageSelect () {
  return (
    <div className="footer__language-select">
      <LanguageQuickSelect />
    </div>
  )
}

function getClassName (props) {
  const { hasOverlay, location } = props
  const { pathname } = location
  const noMarginPage =
    _startsWith(pathname, '/manage-profiles') ||
    _startsWith(pathname, '/portal') ||
    _startsWith(pathname, '/portals') ||
    _startsWith(pathname, '/account') ||
    isLiveEvents(pathname) ||
    isLiveAccessPage(pathname) ||
    _startsWith(pathname, '/share')
  const className = ['footer']
  if (hasOverlay) className.push('footer--mobile-hidden')
  if (noMarginPage) className.push('footer__no-top-margin')
  return className.join(' ')
}

function shouldEmailCapture (location) {
  const { pathname } = location
  return (
    !_startsWith(pathname, '/share') &&
    pathname !== URL_REFER_JOIN &&
    !_startsWith(pathname, '/portal')
  )
}

function Footer (props) {
  const {
    staticTextFooter,
    location,
    detail,
  } = props
  const { pathname } = location

  return (
    <footer className={getClassName(props)}>
      <div className="footer__content">
        <div className="footer__upper">
          {renderMenu(props)}
          {renderLanguageSelect(props)}
        </div>
        {shouldEmailCapture(location) ? <FooterEmailCapture /> : null}
        <div className="footer__lower">
          <div className="footer__social">
            <div className="footer__social__title">
              {staticTextFooter.getIn(['data', 'connectWithUs'])}
            </div>
            <ul className="footer__social__btns">
              <li>
                <SocialButton
                  size={SOCIAL_BUTTON_SIZES.MEDIUM}
                  type={SOCIAL_BUTTON_TYPES.FACEBOOK}
                  contentType={detail.getIn(['data', 'type', 'content'], null)}
                  pathName={pathname}
                  eventTrackingType={props.eventTrackingType}
                />
              </li>
              <li>
                <SocialButton
                  size={SOCIAL_BUTTON_SIZES.MEDIUM}
                  type={SOCIAL_BUTTON_TYPES.TWITTER}
                  contentType={detail.getIn(['data', 'type', 'content'], null)}
                  pathName={pathname}
                  eventTrackingType={props.eventTrackingType}
                />
              </li>
              <li>
                <SocialButton
                  size={SOCIAL_BUTTON_SIZES.MEDIUM}
                  type={SOCIAL_BUTTON_TYPES.INSTAGRAM}
                  contentType={detail.getIn(['data', 'type', 'content'], null)}
                  pathName={pathname}
                  eventTrackingType={props.eventTrackingType}
                />
              </li>
              <li>
                <SocialButton
                  size={SOCIAL_BUTTON_SIZES.MEDIUM}
                  type={SOCIAL_BUTTON_TYPES.YOUTUBE}
                  contentType={detail.getIn(['data', 'type', 'content'], null)}
                  pathName={pathname}
                  eventTrackingType={props.eventTrackingType}
                />
              </li>
              <li>
                <SocialButton
                  size={SOCIAL_BUTTON_SIZES.MEDIUM}
                  type={SOCIAL_BUTTON_TYPES.PINTEREST}
                  contentType={detail.getIn(['data', 'type', 'content'], null)}
                  pathName={pathname}
                  eventTrackingType={props.eventTrackingType}
                />
              </li>
            </ul>
          </div>
          <AppLinks label={staticTextFooter.getIn(['data', 'gaiaApps'])} />
        </div>
      </div>
    </footer>
  )
}

Footer.propTypes = {
  location: PropTypes.object.isRequired,
  menu: ImmutablePropTypes.list.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  staticTextFooter: ImmutablePropTypes.map.isRequired,
}

export default connectRedux(state => ({
  auth: state.auth,
  detail: state.detail,
  isLoggedIn: !!state.auth.get('jwt'),
  menu: state.menu.getIn(['data', 'footer'], EMPTY_LIST),
  hasOverlay: state.header.get('navigationOverlayVisible'),
  staticTextFooter: state.staticText.getIn(['data', 'footer']),
}))(Footer)
