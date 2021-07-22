import PropTypes from 'prop-types'
import _get from 'lodash/get'
import React, { useCallback } from 'react'
import { Map } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Link, { TARGET_BLANK } from 'components/Link'
import Row from 'components/Row.v2'
import TileHoverVideo from 'components/TileHover/TileHoverVideo'

const MAP = Map()
const dataLayer = global.dataLayer

function createAccessor (Accessor, item) {
  if (!item) return null
  const url = item.get('url', '') || ''
  const title = item.get('title', '')
  return url ? (
    <Accessor
      target={TARGET_BLANK}
      title={title}
      to={url}
    />
  ) : null
}


function getOnClickCta (eventLabel = 'related-videos') {
  return () => {
    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'user engagement',
        eventAction: 'carouselclick',
        eventLabel,
      })
    }
  }
}

function renderRelatedVideos (item, params, location) {
  const {
    itemShelfIsOpen,
    openShelf,
    hideShelf,
    focused,
    index,
  } = params
  const videoId = Number(item.get('id'))
  return (
    <TileHoverVideo
      shelfOpened={itemShelfIsOpen}
      onOpenShelf={openShelf}
      upstreamContext={MAP}
      hideShelf={hideShelf}
      location={location}
      hovered={focused}
      index={index}
      id={videoId}
      onVideoTileClick={getOnClickCta('related-videos')}
    />
  )
}

function renderImage (item) {
  const className = 'additional-media__image'
  const img = item.get('img', '') || ''
  const name = item.get('name', '')
  const type = item.get('type')
  const style = img ? {
    backgroundImage: `url(${img})`,
  } : {}

  if (type === 'lp') {
    return (
      <div
        className={`${className} additional-media__image--${name}`}
        role="presentation"
      />
    )
  }
  if (type === 'series' || type === 'feature') {
    return (
      <div
        className={className}
        role="presentation"
        style={style}
      />
    )
  }
  return null
}

function renderWatchMoreTiles (item) {
  const url = item.get('url', '') || ''
  return (
    <div className="additional-media__tiles">
      <Link
        target={TARGET_BLANK}
        to={url}
        onClick={getOnClickCta('explore-more-on-gaia')}
      >{renderImage(item)}
      </Link>
    </div>
  )
}

function noop () {}

export default function AdditionalMedia ({
  additionalMedia,
  staticText,
  location,
  tiles,
}) {
  const handleOpenShelf = useCallback((openShelf, item) => {
    const contentId = item.get('nid')
    const contentType = item.get('type')
    openShelf(contentId, contentType)
  }, [])

  return (
    <div className="additional-media">
      {_get(tiles, 'size', 0) < 1 ? null : (
        <Row
          clearOpenShelfIndex={noop}
          label={staticText.get('related')}
          createAccessor={createAccessor}
          onOpenShelf={handleOpenShelf}
          items={tiles}
          useShelfV1
        >{(item, data) => renderRelatedVideos(item, data, location)}
        </Row>
      )}
      {_get(additionalMedia, 'size', 0) < 1 ? null : (
        <Row
          clearOpenShelfIndex={noop}
          label={staticText.get('exploreMore')}
          createAccessor={createAccessor}
          onOpenShelf={handleOpenShelf}
          items={additionalMedia}
          useShelfV1
        >{(item, data) => renderWatchMoreTiles(item, data, location)}
        </Row>
      )}
    </div>
  )
}

AdditionalMedia.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  additionalMedia: ImmutablePropTypes.list,
  tiles: ImmutablePropTypes.list,
  location: PropTypes.object,
  limit: PropTypes.number,
}
