import { getPrimary } from 'services/languages'
import { ES } from 'services/languages/constants'
import { URL_HELP_CENTER_ES } from 'services/url/constants'
import { get as getConfig } from 'config'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fromJS, Map, List } from 'immutable'
import _partial from 'lodash/partial'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _isFunction from 'lodash/isFunction'
import LoginUsername from 'components/LoginUsername'
import LoginPassword from 'components/LoginPassword'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_LINK } from 'components/ButtonSignUp'
import Link, { TARGET_BLANK } from 'components/Link'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import Loading, { LOADING_ICON_BLUE_DARK_BG_WHITE } from 'components/Loading'
import ErrorMessage from 'components/ErrorMessage'
import { connect as connectRedux } from 'react-redux'
import FormsyForm from 'formsy-react'
import { getBoundActions } from 'actions'
import { connect as connectRouter } from 'components/Router/connect'
import { TYPE_FORGOT_PASSWORD } from 'services/dialog'
import {
  historyRedirect,
  HISTORY_METHOD_REPLACE,
} from 'services/navigation'
import FormInput, {
  FORM_INPUT_TYPE_CHECKBOX,
} from 'components/FormInput'
import { LOGIN_CODE_UNRECOGNIZED_USERNAME_PASSWORD } from 'services/auth/login-codes'
import { H2, HEADING_TYPES } from 'components/Heading'

const { features } = getConfig()

function renderPrivacyTerms (props) {
  const { cartAccountCreatePageStaticText } = props
  return (
    <span>
      {`${cartAccountCreatePageStaticText.getIn(['data', 'termsLabelStartFmtv'])} `}
      <Link
        directLink
        to="/terms-privacy"
        target={TARGET_BLANK}
        // onClick={e => onClickLink(e, props, 'Terms Privacy Link Clicked', 'Terms Privacy')}
      >
        {cartAccountCreatePageStaticText.getIn(['data', 'termsLink'])}
      </Link>
      {` ${cartAccountCreatePageStaticText.getIn(['data', 'termsLabelEnd'])}`}
    </span>
  )
}

async function onValidSubmit (model, props) {
  const {
    doAuthLogin,
    setLoginMessages,
    setLoginMessageCodes,
  } = props
  const {
    username,
    password,
  } = model
  setLoginMessages(null)
  setLoginMessageCodes(null)
  try {
    const auth = await doAuthLogin({ username, password })
    if (_get(auth, 'success')) {
      onLoginSuccess(props, auth)
    } else {
      setLoginMessages(_get(auth, 'messages', []))
      setLoginMessageCodes(_get(auth, 'codes', []))
    }
  } catch (e) {
    setLoginMessages([e.toString()])
    setLoginMessageCodes([-1])
  }
}

function onClickForgotPassword (e, props) {
  const { setOverlayDialogVisible } = props

  e.preventDefault()

  setOverlayDialogVisible(TYPE_FORGOT_PASSWORD)
}

function onLoginSuccess (props, auth) {
  const {
    setOverlayDialogVisible,
    location,
    history,
    resolver,
    user = Map(),
  } = props
  setOverlayDialogVisible(null, false)
  document.activeElement.blur()
  // Remove the language query when we login.
  const query = resolver.get('query', Map())
  const language = query.get('language', List())
  if (language.size > 0) {
    historyRedirect({
      history,
      url: location.pathname,
      auth: fromJS(auth),
      language: user.getIn(['data', 'language']),
      query: _omit(query.toJS(), ['language']),
      historyMethod: HISTORY_METHOD_REPLACE,
    })
  }
}

function onClickRegister (e, props) {
  const {
    onClickClose,
    setOverlayDialogVisible,
  } = props
  e.stopPropagation()
  setOverlayDialogVisible(null, false)

  if (_isFunction(onClickClose)) {
    onClickClose()
  }
}

function onClickCustomerService (e, props) {
  const {
    onClickClose,
    setOverlayDialogVisible,
  } = props
  e.stopPropagation()
  setOverlayDialogVisible(null, false)

  if (_isFunction(onClickClose)) {
    onClickClose()
  }
}

function isSubmitDisabled (canSubmit, processing) {
  return canSubmit === false || processing === true
}

function setCanSubmit (currentCanSubmit, nextCanSubmit, setLoginCanSubmit) {
  if (currentCanSubmit !== nextCanSubmit) {
    setLoginCanSubmit(nextCanSubmit)
  }
}

