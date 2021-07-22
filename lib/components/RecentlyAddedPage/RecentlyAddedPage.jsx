import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as reduxConnect } from 'react-redux'
import { compose } from 'recompose'
import _includes from 'lodash/includes'
import _get from 'lodash/get'
import _parseInt from 'lodash/parseInt'
import { getBoundActions } from 'actions'
import { Map, List } from 'immutable'
import TileGrid from 'components/TileGrid'
import TileRows from 'components/TileRows'
import LoadMore from 'components/LoadMore'
import Pager from 'components/Pager'
import BackToTop from 'components/BackToTop'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import { TYPE_RECENTLY_ADDED } from 'services/tiles'
import {
  STORE_KEY_RECENTLY_ADDED,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_RELATED,
  STORE_KEY_SHELF_FEATURED_EPISODE,
} from 'services/store-keys'
import TileRowTitle from 'components/TileRowTitle'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'
import connectCommentsLoader from 'components/CommentsLoader/connect'
import { connect as connectTiles } from 'components/Tiles/connect'
import { connect as languageConnect } from 'components/Language/connect'
import {
  SCREEN_TYPE_RECENTLY_ADDED,
  createUpstreamContext,
} from 'services/upstream-context'
import { H1, H6 } from 'components/Heading'

function createOnLanguageChange (actions) {
  return actions.tiles.resetTilesData
}

function getTilesState (storeKey, props) {
  const { tiles } = props
  return tiles
}

function getCurrentPage (props) {
  const { location } = props
  return _parseInt(_get(location, ['query', 'page']))
}

function renderTitleElement (title) {
  if (title) {
    return (
      <TileRowTitle
        className={['recently-added-page__tile-row-title']}
        title={title}
      />
    )
  }
  return null
}

function renderTileGrid (
  tilesGridData,
  tilesState,
  location,
  auth,
  rowId,
  title,
  key,
) {
  const titleElement = renderTitleElement(title)

  return (
    <TileGrid
      title={titleElement}
      key={key}
      rowId={rowId}
      activeTileId={tilesState.get('activeId')}
      tileGridData={tilesGridData}
      displayType={RENDER_TYPE_TILE_GRID_GALLERY}
      moreInfoVisible
      scrollable={false}
      location={location}
      auth={auth}
      upstreamContext={createUpstreamContext({
        screenType: SCREEN_TYPE_RECENTLY_ADDED,
        storeKey: STORE_KEY_RECENTLY_ADDED,
      })}
    />
  )
}

function getThisWeekTiles (tiles, currentWeek) {
  return tiles.filter(tile => tile.get('created') >= currentWeek)
}

function getLastWeekTiles (tiles, currentWeek) {
  return tiles.filter(tile => tile.get('created') < currentWeek)
}

function renderWeeklyGrid (tilesState, titles, props, storeKey) {
  const { location, auth, recentlyAdded, staticText } = props
  const currentWeek = recentlyAdded.getIn(['data', 'currentWeek'], 0)
  const thisWeekTiles = getThisWeekTiles(titles, currentWeek)
  const lastWeekTiles = getLastWeekTiles(titles, currentWeek)
  const tileElements = []

  if (thisWeekTiles.size) {
    tileElements.push(
      renderTileGrid(
        thisWeekTiles,
        tilesState,
        location,
        auth,
        storeKey,
        staticText.getIn(['data', 'newThisWeek']),
        'tilegrid-thisweek',
      ),
    )
  }

  if (lastWeekTiles.size) {
    tileElements.push(
      renderTileGrid(
        lastWeekTiles,
        tilesState,
        location,
        auth,
        storeKey,
        staticText.getIn(['data', 'catchUpOnLastWeek']),
        'tilegrid-lastweek',
      ),
    )
  }

  return tileElements
}

function renderTileRows (props, storeKey) {
  const tilesState = getTilesState(storeKey, props)
  if (!tilesState.get('data')) {
    return null
  }

  const tilesProcessing = tilesState.get('processing')
  const titles = tilesState.getIn(['data', 'titles'], List())

  if (tilesProcessing) {
    return renderTileGrid(
      titles,
      tilesState,
      props.location,
      props.auth,
      storeKey,
      null,
      'tilegrid-processing',
    )
  }

  return renderWeeklyGrid(tilesState, titles, props, storeKey)
}

class RecentlyAddedPage extends PureComponent {
  componentDidMount () {
    const props = this.props
    const { page, recentlyAdded, getRecentlyAddedData } = props
    const locale = page.get('locale')
    if (recentlyAdded.size === 0) {
      getRecentlyAddedData(locale)
    }
  }

  onClickLoadMore = (e) => {
    const { props } = this
    const { getTilesDataLoadMore } = props

    getTilesDataLoadMore(e)
  }

