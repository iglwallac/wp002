import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { compose } from 'recompose'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import { TYPE_PLAYLIST } from 'services/tiles'
import {
  STORE_KEY_PLAYLIST,
  STORE_KEY_PLAYLIST_DEFAULT,
  STORE_KEY_SHELF_EPISODES,
  STORE_KEY_SHELF_EPISODES_NEXT,
  STORE_KEY_SHELF_RELATED,
} from 'services/store-keys'
import { connect as connectRedux } from 'react-redux'
import { PLAYLIST_EDIT_COMPLETE } from 'services/playlist'
import _partial from 'lodash/partial'
import _includes from 'lodash/includes'
import Loadable from 'react-loadable'
import { ERROR_TYPE_403 } from 'components/ErrorPage/types'
import PlaylistHeader from 'components/PlaylistHeader'
import SherpaMessage from 'components/SherpaMessage'
import TileRows from 'components/TileRows'
import TileGrid from 'components/TileGrid'
import PlaylistEdit from 'components/PlaylistEdit'
import PlaylistEditLink from 'components/PlaylistEditLink'
import LoadMore from 'components/LoadMore'
import BackToTop from 'components/BackToTop'
import CommentsLoader from 'components/CommentsLoader'
import PlaylistEmpty from 'components/PlaylistEmpty'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'
import { connect as connectTiles } from 'components/Tiles/connect'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { getPrimary } from 'services/languages'
import {
  SCREEN_TYPE_PLAYLIST,
  createUpstreamContext,
} from 'services/upstream-context'

const LoadableErrorPage = Loadable({
  loader: () => import('components/ErrorPage'),
  loading: () => <Sherpa type={TYPE_LARGE} />,
})

function getTilesState (storeKey, props) {
  const { tiles } = props
  return tiles.get(storeKey, Map())
}

function onClickEdit (storeKey, index, id, playlist, setPlaylistQueueItem) {
  setPlaylistQueueItem(storeKey, index, id, playlist)
}

function renderTileGrid (
  tileStoreKey,
  playlistStoreKey,
  props,
  rowId,
  editMode,
  setPlaylistQueueItem,
  tileGridClass,
) {
  const { playlist, location, auth } = props
  const tilesState = getTilesState(tileStoreKey, props)
  let tileGridData
  if (!tilesState.get('data')) {
    return null
  }

  if (
    (tilesState.getIn(['data', 'totalCount']) === 0 ||
      tilesState.getIn(['data', 'titles']).size === 0) &&
    !tilesState.get('processing', false)
  ) {
    return <PlaylistEmpty />
  }

  if (editMode) {
    tileGridData = tilesState
      .getIn(['data', 'titles'])
      .map((item, index) => {
        const inPlaylist = playlist.getIn(
          [playlistStoreKey, 'queue', index, 'playlist'],
          true,
        )
        const setPlaylistQueueItemPartial = _partial(
          onClickEdit,
          playlistStoreKey,
          index,
          item.get('id'),
          !inPlaylist,
          setPlaylistQueueItem,
        )
        const playlistEditComponent = (
          <PlaylistEdit
            onClick={setPlaylistQueueItemPartial}
            inPlaylist={!inPlaylist}
          />
        )
        return item.set('playlistEditComponent', playlistEditComponent)
      })
  } else {
    tileGridData = tilesState.getIn(['data', 'titles'])
  }

  return (
    <TileGrid
      rowId={rowId}
      tileGridClass={tileGridClass}
      activeTileId={tilesState.get('activeId')}
      tileGridData={tileGridData}
      displayType={RENDER_TYPE_TILE_GRID_GALLERY}
      moreInfoVisible
      scrollable={false}
      location={location}
      auth={auth}
      upstreamContext={createUpstreamContext({
        screenType: SCREEN_TYPE_PLAYLIST,
        screenParam: 'default',
        storeKey: rowId,
      })}
    />
  )
}

