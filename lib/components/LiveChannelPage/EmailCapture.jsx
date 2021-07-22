import React from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import FormsyForm from 'formsy-react'
import FormButton from 'components/FormButton'
import { get as getConfig } from 'config'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { setLocalStorage } from 'services/local-preferences'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { EmailInput, Checkbox } from 'components/FormInput.v2'
import { FORM_INPUT_NAME_EMAIL_OPT_IN } from 'services/form'

const { appLang } = getConfig()

class EmailCapture extends React.PureComponent {
  static propTypes = {
    captureKey: PropTypes.string.isRequired,
  }

  constructor (props) {
    super(props)
    this.disableButton = this.disableButton.bind(this)
    this.enableButton = this.enableButton.bind(this)
    this.state = { canSubmit: false }
  }

  onSelectOptInCheckbox = (name, checked) => {
    const { setEmailSignupOptin } = this.props

    setEmailSignupOptin(checked)
  }

  onValidSubmit = (model) => {
    const { props } = this
    const { doEmailSignup, url, utm, userLanguage, captureKey, auth, uid } = props
    const email = model.email
    const source = ''
    const fields = {
      registration_language: userLanguage,
      url,
      form_name: 'GAIA_STREAM_LIVE_CHANNEL',
    }
    doEmailSignup(email, source, fields, utm)
    setLocalStorage(captureKey, 'yes', uid, auth)
  }

  disableButton () {
    this.setState({ canSubmit: false })
  }

  enableButton () {
    this.setState({ canSubmit: true })
  }

  renderForm = () => {
    const { props, state } = this
    const { staticText, email, emailSignup } = props
    const emailOptIn = emailSignup.get('optIn', false)
    const canSubmit = state.canSubmit && !!emailSignup.get('optIn')
    return (
      <FormsyForm
        className="live-channel-page__email-capture__form"
        onValidSubmit={this.onValidSubmit}
        onValid={this.enableButton}
        onInvalid={this.disableButton}
      >
        <EmailInput
          className={['live-channel-page__email-capture__form__input']}
          label={staticText.getIn(['data', 'email'])}
          name="email"
          value={email}
          validations="isEmail"
          validationError={staticText.getIn(['data', 'invalidEmail'])}
          required
        />
        <div className="live-channel-page__email-capture__checkbox-container">
          <Checkbox
            onChange={this.onSelectOptInCheckbox}
            name={FORM_INPUT_NAME_EMAIL_OPT_IN}
            label={staticText.getIn(['data', 'optIn'])}
            value={emailOptIn}
            className="live-channel-page__email-capture__optin"
            required
          />
        </div>
        <FormButton
          formButtonClass={['button', 'button--primary']}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          type={FORM_BUTTON_TYPE_SUBMIT}
          text={staticText.getIn(['data', 'EmailSubmit'])}
          disabled={!canSubmit}
        />
      </FormsyForm>
    )
  }

  render () {
    const { props } = this
    const { staticText } = props

    return (
      <div>
        <div className="live-channel-page__email-capture__label">
          {staticText.getIn(['data', 'EmailLabel'])}
        </div>
        {this.renderForm()}
      </div>
    )
  }
}

export default compose(
  connectStaticText({ storeKey: 'liveChannelPage' }),
  connectRedux(
    state => ({
      auth: state.auth,
      uid: (state.auth) ? state.auth.get('uid') : -1,
      emailSignup: state.emailSignup,
      url: state.page.get('path'),
      utm: state.inboundTracking.getIn(['data', 'strings', 'utm']),
      userLanguage: state.user.getIn(['data', 'language', 0], appLang),
      email: state.user.getIn(['data', 'mail']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        doEmailSignup: actions.emailSignup.doEmailSignupBrooklyn,
        setEmailSignupOptin: actions.emailSignup.setEmailSignupOptin,
      }
    },
  ))(EmailCapture)
