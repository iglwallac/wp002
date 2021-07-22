import React from 'react'
import { Map } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import HeroImage, {
  HERO_IMAGE_OVERLAY_LEFT_TO_RIGHY_OPACITY,
} from 'components/HeroImage'
import { TYPE_CONTENT_VIDEO, TYPE_CONTENT_EPISODE, TYPE_CONTENT_SERIES } from 'services/content-type'
import { formatSeriesHost } from 'theme/web-app'
import { H1 } from 'components/Heading'

function DetailJumbotron (props) {
  const { jumbotron = Map(), type, titleSeparator } = props

  const title = jumbotron.getIn(['data', 'title'], '')
  const seriesTitle = jumbotron.getIn(['data', 'seriesTitle'], '')
  const host = jumbotron.getIn(['data', 'host'], '')
  let heroImageUrl = jumbotron.getIn(['data', 'heroImage', 'large'], '')

  const getHeroImageUrl = () => {
    if (type === TYPE_CONTENT_SERIES) {
      heroImageUrl = jumbotron.getIn(['data', 'heroImageNoText', 'large'], '')
    }

    return heroImageUrl
  }

  const renderMetadata = () => {
    if (type !== TYPE_CONTENT_EPISODE) {
      return null
    }

    return (
      <div className="detail-jumbotron__sub-title">
        {formatSeriesHost(seriesTitle, host, titleSeparator)}
      </div>
    )
  }

  const renderTitle = () => {
    if (!type) {
      return null
    }

    return (
      <H1 inverted className={getClassName()}>
        {type === TYPE_CONTENT_SERIES ? formatSeriesHost(title, host, titleSeparator) : title }
      </H1>
    )
  }

  const getClassName = () => {
    const cls = ['detail-jumbotron__title']
    if (type === TYPE_CONTENT_EPISODE) {
      cls.push('detail-jumbotron__title--episode')
    }
    return cls.join(' ')
  }

  // don't render until we have data
  if (jumbotron.get('data', Map()).size === 0) {
    return null
  }

  return (
    <div className="detail-jumbotron">
      <div className="detail-jumbotron__header-wrapper">
        {renderMetadata()}
        {renderTitle()}
      </div>
      <HeroImage
        url={getHeroImageUrl()}
        overlayOpacity={HERO_IMAGE_OVERLAY_LEFT_TO_RIGHY_OPACITY}
        hasOverlay
      />
    </div>
  )
}

DetailJumbotron.propTypes = {
  jumbotron: ImmutablePropTypes.map.isRequired,
  type: PropTypes.oneOf([
    TYPE_CONTENT_VIDEO,
    TYPE_CONTENT_EPISODE,
    TYPE_CONTENT_SERIES,
  ]),
  titleSeparator: PropTypes.string,
}

export default compose(
  connectRedux(
    state => ({
      jumbotron: state.jumbotron.get('detail'),
    }),
  ),
)(DetailJumbotron)
