import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import TextSeasonEpisode from 'components/TextSeasonEpisode'
import TextSeasonsEpisodes from 'components/TextSeasonsEpisodes'
import { formatDuration } from 'theme/web-app'
import Link from 'components/Link'
import compose from 'recompose/compose'
import PropTypes from 'prop-types'
import {
  isTypeFitnessEpisode,
  isTypeSeriesAll,
  isTypeVideo,
  isTypeYogaVideo,
  isTypeMeditationVideo,
  isTypeYogaEpisode,
  isTypeFitnessVideo,
  isTypeEpisode,
  isTypeMeditationEpisode,
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_SERIES,
} from 'services/content-type'
import { connect as connectStaticText } from 'components/StaticText/connect'

function DetailMetadata (props) {
  const {
    totalSeasons,
    season,
    episode,
    totalEpisodes,
    staticText,
    duration,
    yogaStyle,
    yogaLevel,
    year,
    guest,
    host,
    type,
    contentType,
    fitnessLevel,
    fitnessStyle,
    yogaLevelPath,
    yogaStylePath,
    yogaDurationPath,
    fitnessLevelPath,
    fitnessStylePath,
    fitnessDurationPath,
  } = props

  const metaYear = () => {
    if (!year) {
      return null
    }
    return (
      <span className="detail-metadata__label">{year}</span>
    )
  }

  const metaDuration = () => {
    if (!duration) {
      return null
    }
    return (
      fitnessDurationPath || yogaDurationPath ?
        <Link
          to={fitnessDurationPath || yogaDurationPath}
          className="detail-metadata__label"
        >
          {formatDuration(duration)}
        </Link> : <span className="detail-metadata__label">{formatDuration(duration)}</span>
    )
  }

  const metaGuest = () => {
    if (!guest) {
      return null
    }
    return (
      <span className="detail-metadata__label">{`${staticText.getIn(['data', 'featuring'])}: ${guest}`}</span>
    )
  }

  const metaHost = () => {
    if (!host) {
      return null
    }
    return (
      <span className="detail-metadata__label">{`${staticText.getIn(['data', 'host'])}: ${host}`}</span>
    )
  }

  const metaHostGuest = () => {
    if (guest || host) {
      return (
        <React.Fragment>
          {metaGuest()}
          {metaHost()}
        </React.Fragment>
      )
    }
    return null
  }

  const metaYogaMeditationStyle = () => {
    if (!yogaStyle) {
      return null
    }
    return (
      <Link
        to={yogaStylePath}
        className="detail-metadata__label"
      >
        {yogaStyle}
      </Link>
    )
  }

  const metaYogaMeditiationLevel = () => {
    if (!yogaLevel) {
      return null
    }
    return (
      <Link
        to={yogaLevelPath}
        className="detail-metadata__label"
      >
        {yogaLevel}
      </Link>
    )
  }

  const metaFitnessStyle = () => {
    if (!fitnessStyle) {
      return null
    }
    return (
      <Link
        to={fitnessStylePath}
        className="detail-metadata__label"
      >
        {fitnessStyle}
      </Link>
    )
  }

  const metaFitnessLevel = () => {
    if (!fitnessLevel) {
      return null
    }
    return (
      <Link
        to={fitnessLevelPath}
        className="detail-metadata__label"
      >
        {fitnessLevel}
      </Link>
    )
  }

  const metaSeasonEpisode = () => {
    if (!episode || !season) {
      return null
    }
    return (
      <span className="detail-metadata__label">
        <TextSeasonEpisode
          episode={episode}
          season={season}
        />
      </span>
    )
  }

  const renderSeriesMeta = () => {
    if (isTypeSeriesAll(contentType)) {
      return (
        <TextSeasonsEpisodes
          seasonCount={totalSeasons}
          episodeCount={totalEpisodes}
          className={['detail-metadata__label']}
          hasSpaceBetweenSeperator
        />
      )
    }
    return null
  }

  const renderVideoMeta = () => {
    if (isTypeVideo(contentType)) {
      return (
        <React.Fragment>
          <div className="detail-metadata__top">
            {metaYear()}
            {metaDuration()}
          </div>
          { metaHostGuest() ?
            <div className="detail-metadata__bottom">
              {metaHostGuest()}
            </div>
            : null
          }
        </React.Fragment>
      )
    } else if (isTypeYogaVideo(contentType)) {
      return (
        <div className="detail-metadata__top">
          {metaYogaMeditationStyle()}
          {metaYogaMeditiationLevel()}
          {metaDuration()}
        </div>
      )
    } else if (isTypeFitnessVideo(contentType)) {
      return (
        <div className="detail-metadata__top">
          {metaFitnessStyle()}
          {metaFitnessLevel()}
          {metaDuration()}
        </div>
      )
    } else if (isTypeMeditationVideo(contentType)) {
      return (
        <div className="detail-metadata__top">
          {metaYogaMeditationStyle()}
          {metaDuration()}
        </div>
      )
    }
    return null
  }

  const renderEpisodeMeta = () => {
    if (isTypeEpisode(contentType)) {
      return (
        <React.Fragment>
          <div className="detail-metadata__top">
            {metaSeasonEpisode()}
            {metaDuration()}
            {metaYear()}
          </div>
          { metaHostGuest() ?
            <div className="detail-metadata__bottom">
              {metaHostGuest()}
            </div>
            : null
          }
        </React.Fragment>
      )
    } else if (isTypeYogaEpisode(contentType) || isTypeMeditationEpisode(contentType)) {
      return (
        <div className="detail-metadata__top">
          {metaSeasonEpisode()}
          {metaYogaMeditationStyle()}
          {metaYogaMeditiationLevel()}
          {metaDuration()}
        </div>
      )
    } else if (isTypeFitnessEpisode(contentType)) {
      return (
        <div className="detail-metadata__top">
          {metaSeasonEpisode()}
          {metaFitnessStyle()}
          {metaFitnessLevel()}
          {metaDuration()}
          {metaYear()}
        </div>
      )
    }
    return null
  }

  const renderMeta = () => {
    switch (type) {
      case TYPE_CONTENT_SERIES:
        return renderSeriesMeta()
      case TYPE_CONTENT_VIDEO:
        return renderVideoMeta()
      case TYPE_CONTENT_EPISODE:
        return renderEpisodeMeta()
      default:
        return ''
    }
  }

  return (
    <div className="detail-metadata">
      <div className="detail-metadata__container">
        {renderMeta()}
      </div>
    </div>
  )
}

