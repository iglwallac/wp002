import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { get as getConfig } from 'config'
import FormsyForm from 'formsy-react'
import { EmailInput, Checkbox } from 'components/FormInput.v2'
import FormButton from 'components/FormButton'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { buildEmailDataLayerObject } from 'services/event-tracking'
import { ERROR_EMAIL_INVALID, ERROR_EMAIL_REGISTRATION_ERROR } from 'services/email-signup'
import { H2, H6, HEADING_TYPES } from 'components/Heading'

function getClassName (className) {
  return ['email-capture'].concat(className || []).join(' ')
}

const { appLang } = getConfig()

class EmailCapture extends Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      canSubmit: false,
    }
  }

  onEmailSignup = (formData) => {
    const { props } = this
    const {
      onFormSubmit,
      formName,
      siteSegment,
      user,
      signupEvent,
      submitFooterEmailDataLayer,
      setFooterEmailDataLayer,
      submitGiftVideoEmailDataLayer,
      setGiftVideoEmailDataLayer,
      url,
      utm,
      name,
    } = props


    const emailSignup = formData[name]

    const userLanguage = user.getIn(['data', 'language', 0], appLang)

    onFormSubmit(emailSignup, formName, siteSegment, userLanguage, url, utm)

    if (submitFooterEmailDataLayer === true) {
      setFooterEmailDataLayer(buildEmailDataLayerObject('footer'))
    }

    if (submitGiftVideoEmailDataLayer === true) {
      setGiftVideoEmailDataLayer(buildEmailDataLayerObject('gift a video'))
    }

    if (signupEvent) {
      signupEvent()
    }
  }

  onSelectOptInCheckbox = (name, checked) => {
    const { setEmailSignupOptin } = this.props

    setEmailSignupOptin(checked)
  }

  onReset = () => {
    this.setState(() => ({ canSubmit: false }))
  }

  enableButton = () => {
    this.setState(() => ({ canSubmit: true }))
  }

  disableButton = () => {
    this.setState(() => ({ canSubmit: false }))
  }

  render () {
    const { props, state } = this
    const {
      backgroundGradient,
      inputPlaceholder,
      successText,
      emailSignup,
      staticText,
      buttonText,
      className,
      withTitle,
      inverted,
      subtext,
      success,
      name,
      uid,
    } = props

    const checkboxName = `${name}OptIn`

    // only show email capture for anonymous
    if (uid) {
      return null
    }

    const text = buttonText || staticText.getIn(['data', 'signUp'], 'Sign Up')
    const placeholder = inputPlaceholder || staticText.getIn(['data', 'formPlaceHolder'])
    const errorCode = emailSignup.get('errorCode')
    let errorMessage = ''
    const emailOptIn = emailSignup.get('optIn', false)
    const submitDisabled = state.canSubmit && emailSignup.get('optIn') ? false : true // eslint-disable-line

    const gradient = backgroundGradient ? 'email-capture__gradient' : ''

    if (errorCode === ERROR_EMAIL_INVALID) {
      errorMessage = staticText.getIn(['data', 'errorMessageInvalidEmail'])
    } else if (errorCode === ERROR_EMAIL_REGISTRATION_ERROR) {
      errorMessage = staticText.getIn(['data', 'errorMessageRegistrationError'])
    }

    if (!getConfig().features.emailCapture) {
      return null
    }

    if (success) {
      return (
        <div className={getClassName(className)}>
          <H2 as={HEADING_TYPES.H6} className="email-capture__title--success">
            {successText || staticText.getIn(['data', 'thankYou'])}
          </H2>
        </div>
      )
    }

    return (
      <div className={gradient}>
        { withTitle ?
          <H6 className="email-capture__cta">
            {staticText.getIn(['data', 'title'])}
          </H6>
          : null
        }
        <div className={getClassName(className)}>
          <FormsyForm
            onValid={this.enableButton}
            onInvalid={this.disableButton}
            onValidSubmit={this.onEmailSignup}
          >
            <div className="email-capture__input-wrapper">
              <div className="email-capture__fields">
                <EmailInput
                  autocomplete="off"
                  validations="isEmail"
                  className="email-capture__input"
                  // validationError={staticText.getIn(['data', 'enterValidEmail'])}
                  // errorsVisibleDelay={800}
                  label={placeholder}
                  name={name}
                  value=""
                  inverted={inverted}
                  required
                />
                <Checkbox
                  onChange={this.onSelectOptInCheckbox}
                  name={checkboxName}
                  label={staticText.getIn(['data', 'optIn'])}
                  value={emailOptIn}
                  className="email-capture__optin"
                  required
                />
              </div>
              <FormButton
                type={'submit'}
                formButtonClass={['button--primary', 'email-capture__submit']}
                renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                disabled={submitDisabled}
                text={text}
              />
              {
                errorCode && errorMessage ?
                  <div className="email-capture__error">{`* ${errorMessage}`}</div>
                  : null
              }
              <div className="email-capture__subtext">{subtext}</div>
            </div>
          </FormsyForm>
        </div>
      </div>
    )
  }
}

EmailCapture.defaultProps = {
  inverted: true,
  name: 'emailSignup',
}

EmailCapture.propTypes = {
  name: PropTypes.string,
  inverted: PropTypes.bool,
  className: PropTypes.array,
  subtext: PropTypes.string,
  successText: PropTypes.string,
  success: PropTypes.bool,
  formName: PropTypes.string,
  siteSegment: ImmutablePropTypes.map,
  onFormSubmit: PropTypes.func,
  buttonText: PropTypes.string,
  inputPlaceholder: PropTypes.string,
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  emailSignup: ImmutablePropTypes.map.isRequired,
  url: PropTypes.string,
  utm: PropTypes.string,
  setFooterEmailDataLayer: PropTypes.func.isRequired,
  setGiftVideoEmailDataLayer: PropTypes.func.isRequired,
  signupEvent: PropTypes.func,
  setEmailSignupOptin: PropTypes.func.isRequired,
}
// TODO: Refactor so onFormSubmit don't need to be passed in
export default connectRedux(
  state => ({
    staticText: state.staticText.getIn(['data', 'emailCapture']),
    user: state.user,
    uid: state.user.getIn(['data', 'uid']),
    emailSignup: state.emailSignup,
    url: state.page.get('path'),
    utm: state.inboundTracking.getIn(['data', 'strings', 'utm']),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setFooterEmailDataLayer: actions.eventTracking.setFooterEmailDataLayer,
      setGiftVideoEmailDataLayer: actions.eventTracking.setGiftVideoEmailDataLayer,
      setEmailSignupOptin: actions.emailSignup.setEmailSignupOptin,
    }
  },
)(EmailCapture)
