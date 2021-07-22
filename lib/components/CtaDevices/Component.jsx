import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { getPrimary } from 'services/languages'
import Link, { TARGET_BLANK } from 'components/Link'
import { connect } from 'react-redux'
import {
  URL_ROKU_APP_STORE,
  URL_ANDROID_APP_STORE,
  URL_APPLE_APP_STORE,
  URL_AMAZON_APP_STORE_FIRE_TV,
  URL_CHROMECAST,
} from 'services/url/constants'
import {
  DE,
} from 'services/languages/constants'
import { H2 } from 'components/Heading'

function CtaDevices ({ staticText, userLanguage }) {
  const ctaTitle = staticText.getIn(['data', 'watchTitle'])
  const currentLanguage = getPrimary(userLanguage)

  const renderFireTV = () => {
    if (currentLanguage !== DE) {
      return (
        <li>
          <Link
            target={TARGET_BLANK}
            to={URL_AMAZON_APP_STORE_FIRE_TV}
            className="cta-devices__link cta-devices__link--firetv"
          >
            <span className="assistive">Download the Gaia amazon fire app</span>
          </Link>
        </li>
      )
    }
    return null
  }

  return (
    <div className="cta-devices">
      <div className="cta-devices__center">
        <H2 inverted>
          {ctaTitle}
        </H2>
        <img
          className="cta-devices__img"
          // eslint-disable-next-line global-require
          src={require('./img/new-devices.png').default}
          alt={ctaTitle}
        />
        <ul>
          <li>
            <Link
              target={TARGET_BLANK}
              to={URL_APPLE_APP_STORE}
              className="cta-devices__link cta-devices__link--appleios"
            >
              <span className="assistive">Download the Gaia ios app</span>
            </Link>
          </li>
          <li>
            <Link
              target={TARGET_BLANK}
              to={URL_ANDROID_APP_STORE}
              className="cta-devices__link cta-devices__link--android"
            >
              <span className="assistive">Download the Gaia android app</span>
            </Link>
          </li>
          <li>
            <Link
              target={TARGET_BLANK}
              to={URL_CHROMECAST}
              className="cta-devices__link cta-devices__link--chromecast"
            >
              <span className="assistive">Download the Gaia chromecast app</span>
            </Link>
          </li>
          <li>
            <Link
              target={TARGET_BLANK}
              to={URL_ROKU_APP_STORE}
              className="cta-devices__link cta-devices__link--roku"
            >
              <span className="assistive">Download the Gaia roku app</span>
            </Link>
          </li>
          {renderFireTV()}
        </ul>
      </div>
    </div>
  )
}

CtaDevices.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  userLanguage: ImmutablePropTypes.list.isRequired,
}

export default connect(
  state => ({
    staticText: state.staticText.getIn(['data', 'ctaDevices']),
    userLanguage: state.user.getIn(['data', 'language']),
  }),

)(CtaDevices)
