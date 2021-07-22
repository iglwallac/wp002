import React, { useState } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { List } from 'immutable'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import FormsyForm from 'formsy-react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { H5 } from 'components/Heading'
import { TextInput, Checkbox } from 'components/FormInput.v2'
import FeedbackBox, { FEEDBACK_BOX_TYPES } from 'components/FeedbackBox'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_BUTTON, FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import {
  getImmutableBasePlaylists,
  PLAYLIST_ERROR_EXISTING,
  formatPlaylistInputErrors,
} from 'services/playlist'


const MultiplePlaylistsAddModal = (props) => {
  const {
    createUserPlaylistAndAttachItem,
    resetNewPlaylistError,
    createUserPlaylist,
    processingCreate,
    dismissModal,
    errorCreate,
    staticText,
    playlists,
    hasPortal,
    contentId,
    onSelect,
    meta,
    createOnly,
  } = props
  const [validForm, setValidForm] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)

  const disabled = !validForm
  const errorKey = errorCreate === PLAYLIST_ERROR_EXISTING ? 'otherNameMessage' : 'errorMessage'
  const titleTextKey = createOnly ? 'titleCreate' : 'titleAdd'

  const onValid = () => {
    setValidForm(true)
    if (errorCreate) {
      resetNewPlaylistError()
    }
  }

  const onCheckboxClick = (type, selected, name) => {
    dismissModal()
    onSelect(type, selected, contentId, name)
  }

  const onSubmit = (model) => {
    if (createOnly) {
      createUserPlaylist(
        model.newPlaylist,
        staticText.getIn(['data', 'successMessage']),
      )
      return
    }
    createUserPlaylistAndAttachItem(
      model.newPlaylist,
      contentId,
    )
  }

  const onInvalid = () => setValidForm(false)
  const onButtonClick = () => setInputVisible(true)

  const renderSubmitButton = () => {
    if (!inputVisible && !createOnly) {
      return null
    }

    if (processingCreate) {
      return <Sherpa type={TYPE_SMALL_BLUE} className={['playlist-empty__sherpa']} />
    }

    return (
      <FormButton
        type={FORM_BUTTON_TYPE_SUBMIT}
        formButtonClass={[
          'form-button--primary',
          'form-button--stacked',
          'form-button--submit',
        ]}
        disabled={disabled}
        renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
        text={staticText.getIn(['data', 'buttonSave'])}
      />
    )
  }

  const renderCheckboxes = () => {
    if (createOnly) {
      return null
    }

    const basePlaylists = getImmutableBasePlaylists(hasPortal)
    const allPlaylists = playlists.size ? basePlaylists.concat(playlists) : basePlaylists
    const metaPlaylists = meta.get('playlists', List())
    return allPlaylists.map((pl) => {
      const name = pl.get('staticTextKey') ? staticText.getIn(['data', pl.get('staticTextKey')]) : pl.get('name')
      const inPlaylist = !!metaPlaylists.find(metaPl => metaPl.get('playlistType') === pl.get('type'))
      const onChange = () => onCheckboxClick(pl.get('type'), !inPlaylist, name)
      return (
        <Checkbox
          key={pl.get('id')}
          label={name}
          onChange={onChange}
          value={inPlaylist}
          name={pl.get('type')}
          block
        />
      )
    })
  }

  return (
    <div className="multiple-playlists-add-modal">
      <FormsyForm
        className="multiple-playlists-add-modal"
        onValid={onValid}
        onInvalid={onInvalid}
        onValidSubmit={onSubmit}
      >
        <H5>{staticText.getIn(['data', titleTextKey])}</H5>
        <div className="multiple-playlists-add-modal__list">
          {renderCheckboxes()}
        </div>
        {errorCreate && <FeedbackBox type={FEEDBACK_BOX_TYPES.ERROR}>
          {staticText.getIn(['data', errorKey])}
        </FeedbackBox>}
        {(inputVisible || createOnly) && <TextInput
          name={'newPlaylist'}
          label={staticText.getIn(['data', 'placeholder'])}
          validations={{
            maxLength: 40,
          }}
          validationErrors={{
            maxLength: staticText.getIn(['data', 'inputMaxLengthMessage']),
          }}
          validationErrorFormat={formatPlaylistInputErrors}
          maxLength={100}
          autocomplete="off"
          value={''}
          required
        />}
        {(!inputVisible && !createOnly) && <FormButton
          type={FORM_BUTTON_TYPE_BUTTON}
          onClick={onButtonClick}
          formButtonClass={[
            'form-button--secondary',
            'form-button--stacked',
          ]}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          text={staticText.getIn(['data', 'buttonCreate'])}
        />}
        {renderSubmitButton()}
      </FormsyForm>
    </div>
  )
}


MultiplePlaylistsAddModal.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  playlists: ImmutablePropTypes.list.isRequired,
  meta: ImmutablePropTypes.map,
  createUserPlaylistAndAttachItem: PropTypes.func.isRequired,
  resetNewPlaylistError: PropTypes.func.isRequired,
  createOnly: PropTypes.bool.isRequired,
  contentId: PropTypes.number,
  hasPortal: PropTypes.bool,
  onSelect: PropTypes.func,
  processingCreate: PropTypes.bool,
  errorCreate: PropTypes.string,
}


MultiplePlaylistsAddModal.defaultProps = {
  createOnly: false,
  hasPortal: false,
}


export default compose(
  connectStaticText({ storeKey: 'multiplePlaylistsAddModal' }),
  connectRedux(
    state => ({
      errorCreate: state.playlist.getIn(['userPlaylists', 'new', 'error']),
      processingCreate: state.playlist.getIn(['userPlaylists', 'new', 'processing']),
      playlists: state.playlist.getIn(['userPlaylists', 'data'], List()),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        createUserPlaylistAndAttachItem: actions.playlist.createUserPlaylistAndAttachItem,
        createUserPlaylist: actions.playlist.createUserPlaylist,
        resetNewPlaylistError: actions.playlist.resetNewUserPlaylistError,
        dismissModal: actions.dialog.dismissModal,
      }
    },
  ),
)(MultiplePlaylistsAddModal)
