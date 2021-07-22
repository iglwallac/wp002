import _includes from 'lodash/includes'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { compose } from 'recompose'
import { getBoundActions } from 'actions'
import Loadable from 'react-loadable'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as languageConnect } from 'components/Language/connect'
import { connect as connectTiles } from 'components/Tiles/connect'
import TileRows from 'components/TileRows'
import TileGrid from 'components/TileGrid'
import LoadMore from 'components/LoadMore'
import WatchHistoryEdit from 'components/WatchHistoryEdit'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import { STORE_KEY_WATCH_HISTORY } from 'services/store-keys'
import { TYPE_WATCH_HISTORY } from 'services/tiles'
import { ERROR_TYPE_403 } from 'components/ErrorPage/types'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { Button, TYPES as BUTTON_TYPES } from 'components/Button.v2'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import {
  createUpstreamContext,
  SCREEN_TYPE_WATCH_HISTORY,
} from 'services/upstream-context'
import { isInHideWatched } from 'services/hide-watched'
import { H1 } from 'components/Heading'
import EmptyWatchHistory from './EmptyWatchHistory'

const LoadableErrorPage = Loadable({
  loader: () => import('components/ErrorPage'),
  loading: () => <Sherpa type={TYPE_LARGE} />,
})

function createOnLanguageChange (actions) {
  return actions.tiles.resetTilesData
}

class WatchHistory extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { resetTilesData } = this.props
    // refresh/reload watched history to be certain it is current
    resetTilesData()
  }

  componentDidUpdate (prevProps) {
    const { hideWatchedSaved, resetTilesData } = this.props
    if (hideWatchedSaved && !prevProps.hideWatchedSaved) {
      resetTilesData()
    }
  }

  renderTileGrid = () => {
    const {
      props,
    } = this
    const {
      watchHistoryTiles,
      location,
      auth,
      staticText,
      editMode,
      hideWatched,
      addOrRemoveHideWatched,
      editHideWatched,
      cancelEditHideWatched,
      saveHideWatched,
    } = props

    const tilesData = watchHistoryTiles.get('data', Map())
    const titles = tilesData.get('titles', List())

    const tileGridData = editMode ?
      titles.map((item) => {
        const id = item.get('id')
        const title = item.get('title')
        const watchHistoryEditComponent = (
          <WatchHistoryEdit
            onClick={() => { addOrRemoveHideWatched({ id, title }) }}
            inHideWatchHistory={isInHideWatched(hideWatched, id)}
          />
        )
        return item.set('hideWatchedEditComponent', watchHistoryEditComponent)
      })
      :
      titles

    const EditButtonsComponent = (
      <div className="watch-history__button-container">
        <Button
          type={BUTTON_TYPES.GHOST}
          onClick={editHideWatched}
          className="watch-history__button-edit"
        >
          <span className="watch-history__button-text">
            {staticText.getIn(['data', 'edit'])}
          </span>
          <IconV2 type={ICON_TYPES.PENCIL} />
        </Button>
      </div>
    )

    const CancelSaveButtonsComponent = (
      <div className="watch-history__button-container">
        <Button
          type={BUTTON_TYPES.GHOST}
          className="watch-history__button-cancel"
          onClick={() => { cancelEditHideWatched() }}
        >
          <span className="watch-history__button-text">
            {staticText.getIn(['data', 'cancel'])}
          </span>
        </Button>
        { !hideWatched.isEmpty() &&
        <Button
          type={BUTTON_TYPES.GHOST}
          className="watch-history__button-save"
          onClick={() => { saveHideWatched() }}
        >
          <span className="watch-history__button-text">
            {staticText.getIn(['data', 'save'])}
          </span>
          <IconV2 type={ICON_TYPES.CHECK} />
        </Button>
        }
      </div>
    )

    const titleComponent = (
      <TestarossaSwitch>
        <TestarossaCase campaign="ME-3043" variation={1} unwrap>
          {() => (
            <div className="watch-history__title-container">
              <H1 className="watch-history__title">
                {staticText.getIn(['data', 'title'])}
              </H1>
              {editMode ? CancelSaveButtonsComponent : EditButtonsComponent}
            </div>
          )}
        </TestarossaCase>
        <TestarossaDefault unwrap>
          {() => (
            <H1 className="tile-grid__title">{staticText.getIn(['data', 'title'])}</H1>
          )}
        </TestarossaDefault>
      </TestarossaSwitch>
    )

    return (
      <TileGrid
        title={titleComponent}
        key="watch-history-grid"
        rowId={STORE_KEY_WATCH_HISTORY}
        activeTileId={tilesData.get('activeId')}
        tileGridData={tileGridData}
        displayType={RENDER_TYPE_TILE_GRID_GALLERY}
        moreInfoVisible
        scrollable={false}
        location={location}
        auth={auth}
        upstreamContext={createUpstreamContext({
          screenType: SCREEN_TYPE_WATCH_HISTORY,
          contextType: SCREEN_TYPE_WATCH_HISTORY,
        })}
      />
    )
  }

  render () {
    const {
      props,
      renderTileGrid,
    } = this

    const {
      tileRows,
      shelf,
      auth,
      watchHistoryTiles,
      location,
      setScrollableTileIndex,
      setScrollableRowWidth,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      setShelfVisible,
      getShelfData,
      getTilesDataLoadMore,
      staticText,
    } = props

    if (!auth.get('jwt')) {
      return <LoadableErrorPage location={location} code={ERROR_TYPE_403} />
    }

    const titlesCount = watchHistoryTiles.getIn(['data', 'titles'], List()).size
    const totalTilesCount = watchHistoryTiles.getIn(['data', 'totalCount'], 0)
    const watchHistoryProcessing = watchHistoryTiles.get('processing')

    return (
      <React.Fragment>
        {titlesCount === 0 ? (
          <EmptyWatchHistory staticText={staticText} />
        ) : (
          <div className="watch-history">
            <TileRows
              tileRows={tileRows}
              storeKey={STORE_KEY_WATCH_HISTORY}
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
                screenType: SCREEN_TYPE_WATCH_HISTORY,
              })}
            >
              { renderTileGrid() }
            </TileRows>
            <div className="watch-history__load-more-button-container">
              <LoadMore
                onClickLoadMore={getTilesDataLoadMore}
                buttonClassName={[
                  'detail-series__load-more-button',
                  'button--secondary',
                ]}
                currentCount={titlesCount}
                totalCount={totalTilesCount}
                processing={watchHistoryProcessing}
              />
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }
}

