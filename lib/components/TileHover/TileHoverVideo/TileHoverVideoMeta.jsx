import React from 'react'
import { formatDuration } from 'theme/web-app'
import Truncate from 'react-truncate'
import { getSeriesHoverClass } from 'components/TileHover/TileHoverSeries/TileHoverSeriesMeta'

const getVideoHoverClass = (hovered, anyShelfOpened, hideShelf) => {
  return hovered && !anyShelfOpened && !hideShelf ? 'tile-hover-video__meta--hovered' : ''
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
      className={`tile-hover-video__meta ${hoverClass} ${verticalClass} ${seriesHoverClass}`}
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
      onClick={e => onClickShelf(e)}
    >
      { isYoga ?
        <div className="tile-hover-video__meta--host">{video.get('host')}</div>
        : null
      }
      { isEpisode ?
        <div className="tile-hover-video__meta--series-title">{video.get('seriesTitle')}</div>
        : null
      }
      <div className="tile-hover-video__meta--title">{video.get('title')}</div>
      { isYoga ?
        <React.Fragment>
          <div className="tile-hover-video__meta--style">{video.get('yogaStyle')}</div>
          <div className="tile-hover-video__meta--level">{video.get('yogaLevel')}</div>
        </React.Fragment>
        : null
      }
      { isEpisode ?
        <div className="tile-hover-video__meta--episode">S{video.get('season')}:Ep{video.get('episode')}</div>
        : null
      }
      { isSingle ?
        <div className="tile-hover-video__meta--year">{video.get('year')}</div>
        : null
      }
      <div className="tile-hover-video__meta--duration">{formatDuration(video.get('duration'))}</div>
      <div className="tile-hover-video__meta--body">
        <Truncate lines={3} ellipsis={<span>...</span>}>
          {video.get('teaser')}
        </Truncate>
      </div>
      <div className="tile-hover-video__shelf-icon">
        { renderOpenShelfIcon() }
      </div>
    </div>
  )
}

export default RenderMeta
