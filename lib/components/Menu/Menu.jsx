import PropTypes from 'prop-types'
import React from 'react'
import { List, Map } from 'immutable'
import toNumber from 'lodash/toNumber'
import ImmutablePropTypes from 'react-immutable-proptypes'
import MenuItem from 'components/MenuItem'
import UserAvatar from 'components/UserAvatar'
import { MENU_ITEM_ICON_TYPE_ARROW } from 'components/MenuItem/types'
import _parseInt from 'lodash/parseInt'
import { connect as connectRedux } from 'react-redux'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { getBoundActions } from 'actions'
import { createGaiaScreenModel } from 'services/resolver'
import { createUpstreamContext, SCREEN_TYPE_HEADER } from 'services/upstream-context'
import Link from 'components/Link'
import _get from 'lodash/get'

const CLASS_NAME_AVATAR = ['menu-item__avatar']

function getClass (
  isOwner,
  hasPortal,
) {
  const cls = ['menu-item__link menu-item__link--user']
  if (isOwner) cls.push('menu-item__link--owner')
  if (isOwner && hasPortal) cls.push('menu-item__link--owner-with-portal')
  return cls.join(' ')
}
class Menu extends React.PureComponent {
  //
  onClick = (e) => {
    const { props } = this
    const { currentTarget } = e
    const index = currentTarget.getAttribute('data-index')
    const { menu, setDefaultGaEvent } = props
    const item = menu.get(toNumber(index))

    // --- Experiment ME-2875 ---
    // --- REMOVE WHEN COMPLETED ---
    if (item.get('trackingId') === '181') {
      setDefaultGaEvent(Map({
        event: 'customEvent',
        eventCategory: 'Experiment - Shop Link',
        eventAction: 'clicked',
        eventLabel: _get(props.variation, 'description'),
      }))
    }
    // --- END for ME-2875 ---

    if (item) {
      if (item.get('onClick')) {
        const clickFunc = item.get('onClick')
        clickFunc(e, item, props)
      }
      this.track()
    }
  }

  getProfileName = (profile) => {
    const name = profile.get('first_name')
    const username = profile.get('username')
    return (!name || /^(gaia|friend of)$/i.test(name)) ? username : name
  }

  track () {
    const { props } = this
    const {
      clearUpstreamContext,
      // upstreamContext,
      contextType,
      language,
      resolver,
      auth,
    } = props

    if (contextType) {
      const gaiaScreen = createGaiaScreenModel({ resolver })
      const screenType = gaiaScreen.get('screenType', SCREEN_TYPE_HEADER)
      const screenParam = gaiaScreen.get('screenParam')
      const upstreamContext = createUpstreamContext({
        contextType,
        screenParam,
        screenType,
      })

      if (
        upstreamContext &&
        upstreamContext.get('screenType') &&
        upstreamContext.get('screenParam') &&
        upstreamContext.get('contextType') &&
        location &&
        language &&
        auth
      ) {
        clearUpstreamContext()
      }
    }
  }

  changeUser (profile) {
    const { props } = this
    const {
      toggleUserMenuVisible,
      resetOnboarding,
      changeAuthProfile,
      auth,
    } = props
    resetOnboarding()
    toggleUserMenuVisible()
    changeAuthProfile({
      userAccountId: profile.get('user_account_id'),
      uid: profile.get('uid'),
      auth,
    })
  }

  renderProfile (profile) {
    const { props } = this
    const { portalUrl, auth, staticTextViewPortal } = props

    const uid = auth.get('uid')
    const isOwner = _parseInt(profile.get('uid')) === uid
    const hasPortal = isOwner && portalUrl
    const url = hasPortal ? `/portal/${portalUrl}` : ''
    const onClick = hasPortal ? null : () => this.changeUser(profile)
    const avatar = profile.getIn(['profilePicture', 'hdtv_190x266'], '')
    const className = getClass(isOwner, portalUrl)
    const children = [
      <UserAvatar
        className={CLASS_NAME_AVATAR}
        path={avatar}
        key="avatar"
      />,
      <span
        className="menu-item__profile-name"
        key="username"
      >{this.getProfileName(profile)}
      </span>,
    ]

    if (isOwner && !portalUrl) {
      return (
        <span className={className}>
          {children}
        </span>
      )
    }

    return (
      <Link
        className={className}
        onClick={onClick}
        to={url}
      >
        {children}
        {hasPortal ? (
          <span className="menu-item__view-portal">
            {staticTextViewPortal}
          </span>
        ) : null}
        {hasPortal ? (
          <span className="menu-item__view-portal-icon">
            <IconV2 type={ICON_TYPES.CHEVRON_RIGHT} />
          </span>
        ) : null}
      </Link>
    )
  }

