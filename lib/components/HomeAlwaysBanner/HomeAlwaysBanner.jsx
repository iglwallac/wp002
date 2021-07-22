import React from 'react'
import immutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'

function HomeAlwaysBanner (props) {
  const { staticText } = props

  return (
    <div className="home-always-banner">
      <div className="home-always-banner__content">
        <p className="home-always-banner__title-top">
          {staticText.getIn(['data', 'title'])}
        </p>
        <p className="home-always-banner__title-middle">
          {staticText.getIn(['data', 'freeVideoContentDuration'])}
        </p>
        <p className="home-always-banner__subtitle">
          {staticText.getIn(['data', 'freeVideoContentLabelStart'])}{' '}
          <span className="home-always-banner__mobile-break" />
          {staticText.getIn(['data', 'freeVideoContentLabelEnd'])}
        </p>
      </div>
    </div>
  )
}

HomeAlwaysBanner.propTypes = {
  staticText: immutablePropTypes.map.isRequired,
}

export default connectStaticText({ storeKey: 'homeAlwaysBanner' })(
  HomeAlwaysBanner,
)
