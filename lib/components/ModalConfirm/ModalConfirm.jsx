// import { dismissModal } from 'services/dialog/actions'
import { Button, TYPES } from 'components/Button.v2'
import React, { useCallback } from 'react'
import { H2, HEADING_TYPES } from 'components/Heading'
import PropTypes from 'prop-types'

export default function ModalConfirm ({
  confirmMessage,
  dismissModal,
  onConfirm,
  onCancel,
}) {
  //
  const onClose = useCallback(() => {
    onCancel()
  }, [])

  const onContinue = useCallback(() => {
    onConfirm()
    dismissModal()
  }, [onConfirm])

  return (
    <div className="modal-confirm">
      <div className="modal-confirm__wrapper">
        <H2 as={HEADING_TYPES.H4}>{confirmMessage}</H2>
        <div className="modal-confirm__buttons">
          <Button
            className="modal-confirm__cancel button--stacked"
            type={TYPES.SECONDARY}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="modal-confirm__continue button--stacked"
            type={TYPES.PRIMARY}
            onClick={onContinue}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

ModalConfirm.propTypes = {
  confirmMessage: PropTypes.string.isRequired,
  dismissModal: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
