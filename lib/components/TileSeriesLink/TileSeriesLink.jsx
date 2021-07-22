import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link from 'components/Link'

function TileSeriesLink (props) {
  const { url, staticText } = props
  return (
    <div className="tile-series-link">
      <Link className="tile-series-link__link" to={url}>
        <div className="tile-series-link__hero">
          <div className="tile-series-link__hero-text">
            {staticText.get('viewFullSeries')}
          </div>
        </div>
      </Link>
    </div>
  )
}

TileSeriesLink.propTypes = {
  url: PropTypes.string.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'tileSeriesLink', 'data']),
}))(TileSeriesLink)
