import React from 'react'
import Truncate from 'react-truncate'


export const getSeriesHoverClass = (hovered, anyShelfOpened, hideShelf) => {
  return hovered && !anyShelfOpened && !hideShelf ? 'tile-hover-series__meta--hovered' : ''
}

const renderMeta = (props) => {
  const {
    renderOpenShelfIcon,
    handleMouseEnter,
    handleMouseLeave,
    onClickShelf,
    series,
    hovered,
    anyShelfOpened,
    hideShelf,
    vertical,
  } = props

  const verticalClass = vertical ? 'tile-hover-series__meta--vertical' : ''
  const hoverClass = getSeriesHoverClass(hovered, anyShelfOpened, hideShelf)

  return (
    <div
      className={`tile-hover-series__meta ${verticalClass} ${hoverClass}`}
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
      onClick={e => onClickShelf(e)}
    >
      <div className="tile-hover-series__meta--title">{series.get('title')}</div>
      <div className="tile-hover-series__meta--episode">{series.get('seasonCount')} Seasons, {series.get('episodeCount')} Episodes</div>
      <div className="tile-hover-series__meta--body">
        <Truncate lines={3} ellipsis={<span>...</span>}>
          {series.get('teaser')}
        </Truncate>
      </div>
      <div className="tile-hover-series__shelf-icon">
        { renderOpenShelfIcon() }
      </div>
    </div>
  )
}

export default renderMeta
