import PropTypes from 'prop-types'
import React from 'react'
import GaiaLogo, { TYPE_BLUE_DARK } from 'components/GaiaLogo'
import immutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import _isArray from 'lodash/isArray'

function getClassName (name, props) {
  const { className } = props
  const classes = [name].concat(_isArray(className) ? className : [className])

  return classes.join(' ')
}

function HomeDeviceBanner (props) {
  const { staticText } = props

  return (
    <div className={getClassName('home-device-banner', props)}>
      <div className="home-device-banner__top-container">
        <GaiaLogo
          type={TYPE_BLUE_DARK}
          className={['home-device-banner__gaia-logo']}
        />
        <p className="home-device-banner__subtitle">
          {staticText.getIn(['data', 'subtitle'])}
        </p>
      </div>
      <div className="home-device-banner__bottom-container">
        <p className="home-device-banner__device-title">
          {staticText.getIn(['data', 'deviceListTitle'])}
        </p>
        <p className="home-device-banner__device-desc">
          {staticText.getIn(['data', 'deviceListDescription'])}
        </p>
        <ul className="home-device-banner__device-list">
          <li className="home-device-banner__device-item home-device-banner__device-item--apple-tv">
            <span>Apple TV</span>
          </li>
          <li className="home-device-banner__device-item home-device-banner__device-item--roku">
            <span>Roku</span>
          </li>
          <li className="home-device-banner__device-item home-device-banner__device-item--ios">
            <span>iOS</span>
          </li>
          <li className="home-device-banner__device-item home-device-banner__device-item--chromecast">
            <span>Chromecast</span>
          </li>
          <li className="home-device-banner__device-item home-device-banner__device-item--fire-tv">
            <span>Fire TV</span>
          </li>
          <li className="home-device-banner__device-item home-device-banner__device-item--android">
            <span>Android</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

HomeDeviceBanner.propTypes = {
  staticText: immutablePropTypes.map.isRequired,
  className: PropTypes.array,
}

export default connectStaticText({ storeKey: 'homeDeviceBanner' })(
  HomeDeviceBanner,
)
