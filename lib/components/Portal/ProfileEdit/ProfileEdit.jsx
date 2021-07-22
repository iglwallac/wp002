import { VALIDATIONS_URL, VALIDATIONS_TAGLINE, VALIDATIONS_DISPLAYNAME, MODES } from 'services/portal'
import { TextInput, Textarea, Checkbox, CHECKBOX_STYLES } from 'components/FormInput.v2/FormInput'
import React, { useCallback, useState, useMemo } from 'react'
import { TYPE_UPDATE_PROFILE_IMAGE } from 'services/dialog'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { requestAnimationFrame } from 'services/animate'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import { Button, TYPES } from 'components/Button.v2'
import UserAvatar from 'components/UserAvatar'
import { H3 } from 'components/Heading'
import { List, Map } from 'immutable'
import FormsyForm from 'formsy-react'
import PropTypes from 'prop-types'
import SocialMedia from '../SocialMedia'
import CoverEdit from '../CoverEdit'
import UserTags from '../UserTags'


function createErrorMessages (text) {
  return {
    TAGLINE: { maxLength: text.get('maxLength64') },
    BIO: { maxLength: text.get('maxLength750') },
    DISPLAYNAME: {
      matchRegexp: text.get('errorDisplayName'),
      serverError: text.get('serverError'),
      maxLength: text.get('maxLength25'),
    },
    URL: {
      matchRegexp: text.get('errorPortalUrl'),
      serverError: text.get('serverError'),
      maxLength: text.get('maxLength25'),
    },
  }
}

