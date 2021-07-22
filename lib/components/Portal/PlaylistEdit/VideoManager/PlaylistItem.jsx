import ImmutablePropTypes from 'react-immutable-proptypes'
import { Button, TYPES } from 'components/Button.v2'
import { ICON_TYPES } from 'components/Icon.v2'
import PropTypes from 'prop-types'
import _join from 'lodash/join'
import React from 'react'

const getClassName = (isInPlaylist) => {
  const base = 'portal-playlist-v2-edit__playlist-item-wrapper'
  const cls = [base]

  if (isInPlaylist) {
    cls.push(`${base}--in-playlist`)
  }
  return _join(cls, ' ')
}

const PlaylistItem = ({
  isInPlaylist,
  playlistItem,
  togglePlaylistItem,
}) => {
  const handleButtonClick = () => {
    togglePlaylistItem(playlistItem, isInPlaylist)
  }

  return (
    <div
      className={getClassName(isInPlaylist)}
    >
      <div className="portal-playlist-v2-edit__playlist-item">
        <img className="portal-playlist-v2-edit__playlist-item-img" alt="video thumbnail" src={playlistItem.get('imageWithText')} />
        <Button
          className="portal-playlist-v2__playlist-item-action-btn"
          onClick={handleButtonClick}
          type={TYPES.ICON_PRIMARY}
          icon={isInPlaylist ? ICON_TYPES.CHECK : ICON_TYPES.PLUS}
          shadow
        />
      </div>
    </div>
  )
}

PlaylistItem.propTypes = {
  playlistItem: ImmutablePropTypes.map.isRequired,
  togglePlaylistItem: PropTypes.func.isRequired,
  isInPlaylist: PropTypes.bool.isRequired,

}

export default PlaylistItem
