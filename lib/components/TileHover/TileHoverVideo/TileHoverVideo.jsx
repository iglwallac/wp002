import React from 'react'
import _isFunction from 'lodash/isFunction'
import { getBoundActions } from 'actions'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getWatchAccess } from 'services/media'
import { List, Map } from 'immutable'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import {
  upstreamContextOnClick,
} from 'services/upstream-context'
import ProgressBar from 'components/ProgressBar'
import Icon from 'components/Icon'
import {
  TYPE_CONTENT_VIDEO,
  TYPE_CONTENT_EPISODE,
} from 'services/content-type'
import { CUSTOM_ROW_CLICK_EVENT, HIDDEN_CONTENT_UNHIDE_EVENT, HIDDEN_CONTENT_HIDE_EVENT } from 'services/event-tracking'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import TileHoverVideoMeta from './TileHoverVideoMeta'
import RemovedContentOverlay from '../RemovedContentOverlay/RemovedContentOverlay'
import TileHoverVideoMetaTest from './TileHoverVideoMetaTest'

export const VERTICAL_DISPLAY_MODE = 'tile-list-5x7'

const renderLabel = (value) => {
  if (value) {
    return <span className="tile-hover-video__label">{value}</span>
  }
  return null
}

const getHoverClass = (hovered, anyShelfOpened) => {
  return hovered && !anyShelfOpened ? 'tile-hover-video__icon-container--hovered' : ''
}

const getImageSource = (props) => {
  const {
    video,
    legacyVideo,
    legacyVideoData,
    displayMode,
  } = props

  if (legacyVideo) {
    return legacyVideoData.get('image') || legacyVideoData.get('imageWithText')
  } else if (displayMode === VERTICAL_DISPLAY_MODE) {
    return video.get('verticalImage')
  }
  return video.get('imageWithText')
}

class TileHoverVideo extends React.Component {
  static getDerivedStateFromProps (props, state) {
    const { upstreamContext, id, index, score, source, videoTasteSegment } = props
    if (props.hovered === true && state.playlistFetched !== true) {
      return {
        playlistFetched: true,
      }
    }

    if (state.contentId !== id || state.source !== source) {
      const updatedContext = upstreamContext.merge({
        itemIndex: index,
        contentId: id,
        contentType: 'video',
        score,
        source,
        videoTasteSegment,
      })
      return {
        upstreamContext: updatedContext,
        contentId: id,
        source,
      }
    }
    return null
  }

  constructor (props) {
    super(props)
    this.state = {
      playlistFetched: false,
    }
  }

  onClickHide = (e, video) => {
    e.preventDefault()
    const { setDefaultGaEvent, hideContent } = this.props
    const eventData = HIDDEN_CONTENT_HIDE_EVENT
      .set('eventLabel', video.get('title'))
    setDefaultGaEvent(eventData)
    hideContent({ contentType: 'video', contentId: video.get('id') })
  }

  onClickShelf = (e) => {
    const { props, state } = this
    const { upstreamContext } = state
    const {
      video,
      onOpenShelf,
      setUpstreamContext,
      legacyVideo,
      legacyVideoData,
    } = props

    e.preventDefault()

    upstreamContextOnClick(e, { upstreamContext, setUpstreamContext })

    if (onOpenShelf) {
      let legacyContentType = video.getIn(['type', 'content'])

      if (legacyVideo) {
        legacyContentType = legacyVideoData.getIn(['type', 'content'])
      }

      onOpenShelf(null, legacyContentType)
    }
  }

  getLabel = (video) => {
    const { staticText } = this.props
    const type = video.getIn(['type', 'product'])
    const isNew = video.get('isNew')
    const featuredType = video.get('featuredTileType')
    const featuredLabel = video.get('featuredTileLabel')

    if (featuredType === 'merchandising-campaign') {
      return featuredLabel
    }

    switch (type) {
      case TYPE_CONTENT_VIDEO:
        return isNew ? staticText.get('newVideo') : null

      case TYPE_CONTENT_EPISODE:
        switch (featuredType) {
          case 'new':
            return staticText.get('newEpisode')
          case 'next':
            return staticText.get('nextEpisode')
          case 'first':
            return staticText.get('firstEpisode')
          case 'latest':
            return staticText.get('latestEpisode')
          case 'last':
            return staticText.get('lastEpisode')
          default:
            return isNew ? staticText.get('newEpisode') : null
        }

      default:
        return null
    }
  }

