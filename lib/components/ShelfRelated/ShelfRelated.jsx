import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import TileGrid from 'components/TileGrid'
import { H3 } from 'components/Heading'
import { connect } from 'react-redux'
import { RENDER_TYPE_TILE_GRID_ROW } from 'render'
import { STORE_KEY_SHELF_RELATED } from 'services/store-keys'

function renderTileGrid (props) {
  const {
    auth,
    tiles,
    location,
    upstreamContext,
    scrollableRowWidth,
    scrollableTileIndex,
    setTilesScrollableRowWidth,
    setTilesScrollableTileIndex,
  } = props
  if (!props.tiles.has('data')) {
    return null
  }

  return (
    <TileGrid
      auth={auth}
      scrollable
      location={location}
      moreInfoVisible={false}
      upstreamContext={upstreamContext}
      rowId={STORE_KEY_SHELF_RELATED}
      scrollableRowWidth={scrollableRowWidth}
      displayType={RENDER_TYPE_TILE_GRID_ROW}
      scrollableTileIndex={scrollableTileIndex}
      tileGridData={tiles.getIn(['data', 'titles'])}
      setScrollableRowWidth={setTilesScrollableRowWidth}
      setScrollableTileIndex={setTilesScrollableTileIndex}
    />
  )
}

function ShelfRelated (props) {
  const { className, staticText } = props
  const itemClass = className ? className.join(' ') : null

  return (
    <div className={itemClass ? `shelf-related ${itemClass}` : 'shelf-related'}>
      <H3 className="shelf-related__title">{staticText.get('related')}</H3>
      <div className="shelf-related--container">{renderTileGrid(props)}</div>
    </div>
  )
}

ShelfRelated.propTypes = {
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  className: PropTypes.array,
  scrollableTileIndex: PropTypes.number,
  scrollableRowWidth: PropTypes.number,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  upstreamContext: ImmutablePropTypes.map,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'shelfRelated', 'data']),
}))(ShelfRelated)
