import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import { connect as connectStaticText } from 'components/StaticText/connect'
import GaiaLogo from 'components/GaiaLogo'
import { isNonAmazonAndroid, isAmazon } from 'environment'
import { URL_APPLE_APP_STORE, URL_ANDROID_APP_STORE, URL_AMAZON_APP_STORE_FIRE_TABLET } from 'services/url/constants'
import { H3, HEADING_TYPES } from 'components/Heading'

function buildDeepLink (id) {
  return `gaia://play-video/${id}`
}

function handleSkipDownloadClick (props) {
  return (e) => {
    e.stopPropagation()
    e.preventDefault()
    const { onSkipDownloadClick } = props

    if (onSkipDownloadClick) {
      onSkipDownloadClick()
    }
  }
}

function handleDeepLinkClick () {
  return (e) => {
    // kill browser link handling
    e.stopPropagation()
    e.preventDefault()

    const { target } = e
    const { href } = target

    // most cross-browser compatible method of redirect
    setTimeout(() => {
      global.location = href
    }, 500)
  }
}

function handleDownloadAppClick (props) {
  return (e) => {
    // kill browser link handling
    e.stopPropagation()
    e.preventDefault()

    const { target } = e
    const { href } = target
    const { onDownloadAppClick } = props

    if (onDownloadAppClick) {
      onDownloadAppClick()
    }

    // most cross-browser compatible method of redirect
    setTimeout(() => {
      global.location = href
    }, 500)
  }
}

class DownloadAppModal extends PureComponent {
  render () {
    const { auth, user, video, staticText } = this.props
    const poster = video.getIn(['data', 'poster'])
    const id = video.get('id', null)
    let appStoreUrl = URL_APPLE_APP_STORE
    if (isNonAmazonAndroid()) {
      appStoreUrl = URL_ANDROID_APP_STORE
    } else if (isAmazon()) {
      appStoreUrl = URL_AMAZON_APP_STORE_FIRE_TABLET
    }

    return (
      <div className="download-app">
        <div className="download-app__skip-cta-wrapper">
          <Link
            auth={auth}
            className="download-app__skip-link"
            onClick={handleSkipDownloadClick(this.props)}
            to={URL_JAVASCRIPT_VOID}
            user={user}
          >{staticText.getIn(['data', 'skipCtaText'])}</Link>
        </div>

        <div className="download-app__logo-wrapper">
          <GaiaLogo className={['download-app__logo']} type="white" />
        </div>

        <div className="download-app__content">
          <div className="download-app__play-wrapper">
            <H3 as={HEADING_TYPES.H4} className="download-app__play-header">{staticText.getIn(['data', 'headingText'])}</H3>
            <div className="download-app__poster-wrapper">
              <a
                onClick={handleDeepLinkClick(this.props)}
                className="button download-app__play-app-cta-btn"
                href={buildDeepLink(id)}
              >{staticText.getIn(['data', 'playInAppCtaText'])}</a>
              <img src={poster} className="download-app__poster" alt="" />
            </div>
          </div>

          <div className="download-app__download-wrapper">
            <H3 as={HEADING_TYPES.H4} className="download-app__download-header">
              {staticText.getIn(['data', 'downloadAppCtaText'])}
            </H3>
            <a
              onClick={handleDownloadAppClick(this.props)}
              className="button download-app__download-cta-btn"
              href={appStoreUrl}
            >{staticText.getIn(['data', 'appCtaText'])}</a>
          </div>
        </div>
      </div>
    )
  }
}

DownloadAppModal.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  onDownloadAppClick: PropTypes.func,
  onSkipDownloadClick: PropTypes.func,
  onWatchOnAppClick: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  video: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'downloadAppModal' }),
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
    }),
  ),
)(DownloadAppModal)
