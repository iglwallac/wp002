import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React from 'react'
import { Map, List } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectTiles } from 'components/Tiles/connect'
import _includes from 'lodash/includes'
import _get from 'lodash/get'
import _assign from 'lodash/assign'
import { TYPE_SERIES_SEASON } from 'services/tiles'
import {
  STORE_KEY_DETAIL_SERIES_SEASON,
} from 'services/store-keys'
import {
  createUpstreamContext,
  SCREEN_TYPE_DETAIL_SERIES,
} from 'services/upstream-context'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import TileGrid from 'components/TileGrid'
import TileRows from 'components/TileRows'
import InlineSeasonNav from 'components/InlineSeasonNav'
import { H3 } from 'components/Heading'
import LoadMore from 'components/LoadMore'
import {
  historyRedirect,
  HISTORY_METHOD_REPLACE,
} from 'services/navigation'


const SEASON_LINK = 'season-link'
const SEASON_DROPDOWN = 'season-dropdown'

function DetailSeriesSeasons (props) {
  const { tiles, location, auth, detail, staticText, getTilesDataLoadMore } = props
  const seasonNumbers = detail.getIn(['data', 'seasonNums'], List())
  const shouldRenderSeasonsFilter = seasonNumbers.size > 1
  const detailData = detail.get('data', Map())
  const tilesProcessing = tiles.getIn([STORE_KEY_DETAIL_SERIES_SEASON, 'processing'])
  const titlesCount = tiles.getIn([STORE_KEY_DETAIL_SERIES_SEASON, 'data', 'titles'], List()).size
  const totalTilesCount = tiles.getIn([STORE_KEY_DETAIL_SERIES_SEASON, 'data', 'totalCount'], 0)

  const historyRedirectOnSeasonChange = (season) => {
    const { history, language } = props
    const { pathname, query } = location

    // If season is in the query do a replace so we don't get a a confusing history.
    const historyMethod = _get(location, ['query', 'season'])
      ? HISTORY_METHOD_REPLACE
      : undefined
    historyRedirect({
      history,
      url: pathname,
      query: _assign({}, query, { season }),
      auth,
      language,
      historyMethod,
    })
  }

  const onClickSeasonLink = (e) => {
    const season = e.target.getAttribute('data-season')

    historyRedirectOnSeasonChange(season)
  }

  const renderSeasonsFilter = () => {
    const {
      getDetailSeriesSeason,
    } = props

    // get the season using a function from the connectTiles HOC
    const tileSeason = getDetailSeriesSeason()
    const seasons = detail
      .getIn(['data', 'seasonNums'], List())
      .reduce((list, seasonNumber) => {
        const season = Map({
          name: `${staticText.getIn(['data', 'season'])} ${seasonNumber}`,
          value: seasonNumber,
          element: SEASON_DROPDOWN,
        })
        return list.push(season)
      }, List())

    const defaultOption = seasons.find(season => season.get('value') === tileSeason) || Map()

    return (
      <div className="detail-series__season-filter-wrapper">
        <InlineSeasonNav
          seasons={seasons}
          element={SEASON_LINK}
          onClickSeasonLink={onClickSeasonLink}
          currentSeason={defaultOption.get('value', null)}
        />
      </div>
    )
  }

  const renderTileGrid = () => {
    const {
      setEventSeriesVisited,
      setEventVideoVisited,
    } = props

    if (!tiles.getIn([STORE_KEY_DETAIL_SERIES_SEASON, 'data'])) {
      return null
    }

    const seasonNum = tiles.getIn([STORE_KEY_DETAIL_SERIES_SEASON, 'season'], 1)

    return (
      <TileGrid
        title={null}
        rowId={STORE_KEY_DETAIL_SERIES_SEASON}
        tileGridClass={['detail-series-seasons__tiles']}
        activeTileId={tiles.getIn([STORE_KEY_DETAIL_SERIES_SEASON, 'activeId'])}
        tileGridData={tiles.getIn([STORE_KEY_DETAIL_SERIES_SEASON, 'data', 'titles'])}
        displayType={RENDER_TYPE_TILE_GRID_GALLERY}
        moreInfoVisible
        scrollable={false}
        location={location}
        auth={auth}
        setEventSeriesVisited={setEventSeriesVisited}
        setEventVideoVisited={setEventVideoVisited}
        upstreamContext={createUpstreamContext({
          storeKey: STORE_KEY_DETAIL_SERIES_SEASON,
          screenType: SCREEN_TYPE_DETAIL_SERIES,
          screenParam: detail.getIn(['data', 'id']),
          seasonNum,
        })}
      />
    )
  }

  const renderTileRows = () => {
    const {
      shelf,
      tileRows,
      setShelfVisible,
      getShelfData,
      setTileRowsRowActiveId,
      setTileRowsActiveId,
      setTilesScrollableRowWidth,
      setTilesScrollableTileIndex,
    } = props

    return (
      <TileRows
        tileRows={tileRows}
        storeKey={STORE_KEY_DETAIL_SERIES_SEASON}
        shelf={shelf}
        auth={auth}
        location={location}
        setScrollableTileIndex={setTilesScrollableTileIndex}
        setScrollableRowWidth={setTilesScrollableRowWidth}
        setTileRowsActiveId={setTileRowsActiveId}
        setTileRowsRowActiveId={setTileRowsRowActiveId}
        setShelfVisible={setShelfVisible}
        getShelfData={getShelfData}
        upstreamContext={createUpstreamContext({
          screenType: SCREEN_TYPE_DETAIL_SERIES,
          screenParam: detail.getIn(['data', 'id']),
        })}
        useShelfV2
      >
        {renderTileGrid()}
      </TileRows>
    )
  }

  const renderLoadMore = () => {
    return (
      <div className="detail-series-seasons__bottom">
        {tilesProcessing ? null : (
          <LoadMore
            onClickLoadMore={getTilesDataLoadMore}
            buttonClassName={[
              'detail-series-seasons__load-more',
              'button--secondary',
            ]}
            currentCount={titlesCount}
            totalCount={totalTilesCount}
            processing={tilesProcessing}
          />
        )}
      </div>
    )
  }

  if (detailData.size === 0) {
    return null
  }

  return (
    <div className="detail-series-seasons">
      <H3 className="detail-series-seasons__title">
        {staticText.getIn(['data', 'episodes'])}
      </H3>
      {
        shouldRenderSeasonsFilter ?
          renderSeasonsFilter()
          : null
      }
      {renderTileRows()}
      {renderLoadMore()}
    </div>
  )
}

