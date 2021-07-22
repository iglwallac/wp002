import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import Button from 'components/Button'
import { TYPE_LOGIN } from 'services/dialog'
import { H2, HEADING_TYPES } from 'components/Heading'


class ModalGiftFlowLogin extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      modalOpen: true,
    }
  }

  openModal = () => {
    this.setState(() => ({ modalOpen: true }))
  }

  closeModal = () => {
    const { removeModal } = this.props
    removeModal()
  }

  modal = () => {
    const props = this.props
    const state = this.state
    const { staticText } = props

    if (!state.modalOpen) {
      return null
    }

    return (
      <div className="modal-gift-flow-login__content">
        <H2 as={HEADING_TYPES.H4} className="modal-gift-flow-login__title">
          {staticText.getIn(['data', 'title'])}
        </H2>
        <div className="modal-gift-flow-login__button-container">
          <Button
            url={URL_JAVASCRIPT_VOID}
            text={staticText.getIn(['data', 'login'])}
            buttonClass={['modal-gift-flow-login__button']}
            onClick={() => this.renderLoginModal()}
          />
          <Button
            url={URL_JAVASCRIPT_VOID}
            text={staticText.getIn(['data', 'continue'])}
            buttonClass={['modal-gift-flow-login__button']}
            onClick={() => this.closeModal()}
          />
        </div>
      </div>
    )
  }

  renderLoginModal = () => {
    const { renderModal } = this.props
    renderModal(TYPE_LOGIN, this.props)
  }

  render () {
    return (
      <div className="modal-gift-flow-login">
        {this.modal()}
      </div>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'modalGiftFlowLogin' }),
  connectRedux(
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        removeModal: actions.dialog.removeModal,
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
)(ModalGiftFlowLogin)
