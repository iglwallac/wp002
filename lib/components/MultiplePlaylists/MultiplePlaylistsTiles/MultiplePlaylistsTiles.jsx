import React from 'react'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { List } from 'immutable'
import { RENDER_TYPE_TILE_GRID_GALLERY } from 'render'
import { getPlaylistTileStoreKey } from 'services/playlist'
import { isInHideWatched } from 'services/hide-watched'

import TileRows from 'components/TileRows'
import TileGrid from 'components/TileGrid'
import Sherpa from 'components/Sherpa'
import LoadMore from 'components/LoadMore'
import MultiplePlaylistsEmpty from 'components/MultiplePlaylists/MultiplePlaylistsEmpty'
import PlaylistEdit from 'components/PlaylistEdit'
import { STORE_KEY_WATCH_HISTORY } from 'services/store-keys'

const renderTileGrid = (props, activePlaylistTiles, storeKey) => {
  const {
    auth,
    resolver,
    playlist,
    setPlaylistQueueItem,
    addOrRemoveHideWatched,
    hideWatched,
  } = props
  let tileGridData
  const isWatchHistory = storeKey === STORE_KEY_WATCH_HISTORY
  const editMode = playlist.getIn(
    [storeKey, 'editMode'],
    false,
  )
  const location = resolver.get('location')

  if (editMode) {
    tileGridData = activePlaylistTiles
      .getIn(['data', 'titles'])
      .map((item, index) => {
        const id = item.get('id')
        const title = item.get('title')
        const inPlaylist = isWatchHistory
          ? !isInHideWatched(hideWatched.get('data'), id)
          : playlist.getIn(
            [storeKey, 'queue', index, 'playlist'],
            true,
          )
        const onClick = isWatchHistory
          ? () => addOrRemoveHideWatched({ id, title })
          : () => setPlaylistQueueItem(storeKey, index, id, !inPlaylist)

        const playlistEditComponent = (
          <PlaylistEdit
            onClick={onClick}
            inPlaylist={!inPlaylist}
          />
        )
        return item.set('playlistEditComponent', playlistEditComponent)
      })
  } else {
    tileGridData = activePlaylistTiles.getIn(['data', 'titles'])
  }

  return (
    <TileGrid
      auth={auth}
      tileGridData={tileGridData}
      displayType={RENDER_TYPE_TILE_GRID_GALLERY}
      moreInfoVisible={false}
      location={location}
    />
  )
}

const MultiplePlaylistTiles = (props) => {
  const {
    auth,
    getLoadMore,
    shelf,
    playlist,
    tiles,
    tileRows,
    setTilesScrollableTileIndex,
    setTilesScrollableRowWidth,
    setTileRowsActiveId,
    setTileRowsRowActiveId,
    setTilesActiveId,
    user,
  } = props
  const activePlaylistType = playlist.getIn(['userPlaylists', 'activePlaylist', 'type'], '')
  const tileStoreKey = getPlaylistTileStoreKey(activePlaylistType)
  const activePlaylistTiles = tiles.get(tileStoreKey)

  if (!activePlaylistTiles) return <Sherpa />

  const processing = activePlaylistTiles.get('processing')
  const placeholderTitlesExist = activePlaylistTiles.get('placeholderTitlesExist')
  const titlesCount = activePlaylistTiles.getIn(['data', 'titles'], List()).size
  const totalTilesCount = activePlaylistTiles.getIn(['data', 'totalCount'], 0)
  const playlistIsEmpty = totalTilesCount === 0 && !placeholderTitlesExist

  if (playlistIsEmpty) {
    return <MultiplePlaylistsEmpty playlistType={activePlaylistType} />
  }

  return (
    <React.Fragment>
      <TileRows
        tileRows={tileRows}
        storeKey={tileStoreKey}
        auth={auth}
        user={user}
        shelf={shelf}
        setScrollableTileIndex={setTilesScrollableTileIndex}
        setScrollableRowWidth={setTilesScrollableRowWidth}
        setTileRowsActiveId={setTileRowsActiveId}
        setTileRowsRowActiveId={setTileRowsRowActiveId}
        setTilesActiveId={setTilesActiveId}
      >
        {renderTileGrid(props, activePlaylistTiles, tileStoreKey)}
      </TileRows>
      <LoadMore
        onClickLoadMore={getLoadMore}
        buttonClassName={['multiple-playlists__load-more-button', 'button--secondary']}
        currentCount={titlesCount}
        totalCount={totalTilesCount}
        processing={processing}
      />
    </React.Fragment>
  )
}

export default connect((state) => {
  return {
    auth: state.auth,
    resolver: state.resolver,
    hideWatched: state.hideWatched,
    shelf: state.shelf,
    playlist: state.playlist,
    tiles: state.tiles,
    tileRows: state.tileRows,
    user: state.user,
  }
},
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    getLoadMore: actions.playlist.getPlaylistTilesLoadMore,
    setTilesActiveId: actions.tiles.setTilesActiveId,
    setTilesScrollableTileIndex: actions.tiles.setTilesScrollableTileIndex,
    setTilesScrollableRowWidth: actions.tiles.setTilesScrollableRowWidth,
    setTileRowsActiveId: actions.tileRows.setTileRowsActiveId,
    setTileRowsRowActiveId: actions.tileRows.setTileRowsRowActiveId,
    setPlaylistQueueItem: actions.playlist.setPlaylistQueueItem,
    addOrRemoveHideWatched: actions.hideWatched.addOrRemoveHideWatched,
  }
},

)(MultiplePlaylistTiles)
