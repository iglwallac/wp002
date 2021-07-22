import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { RENDER_TYPE_TILE_GRID_ROW } from 'render'
import { STORE_KEY_SHELF_EPISODES_NEXT } from 'services/store-keys'
import TileGrid from 'components/TileGrid'
import { H3 } from 'components/Heading'

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
      tileGridData={tiles.getIn(['data', 'titles'])}
      displayType={RENDER_TYPE_TILE_GRID_ROW}
      scrollable
      scrollableTileIndex={scrollableTileIndex}
      scrollableRowWidth={scrollableRowWidth}
      setScrollableRowWidth={setTilesScrollableRowWidth}
      setScrollableTileIndex={setTilesScrollableTileIndex}
      moreInfoVisible={false}
      rowId={STORE_KEY_SHELF_EPISODES_NEXT}
      location={location}
      auth={auth}
      upstreamContext={upstreamContext}
    />
  )
}

function getClassName (inputClassName) {
  return ['shelf-next-episodes'].concat(inputClassName || []).join(' ')
}

function ShelfNextEpisodes (props) {
  const { className, shelf, staticText } = props
  return (
    <div className={getClassName(className)}>
      <H3 className={'shelf-next-episodes__title'}>
        {`${staticText.get('moreEpisodesFrom')} ${shelf.getIn([
          'data',
          'seriesTitle',
        ])}`}
      </H3>
      <div className="shelf-next-episodes__container">
        {renderTileGrid(props)}
      </div>
    </div>
  )
}

ShelfNextEpisodes.propTypes = {
  className: PropTypes.array,
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  scrollableTileIndex: PropTypes.number,
  scrollableRowWidth: PropTypes.number,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  updateTilesSeasonData: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  upstreamContext: ImmutablePropTypes.map,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'shelfNextEpisodes', 'data']),
}))(ShelfNextEpisodes)
