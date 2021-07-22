import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import { connect as connectRouter } from 'components/Router/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link from 'components/Link'
import _isFunction from 'lodash/isFunction'
import TileHero from 'components/TileHero'
import Vote, { SIZE_SMALL as VOTE_SIZE_SMALL } from 'components/Vote'
import ProgressBar from 'components/ProgressBar'
import { formatDuration } from 'theme/web-app'
import {
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
} from 'services/content-type'
import { WATCH_NODE_TYPE_FEATURE } from 'components/Watch'
import WatchAccess, {
  ACCESS_CHECK_AUTH_FEATURE_GEO,
  ACCESS_FEATURE,
  ACCESS_PREVIEW,
} from 'components/WatchAccess'
import WatchAccessAllowed from 'components/WatchAccessAllowed'
import WatchAccessDenied from 'components/WatchAccessDenied'
import NotAvailable, {
  TYPE_NOT_AVAILABLE_OVERLAY,
} from 'components/NotAvailable'
import { getBoundActions } from 'actions'
import {
  upstreamContextOnClick,
} from 'services/upstream-context'

class TileVideo extends PureComponent {
  onClickVideoTitle = (evt) => {
    const { props } = this
    const {
      app,
      auth,
      id,
      location,
      page,
      setEventVideoVisited,
      upstreamContext,
      setUpstreamContext,
    } = props
    if (_isFunction(setEventVideoVisited)) {
      setEventVideoVisited({ auth, location, page, id, app })
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
      return <div className="tile-video__label">{value}</div>
    }
    return null
  }

  renderTopMeta = (props) => {
    const { onClickVideoTitle } = this
    const {
      yogaTeacherPath,
      fitnessInstructorPath,
    } = props
    if (props.type !== TYPE_CONTENT_VIDEO && props.host) {
      return (
        <span className="tile-video__host">
          {
            yogaTeacherPath || fitnessInstructorPath ?
              <Link to={yogaTeacherPath || fitnessInstructorPath}>
                {props.host}
              </Link> : props.host
          }
        </span>
      )
    }

    if (props.type === TYPE_CONTENT_VIDEO) {
      return (
        <Link
          to={props.url}
          className="tile-video__title"
          data-element="video-title"
          onClick={onClickVideoTitle}
        >
          {props.title}
        </Link>
      )
    }

    return null
  }

  renderTitle = (props) => {
    const { onClickVideoTitle } = this
    if (props.type !== TYPE_CONTENT_VIDEO) {
      return (
        <Link
          to={props.url}
          className="tile-video__title"
          data-element="video-title"
          onClick={onClickVideoTitle}
        >
          {props.title}
        </Link>
      )
    }

    return null
  }

