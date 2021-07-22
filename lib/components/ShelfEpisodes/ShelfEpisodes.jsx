import PropTypes from 'prop-types'
import React from 'react'
import TileGrid from 'components/TileGrid'
import FilterSeason from 'components/FilterSeason'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import { connect as connectTiles } from 'components/Tiles/connect'
import { Map, List } from 'immutable'
import { partial as _partial } from 'lodash'
import { RENDER_TYPE_TILE_GRID_ROW } from 'render'
import { STORE_KEY_SHELF_EPISODES } from 'services/store-keys'
import { TYPE_SERIES_SEASON } from 'services/tiles'
import {
  TYPE_PRODUCT_EPISODIC,
  TYPE_PRODUCT_SEGMENTED,
} from 'services/content-type'
import { H3 } from 'components/Heading'

function renderTileGrid (props) {
  if (!props.tiles.has('data')) {
    return null
  }

  return (
    <TileGrid
      tileGridData={props.tiles.getIn(['data', 'titles'])}
      displayType={RENDER_TYPE_TILE_GRID_ROW}
      scrollable
      scrollableTileIndex={props.scrollableTileIndex}
      scrollableRowWidth={props.scrollableRowWidth}
      setScrollableRowWidth={props.setTilesScrollableRowWidth}
      setScrollableTileIndex={props.setTilesScrollableTileIndex}
      moreInfoVisible={false}
      rowId={STORE_KEY_SHELF_EPISODES}
      location={props.location}
      auth={props.auth}
      upstreamContext={props.upstreamContext}
    />
  )
}

function onSeasonChange (e, props) {
  const { getTilesDataCreate, user = Map() } = props
  const language = user.getIn(['data', 'language'], List())
  getTilesDataCreate({ season: e.value, language })
}

function getClassName (inputClassName) {
  return ['shelf-episodes'].concat(inputClassName || []).join(' ')
}

function getContainerClassName (seasonNums, productType) {
  const className = ['shelf-episodes__container']

  if (getSeasonsFilterVisible(seasonNums, productType)) {
    className.push('shelf-episodes__container--filter-visible')
  }
  return className.join(' ')
}

function getSeasonsFilterVisible (seasonNums, productType) {
  return (
    seasonNums.size > 1 &&
    (productType === TYPE_PRODUCT_EPISODIC ||
      productType === TYPE_PRODUCT_SEGMENTED)
  )
}

function ShelfEpisodes (props) {
  const { shelf, className, tiles, staticText } = props

  const data = shelf.get('data', Map())
  const seasonNums = data.get('seasonNums', List())
  const productType = data.getIn(['type', 'product'])
  const filterVisible = getSeasonsFilterVisible(seasonNums, productType)

  return (
    <div className={getClassName(className)}>
      <H3 className={'shelf-episodes__title'}>
        {`${staticText.get('moreEpisodesFrom')} ${shelf.getIn([
          'data',
          'seriesTitle',
        ])}`}
      </H3>
      {!filterVisible ? null : (
        <FilterSeason
          defaultSeason={tiles.get('season')}
          onSeasonChange={_partial(onSeasonChange, _partial.placeholder, props)}
          seasonNums={seasonNums}
        />
      )}
      <div className={getContainerClassName(seasonNums, productType)}>
        {renderTileGrid(props)}
      </div>
    </div>
  )
}

ShelfEpisodes.propTypes = {
  className: PropTypes.array,
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
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

const connectedShelfEpisodes = connect(state => ({
  staticText: state.staticText.getIn(['data', 'shelfEpisodes', 'data']),
  user: state.user,
}))(ShelfEpisodes)

const connectedShelfEpisodesTiles = connectTiles({
  storeKey: STORE_KEY_SHELF_EPISODES,
  type: TYPE_SERIES_SEASON,
  parentStateAsId: true,
  parentStateKey: 'shelf',
})(connectedShelfEpisodes)

export default connectedShelfEpisodesTiles
