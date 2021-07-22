import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { H5 } from 'components/Heading'
import { Button, TYPES } from 'components/Button.v2'


const MultiplePlaylistsDeleteModal = (props) => {
  const {
    staticText,
    dismissModal,
    playlistName,
    playlistSize,
    playlistType,
    deletePlaylist,
  } = props

  const getBodyText = () => {
    return (
      <div className="multiple-playlists-delete-modal__text">
        {staticText.getIn(['data', 'body1'])}
        <b>{` ${playlistName} `}</b>
        {staticText.getIn(['data', 'body2'])}
        <b>{` ${playlistSize} `}</b>
        {staticText.getIn(['data', 'body3'])}
      </div>
    )
  }

  return (
    <div className="multiple-playlists-delete-modal">
      <H5 className="multiple-playlists-delete-modal__title">
        {staticText.getIn(['data', 'title'])}
      </H5>
      {getBodyText()}
      <Button
        type={TYPES.PRIMARY}
        className="multiple-playlists-delete-modal__delete"
        onClick={() => deletePlaylist(playlistType)}
        stacked
      >
        {staticText.getIn(['data', 'buttonDelete'])}
      </Button>
      <Button
        type={TYPES.SECONDARY}
        className="multiple-playlists-delete-modal__cancel"
        onClick={() => dismissModal()}
        stacked
      >
        {staticText.getIn(['data', 'buttonCancel'])}
      </Button>
    </div>
  )
}


MultiplePlaylistsDeleteModal.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  deletePlaylist: PropTypes.func.isRequired,
  dismissModal: PropTypes.func.isRequired,
}


export default compose(
  connectStaticText({ storeKey: 'multiplePlaylistsDeleteModal' }),
  connectRedux(
    null,
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        deletePlaylist: actions.playlist.deleteUserPlaylist,
        dismissModal: actions.dialog.dismissModal,
      }
    },
  ),
)(MultiplePlaylistsDeleteModal)
