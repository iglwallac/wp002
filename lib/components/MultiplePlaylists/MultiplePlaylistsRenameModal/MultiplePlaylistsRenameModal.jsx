import React, { useState } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import FormsyForm from 'formsy-react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { H5 } from 'components/Heading'
import { TextInput } from 'components/FormInput.v2'
import FeedbackBox, { FEEDBACK_BOX_TYPES } from 'components/FeedbackBox'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { formatPlaylistInputErrors } from 'services/playlist'


const MultiplePlaylistsRenameModal = (props) => {
  const {
    resetRenameUserPlaylistError,
    renameUserPlaylist,
    staticText,
    processing,
    error,
    playlistName,
    playlistType,
  } = props
  const [validForm, setValidForm] = useState(false)
  const disabled = !validForm
  const errorKey = error === 'existing' ? 'otherNameMessage' : 'errorMessage'

  const onValid = () => {
    setValidForm(true)
    if (error) {
      resetRenameUserPlaylistError()
    }
  }

  const onInvalid = () => setValidForm(false)

  const onSubmit = model => renameUserPlaylist(
    playlistType,
    model.playlistName,
    staticText.getIn(['data', 'successMessage']),
  )

  return (
    <div className="multiple-playlists-rename-modal">
      <FormsyForm
        className="multiple-playlists-rename-modal__form"
        onValid={onValid}
        onInvalid={onInvalid}
        onValidSubmit={onSubmit}
      >
        <H5 className="multiple-playlists-rename-modal__title">
          {staticText.getIn(['data', 'title'])}
        </H5>
        {error && <FeedbackBox type={FEEDBACK_BOX_TYPES.ERROR}>
          {staticText.getIn(['data', errorKey])}
        </FeedbackBox>}
        <TextInput
          name="playlistName"
          label={staticText.getIn(['data', 'placeholder'])}
          validations={{
            maxLength: 40,
            differentName: model => model.playlistName !== playlistName,
          }}
          validationErrors={{
            maxLength: staticText.getIn(['data', 'inputMaxLengthMessage']),
          }}
          validationErrorFormat={formatPlaylistInputErrors}
          maxLength={100}
          autocomplete="off"
          value={playlistName}
          required
        />
        {
          !processing ?
            <FormButton
              type={FORM_BUTTON_TYPE_SUBMIT}
              formButtonClass={[
                'form-button--primary',
                'form-button--primary',
                'form-button--stacked',
                'form-button--submit',
                'multiple-playlists-rename-modal__button',
              ]}
              disabled={disabled}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              text={staticText.getIn(['data', 'buttonSave'])}
            />
            : <Sherpa type={TYPE_SMALL_BLUE} />
        }
      </FormsyForm>
    </div>
  )
}


MultiplePlaylistsRenameModal.propTypes = {
  resetRenameUserPlaylistError: PropTypes.func.isRequired,
  renameUserPlaylist: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  playlistName: PropTypes.string.isRequired,
  playlistType: PropTypes.string.isRequired,
  processing: PropTypes.bool.isRequired,
  error: PropTypes.string,
}


MultiplePlaylistsRenameModal.defaultProps = {
  processing: false,
}


export default compose(
  connectStaticText({ storeKey: 'multiplePlaylistsRenameModal' }),
  connectRedux(
    state => ({
      error: state.playlist.getIn(['userPlaylists', 'rename', 'error']),
      processing: state.playlist.getIn(['userPlaylists', 'rename', 'processing']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renameUserPlaylist: actions.playlist.renameUserPlaylist,
        resetRenameUserPlaylistError: actions.playlist.resetRenameUserPlaylistError,
      }
    },
  ),
)(MultiplePlaylistsRenameModal)