  getIconClasses = () => {
    const { props } = this
    const { page } = props
    const iconClassNames = ['tile-hover-video__shelf-icon', 'tile-hover-video__shelf-icon--small-wrapper']

    if (page.get('isTouch')) {
      iconClassNames.push('tile-hover-video__shelf-icon--touch-wrapper')
    }
    return iconClassNames.join(' ')
  }

  trackImpressions = () => {
    const { props } = this
    const {
      auth,
      setEventVideoImpressed,
      app,
      page,
      language,
      index,
      id,
      impressed,
      upstreamContext,
      score,
      source,
    } = props

    if (!id || impressed) {
      return null
    }

    const updatedContext = upstreamContext.merge({
      itemIndex: index,
      contentId: id,
      contentType: 'video',
      score,
      source,
    })

    setEventVideoImpressed({
      auth,
      location,
      page,
      app,
      upstreamContext: updatedContext,
      language,
    })
    this.setState({ upstreamContext: updatedContext })
    return null
  }

  handleVideoClick = (evt) => {
    const { props, state } = this
    const { upstreamContext } = state
    const { setUpstreamContext, video, adminTitle, setDefaultGaEvent, onVideoTileClick } = props
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Play Click')
      .set('eventLabel', adminTitle)
      .set('contentInfo', `${video.get('title')} | video | ${video.get('id')}`)
    setDefaultGaEvent(eventData)
    upstreamContextOnClick(evt, { upstreamContext, setUpstreamContext })

    if (_isFunction(onVideoTileClick)) {
      onVideoTileClick(evt)
    }
  }

  handleMouseEnter = () => {
    this.setState(() => ({ metaHovered: true }))
  }

  handleMouseLeave = () => {
    this.setState(() => ({ metaHovered: false }))
  }

  handleTileClick = (e) => {
    const { props, onClickShelf } = this
    const { anyShelfOpened, video, adminTitle, setDefaultGaEvent, hiddenContentInfo } = props
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Click Tile')
      .set('eventLabel', adminTitle)
      .set('contentInfo', `${video.get('title')} | video | ${video.get('id')}`)
    setDefaultGaEvent(eventData)
    if (anyShelfOpened && !hiddenContentInfo) {
      return onClickShelf(e)
    }
    return null
  }

  handleUnhide = () => {
    const { props } = this
    const { hiddenContentInfo, unhideContent, setDefaultGaEvent, video } = props
    const eventData = HIDDEN_CONTENT_UNHIDE_EVENT
      .set('eventLabel', video.get('title'))
    setDefaultGaEvent(eventData)
    unhideContent({ id: hiddenContentInfo.get('id'), contentId: hiddenContentInfo.get('contentId') })
  }

  renderControls = (linkUrl) => {
    const { handleVideoClick, props, state } = this
    const {
      hovered,
      anyShelfOpened,
      id,
      index,
      upstreamContext,
      video,
      adminTitle,
    } = props
    const { playlistFetched } = state

    const hoverClass = getHoverClass(hovered, anyShelfOpened)
    const updatedContext = upstreamContext.set('itemIndex', index)
    const eventData = CUSTOM_ROW_CLICK_EVENT
      .set('eventAction', 'Playlist Add')
      .set('eventLabel', adminTitle)
      .set('contentInfo', `${video.get('title')} | video | ${video.get('id')}`)
    return (
      <span className={`tile-hover-video__icon-container ${hoverClass}`}>
        <Link className="tile-hover-video__play-link" to={linkUrl} onClick={handleVideoClick}>
          <Icon
            iconClass={['icon--play-fill', 'icon--white', 'tile-hover-video__play-icon']}
          />
        </Link>

        <span className="tile-hover-video__playlist-container">
          {playlistFetched ?
            <PlaylistAddRemove
              upstreamContext={updatedContext}
              contentId={id}
              notext
              merchEventData={eventData}
            />
            : null
          }
        </span>
      </span>
    )
  }