DetailSeriesSeasons.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  detail: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  setTilesActiveId: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
  getTilesDataLoadMore: PropTypes.func.isRequired,
  getDetailSeriesSeason: PropTypes.func.isRequired,
}

DetailSeriesSeasons.defaultProps = {
  tiles: Map(),
  tileRows: Map(),
}

export default compose(
  connectTiles({
    storeKey: STORE_KEY_DETAIL_SERIES_SEASON,
    type: TYPE_SERIES_SEASON,
    enablePageBehaviors: true,
  }),
  connectRedux(
    (state) => {
      const storeKeyList = [
        STORE_KEY_DETAIL_SERIES_SEASON,
      ]
      const tiles = state.tiles.filter((val, key) => _includes(storeKeyList, key))
      const tileRows = state.tileRows.filter((val, key) => _includes(storeKeyList, key))

      return {
        tiles,
        tileRows,
        shelf: state.shelf,
        auth: state.auth,
        detail: state.detail,
        language: state.user.getIn(['data', 'language'], List()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setTilesActiveId: actions.tiles.setTilesActiveId,
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setShelfVisible: actions.shelf.setShelfVisible,
        getShelfData: actions.shelf.getShelfData,
        setEventVideoVisited: actions.eventTracking.setEventVideoVisited,
        setEventSeriesVisited: actions.eventTracking.setEventSeriesVisited,
      }
    },
  ),
  connectStaticText({ storeKey: 'detailSeriesSeasons' }),
)(DetailSeriesSeasons)
