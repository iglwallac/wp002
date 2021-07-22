import React from 'react'
import Button from 'components/Button'
import { H2, HEADING_TYPES } from 'components/Heading'

export default class ModalRemoveUser extends React.PureComponent {
  onRemoveClick = () => {
    const { props } = this
    const { auth, profileToRemove, removeProfile, removeModal } = props
    const data = { auth, profile: profileToRemove }
    removeProfile(data)
    removeModal()
  }

  render () {
    const { onRemoveClick, props } = this
    const { titleText, bodyText, buttonText } = props
    return (
      <div className="modal-remove-user">
        <H2 as={HEADING_TYPES.H4} className="modal-remove-user__title">{titleText}</H2>
        <div className="modal-remove-user__text">
          {bodyText}
        </div>
        <Button
          text={buttonText}
          onClick={() => onRemoveClick()}
          buttonClass={['button--primary', 'button--stacked', 'modal-remove-user__button']}
        />
      </div>
    )
  }
}