DetailMetadata.propTypes = {
  host: PropTypes.string,
  totalSeasons: PropTypes.number,
  totalEpisodes: PropTypes.number,
  duration: PropTypes.number,
  yogaStyle: PropTypes.string,
  yogaLevel: PropTypes.string,
  yogaLevelPath: PropTypes.string,
  yogaStylePath: PropTypes.string,
  yogaDurationPath: PropTypes.string,
  staticText: ImmutablePropTypes.map.isRequired,
  year: PropTypes.string,
  guest: PropTypes.string,
  contentType: PropTypes.string,
  season: PropTypes.number,
  episode: PropTypes.number,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
  fitnessLevelPath: PropTypes.string,
  fitnessDurationPath: PropTypes.string,
  fitnessStylePath: PropTypes.string,
  type: PropTypes.oneOf([
    TYPE_CONTENT_VIDEO,
    TYPE_CONTENT_EPISODE,
    TYPE_CONTENT_SERIES,
  ]),
}

export default compose(
  connectRedux(
    (state) => {
      return {
        host: state.detail.getIn(['data', 'host']),
        totalSeasons: state.detail.getIn(['data', 'totalSeasons']),
        totalEpisodes: state.detail.getIn(['data', 'totalEpisodes']),
        duration: state.detail.getIn(['data', 'runtime']),
        yogaStyle: state.detail.getIn(['data', 'yogaStyle']),
        yogaLevel: state.detail.getIn(['data', 'yogaLevel']),
        yogaLevelPath: state.detail.getIn(['data', 'yogaLevelPath']),
        yogaStylePath: state.detail.getIn(['data', 'yogaStylePath']),
        yogaDurationPath: state.detail.getIn(['data', 'yogaDurationPath']),
        staticText: state.staticText.getIn(['data', 'detailMetadata']),
        year: state.detail.getIn(['data', 'year']),
        guest: state.detail.getIn(['data', 'guest']),
        contentType: state.detail.getIn(['data', 'type', 'content']),
        season: state.detail.getIn(['data', 'season']),
        episode: state.detail.getIn(['data', 'episode']),
        fitnessStyle: state.detail.getIn(['data', 'fitnessStyle']),
        fitnessLevel: state.detail.getIn(['data', 'fitnessLevel']),
        fitnessLevelPath: state.detail.getIn(['data', 'fitnessLevelPath']),
        fitnessDurationPath: state.detail.getIn(['data', 'fitnessDurationPath']),
        fitnessStylePath: state.detail.getIn(['data', 'fitnessStylePath']),
      }
    },
  ),
  connectStaticText({ storeKey: 'detailMetadata' }),
)(DetailMetadata)
