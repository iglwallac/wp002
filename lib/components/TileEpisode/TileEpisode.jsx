import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import { getBoundActions } from 'actions'
import { connect as connectRouter } from 'components/Router/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link from 'components/Link'
import TileHero from 'components/TileHero'
import Vote, { SIZE_SMALL as VOTE_SIZE_SMALL } from 'components/Vote'
import ProgressBar from 'components/ProgressBar'
import { formatDuration } from 'theme/web-app'
import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'
import {
  TYPE_CONTENT_EPISODE,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
} from 'services/content-type'
import { WATCH_NODE_TYPE_FEATURE } from 'components/Watch'
import WatchAccess, {
  ACCESS_CHECK_AUTH_FEATURE_GEO,
  ACCESS_PREVIEW,
  ACCESS_FEATURE,
} from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import NotAvailable, {
  TYPE_NOT_AVAILABLE_OVERLAY,
} from 'components/NotAvailable'
import TextSeasonEpisode from 'components/TextSeasonEpisode'
import { upstreamContextOnClick } from 'services/upstream-context'

const VIDEO_TITLE = 'video-title'
const SERIES_TITLE = 'series-title'

class TileEpisode extends PureComponent {
  onClickTitle = (evt) => {
    const { props } = this
    const {
      app,
      auth,
      id,
      location,
      page,
      setEventVideoVisited,
      setEventSeriesVisited,
      upstreamContext,
      setUpstreamContext,
    } = props
    const linkType = evt.currentTarget.getAttribute('data-element')
    const isVideoTitle = linkType === VIDEO_TITLE
    const isSeriesTitle = linkType === SERIES_TITLE
    if (_isFunction(setEventVideoVisited) && isVideoTitle) {
      setEventVideoVisited({ auth, location, page, id, app })
    } else if (_isFunction(setEventSeriesVisited) && isSeriesTitle) {
      setEventSeriesVisited({ auth, location, page, id, app })
    }
    upstreamContextOnClick(evt, { upstreamContext, setUpstreamContext })
  }

  getMetaItem = (type, path) => {
    return (
      path ?
        <Link to={path}>
          {type}
        </Link> :
        type
    )
  }

  renderLabel = (value) => {
    if (value) {
      return <div className="tile-episode__label">{value}</div>
    }

    return null
  }

  renderSeriesTitle = (seriesTitle, seriesPath) => {
    const { onClickTitle } = this
    if (seriesTitle && seriesPath) {
      return (
        <Link
          to={seriesPath}
          data-element={SERIES_TITLE}
          onClick={onClickTitle}
          className="tile-episode__series-title"
        >
          {seriesTitle}
        </Link>
      )
    } else if (seriesTitle) {
      return (
        <div className="tile-episode__series-title">{seriesTitle}</div>
      )
    }

    return null
  }

  renderTopMeta = (props, renderSeriesTitleFunc) => {
    if (props.seriesTitle) {
      return renderSeriesTitleFunc(props.seriesTitle, props.seriesPath)
    }

    return null
  }

