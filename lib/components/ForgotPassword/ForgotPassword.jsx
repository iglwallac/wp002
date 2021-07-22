import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import FormsyForm from 'formsy-react'
import { sendEmail } from 'services/reset-password'
import ForgotPasswordUsername from 'components/ForgotPasswordUsername'
import FormButton from 'components/FormButton'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import ErrorMessage from 'components/ErrorMessage'
import Loading, { LOADING_ICON_BLUE_DARK_BG_WHITE } from 'components/Loading'
import Button from 'components/Button'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { partial as _partial } from 'lodash'
import { getPrimary } from 'services/languages'
import { EN } from 'services/languages/constants'
import { H2 } from 'components/Heading'


function isSubmitDisabled (canSubmit, processing) {
  return canSubmit === false || processing === true
}

function onClickClose (props) {
  const { setOverlayDialogVisible } = props
  setOverlayDialogVisible(null, false)
}

class ForgotPassword extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      canSubmit: false,
      processing: false,
      message: null,
      success: null,
      email: null,
    }
  }

  setProcessing = (processing) => {
    this.setState(() => ({
      processing,
    }))
  }

  enableButton = () => {
    this.setState(() => ({
      canSubmit: true,
    }))
  }

  disableButton = () => {
    this.setState(() => ({
      canSubmit: false,
    }))
  }

  submit = (model) => {
    const { email } = model
    const { staticText, user } = this.props
    const primaryLanguage = getPrimary(user.getIn(['data', 'language'], EN))
    this.setProcessing(true)
    this.setState(() => ({
      message: null,
    }))
    sendEmail({ email, primaryLanguage })
      .then(() => {
        this.setState(() => ({
          success: true,
          message: [staticText.getIn(['data', 'linkHasBeenSent'])],
          email,
          processing: false,
        }))
      })
      .catch(() => {
        this.setState(() => ({
          success: false,
          message: [staticText.getIn(['data', 'emailNotRecognized'])],
          processing: false,
        }))
      })
  }

  render () {
    const props = this.props
    const state = this.state
    const { staticText } = props
    const { message, email, success, processing, canSubmit } = state
    const messageClass = success ? ['forgot-password__confirm-message'] : []
    const onClickClosePartial = _partial(onClickClose, props)
    const submitDisabled = isSubmitDisabled(canSubmit, processing)

    return (
      <div className="forgot-password">
        <H2 className="forgot-password__title" fixed>
          {success
            ? staticText.getIn(['data', 'linkSent'])
            : staticText.getIn(['data', 'forgotPassword'])}
        </H2>
        <FormsyForm
          onSubmit={this.submit}
          onValid={this.enableButton}
          onInvalid={this.disableButton}
        >
          {message ? (
            <ErrorMessage
              errorMessages={message}
              errorMessageClass={messageClass}
            />
          ) : null}
          {!success ? (
            <p>{staticText.getIn(['data', 'enterEmailSendLinkToTeset'])}</p>
          ) : null}
          {!success ? (
            <ForgotPasswordUsername
              name="email"
              validations={{ isEmail: true }}
              required
            />
          ) : null}
          {!success ? (
            <div className="forgot-password__submit-wrapper">
              <FormButton
                type="submit"
                disabled={submitDisabled}
                formButtonClass={['form-button--primary', 'form-button--stacked']}
                renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                text={staticText.getIn(['data', 'sendResetLink'])}
              />
            </div>
          ) : null}
          {processing ? (
            <div className="forgot-password__loading">
              <Loading visible icon={LOADING_ICON_BLUE_DARK_BG_WHITE} />
            </div>
          ) : null}
          {success ? (
            <div className="forgot-password__email">{email}</div>
          ) : null}
          {success ? (
            <Button
              text={staticText.getIn(['data', 'done'])}
              buttonClass={['button--primary', 'button--stacked']}
              onClick={onClickClosePartial}
            />
          ) : null}
        </FormsyForm>
      </div>
    )
  }
}

ForgotPassword.propTypes = {
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setEventUserInteraction: PropTypes.func.isRequired,
}

ForgotPassword.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(
  state => ({
    auth: state.auth,
    user: state.user,
    staticText: state.staticText.getIn(['data', 'forgotPassword']),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
    }
  },
)(ForgotPassword)
