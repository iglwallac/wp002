import PropTypes from 'prop-types'
import React from 'react'
import Link, { TARGET_BLANK } from 'components/Link'
import {
  URL_ROKU_APP_STORE,
  URL_ANDROID_APP_STORE,
  URL_APPLE_APP_STORE,
  URL_AMAZON_APP_STORE_FIRE_TV,
} from 'services/url/constants'

function AppLinksGrid (props) {
  const { label } = props
  return (
    <div className="app-links-grid">
      {
        label ? <p className="app-links-grid__label">{label}</p> : null
      }
      <ul className="app-links-grid__list">
        <li className="app-links-grid__list-item app-links-grid__list-item--first">
          <Link
            to={URL_ROKU_APP_STORE}
            target={TARGET_BLANK}
            className="app-links-grid__link app-links-grid__link--roku"
          />
          <Link
            to={URL_AMAZON_APP_STORE_FIRE_TV}
            target={TARGET_BLANK}
            className="app-links-grid__link app-links-grid__link--firetv"
          />
          <Link
            to={URL_APPLE_APP_STORE}
            target={TARGET_BLANK}
            className="app-links-grid__link app-links-grid__link--iphone app-links-grid__link--last"
          />
        </li>
        <li className="app-links-grid__list-item">
          <Link
            to={URL_ANDROID_APP_STORE}
            target={TARGET_BLANK}
            className="app-links-grid__link app-links-grid__link--android"
          />
          <Link
            to={URL_APPLE_APP_STORE}
            target={TARGET_BLANK}
            className="app-links-grid__link app-links-grid__link--ipad"
          />
          <Link
            to={URL_APPLE_APP_STORE}
            target={TARGET_BLANK}
            className="app-links-grid__link app-links-grid__link--tvos app-links-grid__link--last"
          />
        </li>
      </ul>
    </div>
  )
}

AppLinksGrid.propTypes = {
  label: PropTypes.string,
}

export default AppLinksGrid
