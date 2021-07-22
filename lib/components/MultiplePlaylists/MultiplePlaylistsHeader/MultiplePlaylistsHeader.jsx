import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import { H1 } from 'components/Heading'
import { Button } from 'components/Button.v2'
import IconV2, { ICON_TYPES, ICON_STYLES } from 'components/Icon.v2'
import { getPlaylistTileStoreKey } from 'services/playlist'
import { TYPE_USER_PLAYLIST_DELETE, TYPE_USER_PLAYLIST_RENAME } from 'services/dialog'

const renderButton = ({
  hide,
  icon,
  text,
  onClick,
  style = ICON_STYLES.TEAL_CIRCLE,
} = {}) => {
  if (hide) {
    return null
  }

  return (
    <Button
      onClick={onClick}
      className="multiple-playlists-header__button"
    >
      <span className="multiple-playlists-header__button-text">
        {text}
      </span>
      <IconV2
        type={icon}
        style={style}
      />
    </Button>
  )
}

const MultiplePlaylistsHeader = (props) => {
  const {
    playlist,
    staticText,
    tiles,
    title,
    toggleEditMode,
    renderModal,
    resetRenameUserPlaylistError,
  } = props
  const activePlaylistType = playlist.getIn(['userPlaylists', 'activePlaylist', 'type'], '')
  const storeKey = getPlaylistTileStoreKey(activePlaylistType)
  const activePlaylistTiles = tiles.get(storeKey)
  const totalTilesCount = activePlaylistTiles && activePlaylistTiles.getIn(['data', 'totalCount'], 0)
  const editMode = playlist.getIn([storeKey, 'editMode'], false)
  const isUserPlaylist = activePlaylistType.startsWith('user-')
  const hideDelete = !isUserPlaylist
  const hideRename = !isUserPlaylist
  const hideEdit = !totalTilesCount

  const renderDeleteModal = () => {
    renderModal(TYPE_USER_PLAYLIST_DELETE, {
      playlistName: title,
      playlistSize: totalTilesCount,
      playlistType: activePlaylistType,
    })
  }

  const renderRenameModal = () => {
    renderModal(TYPE_USER_PLAYLIST_RENAME, {
      playlistName: title,
      playlistType: activePlaylistType,
      onDismiss: () => resetRenameUserPlaylistError(),
    })
  }

  return (
    <header className="multiple-playlists-header">
      <H1>{title}</H1>

      <div className="multiple-playlists-header__buttons">
        {renderButton({
          hide: hideDelete,
          icon: ICON_TYPES.DELETE,
          text: staticText.getIn(['data', 'deleteButtonText']),
          onClick: renderDeleteModal,
        })}
        {renderButton({
          hide: hideRename,
          icon: ICON_TYPES.RENAME,
          text: staticText.getIn(['data', 'renameButtonText']),
          onClick: renderRenameModal,
        })}
        {renderButton({
          hide: hideEdit,
          icon: editMode ? ICON_TYPES.CIRCULAR_CHECK : ICON_TYPES.PENCIL,
          text: editMode ? staticText.getIn(['data', 'saveChanges']) : staticText.getIn(['data', 'editButtonText']),
          onClick: () => toggleEditMode(storeKey),
          style: editMode ? ICON_STYLES.OUTLINE : ICON_STYLES.TEAL_CIRCLE,
        })}
      </div>
    </header>
  )
}

MultiplePlaylistsHeader.propTypes = {
  title: PropTypes.string.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  resetRenameUserPlaylistError: PropTypes.func.isRequired,
}

export default connect(
  state => ({
    playlist: state.playlist,
    staticText: state.staticText.getIn(['data', 'multiplePlaylistsHeader']),
    title: state.playlist.getIn(['userPlaylists', 'activePlaylist', 'name'], ''),
    tiles: state.tiles,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      toggleEditMode: actions.playlist.togglePlaylistEditMode,
      renderModal: actions.dialog.renderModal,
      resetRenameUserPlaylistError: actions.playlist.resetRenameUserPlaylistError,
    }
  },
)(MultiplePlaylistsHeader)