  render () {
    const { props, onClickLoadMore } = this
    const {
      recentlyAdded,
      tileRows,
      shelf,
      auth,
      location,
      history,
      children,
      tiles,
      staticText,
      setScrollableTileIndex,
      setScrollableRowWidth,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      setShelfVisible,
      getShelfData,
    } = props
    const dateToday = recentlyAdded.getIn(['data', 'dateTimeText'])
    const placeholderTitlesExist = tiles.get('placeholderTitlesExist')
    const titlesCount = tiles.getIn(['data', 'titles'], List()).size
    const totalTilesCount = tiles.getIn(['data', 'totalCount'], 0)
    const totalPages = tiles.getIn(['data', 'totalPages'], 0)
    const processing = tiles.get('processing')
    const queryPage = getCurrentPage(props)
    const currentPage = queryPage || 1

    return (
      <div className="recently-added-page">
        <header className="recently-added-page__header">
          <H6 className="recently-added-page__date">{dateToday}</H6>
          <H1 className="recently-added-page__title">
            {staticText.getIn(['data', 'newOnGaia'])}
          </H1>
          <p className="recently-added-page__intro">
            {staticText.getIn(['data', 'stayUpToDate'])}
          </p>
        </header>
        <TileRows
          tileRows={tileRows}
          storeKey={STORE_KEY_RECENTLY_ADDED}
          shelf={shelf}
          auth={auth}
          location={location}
          setScrollableTileIndex={setScrollableTileIndex}
          setScrollableRowWidth={setScrollableRowWidth}
          setTileRowsActiveId={setTileRowsActiveId}
          setTileRowsRowActiveId={setTileRowsRowActiveId}
          setShelfVisible={setShelfVisible}
          getShelfData={getShelfData}
          upstreamContext={createUpstreamContext({
            screenType: SCREEN_TYPE_RECENTLY_ADDED,
          })}
        >
          {renderTileRows(props, TYPE_RECENTLY_ADDED)}
          {children}
        </TileRows>
        <div className="recently-added-page__bottom">
          {
            placeholderTitlesExist ||
            processing ||
            totalPages < 2 ||
            currentPage === totalPages ||
            currentPage !== 1 ? null :
              (
                <LoadMore
                  onClickLoadMore={onClickLoadMore}
                  buttonClassName={[
                    'recently-added-page__load-more-button',
                    'button--secondary',
                  ]}
                  currentCount={titlesCount}
                  totalCount={totalTilesCount}
                  processing={processing}
                />
              )
          }
          {
            placeholderTitlesExist ||
            processing ||
            (currentPage === 1) ||
            totalPages < 2 ? null :
              (
                <Pager location={location} history={history} total={totalPages} />
              )
          }
          <BackToTop />
        </div>
      </div>
    )
  }
}

RecentlyAddedPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  recentlyAdded: ImmutablePropTypes.map.isRequired,
  updateTilesSeasonData: PropTypes.func.isRequired,
  getTilesSeriesData: PropTypes.func.isRequired,
  getTilesEpisodeData: PropTypes.func.isRequired,
  setShelfActiveTab: PropTypes.func.isRequired,
  getTilesDataLoadMore: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setScrollableRowWidth: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  setShelfDataUserPlaylist: PropTypes.func.isRequired,
  setScrollableTileIndex: PropTypes.func.isRequired,
  getRecentlyAddedData: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
}

export default compose(
  reduxConnect(
    (state) => {
      const storeKeyList = [
        STORE_KEY_RECENTLY_ADDED,
        STORE_KEY_SHELF_EPISODES_NEXT,
        STORE_KEY_SHELF_EPISODES,
        STORE_KEY_SHELF_RELATED,
        STORE_KEY_SHELF_FEATURED_EPISODE,
      ]
      const tileRows = state.tileRows.filter((val, key) => _includes(storeKeyList, key))
      return {
        recentlyAdded: state.recentlyAdded,
        auth: state.auth,
        tiles: state.tiles.get(STORE_KEY_RECENTLY_ADDED, Map()),
        shelf: state.shelf,
        tileRows,
        page: state.page,
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getRecentlyAddedData: actions.recentlyAdded.getRecentlyAddedData,
        updateTilesSeasonData: actions.tiles.updateTilesSeasonData,
        getTilesSeriesData: actions.tiles.getTilesSeriesData,
        getTilesEpisodeData: actions.tiles.getTilesEpisodeData,
        setShelfActiveTab: actions.shelf.setShelfActiveTab,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setShelfVisible: actions.shelf.setShelfVisible,
        setShelfDataUserPlaylist: actions.shelf.setShelfDataUserPlaylist,
        getShelfData: actions.shelf.getShelfData,
      }
    },
  ),
  connectCommentsLoader(),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectTiles({
    storeKey: STORE_KEY_RECENTLY_ADDED,
    type: TYPE_RECENTLY_ADDED,
    enablePageBehaviors: true,
  }),
  connectStaticText({
    storeKey: 'recentlyAddedPage',
  }),
  languageConnect({ createOnLanguageChange }),
)(RecentlyAddedPage)