WatchHistory.proptypes = {
  setShelfActiveTab: PropTypes.func.isRequired,
  setScrollableTileIndex: PropTypes.func.isRequired,
  setScrollableRowWidth: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  setShelfDataUserPlaylist: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
  history: ImmutablePropTypes.map.isRequired,
  location: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  getTilesDataLoadMore: PropTypes.func.isRequired,
  hideWatched: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    (state) => {
      const tileRows = state.tileRows.filter(
        (val, key) => _includes(STORE_KEY_WATCH_HISTORY, key),
      )
      return {
        auth: state.auth,
        shelf: state.shelf,
        page: state.page,
        watchHistoryTiles: state.tiles.get(STORE_KEY_WATCH_HISTORY, Map()),
        tileRows,
        hideWatched: state.hideWatched.get('data', List()),
        editMode: state.hideWatched.get('editMode', false),
        hideWatchedSaved: state.hideWatched.get('saveDone', false),
        staticText: state.staticText.getIn(['data', 'watchHistory'], Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setShelfActiveTab: actions.shelf.setShelfActiveTab,
        setScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setShelfVisible: actions.shelf.setShelfVisible,
        setShelfDataUserPlaylist: actions.shelf.setShelfDataUserPlaylist,
        getShelfData: actions.shelf.getShelfData,
        addOrRemoveHideWatched: actions.hideWatched.addOrRemoveHideWatched,
        editHideWatched: actions.hideWatched.editHideWatched,
        cancelEditHideWatched: actions.hideWatched.cancelEditHideWatched,
        saveHideWatched: actions.hideWatched.saveHideWatched,
        resetTilesData: actions.tiles.resetTilesData,
      }
    },
  ),
  connectStaticText({
    storeKey: STORE_KEY_WATCH_HISTORY,
  }),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectTiles({
    storeKey: STORE_KEY_WATCH_HISTORY,
    type: TYPE_WATCH_HISTORY,
    enablePageBehaviors: true,
    attachProps: true,
  }),
  languageConnect({ createOnLanguageChange }),
)(WatchHistory)
