import React from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Button from 'components/Button'
import { getBoundActions } from 'actions'
import FormsyForm from 'formsy-react'
import FormButton from 'components/FormButton'
import { get as getConfig } from 'config'
import { isBrowser } from 'config/environment'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { EmailInput, Checkbox } from 'components/FormInput.v2'
import { UPGRADE_NOW_URL, JOIN_NOW_URL, JOIN_NOW_QUERY,
  LIVE_CHANNEL_EMAIL_CAPTURE_KEY, EMAIL_CAPTURE_KEY_PREFIX } from 'services/live-access-events/constants'
import { setLocalStorage, getLocalStorage } from 'services/local-preferences'
import { FORM_INPUT_NAME_EMAIL_OPT_IN } from 'services/form'

const { appLang } = getConfig()

export const getEventEmailCaptureKey = (eventDetails) => {
  return EMAIL_CAPTURE_KEY_PREFIX + ((eventDetails) ?
    eventDetails.get('route', eventDetails.get('title', LIVE_CHANNEL_EMAIL_CAPTURE_KEY)) :
    LIVE_CHANNEL_EMAIL_CAPTURE_KEY)
}

export const isEmailCaptured = (emailCaptureKey) => {
  return emailCaptureKey && isBrowser() ?
    getLocalStorage(emailCaptureKey) === 'yes' : true
}
class EmailCapture extends React.PureComponent {
  constructor (props) {
    super(props)
    this.validEmail = this.validEmail.bind(this)
    this.inValidEmail = this.inValidEmail.bind(this)
    this.state = { validEmail: false }
  }

  onSelectOptInCheckbox = (name, checked) => {
    const { setEmailSignupOptin } = this.props

    setEmailSignupOptin(checked)
  }

  onValidSubmit = (model) => {
    const { props } = this
    const { doEmailSignup, url, utm, language, emailCaptureKey, uid, auth } = props
    const email = model.email
    const source = ''
    const fields = {
      registration_language: language,
      url,
      form_name: 'GAIA_STREAM_LIVE',
    }
    doEmailSignup(email, source, fields, utm)
    setLocalStorage(emailCaptureKey, 'yes', uid, auth)
  }

  validEmail () {
    this.setState({ validEmail: true })
  }

  inValidEmail () {
    this.setState({ validEmail: false })
  }


  renderForm = () => {
    const { props, state } = this
    const { staticText, userEmail, emailSignup } = props
    const emailOptIn = emailSignup.get('optIn', false)
    const canSubmit = state.validEmail && !!emailSignup.get('optIn')

    return (
      <FormsyForm
        className="live-page-email-capture__form"
        onValidSubmit={this.onValidSubmit}
        onValid={this.validEmail}
        onInvalid={this.inValidEmail}
      >
        <EmailInput
          className={['live-page-email-capture__form__input']}
          label={staticText.getIn(['data', 'email'])}
          name="email"
          value={userEmail}
          validations="isEmail"
          validationError={staticText.getIn(['data', 'invalidEmail'])}
          required
        />
        <div className="live-page-email-capture__optin-container">
          <Checkbox
            onChange={this.onSelectOptInCheckbox}
            name={FORM_INPUT_NAME_EMAIL_OPT_IN}
            label={staticText.getIn(['data', 'optIn'])}
            value={emailOptIn}
            className="live-page-email-capture__optin"
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
    const { staticText, emailCaptureKey, emailSignup, isAnonymous } = props
    const isCaptured = isEmailCaptured(emailCaptureKey)
    if (isCaptured || emailSignup.get('success') === true) {
      return null
    }
    const buttonText = isAnonymous ? staticText.getIn(['data', 'joinNow']) : staticText.getIn(['data', 'upgradeNow'])
    const url = isAnonymous ? JOIN_NOW_URL : UPGRADE_NOW_URL
    const query = isAnonymous ? JOIN_NOW_QUERY : null
    return (
      <div>
        <div className="live-page-email-capture__overlay live-page-email-capture__overlay--blocking">
          <div className="live-page-email-capture">
            <div className="live-page-email-capture__label">
              {staticText.getIn(['data', 'EmailLabel1'])}
            </div>
            {this.renderForm()}
            <div className="live-page-email-capture__label">
              {staticText.getIn(['data', 'EmailLabel2'])}
            </div>
            <Button
              buttonClass={['button', 'button--imagery', 'live-page__email-capture__button']}
              text={buttonText}
              url={url}
              query={query}
            />
          </div>
        </div>
      </div>
    )
  }
}

EmailCapture.propTypes = {
  enforce: PropTypes.bool,
  setEmailSignupOptin: PropTypes.func.isRequired,
}
EmailCapture.defaultProps = {
  enforce: false,
}

export default compose(
  connectStaticText({ storeKey: 'livePage' }),
  connectRedux(
    (state) => {
      const language = state.user.getIn(['data', 'language', 0], appLang)
      return {
        auth: state.auth,
        uid: (state.auth) ? state.auth.get('uid') : -1,
        emailSignup: state.emailSignup,
        url: state.page.get('path'),
        utm: state.inboundTracking.getIn(['data', 'strings', 'utm']),
        language,
        emailCaptureKey: getEventEmailCaptureKey(state.liveAccessEvents.getIn(['eventDetails', language, 'data', 'event'])),
        isAnonymous: !state.auth.get('username'),
        userEmail: state.user.getIn(['data', 'mail']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        doEmailSignup: actions.emailSignup.doEmailSignupBrooklyn,
        setEmailSignupOptin: actions.emailSignup.setEmailSignupOptin,
      }
    },
  ))(EmailCapture)
