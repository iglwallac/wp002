import PropTypes from 'prop-types'
import React from 'react'
import Link, { TARGET_BLANK } from 'components/Link'
import {
  URL_ROKU_APP_STORE,
  URL_ANDROID_APP_STORE,
  URL_APPLE_APP_STORE,
  URL_AMAZON_APP_STORE_FIRE_TV,
} from 'services/url/constants'

const assistiveTextForAda = {
  roku: 'roku',
  android: 'android',
  iphone: 'iphone',
  ipad: 'ipad',
  tvos: 'appleTv',
  amazonFireTv: 'amazon fire tv',
}

function AppLinks (props) {
  const { label } = props
  const { roku, android, iphone, ipad, tvos, amazonFireTv } = assistiveTextForAda
  return (
    <div className="app-links">
      <p className="app-links__label">{label}</p>
      <ul className="app-links__list">
        <li className="app-links__list-item">
          <Link
            target={TARGET_BLANK}
            to={URL_ROKU_APP_STORE}
            className="app-links__link--roku"
          >
            <span className="assistive">{roku}</span>
          </Link>
        </li>
        <li className="app-links__list-item">
          <Link
            target={TARGET_BLANK}
            to={URL_ANDROID_APP_STORE}
            className="app-links__link--android"
          >
            <span className="assistive">{android}</span>
          </Link>
        </li>
        <li className="app-links__list-item">
          <Link
            target={TARGET_BLANK}
            to={URL_APPLE_APP_STORE}
            className="app-links__link--iphone"
          >
            <span className="assistive">{iphone}</span>
          </Link>
        </li>
        <li className="app-links__list-item">
          <Link
            target={TARGET_BLANK}
            to={URL_APPLE_APP_STORE}
            className="app-links__link--ipad"
          >
            <span className="assistive">{ipad}</span>
          </Link>
        </li>
        <li className="app-links__list-item">
          <Link
            target={TARGET_BLANK}
            to={URL_APPLE_APP_STORE}
            className="app-links__link--tvos"
          >
            <span className="assistive">{tvos}</span>
          </Link>
        </li>
        <li className="app-links__list-item">
          <Link
            target={TARGET_BLANK}
            to={URL_AMAZON_APP_STORE_FIRE_TV}
            className="app-links__link--firetv"
          >
            <span className="assistive">{amazonFireTv}</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}

AppLinks.propTypes = {
  label: PropTypes.string,
}

export default React.memo(AppLinks)