  renderBottomMeta = (props, formatDurationFunc) => {
    const meta = []
    const metaClassName = 'tile-video__meta-item'
    const {
      yogaLevelPath,
      yogaStylePath,
      yogaDurationPath,
      fitnessLevelPath,
      fitnessStylePath,
      fitnessDurationPath,
    } = props
    switch (props.type) {
      case TYPE_CONTENT_VIDEO_YOGA:
        if (props.yogaStyle) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-video-yoga-style-${props.id}`}
            >
              { this.getMetaItem(props.yogaStyle, yogaStylePath) }
            </span>,
          )
        }
        if (props.yogaLevel) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-video-yoga-level-${props.id}`}
            >
              { this.getMetaItem(props.yogaLevel, yogaLevelPath) }
            </span>,
          )
        }
        break

      case TYPE_CONTENT_VIDEO_FITNESS:
        if (props.fitnessStyle) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-video-fitness-style-${props.id}`}
            >
              { this.getMetaItem(props.fitnessStyle, fitnessStylePath) }
            </span>,
          )
        }
        if (props.fitnessLevel) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-video-fitness-level-${props.id}`}
            >
              { this.getMetaItem(props.fitnessLevel, fitnessLevelPath) }
            </span>,
          )
        }
        break

      case TYPE_CONTENT_VIDEO_MEDITATION:
        if (props.meditationStyle) {
          meta.push(
            <span
              className={metaClassName}
              key={`tile-video-meditation-style-${props.id}`}
            >
              {props.meditationStyle}
            </span>,
          )
        }
        break
      default:
        break
    }

    if (props.duration) {
      meta.push(
        <span
          className={`${metaClassName} ${metaClassName}--last`}
          key={`tile-video-duration-${props.id}`}
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

    return meta
  }

  renderTileProgressBar = (userInfo, duration) => {
    if (!userInfo || !duration || !userInfo.get('featurePosition')) {
      return null
    }
    return (
      <div className="tile-video__progress-bar">
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
      renderTitle,
      renderBottomMeta,
    } = this
    const {
      id,
      auth,
      type,
      teaser,
      feature,
      asShare,
      preview,
      itemIndex,
      heroLabel,
      staticText,
      forceAccess,
      isInPlaylist,
      onClickWatch,
      addToPlaylist,
      upstreamContext,
      displayMoreInfoButton,
    } = props
    const itemClass = Array.isArray(props.videoTileClass)
      ? props.videoTileClass.join(' ')
      : props.videoTileClass
    return (
      <div data-type={type} className={itemClass ? `tile-video ${itemClass}` : 'tile-video'}>
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
          auth={auth}
          heroLabel={heroLabel}
          watchType={WATCH_NODE_TYPE_FEATURE}
          preview={preview}
          feature={feature}
          showMoreInfo={props.showMoreInfo}
          toolTipComponent={props.toolTipComponent}
          active={props.active}
          itemIndex={itemIndex}
          onClickMoreInfo={props.onClickMoreInfo}
          isInPlaylist={isInPlaylist}
          addToPlaylist={addToPlaylist}
          upstreamContext={upstreamContext}
          onClickWatch={onClickWatch}
        />
        {renderTileProgressBar(props.userInfo, props.duration)}
        <div className="tile-video__top-meta">
          <Vote
            auth={props.auth}
            vote={props.vote}
            voteDown={props.voteDown}
            voteId={props.voteId}
            size={VOTE_SIZE_SMALL}
            className="vote--right-align vote--small"
          />
          {renderTopMeta(props)}
        </div>
        {renderTitle(props)}
        <div className="tile-video__bottom-meta">
          {renderBottomMeta(props, formatDuration)}
        </div>
        {teaser ? <div className="tile-video__teaser">{teaser}</div> : null}
      </div>
    )
  }
}

TileVideo.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  active: PropTypes.bool,
  videoTileClass: PropTypes.array,
  type: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
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
  yogaTeacherPath: PropTypes.string,
  fitnessStyle: PropTypes.string,
  fitnessLevel: PropTypes.string,
  fitnessLevelPath: PropTypes.string,
  fitnessStylePath: PropTypes.string,
  fitnessDurationPath: PropTypes.string,
  fitnessInstructorPath: PropTypes.string,
  meditationStyle: PropTypes.string,
  onClickMoreInfo: PropTypes.func,
  showMoreInfo: PropTypes.bool.isRequired,
  toolTipComponent: PropTypes.element,
  preview: ImmutablePropTypes.map.isRequired,
  feature: ImmutablePropTypes.map.isRequired,
  onClickWatch: PropTypes.func,
  setEventVideoVisited: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
  isInPlaylist: PropTypes.bool,
  addToPlaylist: PropTypes.bool,
  upstreamContext: ImmutablePropTypes.map,
  heroLabel: PropTypes.string,
  teaser: PropTypes.string,
  forceAccess: PropTypes.oneOf([
    ACCESS_FEATURE,
    ACCESS_PREVIEW,
  ]),
}

TileVideo.defaultProps = {
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
  connectStaticText({ storeKey: 'tileVideo' }),
  pure,
)(TileVideo)
