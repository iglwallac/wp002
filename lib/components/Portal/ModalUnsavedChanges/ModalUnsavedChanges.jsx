import ImmutablePropTypes from 'react-immutable-proptypes'
import { Button, TYPES } from 'components/Button.v2'
import React, { useCallback } from 'react'
import { H2, HEADING_TYPES } from 'components/Heading'
import PropTypes from 'prop-types'

export default function ModalUnsavedChanges ({
  updateEditor,
  currentCover,
  currentTags,
  staticText,
  prevMode,
  setMode,
  modes,
}) {
  //
  const onClose = useCallback(() => {
    if (prevMode === modes.COVER_EDIT) {
      updateEditor('coverPhotoKey', currentCover)
      setMode(modes.PROFILE_EDIT)
    } else if (prevMode === modes.TAGS_EDIT) {
      updateEditor('tags', currentTags)
      setMode(modes.PROFILE_EDIT)
    } else setMode(modes.DEFAULT)
  }, [prevMode, currentTags, currentCover])

  const onContinue = useCallback(() => {
    setMode(prevMode)
  }, [prevMode])

  return (
    <div className="modal-unsaved-changes">
      <div className="modal-unsaved-changes__wrapper">
        <H2 as={HEADING_TYPES.H4}>{staticText.get('modalExitTitle', '')}</H2>
        <div className="modal-unsaved-changes__buttons">
          <Button
            className="modal-unsaved-changes__cancel button--stacked"
            onClick={onContinue}
            type={TYPES.SECONDARY}
          >
            {staticText.get('buttonCancel', '')}
          </Button>
          <Button
            className="modal-unsaved-changes__continue button--stacked"
            onClick={onClose}
            type={TYPES.PRIMARY}
          >
            {staticText.get('buttonDiscard', '')}
          </Button>
        </div>
      </div>
    </div>
  )
}

ModalUnsavedChanges.propTypes = {
  currentTags: ImmutablePropTypes.list.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  currentCover: PropTypes.string.isRequired,
  updateEditor: PropTypes.func.isRequired,
  prevMode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  modes: PropTypes.object.isRequired,
}