function ProfileEdit ({
  setOverlayDialogVisible,
  updateEditor,
  updatePortal,
  tagOptions,
  setMode,
  portal,
  modes,
  text,
  user,
}) {
  // editor comparison props
  const currentCover = portal.getIn(['data', 'coverPhotoKey'], '') || 'default'
  const isSaving = portal.getIn(['editor', 'processing'], false)
  const picture = portal.getIn(['data', 'profilePicture'], '')
  const currentTags = portal.getIn(['data', 'tags'], List())
  const editor = portal.getIn(['editor', 'data'], Map())
  const mode = portal.get('mode', MODES.PROFILE_EDIT)
  const current = portal.get('data', Map())
  // we are removing the tags list from the comparison because tags that have been changed
  // will have different ids and that will make the comparison inaccurate
  const comparableEditor = editor.delete('tags')
  const comparableCurrent = current.delete('tags')
  const hasChanges = !comparableEditor.equals(comparableCurrent)

  // editor props
  const privacySetting = editor.get('privacySetting', 'private')
  const socialUrls = editor.get('userPortalUrls', List())
  const description = editor.get('description') || ''
  const displayName = editor.get('displayName') || ''
  const tagline = editor.get('tagline') || ''
  const tags = editor.get('tags', List())
  const url = editor.get('url') || ''

  const [
    isValid,
    setValidity,
  ] = useState(true)

  const messages = useMemo(() => (
    createErrorMessages(text)
  ), [text])

  const onValid = useCallback(() => (
    setValidity(true)
  ), [])

  const onInvalid = useCallback(() => (
    setValidity(false)
  ), [])

  const onChange = useCallback((value, { name }) => {
    updateEditor(name, value)
  }, [])

  const onChangePrivacy = useCallback((name, checked) => {
    updateEditor(name, checked ? 'private' : 'public')
  }, [])

  const onValidSubmit = useCallback(() => {
    updatePortal(editor)
    setMode(modes.DEFAULT)
    requestAnimationFrame(() => window.scrollTo(0, 0))
  }, [editor])

  const updateAvatar = useCallback((e) => {
    e.preventDefault()
    setOverlayDialogVisible(TYPE_UPDATE_PROFILE_IMAGE)
  }, [])

  const onExit = useCallback(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0))
    const nextMode = hasChanges
      ? modes.UNSAVED_CHANGES
      : modes.DEFAULT
    setMode(nextMode)
  }, [hasChanges])

  return (
    <div className="portal-v2-edit">
      <Button
        className="portal-v2-edit__back"
        type={TYPES.GHOST}
        onClick={onExit}
      >
        <Icon type={ICON_TYPES.CHEVRON_LEFT} />
        {text.get('buttonBack', '')}
      </Button>
      <H3>{text.get('modalTitle', '')}</H3>
      <CoverEdit
        updateUserPortal={updatePortal}
        updateEditor={updateEditor}
        currentCover={currentCover}
        staticText={text}
        setMode={setMode}
        editor={editor}
        modes={MODES}
        mode={mode}
        user={user}
      />
      <FormsyForm
        onSubmit={onValidSubmit}
        onInvalid={onInvalid}
        onValid={onValid}
      >
        <div className="portal-v2-edit__info">
          <div className="portal-v2-edit__left">
            <div className="portal-v2-edit__basic">
              <div className="portal-v2-edit__avatar">
                <UserAvatar path={picture} />
                <Button
                  className="portal-v2-edit__avatar-cta"
                  onClick={updateAvatar}
                  type={TYPES.ICON_PRIMARY}
                  icon={ICON_TYPES.PENCIL}
                />
              </div>
              <div className="portal-v2-edit__user-and-url">
                <TextInput
                  label={text.get('inputLabelDisplayName', '')}
                  validationErrors={messages.DISPLAYNAME}
                  validations={VALIDATIONS_DISPLAYNAME}
                  onChange={onChange}
                  value={displayName}
                  autocomplete="off"
                  name="displayName"
                  showCharCount
                  required
                />
                <TextInput
                  label={text.get('inputLabelUrl', '')}
                  validationErrors={messages.URL}
                  validations={VALIDATIONS_URL}
                  onChange={onChange}
                  autocomplete="off"
                  showCharCount
                  value={url}
                  name="url"
                  required
                  block
                />
              </div>
              <div className="portal-v2-edit__privacy">
                <Checkbox
                  style={CHECKBOX_STYLES.SECONDARY}
                  label={text.get('checkboxLabelPrivacyPrivate', '')}
                  className="portal-v2-edit__checkbox"
                  value={privacySetting === 'private'}
                  onChange={onChangePrivacy}
                  name="privacySetting"
                  htmlValue="private"
                  block
                />
              </div>
            </div>
            <TextInput
              label={text.get('inputLabelTagline', '')}
              validationErrors={messages.TAGLINE}
              validations={VALIDATIONS_TAGLINE}
              onChange={onChange}
              autocomplete="off"
              showCharCount
              value={tagline}
              name="tagline"
            />
            <Textarea
              label={text.get('inputLabelBio', '')}
              validationErrors={messages.BIO}
              validations="maxLength:750"
              onChange={onChange}
              value={description}
              name="description"
              autocomplete="off"
              showCharCount
              block
            />
          </div>
          <div className="portal-v2-edit__right">
            <SocialMedia
              updateEditor={updateEditor}
              urls={socialUrls}
              text={text}
            />
            <UserTags
              updateEditor={updateEditor}
              updatePortal={updatePortal}
              currentTags={currentTags}
              options={tagOptions}
              setMode={setMode}
              modes={modes}
              tags={tags}
              text={text}
              mode={mode}
            />
            <div className="portal-v2-edit__cta-container">
              <Button
                disabled={!isValid || !hasChanges || isSaving}
                className="portal-v2-edit__submit"
                type={TYPES.PRIMARY}
                submit
              >{
                  isSaving
                    ? text.get('buttonTextSaving', '')
                    : text.get('buttonTextSave', '')
                }
              </Button>
            </div>
          </div>
        </div>
      </FormsyForm>
    </div>
  )
}

export default ProfileEdit

ProfileEdit.propTypes = {
  setOverlayDialogVisible: PropTypes.func.isRequired,
  tagOptions: ImmutablePropTypes.list.isRequired,
  portal: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  text: ImmutablePropTypes.map.isRequired,
  updateEditor: PropTypes.func.isRequired,
  updatePortal: PropTypes.func.isRequired,
  modes: PropTypes.object.isRequired,
  setMode: PropTypes.func.isRequired,
}
