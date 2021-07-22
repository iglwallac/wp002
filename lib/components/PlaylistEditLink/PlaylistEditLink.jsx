import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { partial as _partial } from 'lodash'
import { STORE_KEY_PLAYLIST } from 'services/store-keys'
import { getDeleteQueueIds } from 'services/playlist'
import { Button, TYPES as BUTTON_TYPES } from 'components/Button.v2'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'

function getEditLinkClassName (editMode) {
  return ['playlist-edit-link']
    .concat(editMode ? 'playlist-edit-link--active' : [])
    .join(' ')
}

function onClickEditMode (
  tilesStoreKey,
  playlistStoreKey,
  editMode,
  playlist,
  auth,
  uid,
  togglePlaylistEditMode,
  deletePlaylistIds,
  deleteTilesDataById,
  setShelfVisible,
  setTileRowsActiveId,
  setTileRowsRowActiveId,
) {
  if (editMode) {
    const deleteIds = getDeleteQueueIds(playlistStoreKey, playlist)
    if (deleteIds.size > 0) {
      deleteTilesDataById(tilesStoreKey, deleteIds)
      deletePlaylistIds(playlistStoreKey, deleteIds, auth, uid)
    }
  } else {
    setShelfVisible(false)
    setTileRowsActiveId(STORE_KEY_PLAYLIST, null)
    setTileRowsRowActiveId(STORE_KEY_PLAYLIST, null)
  }
  togglePlaylistEditMode(playlistStoreKey)
}

function PlaylistEditLink (props) {
  const {
    tilesStoreKey,
    playlistStoreKey,
    editMode,
    playlist,
    auth,
    staticText,
    togglePlaylistEditMode,
    deletePlaylistIds,
    deleteTilesDataById,
    setShelfVisible,
    setTileRowsActiveId,
    setTileRowsRowActiveId,
  } = props
  const setPlaylistEditMode = _partial(
    onClickEditMode,
    tilesStoreKey,
    playlistStoreKey,
    editMode,
    playlist,
    auth,
    auth.get('uid'),
    togglePlaylistEditMode,
    deletePlaylistIds,
    deleteTilesDataById,
    setShelfVisible,
    setTileRowsActiveId,
    setTileRowsRowActiveId,
  )


  return (
    <div className={getEditLinkClassName(editMode)}>
      <Button
        type={BUTTON_TYPES.GHOST}
        onClick={setPlaylistEditMode}
        className="playlist-edit-link__button"
      >
        <span className="playlist-edit-link__button-text">
          {editMode
            ? staticText.getIn(['data', 'doneEditing'])
            : staticText.getIn(['data', 'editPlaylist'])}
        </span>
        {!editMode ? <IconV2 type={ICON_TYPES.PENCIL} /> : null}
      </Button>
    </div>
  )
}

PlaylistEditLink.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  playlistStoreKey: PropTypes.string.isRequired,
  tilesStoreKey: PropTypes.string.isRequired,
  editMode: PropTypes.bool.isRequired,
  togglePlaylistEditMode: PropTypes.func.isRequired,
  deletePlaylistIds: PropTypes.func.isRequired,
  deleteTilesDataById: PropTypes.func.isRequired,
  playlist: ImmutablePropTypes.map.isRequired,
  setShelfVisible: PropTypes.func.isRequired,
  setTileRowsRowActiveId: PropTypes.func.isRequired,
  setTileRowsActiveId: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'playlistEditLink']),
}))(PlaylistEditLink)