function renderPlaylistEditLink (
  auth,
  playlistStoreKey,
  tilesStoreKey,
  editMode,
  playlist,
  togglePlaylistEditMode,
  deletePlaylistIds,
  deleteTilesDataById,
  setShelfVisible,
  setTileRowsActiveId,
  setTileRowsRowActiveId,
) {
  return (
    <PlaylistEditLink
      auth={auth}
      playlistStoreKey={playlistStoreKey}
      tilesStoreKey={tilesStoreKey}
      editMode={editMode}
      playlist={playlist}
      togglePlaylistEditMode={togglePlaylistEditMode}
      deletePlaylistIds={deletePlaylistIds}
      deleteTilesDataById={deleteTilesDataById}
      setShelfVisible={setShelfVisible}
      setTileRowsActiveId={setTileRowsActiveId}
      setTileRowsRowActiveId={setTileRowsRowActiveId}
    />
  )
}

function renderLoadMore (
  titlesCount,
  totalTilesCount,
  processing,
  onClickLoadMore,
) {
  return (
    <LoadMore
      onClickLoadMore={onClickLoadMore}
      buttonClassName={['playlist__load-more-button', 'button--secondary']}
      currentCount={titlesCount}
      totalCount={totalTilesCount}
      processing={processing}
    />
  )
}

class PlaylistPage extends PureComponent {
  componentDidMount () {
    const { auth, getPlaylistLocalPref } = this.props
    getPlaylistLocalPref(
      STORE_KEY_PLAYLIST_DEFAULT,
      auth.get('uid'),
      PLAYLIST_EDIT_COMPLETE,
    )
  }

  componentWillReceiveProps (nextProps) {
    if (!process.env.BROWSER) {
      return
    }
    const { auth } = this.props
    const { auth: nextAuth, setPagePath, deleteTiles } = nextProps
    if (auth.get('jwt') !== nextAuth.get('jwt')) {
      // Set the path to nothing to trip setPageSeo to update page title
      // when logging in on the playlist page
      setPagePath('')
      deleteTiles(STORE_KEY_PLAYLIST)
    }
  }

  componentWillUnmount () {
    const {
      setShelfVisible,
      deleteTiles,
      setCommentsVisible,
      deletePlaylistQueue,
    } = this.props
    setShelfVisible(false)
    deleteTiles(STORE_KEY_PLAYLIST)
    setCommentsVisible(false)
    deletePlaylistQueue(STORE_KEY_PLAYLIST_DEFAULT)
  }

  render () {
    const { props } = this
    const {
      location,
      history,
      staticText,
      playlist,
      auth,
      user,
      shelf,
      tileRows,
    } = props
    const {
      togglePlaylistEditMode,
      deletePlaylistIds,
      deleteTilesDataById,
      setShelfVisible,
      getShelfData,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
      setTilesScrollableTileIndex,
      setTilesScrollableRowWidth,
      getTilesDataLoadMore,
      setPlaylistQueueItem,
    } = props
    const rowId = STORE_KEY_PLAYLIST
    const editMode = playlist.getIn(
      [STORE_KEY_PLAYLIST_DEFAULT, 'editMode'],
      false,
    )
    const sherpaMessage = `${staticText.getIn([
      'data',
      'quickTip',
    ])}: ${staticText.getIn(['data', 'click'])} ${String.fromCharCode(
      8216,
    )} ${staticText.getIn(['data', 'editPlaylist'])} ${String.fromCharCode(
      8217,
    )} ${staticText.getIn(['data', 'toManageYourPlaylist'])}`
    const editModeSherpaMessage = staticText.getIn([
      'data',
      'doneEditingBackToPlaylist',
    ])
    const tilesState = getTilesState(STORE_KEY_PLAYLIST, props)
    const hasTitles =
      tilesState.getIn(['data', 'titles'], List()).size > 0
    const titlesCount = tilesState.getIn(['data', 'titles'], List()).size
    const totalTilesCount = tilesState.getIn(['data', 'totalCount'], 0)
    const processing = tilesState.get('processing')
    const userLanguage = getPrimary(user.getIn(['data', 'language']))
    const playlistEditLinkComponent = renderPlaylistEditLink(
      auth,
      STORE_KEY_PLAYLIST_DEFAULT,
      STORE_KEY_PLAYLIST,
      editMode,
      playlist,
      togglePlaylistEditMode,
      deletePlaylistIds,
      deleteTilesDataById,
      setShelfVisible,
      setTileRowsActiveId,
      setTileRowsRowActiveId,
    )
    const sherpaMessageComponent = (
      <SherpaMessage
        message={editMode ? editModeSherpaMessage : sherpaMessage}
        language={userLanguage}
      />
    )
    const firstEditComplete = playlist.getIn(
      [STORE_KEY_PLAYLIST_DEFAULT, PLAYLIST_EDIT_COMPLETE],
      false,
    )

    if (!auth.get('jwt')) {
      return (
        <LoadableErrorPage
          history={history}
          location={location}
          code={ERROR_TYPE_403}
        />
      )
    }
    return (
      <div className="playlist">
        <CommentsLoader />
        <PlaylistHeader
          playlistEditLinkComponent={
            hasTitles ? (
              playlistEditLinkComponent
            ) : (
              <span className="playlist-edit-link__placeholder" />
            )
          }
        />
        <div className="playlist__sherpa">
          <div className="playlist__sherpa-inner">
            {hasTitles && !firstEditComplete ? (
              sherpaMessageComponent
            ) : (
              <span className="playlist__sherpa-placeholder" />
            )}
          </div>
        </div>
        <div className="playlist__content">
          <TileRows
            tileRows={tileRows}
            storeKey={STORE_KEY_PLAYLIST}
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
              screenType: SCREEN_TYPE_PLAYLIST,
            })}
            useShelfV2
          >
            {renderTileGrid(
              STORE_KEY_PLAYLIST,
              STORE_KEY_PLAYLIST_DEFAULT,
              props,
              rowId,
              editMode,
              setPlaylistQueueItem,
              ['playlist__tile-grid'],
            )}
          </TileRows>
        </div>
        <div className="playlist__bottom">
          {renderLoadMore(
            titlesCount,
            totalTilesCount,
            processing,
            getTilesDataLoadMore,
          )}
          <BackToTop />
        </div>
      </div>
    )
  }
}

PlaylistPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  shelf: ImmutablePropTypes.map.isRequired,
  tiles: ImmutablePropTypes.map.isRequired,
  playlist: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object.isRequired,
  tileRows: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  getPlaylistLocalPref: PropTypes.func.isRequired,
  setPagePath: PropTypes.func.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  getShelfData: PropTypes.func.isRequired,
  deleteTiles: PropTypes.func.isRequired,
  deletePlaylistQueue: PropTypes.func.isRequired,
  setCommentsVisible: PropTypes.func.isRequired,
  togglePlaylistEditMode: PropTypes.func.isRequired,
  deletePlaylistIds: PropTypes.func.isRequired,
  setPlaylistQueueItem: PropTypes.func.isRequired,
  deleteTilesDataById: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  getTilesDataLoadMore: PropTypes.func.isRequired,
  setTilesScrollableTileIndex: PropTypes.func.isRequired,
  setTilesScrollableRowWidth: PropTypes.func.isRequired,
}

export default compose(
  connectTiles({
    storeKey: STORE_KEY_PLAYLIST,
    type: TYPE_PLAYLIST,
    enablePageBehaviors: true,
  }),
  connectRedux(
    (state) => {
      const storeKeyList = [
        STORE_KEY_PLAYLIST,
        STORE_KEY_SHELF_EPISODES,
        STORE_KEY_SHELF_EPISODES_NEXT,
        STORE_KEY_SHELF_RELATED,
      ]
      const tileRows = state.tileRows.filter((val, key) => _includes(storeKeyList, key))
      const tiles = state.tiles.filter((val, key) =>
        _includes(storeKeyList, key) || key === 'scrollableRowWidth',
      )
      return {
        tiles,
        tileRows,
        shelf: state.shelf,
        auth: state.auth,
        user: state.user,
        page: state.page,
        playlist: state.playlist,
        staticText: state.staticText.getIn(['data', 'playlistPage'], Map()),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getPlaylistLocalPref: actions.playlist.getPlaylistLocalPref,
        setPagePath: actions.page.setPagePath,
        setShelfVisible: actions.shelf.setShelfVisible,
        getShelfData: actions.shelf.getShelfData,
        deleteTiles: actions.tiles.deleteTiles,
        deletePlaylistQueue: actions.playlist.deletePlaylistQueue,
        setCommentsVisible: actions.comments.setCommentsVisible,
        togglePlaylistEditMode: actions.playlist.togglePlaylistEditMode,
        deletePlaylistIds: actions.playlist.deletePlaylistIds,
        setPlaylistQueueItem: actions.playlist.setPlaylistQueueItem,
        deleteTilesDataById: actions.tiles.deleteTilesDataById,
        setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
        setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
        setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
        setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
      }
    },
  ),
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
)(PlaylistPage)