  renderOpenShelfIcon = (touch) => {
    const { state, props, onClickShelf } = this
    const { metaHovered } = state
    const {
      onOpenShelf,
    } = props

    if (!onOpenShelf) {
      return null
    }

    const classNames = ['icon', 'icon--openplaylist', 'icon--action']
    if (metaHovered) {
      classNames.push('tile-hover-video__card--hovered')
    }
    if (touch) {
      return <span className="tile-hover-video__shelf-icon--touch" onClick={onClickShelf} />
    }
    return <Icon iconClass={classNames} onClick={onClickShelf} />
  }

  renderTileProgressBar = (userNodeInfo, duration) => {
    if (!userNodeInfo || !duration || !userNodeInfo.get('featurePosition')) {
      return null
    }
    return (
      <div className="tile-hover-video__progress-bar">
        <ProgressBar duration={duration} userInfo={userNodeInfo} />
      </div>
    )
  }

  render () {
    const {
      props,
      handleVideoClick,
      getLabel,
      onClickShelf,
      renderOpenShelfIcon,
      handleMouseEnter,
      handleMouseLeave,
      handleTileClick,
      handleUnhide,
      onClickHide,
    } = this

    const {
      auth,
      hasData,
      video = Map(),
      id,
      country,
      subscriptions,
      hideLabel,
      shelfOpened,
      anyShelfOpened,
      userNodeInfo,
      hovered,
      hideShelf,
      legacyVideo,
      legacyVideoData = Map(),
      displayMode,
      hiddenContentInfo,
      upstreamContext,
      showHideContentButton,
    } = props
    if (legacyVideo && legacyVideoData.get('id', 0) <= 0) {
      return <div className="tile-hover-video__placeholder" />
    } else if (!legacyVideo && !hasData) {
      return <div className="tile-hover-video__placeholder" />
    }

    const videoId = video.get('id') || legacyVideoData.get('id')

    if (!videoId) {
      return (
        <div className="tile-hover-video__placeholder tile-hover-video__placeholder--error">
          Video {id} unavailable
        </div>
      )
    }

    let feature = video.get('feature', Map())
    let url = video.get('url', '')
    let label = hideLabel ? null : getLabel(video)
    // if we are passing in legacyVideoData and not using the new video store
    if (legacyVideo) {
      feature = legacyVideoData.get('feature', Map())
      url = legacyVideoData.get('url', '')
      label = hideLabel ? null : getLabel(legacyVideoData)
    }
    const featureDuration = feature.get('duration')
    const watchAccess = getWatchAccess({
      media: feature,
      country,
      userSubscriptions: subscriptions,
    })

    let linkUrl = watchAccess ? `${url}?fullplayer=feature` : url
    if (anyShelfOpened) linkUrl = ''
    const tileClassNames = ['tile-hover-video']
    if (shelfOpened) {
      tileClassNames.push('tile-hover-video--shelf-opened')
    }
    return (
      <div className={tileClassNames.join(' ')} onClick={handleTileClick} >
        <div className="tile-hover-video__wrapper">
          {!anyShelfOpened ?
            <Link key={id} to={linkUrl} onClick={handleVideoClick} className="tile-hover-video__link">
              {renderLabel(label)}
              <img
                src={getImageSource(props)}
                alt={video.get('title')}
                className="tile-hover-video__image"
              />
            </Link>
            :
            <Link key={id} to={URL_JAVASCRIPT_VOID} onClick={handleTileClick} className="tile-hover-video__link">
              <img
                src={getImageSource(props)}
                alt={video.get('title')}
                className="tile-hover-video__image"
              />
            </Link>
          }
          <TestarossaSwitch>
            <TestarossaCase campaign="ME-3043" variation={[1]}>
              {null}
            </TestarossaCase>
            <TestarossaDefault unwrap>
              {this.renderControls(linkUrl)}
            </TestarossaDefault>
          </TestarossaSwitch>
        </div>
        <div className={this.getIconClasses()}>
          {id ? this.renderOpenShelfIcon(true) : null}
        </div>
        {!shelfOpened && auth.get('jwt') ? this.renderTileProgressBar(legacyVideo ? legacyVideoData.get('userInfo', Map()) : userNodeInfo, featureDuration) : null}
        { hiddenContentInfo &&
          <RemovedContentOverlay
            title={(legacyVideo ? legacyVideoData : video).get('title')}
            undoHideContentHandler={handleUnhide}
          />
        }
        <TestarossaSwitch>
          <TestarossaCase campaign="ME-3043" variation={[1]}>
            <TileHoverVideoMetaTest
              renderOpenShelfIcon={renderOpenShelfIcon}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              anyShelfOpened={anyShelfOpened}
              onClickShelf={onClickShelf}
              video={legacyVideo ? legacyVideoData : video}
              hovered={hovered}
              vertical={displayMode === VERTICAL_DISPLAY_MODE}
              hideShelf={hideShelf}
              linkUrl={linkUrl}
              handleVideoClick={this.handleVideoClick}
              upstreamContext={upstreamContext}
              auth={auth}
              onClickHide={onClickHide}
              showHideContentButton={showHideContentButton}
            />
          </TestarossaCase>
          <TestarossaDefault unwrap>
            <TileHoverVideoMeta
              renderOpenShelfIcon={renderOpenShelfIcon}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              anyShelfOpened={anyShelfOpened}
              onClickShelf={onClickShelf}
              video={legacyVideo ? legacyVideoData : video}
              hovered={hovered}
              vertical={displayMode === VERTICAL_DISPLAY_MODE}
              hideShelf={hideShelf}
            />
          </TestarossaDefault>
        </TestarossaSwitch>
      </div>
    )
  }
}

