import PropTypes from 'prop-types'
import React from 'react'
import Icon from 'components/Icon'

function getClassName (inPlaylist) {
  return ['playlist-edit']
    .concat(inPlaylist ? ['playlist-edit--add'] : [])
    .join(' ')
}

function getIconClassNames (inPlaylist) {
  const classNames = ['icon--x-small', 'icon--action', 'playlist-edit__icon']
  if (inPlaylist) {
    classNames.push('icon--add', 'playlist-edit__icon--add')
  } else {
    classNames.push('icon--close', 'playlist-edit__icon--remove')
  }
  return classNames
}

function PlaylistEdit (props) {
  return (
    <div className={getClassName(props.inPlaylist)}>
      <Icon
        iconClass={getIconClassNames(props.inPlaylist)}
        onClick={props.onClick}
      />
    </div>
  )
}

PlaylistEdit.propTypes = {
  onClick: PropTypes.func.isRequired,
  inPlaylist: PropTypes.bool.isRequired,
}

export default PlaylistEdit
