import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React from 'react'
import { Map, List } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import TileHoverVideo from 'components/TileHover/TileHoverVideo'
import Row from 'components/Row.v2'
import {
  createUpstreamContext,
  SCREEN_TYPE_DETAIL_VIDEO,
} from 'services/upstream-context'

function VideoRow (props) {
  const {
    tiles,
    detail,
    storeKey,
    location,
    setShelfOpen,
    openShelfRowId,
    clearOpenShelfRowId,
  } = props
  const tilesData = tiles.getIn(['data', 'titles'], List())

  const handleOpenShelf = (openShelf, item) => {
    const contentId = item.get('id')
    const contentType = item.get('type')

    openShelf(contentId, contentType)
    setShelfOpen(storeKey)
  }

  const getUpstreamContext = () => {
    return createUpstreamContext({
      storeKey,
      screenType: SCREEN_TYPE_DETAIL_VIDEO,
      screenParam: detail.getIn(['data', 'id']),
    })
  }

  const renderItem = (item, params) => {
    const { openShelf, focused, index, itemShelfIsOpen, hideShelf } = params

    const videoId = Number(item.get('id'))
    const shelfOpened = openShelfRowId === storeKey

    return (
      <TileHoverVideo
        id={videoId}
        index={index}
        location={location}
        hovered={focused}
        onOpenShelf={openShelf}
        anyShelfOpened={shelfOpened}
        shelfOpened={itemShelfIsOpen}
        upstreamContext={getUpstreamContext()}
        hideShelf={hideShelf}
        legacyVideo
        legacyVideoData={item}
      />
    )
  }

  const renderItems = () => {
    return (
      <Row
        items={tilesData}
        shelfOpened={openShelfRowId === storeKey}
        onOpenShelf={handleOpenShelf}
        closeShelf={() => null}
        upstreamContext={getUpstreamContext()}
        createAccessor={() => null}
        clearOpenShelfIndex={clearOpenShelfRowId}
      >{(item, data) => renderItem(item, data)}
      </Row>
    )
  }

  return (
    <div className="video-row">
      {renderItems()}
    </div>
  )
}

VideoRow.propTypes = {
  location: PropTypes.object.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  storeKey: PropTypes.string.isRequired,
  openShelfRowId: PropTypes.string,
  setShelfOpen: PropTypes.func.isRequired,
  clearOpenShelfRowId: PropTypes.func.isRequired,
}

VideoRow.defaultProps = {
  tiles: Map(),
}

export default compose(
  connectRedux(
    (state, props) => {
      const { storeKey } = props

      return {
        tiles: state.tiles.get(storeKey),
        detail: state.detail,
      }
    },
  ),
)(VideoRow)