TileHoverVideo.propTypes = {
  upstreamContext: ImmutablePropTypes.map,
  id: PropTypes.number.isRequired,
  location: PropTypes.object,
  onOpenShelf: PropTypes.func,
  shelfOpened: PropTypes.bool,
  legacyVideo: PropTypes.bool,
  legacyVideoData: ImmutablePropTypes.map,
  adminTitle: PropTypes.string,
  displayMode: PropTypes.string,
  showHideContentButton: PropTypes.bool,
  onVideoTileClick: PropTypes.func,
}

export default compose(
  connectRedux(
    (state, props) => {
      const { id, disableRemovedContentOverlay } = props
      const language = state.user.getIn(['data', 'language', 0], 'en')
      const videoStore = state.videos.getIn([Number(id), language], Map())
      const isInPlaylist = state.userNodeInfo.getIn([Number(id), 'data', 'playlist'])
      const featurePosition = state.userNodeInfo.getIn([Number(id), 'data', 'featurePosition'])
      const hiddenContentList = state.hiddenContentPreferences.getIn(['content'])
      const hiddenContentInfo = !disableRemovedContentOverlay && hiddenContentList && hiddenContentList.find(content => content.get('contentId') === id)
      return {
        hasData: videoStore.has('data'),
        processing: videoStore.get('processing', false),
        video: videoStore.get('data', Map()),
        impressed: videoStore.get('impressed'),
        country: state.auth.get('country'),
        auth: state.auth,
        subscriptions: state.auth.get('subscriptions', List()),
        app: state.app,
        page: state.page,
        staticText: state.staticText.getIn(['data', 'tile', 'data']),
        isInPlaylist,
        hiddenContentInfo,
        featurePosition,
        userNodeInfo: state.userNodeInfo.getIn([Number(id), 'data'], Map()),
        id: Number(id),
        language: state.user.getIn(['data', 'language'], Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        fetchNodes: actions.node.getNodes,
        getPmScreen: actions.pmScreen.getPmScreen,
        setUpstreamContext: actions.upstreamContext.setUpstreamContext,
        setEventVideoImpressed: actions.eventTracking.setEventVideoImpressed,
        clearVideosImpressionData: actions.videos.clearVideosImpressionData,
        setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
        unhideContent: actions.hiddenContentPreferences.unhideContent,
        hideContent: actions.hiddenContentPreferences.hideContent,
      }
    },
  ),
)(TileHoverVideo)