  renderBottomMeta = (props, formatDurationFunc) => {
    const {
      yogaLevelPath,
      yogaStylePath,
      yogaDurationPath,
      fitnessLevelPath,
      fitnessStylePath,
      fitnessDurationPath,
    } = props
    const meta = []
    const metaClassName = 'tile-episode__meta-item'

    switch (props.type) {
      case TYPE_CONTENT_EPISODE:
      case TYPE_CONTENT_SEGMENT:
        meta.push(
          <span className={metaClassName} key={`tile-episode-counts-${props.id}`}>
            <TextSeasonEpisode
              className={['tile-episode__season-episode']}
              season={props.season}
              episode={props.episode}
            />
          </span>,
        )
        break
      case TYPE_CONTENT_EPISODE_YOGA:
      case TYPE_CONTENT_SEGMENT_YOGA:
        if (props.yogaStyle) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-episode-yoga-style-${props.id}`}
            >
              { this.getMetaItem(props.yogaStyle, yogaStylePath) }
            </span>,
          )
        }

        if (props.yogaLevel) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-episode-yoga-level-${props.id}`}
            >
              { this.getMetaItem(props.yogaLevel, yogaLevelPath) }
            </span>,
          )
        }
        break

      case TYPE_CONTENT_EPISODE_FITNESS:
      case TYPE_CONTENT_SEGMENT_FITNESS:
        if (props.fitnessStyle) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-episode-fitness-style-${props.id}`}
            >
              { this.getMetaItem(props.fitnessStyle, fitnessStylePath) }
            </span>,
          )
        }

        if (props.fitnessLevel) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-episode-fitness-level-${props.id}`}
            >
              { this.getMetaItem(props.fitnessLevel, fitnessLevelPath) }
            </span>,
          )
        }
        break

      case TYPE_CONTENT_EPISODE_MEDITATION:
      case TYPE_CONTENT_SEGMENT_MEDITATION:
        if (props.meditationStyle) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-episode-meditation-style-${props.id}`}
            >
              {props.meditationStyle}
            </span>,
          )
        }
        break
      default:
        return null
    }

    if (props.duration) {
      meta.push(
        <span
          className={`${metaClassName} ${metaClassName}--last`}
          key={`tile-episode-duration-${props.id}`}
        >
          {
            fitnessDurationPath || yogaDurationPath ?
              <Link to={fitnessDurationPath || yogaDurationPath}>
                {formatDurationFunc(props.duration)}
              </Link> : formatDurationFunc(props.duration)
          }
        </span>,
      )
    }

    if (
      props.type !== TYPE_CONTENT_EPISODE &&
      props.type !== TYPE_CONTENT_SEGMENT
    ) {
      meta.push(
        <span className={metaClassName} key={`tile-episode-counts-${props.id}`}>
          <TextSeasonEpisode
            className={['tile-episode__season-episode']}
            season={props.season}
            episode={props.episode}
          />
        </span>,
      )
    }

    return meta
  }

  renderTileProgressBar = (userInfo, duration) => {
    if (!userInfo || !duration || !userInfo.get('featurePosition')) {
      return null
    }
    return (
      <div className="tile-episode__progress-bar">
        <ProgressBar duration={duration} userInfo={userInfo} />
      </div>
    )
  }


  render () {
    const {
      props,
      renderLabel,
      renderTileProgressBar,
      renderTopMeta,
      renderSeriesTitle,
      onClickTitle,
      renderBottomMeta,
    } = this
    const {
      id,
      auth,
      type,
      teaser,
      feature,
      preview,
      asShare,
      heroLabel,
      hasOverlay,
      staticText,
      forceAccess,
      isInPlaylist,
      addToPlaylist,
      upstreamContext,
      episodeTileClass,
      displayMoreInfoButton,
    } = props
    const itemClass = _isArray(episodeTileClass)
      ? episodeTileClass.join(' ')
      : episodeTileClass
    return (
      <div data-type={type} className={itemClass ? `tile-episode ${itemClass}` : 'tile-episode'}>
        <WatchAccess
          auth={auth}
          preview={preview}
          feature={feature}
          accessCheck={ACCESS_CHECK_AUTH_FEATURE_GEO}
        >
          <WatchAccessDenied>
            <NotAvailable
              type={TYPE_NOT_AVAILABLE_OVERLAY}
              message={staticText.getIn(['data', 'notAvailableInRegion'])}
            />
          </WatchAccessDenied>
          <WatchAccessAllowed>{renderLabel(props.label)}</WatchAccessAllowed>
        </WatchAccess>
        <TileHero
          asShare={asShare}
          forceAccess={forceAccess}
          displayMoreInfoButton={displayMoreInfoButton}
          id={id}
          type={type}
          image={props.image}
          url={props.url}
          hasPlayIcon
          auth={props.auth}
          heroLabel={heroLabel}
          watchType={WATCH_NODE_TYPE_FEATURE}
          preview={props.preview}
          feature={props.feature}
          showMoreInfo={props.showMoreInfo}
          toolTipComponent={props.toolTipComponent}
          active={props.active}
          onClickMoreInfo={props.onClickMoreInfo}
          onClickWatch={props.onClickWatch}
          isInPlaylist={isInPlaylist}
          addToPlaylist={addToPlaylist}
          upstreamContext={upstreamContext}
          hasOverlay={hasOverlay}
        />
        {renderTileProgressBar(props.userInfo, props.duration)}
        <div className="tile-episode__top-meta">
          <Vote
            className="vote--right-align vote--small"
            auth={props.auth}
            vote={props.vote}
            size={VOTE_SIZE_SMALL}
            voteDown={props.voteDown}
            voteId={props.voteId}
          />
          {renderTopMeta(props, renderSeriesTitle)}
        </div>
        <Link
          className="tile-episode__title"
          data-element={VIDEO_TITLE}
          onClick={onClickTitle}
          to={props.url}
        >
          {props.title}
        </Link>
        <div className="tile-episode__bottom-meta">
          {renderBottomMeta(props, formatDuration)}
        </div>
        {teaser ? <div className="tile-episode__teaser">{teaser}</div> : null}
      </div>
    )
  }
}

TileEpisode.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  active: PropTypes.bool,
  episodeTileClass: PropTypes.array,
  title: PropTypes.string.isRequired,
  seriesTitle: PropTypes.string,
  seriesPath: PropTypes.string,
  image: PropTypes.string.isRequired,
  episode: PropTypes.number,
  season: PropTypes.number,
  duration: PropTypes.number,
  label: PropTypes.string,
  userInfo: ImmutablePropTypes.map,
  vote: PropTypes.number,
  voteId: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  host: PropTypes.string,
  asShare: PropTypes.bool,
  yogaStyle: PropTypes.string,
  yogaLevel: PropTypes.string,
  yogaLevelPath: PropTypes.string,
  yogaStylePath: PropTypes.string,
  yogaDurationPath: PropTypes.string,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
  fitnessLevelPath: PropTypes.string,
  fitnessStylePath: PropTypes.string,
  fitnessDurationPath: PropTypes.string,
  meditationStyle: PropTypes.string,
  onClickMoreInfo: PropTypes.func,
  showMoreInfo: PropTypes.bool.isRequired,
  toolTipComponent: PropTypes.element,
  preview: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  onClickWatch: PropTypes.func,
  setEventVideoVisited: PropTypes.func,
  setEventSeriesVisited: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
  isInPlaylist: PropTypes.bool,
  addToPlaylist: PropTypes.bool,
  upstreamContext: ImmutablePropTypes.map,
  heroLabel: PropTypes.string,
  teaser: PropTypes.string,
  hasOverlay: PropTypes.bool,
  forceAccess: PropTypes.oneOf([
    ACCESS_FEATURE,
    ACCESS_PREVIEW,
  ]),
}

TileEpisode.defaultProps = {
  vote: 0,
}

export default compose(
  connectRouter(),
  connect(
    state => ({
      app: state.app,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
      }
    },
  ),
  connectStaticText({ storeKey: 'tileEpisode' }),
  pure,
)(TileEpisode)
