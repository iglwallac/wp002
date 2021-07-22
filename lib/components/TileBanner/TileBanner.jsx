import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Icon from 'components/Icon'
import Link from 'components/Link'
import WatchAccess, {
  ACCESS_PREVIEW,
  ACCESS_FEATURE,
} from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import HeroImage, {
  HERO_IMAGE_OVERLAY_OPACITY_LIGHT,
} from 'components/HeroImage'
import TextSeasonsEpisodes from 'components/TextSeasonsEpisodes'
import TextSeasonEpisode from 'components/TextSeasonEpisode'
import TextYogaMeta from 'components/TextYogaMeta'
import TextFitnessMeta from 'components/TextFitnessMeta'
import { formatDuration, truncate } from 'theme/web-app'
import {
  isTypeYogaFitnessVideo,
  isTypeEpisode,
  isTypeYogaFitnessEpisode,
  isTypeSeries,
  isTypeYogaFitnessSeries,
} from 'services/content-type'
import { upstreamContextOnClick as upstreamContextClick } from 'services/upstream-context'
import _partial from 'lodash/partial'

function getClassName (className) {
  return ['tile-banner'].concat(className || []).join(' ')
}

class TileBanner extends PureComponent {
  getUpstreamContextOnClick = () => {
    const { props } = this
    const {
      upstreamContext,
      setUpstreamContext,
    } = props

    return _partial(
      upstreamContextClick,
      _partial.placeholder,
      { upstreamContext, setUpstreamContext },
    )
  }

  renderPlayIcon = () => {
    return (
      <Icon
        iconClass={['icon--play-fill', 'icon--white', 'tile-banner__play-icon']}
      />
    )
  }

  renderSeriesOrHost = (
    typeOfContent,
    titleOfSeries,
    pathToSeries,
    nameOfHost,
    onClick,
  ) => {
    if (isTypeEpisode(typeOfContent) || isTypeYogaFitnessEpisode(typeOfContent)) {
      return (
        <span className="tile-banner__meta-item tile-banner__meta-item--stacked">
          <Link
            to={pathToSeries}
            onClick={onClick}
            data-element="series-title"
            className="tile-banner__meta-link"
          >
            {titleOfSeries}
          </Link>
        </span>
      )
    } else if (isTypeYogaFitnessVideo(typeOfContent)) {
      return (
        <span className="tile-banner__meta-item tile-banner__meta-item--stacked">
          {nameOfHost}
        </span>
      )
    }

    return null
  }

  render () {
    const {
      props,
      renderSeriesOrHost,
      renderPlayIcon,
      getUpstreamContextOnClick,
    } = this
    const {
      auth,
      label,
      id,
      type,
      title,
      heroImage,
      duration,
      url,
      episode,
      season,
      episodeCount,
      seasonCount,
      seriesTitle,
      seriesPath,
      teaser,
      host,
      year,
      yogaStyle,
      yogaLevel,
      fitnessStyle,
      fitnessLevel,
      feature,
      preview,
      className,
    } = props

    // eslint-disable-next-line no-shadow
    const upstreamContextOnClick = getUpstreamContextOnClick()

    return (
      <div className={getClassName(className)}>
        <span className="tile-banner__label">{label}</span>
        <HeroImage
          className={['tile-banner__background-hero']}
          hasOverlay
          overlayOpacity={HERO_IMAGE_OVERLAY_OPACITY_LIGHT}
          smallUrl={heroImage.get('small')}
          mediumSmallUrl={heroImage.get('mediumSmall')}
          mediumUrl={heroImage.get('medium')}
          largeUrl={heroImage.get('large')}
        />
        <div className="tile-banner__meta">
          <Link
            to={url}
            data-element="video-title"
            onClick={upstreamContextOnClick}
            className="tile-banner__title"
          >
            {title}
          </Link>
          {renderSeriesOrHost(type, seriesTitle, seriesPath, host, upstreamContextOnClick)}
          <div className="tile-banner__meta-items">
            {year ? <span className="tile-banner__meta-item">{year}</span> : null}
            <TextYogaMeta
              id={id}
              className="tile-banner__meta-item"
              yogaStyle={yogaStyle}
              yogaLevel={yogaLevel}
            />
            <TextFitnessMeta
              id={id}
              className="tile-banner__meta-item"
              fitnessStyle={fitnessStyle}
              fitnessLevel={fitnessLevel}
            />
            <TextSeasonEpisode
              episode={episode}
              season={season}
              className={['tile-banner__meta-item']}
            />
            <TextSeasonsEpisodes
              seasonCount={seasonCount}
              episodeCount={episodeCount}
              className={['tile-banner__meta-item']}
            />
            {duration ? (
              <span className="tile-banner__meta-item tile-banner__meta-item--last">
                {formatDuration(duration)}
              </span>
            ) : null}
          </div>
          {teaser ? (
            <p className="tile-banner__teaser">{truncate(teaser, 90)}</p>
          ) : null}
        </div>
        <div className="tile-banner__actions">
          {!isTypeSeries(type) || !isTypeYogaFitnessSeries(type) ? (
            <div className="tile-banner__play-action">
              <WatchAccess auth={auth} preview={preview} feature={feature}>
                <WatchAccessAllowed access={ACCESS_FEATURE}>
                  <Link
                    className="tile-banner__play-link"
                    to={url}
                    data-element="play-button"
                    onClick={upstreamContextOnClick}
                    query={{ fullplayer: 'feature' }}
                  >
                    {renderPlayIcon()}
                  </Link>
                </WatchAccessAllowed>
                <WatchAccessAllowed access={ACCESS_PREVIEW}>
                  <Link
                    className="tile-banner__play-link"
                    to={url}
                    query={{ fullplayer: 'preview' }}
                  >
                    {renderPlayIcon()}
                  </Link>
                </WatchAccessAllowed>
                <WatchAccessDenied>
                  <Link className="tile-banner__play-link" to={url}>
                    {renderPlayIcon()}
                  </Link>
                </WatchAccessDenied>
              </WatchAccess>
            </div>
          ) : null}
          <div className="tile-banner__more-action">
            <Link className="tile-banner__more-link" to={url}>
              <Icon
                iconClass={[
                  'icon--dots',
                  'icon--white',
                  'tile-banner__more-icon',
                ]}
              />
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

TileBanner.propTypes = {
  history: PropTypes.object,
  auth: ImmutablePropTypes.map.isRequired,
  label: PropTypes.string,
  userInfo: ImmutablePropTypes.map,
  type: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  heroImage: ImmutablePropTypes.map.isRequired,
  title: PropTypes.string.isRequired,
  duration: PropTypes.number,
  url: PropTypes.string.isRequired,
  episode: PropTypes.number,
  season: PropTypes.number,
  seasonCount: PropTypes.number,
  episodeCount: PropTypes.number,
  seriesTitle: PropTypes.string,
  seriesPath: PropTypes.string,
  host: PropTypes.string,
  guest: PropTypes.string,
  year: PropTypes.string,
  teaser: PropTypes.string,
  yogaStyle: PropTypes.string,
  yogaLevel: PropTypes.string,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
  meditationStyle: PropTypes.string,
  feature: ImmutablePropTypes.map,
  preview: ImmutablePropTypes.map,
  upstreamContext: ImmutablePropTypes.map,
  className: PropTypes.array,
  setUpstreamContext: PropTypes.func,
}

export default connectRedux(
  () => {
    return {}
  },
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setUpstreamContext: actions.upstreamContext.setUpstreamContext,
    }
  },
)(TileBanner)