  renderProfiles () {
    const { props } = this
    const { profiles, auth } = props

    if (profiles) {
      const uid = auth.get('uid')
      const userProfiles = profiles.get('data', List())
      const currentUsersProfile = userProfiles.find(profile => (
        _parseInt(profile.get('uid')) === uid
      ))
      const otherProfiles = userProfiles.filter(profile => (
        _parseInt(profile.get('uid')) !== uid
      ))
      const orderedProfiles = otherProfiles.insert(0, currentUsersProfile)
      return orderedProfiles.map((profile) => {
        return (
          <li
            className="menu-item menu__menu-item menu-item--user menu-item--profile"
            key={`menu-item-profile-${profile.get('uid')}`}
          >{this.renderProfile(profile)}
          </li>
        )
      })
    }
    return null
  }

  renderMenuItems () {
    const { props } = this
    const {
      itemLinkClassName = [],
      itemClassName = [],
      itemIconType,
      itemChildren,
      menu,
    } = props

    return menu.map((item, index, list) => {
      //
      const linkClassName = [].concat(itemLinkClassName)
      const child = itemChildren ? itemChildren.get(index) : null
      const iconType = child && itemIconType ? itemIconType : null
      const iconArrowClassName = 'menu-item__icon-arrow'
      const iconClasses = []

      if (iconType === MENU_ITEM_ICON_TYPE_ARROW) {
        iconClasses.push(iconArrowClassName)
      }

      if (item.get('active')) {
        linkClassName.push('menu-item__link--active')
      }

      if (item.get('selected')) {
        linkClassName.push('menu-item__link--selected')
      }

      if (item.get('selected') && iconType === MENU_ITEM_ICON_TYPE_ARROW) {
        iconClasses.push(`${iconArrowClassName}--expanded`)
      }

      if (index === 0) {
        linkClassName.push('menu-item__link--first')
      }
      if (item.get('user-menu-border')) {
        linkClassName.push('menu-item__link--border')
      }
      if (index === list.size - 1) {
        linkClassName.push('menu-item__link--last')
      }
      // TODO: Special UserMenu case should move to user menu
      if (index === list.size - 1 && item.get('user-menu-item')) {
        linkClassName.push('menu-item__link--last--user')
      }
      let label = item.get('label')

      // --- Experiment ME-2875 ---
      // --- REMOVE WHEN COMPLETED ---
      if (item.get('trackingId') === '181') {
        const campaignId = _get(props.campaign, 'friendlyId')
        if (campaignId !== 'ME-2875') {
          return null
        }
        label = _get(props.variation, 'description')
      }
      // --- END for ME-2875 ---
      /* eslint-disable react/no-array-index-key */
      return (
        <MenuItem
          key={index}
          index={index}
          iconType={iconType}
          url={item.get('url')}
          onClick={this.onClick}
          label={label}
          target={item.get('target')}
          linkClass={linkClassName.join(' ')}
          iconClassName={iconClasses.join(' ')}
          scrollToTop={item.get('scrollToTop')}
          itemClass={['menu__menu-item'].concat(itemClassName).join(' ')}
        >
          {itemChildren.get(index)}
        </MenuItem>
      )
      /* eslint-enable react/no-array-index-key */
    })
  }

  render () {
    const { props } = this
    const { className, ariaId } = props
    return (
      <ul aria-labelledby={ariaId} className={['menu'].concat(className || []).join(' ')}>
        {this.renderProfiles()}
        {this.renderMenuItems()}
      </ul>
    )
  }
}

Menu.propTypes = {
  clearUpstreamContext: PropTypes.func.isRequired,
  menu: ImmutablePropTypes.list.isRequired,
  itemChildren: ImmutablePropTypes.list,
  itemLinkClassName: PropTypes.string,
  profiles: ImmutablePropTypes.map,
  itemClassName: PropTypes.string,
  itemIconType: PropTypes.string,
  className: PropTypes.string,
  ariaId: PropTypes.string,
}

Menu.defaultProps = {
  itemChildren: List(),
}

export default connectRedux(
  state => ({
    staticTextViewPortal: state.staticText.getIn(['data', 'portalV2', 'data', 'viewPortal'], ''),
    language: state.user.getIn(['data', 'language']),
    resolver: state.resolver,
    auth: state.auth,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      resetOnboarding: actions.onboarding.resetOnboarding,
      clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
      changeAuthProfile: actions.auth.changeAuthProfile,
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
    }
  },
)(Menu)