class Login extends Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      termsChecked: false,
    }
  }

  renderTermsCheckbox = () => {
    return (
      <FormInput
        name={'terms'}
        label={renderPrivacyTerms(this.props)}
        type={FORM_INPUT_TYPE_CHECKBOX}
        checkedValue
        labelClassName={['cart-tests-checkout-modal__checkbox-label']}
        user={Map()}
        onChange={() => this.setState(prevState => ({
          termsChecked: !prevState.termsChecked,
        }))}
        checked={this.state.termsChecked}
      />
    )
  }

  render () {
    const { props, state } = this
    const {
      login,
      auth,
      user,
      loginStaticText,
      setLoginCanSubmit,
      emailText,
      passwordText,
      forgotText,
      helpText,
      location,
    } = props
    const { termsChecked } = state
    const canSubmit = login.get('canSubmit', false)
    const authProcessing = auth.get('processing')
    const messages = login.get('messages')
    const messageCodes = login.get('messageCodes', List())
    const unrecognizedUserNameOrPassword =
      messageCodes.includes(LOGIN_CODE_UNRECOGNIZED_USERNAME_PASSWORD)
    const unrecognizedMessage = `${loginStaticText.getIn(['data', 'unrecognizedUsernameOrPassword'])} www.gaia.com/contact.`

    let supportLink =
      'https://gaiasupportcenter.zendesk.com/hc/en-us/requests/new'
    const langIsEs = getPrimary(user.getIn(['data', 'language'], List())) === ES
    const submitDisabled = isSubmitDisabled(canSubmit, authProcessing, termsChecked, location)

    if (langIsEs && _get(features, ['userLanguage', 'esZendeskHelpLink'])) {
      supportLink = URL_HELP_CENTER_ES
    }

    return (
      <div className="login">
        <H2 as={HEADING_TYPES.H4} className="login__title">
          {loginStaticText.getIn(['data', 'logIn'])}
        </H2>
        <FormsyForm
          onValidSubmit={_partial(onValidSubmit, _partial.placeholder, props)}
          onValid={_partial(setCanSubmit, canSubmit, true, setLoginCanSubmit)}
          onInvalid={_partial(setCanSubmit, canSubmit, false, setLoginCanSubmit)}
        >
          {messages ? (
            <ErrorMessage
              errorMessages={
                unrecognizedUserNameOrPassword ?
                  [unrecognizedMessage] :
                  messages.toArray()
              }
            />
          ) : (
            <div className="login__error-message-placeholer" />
          )}
          <LoginUsername
            name="username"
            validations={{ minLength: 1, maxLength: 60 }}
            required
            customPlaceholder={emailText}
          />
          <LoginPassword
            name="password"
            validations={{ maxLength: 60 }}
            required
            customPlaceholder={passwordText}
          />
          <div className="login__submit-wrapper">
            <FormButton
              type={FORM_BUTTON_TYPE_SUBMIT}
              disabled={submitDisabled}
              formButtonClass={[
                'form-button--primary',
                'form-button--stacked',
                'login__login-button',
              ]}
              renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
              text={loginStaticText.getIn(['data', 'logIn'])}
            />
          </div>
          <div className="login__forgot-password">
            <Link
              className="login__forgot-password-link"
              to="#forgot-password"
              onClick={_partial(
                onClickForgotPassword,
                _partial.placeholder,
                props,
              )}
            >
              {forgotText || loginStaticText.getIn(['data', 'forgotPassword'])}
            </Link>
          </div>
          <div className="login__register">
            <ButtonSignUp
              className="login__register-link"
              onClick={_partial(onClickRegister, _partial.placeholder, props)}
              type={BUTTON_SIGN_UP_TYPE_LINK}
              text={loginStaticText.getIn(['data', 'newToGaia'])}
              scrollToTop
            />
          </div>
          <div className="login__support">
            <Link
              to={supportLink}
              target={TARGET_BLANK}
              className="login__support-link"
              onClick={_partial(onClickCustomerService, _partial.placeholder, props)}
            >
              {helpText || loginStaticText.getIn(['data', 'contactCustomerService'])}
            </Link>
          </div>
          {authProcessing ? (
            <div className="login__loading">
              <Loading visible icon={LOADING_ICON_BLUE_DARK_BG_WHITE} />
            </div>
          ) : (
            <div className="login__loading-placeholder" />
          )}
        </FormsyForm>
      </div>
    )
  }
}

Login.propTypes = {
  setLoginCanSubmit: PropTypes.func.isRequired,
  setLoginMessageCodes: PropTypes.func.isRequired,
  setLoginMessages: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  login: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  app: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  loginStaticText: ImmutablePropTypes.map.isRequired,
  setAuthData: PropTypes.func.isRequired,
  doAuthLogin: PropTypes.func.isRequired,
  onClickClose: PropTypes.func,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setEventUserInteraction: PropTypes.func.isRequired,
}

export default compose(
  connectRouter(),
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
      page: state.page,
      app: state.app,
      resolver: state.resolver,
      login: state.login,
      loginStaticText: state.staticText.getIn(['data', 'login'], Map()),
      cartAccountCreatePageStaticText: state.staticText.getIn(['data', 'cartAccountCreatePage'], Map()),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setLoginCanSubmit: actions.login.setLoginCanSubmit,
        setLoginMessageCodes: actions.login.setLoginMessageCodes,
        setLoginMessages: actions.login.setLoginMessages,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setAuthData: actions.auth.setAuthData,
        doAuthLogin: actions.auth.doAuthLogin,
        setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
      }
    },
  ),
)(Login)
