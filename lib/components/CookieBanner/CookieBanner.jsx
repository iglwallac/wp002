import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import _get from 'lodash/get'
import Button from 'components/Button'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import Link from 'components/Link'
import { URL_TERMS_PRIVACY } from 'services/url/constants'
import {
  isFreeTrialPage,
  isFullPlayer,
  isEmbedded,
  isLogout,
  isPlans,
  isGift,
  isCart,
  isGo,
} from 'services/url'

function CookieBanner (props) {
  const { staticText, cookie, setCookieBannerAccepted, location } = props
  const canSetCookie = cookie.get('canSetCookie')

  const onClickAccept = () => {
    return setCookieBannerAccepted(true)
  }

  const shouldShow = () => {
    const pathname = _get(location, 'pathname')
    const query = _get(location, 'query')

    return (
      !isCart(pathname) &&
      !isPlans(pathname) &&
      !isGo(pathname) &&
      !isLogout(pathname) &&
      !isGift(pathname) &&
      !isFreeTrialPage(pathname) &&
      !isFullPlayer(query) &&
      !isEmbedded(query)
    )
  }

  // only show the banner if the store is specifically set to false
  if (canSetCookie === false && shouldShow()) {
    return (
      <div className="cookie-banner">
        <div className="cookie-banner__content">
          <div className="cookie-banner__left">
            <p className="cookie-banner__description">
              {`${staticText.getIn(['data', 'weUseCookies'])} ${staticText.getIn(['data', 'seeOur'])} `}
              <Link to={URL_TERMS_PRIVACY} className="cookie-banner__privacy-link">
                {staticText.getIn(['data', 'privacyPolicy'])}
              </Link>
              {` ${staticText.getIn(['data', 'here'])}.`}
            </p>
          </div>
          <div className="cookie-banner__right">
            <Button
              text={staticText.getIn(['data', 'accept'])}
              url={URL_JAVASCRIPT_VOID}
              buttonClass={['button--primary', 'button--inverted', 'cookie-banner__accept']}
              onClick={onClickAccept}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

CookieBanner.propTypes = {
  location: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  cookie: ImmutablePropTypes.map.isRequired,
  setCookieBannerAccepted: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      cookie: state.cookie,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setCookieBannerAccepted: actions.cookie.setCookieBannerAccepted,
      }
    },
  ),
  connectStaticText({ storeKey: 'cookieBanner' }),
)(CookieBanner)
