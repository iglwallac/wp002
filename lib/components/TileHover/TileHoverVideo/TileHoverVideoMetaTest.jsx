import React, { useState } from 'react'
import { formatDuration } from 'theme/web-app'
import Link from 'components/Link'
import { getSeriesHoverClass } from 'components/TileHover/TileHoverSeries/TileHoverSeriesMeta'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import PlaylistAddRemove from 'components/PlaylistAddRemove'
import ToolTip from 'components/ToolTip'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'

const getVideoHoverClass = (hovered, anyShelfOpened, hideShelf) => {
  return hovered && !anyShelfOpened && !hideShelf ? 'tile-hover-video__meta--hovered' : ''
}

const renderControls = (props) => {
  const {
    linkUrl,
    handleVideoClick,
    auth,
    upstreamContext,
    video,
    onClickHide,
    staticText,
    hiddenContentInfo,
    showHideContentButton,
  } = props
  const videoId = video.get('id')
  const [showToolTip, setShowToolTipState] = useState(false)

  const shouldShowToolTip = (mouseDirection) => {
    const dataReady = hiddenContentInfo.size > 0

    if (mouseDirection === 'leave') {
      return setShowToolTipState(false)
    }

    if (dataReady) {
      const hideToolTip = !!hiddenContentInfo.getIn(['content']).find((el) => {
        return (el.get('contentId') === videoId)
      })
      if (hideToolTip) {
        return setShowToolTipState(false)
      }
    }
    return setShowToolTipState(true)
  }

  const handleClick = (e) => {
    onClickHide(e, video)
    setShowToolTipState(false)
  }

  return (
    <div className="tile-hover-video__meta-test--controls">
      <Link className="tile-hover-video__meta-test--play" to={linkUrl} onClick={handleVideoClick}>
        <IconV2 type={ICON_TYPES.CIRCULAR_PLAY} />
        <span className="tile-hover-video__meta-test--watch-text">Watch Now</span>
      </Link>
      <div
        className="tile-hover-video__meta-test--controls-container"
      >
        {showHideContentButton && (
          <span
            className="tile-hover-video__tool-tip-container"
            onMouseEnter={() => shouldShowToolTip('enter')}
            onMouseLeave={() => shouldShowToolTip('leave')}
          >
            <ToolTip
              visible={showToolTip}
              containerClassName={['tool-tip__inner--video-tile-hover']}
              className={['tool-tip__outer tool-tip__outer--video-tile-hover']}
              arrowClassName={['tool-tip__arrow--center-bottom tool-tip__arrow--center-bottom-tile-hover']}
            >
              {staticText.getIn(['data', 'removeVideo'])}
            </ToolTip>
            <IconV2
              type={ICON_TYPES.HIDE_2}
              onClick={e => handleClick(e)}
            />
          </span>
        )}
        {auth.get('jwt') && <PlaylistAddRemove
          toolTipEnabled
          upstreamContext={upstreamContext}
          contentId={video.get('id')}
          circlularIcon
          noText
          centerIcon
        />}
      </div>
    </div>
  )
}

const RenderMeta = (props) => {
  const {
    renderOpenShelfIcon,
    handleMouseEnter,
    handleMouseLeave,
    onClickShelf,
    video,
    hovered,
    anyShelfOpened,
    hideShelf,
    vertical,
  } = props

  const productType = video.get('productType')
  const displayType = video.get('displayType')
  const isSingle = productType === 'single' && displayType !== 'yoga'
  const isEpisode = productType === 'episode' && displayType !== 'yoga'
  const isYoga = video.get('displayType') === 'yoga'
  const hoverClass = getVideoHoverClass(hovered, anyShelfOpened, hideShelf)
  const seriesHoverClass = vertical ? getSeriesHoverClass(hovered, anyShelfOpened, hideShelf) : ''
  const verticalClass = vertical ? 'tile-hover-series__meta tile-hover-series__meta--vertical' : ''

  return (
    <div
      className={`tile-hover-video__meta tile-hover-video__meta-test ${hoverClass} ${verticalClass} ${seriesHoverClass}`}
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
    >
      { renderControls(props) }
      <div onClick={e => onClickShelf(e)}>
        <div className="tile-hover-video__meta--title tile-hover-video__meta-test--title">{video.get('title')}</div>
        { isYoga ?
          <React.Fragment>
            <div className="tile-hover-video__meta--style">{video.get('yogaStyle')}</div>
            <div className="tile-hover-video__meta--level">{video.get('yogaLevel')}</div>
          </React.Fragment>
          : null
        }
        { isYoga ?
          <div className="tile-hover-video__meta--host">{video.get('host')}</div>
          : null
        }
        { isEpisode ?
          <div className="tile-hover-video__meta--series-title tile-hover-video__meta-test--series-title">{video.get('seriesTitle')}</div>
          : null
        }
        { isEpisode ?
          <div className="tile-hover-video__meta--episode tile-hover-video__meta-test--episode">S{video.get('season')}:Ep{video.get('episode')}</div>
          : null
        }
        { isSingle ?
          <div className="tile-hover-video__meta--year tile-hover-video__meta-test--year">{video.get('year')}</div>
          : null
        }
        <div className="tile-hover-video__meta--duration tile-hover-video__meta-test--duration">{formatDuration(video.get('duration'))}</div>
        <div className="tile-hover-video__shelf-icon tile-hover-video__meta-test--shelf-icon">
          { renderOpenShelfIcon() }
        </div>
      </div>
    </div>
  )
}

export default compose(
  connectStaticText({ storeKey: 'tileHoverVideo' }),
  connectRedux((state) => {
    return {
      hiddenContentInfo: state.hiddenContentPreferences,
    }
  }),
)(RenderMeta)
