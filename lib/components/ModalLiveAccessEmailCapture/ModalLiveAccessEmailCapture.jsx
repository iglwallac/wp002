import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import FormsyForm from 'formsy-react'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { EmailInput, Checkbox } from 'components/FormInput.v2'
import { FORM_INPUT_NAME_EMAIL_OPT_IN } from 'services/form'

class ModalLiveAccessEmailCapture extends React.PureComponent {
  constructor (props) {
    super(props)
    this.validEmail = this.validEmail.bind(this)
    this.inValidEmail = this.inValidEmail.bind(this)
    this.state = {
      siteUrl: '',
      isValidEmail: false,
    }
  }

  onValidSubmit = (model) => {
    const { props } = this
    const { doEmailSignup, id } = props
    const email = model.email
    const source = `live access - ${id}`
    doEmailSignup(email, source)
  }

  onSelectOptInCheckbox = (name, checked) => {
    const { setEmailSignupOptin } = this.props

    setEmailSignupOptin(checked)
  }

  validEmail () {
    this.setState({ isValidEmail: true })
  }

  inValidEmail () {
    this.setState({ isValidEmail: false })
  }

  renderForm = (success) => {
    const { props, state } = this
    const { staticText, userEmail, emailSignup } = props
    const emailOptIn = emailSignup.get('optIn', false)
    const canSubmit = state.isValidEmail && !!emailSignup.get('optIn')
    return (
      <FormsyForm
        onValidSubmit={this.onValidSubmit}
        onValid={this.validEmail}
        onInvalid={this.inValidEmail}
      >
        <div className={success ? 'modal-live-access__email--invisible' : ''}>
          <EmailInput
            label={staticText.getIn(['data', 'email'])}
            name="email"
            value={userEmail}
            validations="isEmail"
            required
          />
        </div>
        <Checkbox
          onChange={this.onSelectOptInCheckbox}
          name={FORM_INPUT_NAME_EMAIL_OPT_IN}
          label={staticText.getIn(['data', 'optIn'])}
          value={emailOptIn}
          className="modal-live-access__optin"
          required
        />
        {success ?
          (
            <div className="modal-live-access__thankyou">
              {staticText.getIn(['data', 'thankYou'])}
            </div>
          )
          : (
            <FormButton
              formButtonClass={['form-button--primary', 'modal-live-access__email-submit']}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              type={FORM_BUTTON_TYPE_SUBMIT}
              text={staticText.getIn(['data', 'signUp'])}
              disabled={!canSubmit}
            />
          )}
      </FormsyForm>
    )
  }

  render () {
    const { props } = this
    const { staticText, emailSignup } = props
    return (
      <div className="modal-live-access">
        <div className="modal-live-access__description">
          {staticText.getIn(['data', 'signUpLong'])}
        </div>
        {this.renderForm(emailSignup.get('success'))}
      </div>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'modalLiveAccessEmailCapture' }),
  connectRedux(
    state => ({
      share: state.share,
      emailSignup: state.emailSignup,
      userEmail: state.user.getIn(['data', 'mail']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renderModal: actions.dialog.renderModal,
        doEmailSignup: actions.emailSignup.doEmailSignupBrooklyn,
        clearShare: actions.share.clearShare,
        setEmailSignupOptin: actions.emailSignup.setEmailSignupOptin,
      }
    },
  ))(ModalLiveAccessEmailCapture)
