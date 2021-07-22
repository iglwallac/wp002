import React, { PureComponent } from 'react'
import Title from 'components/Title'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { historyRedirect } from 'services/navigation'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import FormsyForm from 'formsy-react'
import {
  getRemoteLoginCodeValidation,
  TEXTBOX_REMOTE_LOGIN_CODE,
  REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED,
  APPROVE_REMOTE_LOGIN_CODE_PROCESSING,
  APPROVE_REMOTE_LOGIN_CODE_ERROR_CODE,
} from 'services/remote-login-code'
import FormInput, { FORM_INPUT_TYPE_TEXT } from 'components/FormInput'
import PropTypes from 'prop-types'
import _partial from 'lodash/partial'
import {
  FORM_BUTTON_TYPE_SUBMIT,
  FORM_BUTTON_TYPE_BUTTON,
} from 'components/FormButton/types'
import FormButton from 'components/FormButton'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { TYPE_LOGIN } from 'services/dialog'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import _get from 'lodash/get'
import { URL_LOGOUT } from 'services/url/constants'

function renderDescription (props, setIsAuthenticationConfirmed) {
  const { staticText, auth, remoteLoginCode, setOverlayDialogVisible } = props
  const successfullyActivatedCode = remoteLoginCode.getIn(['data', REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED])
  if (successfullyActivatedCode) {
    return null
  }
  if (!auth.get('jwt')) {
    return (
      <FormsyForm
        className="activate-remote-login-code__form"
        key="activate-remote-login-code-form-not-authenticated"
      >
        <p key="activate-remote-login-code-description">
          { staticText.getIn(['data', 'mainDescriptionNotAuthenticated']) }
        </p>
        <div className="activate-remote-login-code__buttons">
          <FormButton
            type={FORM_BUTTON_TYPE_BUTTON}
            formButtonClass={[
              'form-button--primary',
            ]}
            renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
            text={staticText.getIn(['data', 'login'])}
            onClick={function _confirmAuth () {
              setOverlayDialogVisible(TYPE_LOGIN)
              setIsAuthenticationConfirmed(true)
            }}
          />
        </div>
      </FormsyForm>
    )
  }
  return null
}

function logout (props) {
  const { history, auth, user } = props
  const language = user.getIn(['data', 'language', 0], 'en')
  historyRedirect({
    query: { redirect: 'activate' },
    url: URL_LOGOUT,
    language,
    history,
    auth,
  })
}

function renderAuth (props, state, successfullyActivatedCode, setIsAuthenticationConfirmed) {
  const { staticText, auth } = props
  const { isAuthenticationConfirmed } = state

  if (successfullyActivatedCode) {
    return null
  }
  if (!auth.get('jwt')) {
    return null
  }
  if (isAuthenticationConfirmed) {
    return null
  }
  return (
    <FormsyForm
      className="activate-remote-login-code__form"
      key="activate-remote-login-code-form"
    >
      <p key="activate-remote-login-code-auth-label" className={'activate-remote-login-code__label'}>
        { staticText.getIn(['data', 'youAreLoggedInAs']) }
        <span key="activate-remote-login-code-username" className="activate-remote-login-code__username">
          {auth.get('username')}
        </span>
      </p>
      <div className="activate-remote-login-code__buttons">
        <FormButton
          type={FORM_BUTTON_TYPE_BUTTON}
          formButtonClass={[
            'form-button--primary',
          ]}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          text={staticText.getIn(['data', 'activateCode'])}
          onClick={function _confirmAuth () { setIsAuthenticationConfirmed(true) }}
        />
        <FormButton
          type={FORM_BUTTON_TYPE_BUTTON}
          formButtonClass={[
            'form-button--secondary',
          ]}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          text={staticText.getIn(['data', 'loginAsADifferentUser'])}
          onClick={function _logout () { logout(props) }}
        />
      </div>
    </FormsyForm>
  )
}

function renderSuccessMessage (props) {
  const { staticText } = props
  return (<p key="activate-remote-login-code-success-label">
    { staticText.getIn(['data', 'success']) }
  </p>)
}

function renderActivationErrorMessage (props) {
  const { remoteLoginCode, staticText } = props
  const activationErrorCode = remoteLoginCode.getIn(['data', APPROVE_REMOTE_LOGIN_CODE_ERROR_CODE])
  if (activationErrorCode) {
    const activationErrorMessage = activationErrorCode === 400 ? staticText.getIn(['data', 'activationCodeErrorNotFound']) : staticText.getIn(['data', 'activationCodeErrorGeneric'])
    return (<p key="activate-remote-login-code-error" className={'activate-remote-login-code__error'}>
      {activationErrorMessage}
    </p>)
  }
  return null
}

function renderRemoteLoginControl (props) {
  const { staticText } = props
  return (<div className={'activate-remote-login-code__code'}>
    <label className={'activate-remote-login-code__label'} htmlFor={TEXTBOX_REMOTE_LOGIN_CODE}>
      { staticText.getIn(['data', 'activationCodeLabel']) }
    </label>
    <div className={'activate-remote-login-code__spacer'} />
    {renderActivationErrorMessage(props)}
    <FormInput
      name={TEXTBOX_REMOTE_LOGIN_CODE}
      type={FORM_INPUT_TYPE_TEXT}
      maxLength={6}
      validations={getRemoteLoginCodeValidation()}
      required
      placeholder={staticText.getIn([
        'data',
        'enterActivationCode',
      ])}
    />
  </div>)
}

function onValidSubmit (model, props) {
  const remoteLoginCode = model[TEXTBOX_REMOTE_LOGIN_CODE]
  const { auth, getRemoteLoginCodeApproval } = props
  getRemoteLoginCodeApproval({ auth, remoteLoginCode }).then(() => {})
}

function renderForm (props, state, setIsRemoteLoginCodeInputValid) {
  const { isRemoteLoginCodeInputValid, isAuthenticationConfirmed } = state
  const { staticText, auth, remoteLoginCode } = props
  const processing = remoteLoginCode.getIn([APPROVE_REMOTE_LOGIN_CODE_PROCESSING])

  if (auth.get('jwt') && isAuthenticationConfirmed) {
    return (<FormsyForm
      key="activate-remote-login-code-main-form"
      className="activate-remote-login-code__form"
      onValidSubmit={_partial(onValidSubmit, _partial.placeholder, props)}
      onValid={_partial(setIsRemoteLoginCodeInputValid, true)}
      onInvalid={_partial(setIsRemoteLoginCodeInputValid, false)}
    >
      {renderRemoteLoginControl(props)}
      <div className="activate-remote-login-code__buttons">
        <FormButton
          type={FORM_BUTTON_TYPE_SUBMIT}
          formButtonClass={[
            'form-button--primary',
            'form-button--stacked',
            'activate-remote-login-code__next-button',
          ]}
          disabled={!isRemoteLoginCodeInputValid || processing}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          text={staticText.getIn(['data', 'activate'])}
        />
      </div>
    </FormsyForm>)
  }
  return null
}

function renderContent (
  props,
  state,
  setIsAuthenticationConfirmed,
  setIsRemoteLoginCodeInputValid) {
  const { remoteLoginCode } = props
  const successfullyActivatedCode = remoteLoginCode.getIn(['data', REMOTE_LOGIN_CODE_SUCCESSFULLY_ACTIVATED])
  const processing = remoteLoginCode.getIn([APPROVE_REMOTE_LOGIN_CODE_PROCESSING])

  if (processing) {
    return (
      <Sherpa type={TYPE_SMALL_WHITE} className={['activate-remote-login-code__sherpa']} />
    )
  }
  const returnValue = []
  returnValue.push(renderDescription(props, setIsAuthenticationConfirmed))
  returnValue.push(
    renderAuth(props, state, successfullyActivatedCode, setIsAuthenticationConfirmed),
  )
  if (successfullyActivatedCode) {
    returnValue.push(renderSuccessMessage(props))
  } else {
    returnValue.push(renderForm(props, state, setIsRemoteLoginCodeInputValid))
  }
  return returnValue
}

class ActivateRemoteLoginCodePage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isRemoteLoginCodeInputValid: false,
      isAuthenticationConfirmed: false,
    }
  }

  componentDidMount () {
    const { auth, setOverlayDialogVisible, location } = this.props
    const query = location.query
    const redirectedFrom = _get(query, 'redirectedFrom')

    if (!auth.get('jwt') && redirectedFrom) {
      setOverlayDialogVisible(TYPE_LOGIN)
      this.setIsAuthenticationConfirmed(true)
    }
  }

  setIsRemoteLoginCodeInputValid = (isRemoteLoginCodeInputValid) => {
    this.setState(() => ({ isRemoteLoginCodeInputValid }))
  }

  setIsAuthenticationConfirmed = (isAuthenticationConfirmed) => {
    this.setState(() => ({ isAuthenticationConfirmed }))
  }

  render () {
    const { staticText } = this.props
    return (
      <div className="activate-remote-login-code">
        <div className="activate-remote-login-code__jumbotron">
          <Title
            text={staticText.getIn(['data', 'activateYourDevice'])}
            className={['activate-remote-login-code__jumbotron-title']}
          />
        </div>
        <div className="activate-remote-login-code__content-wrapper">
          <div className="activate-remote-login-code__content">
            {renderContent(this.props,
              this.state,
              this.setIsAuthenticationConfirmed,
              this.setIsRemoteLoginCodeInputValid)}
          </div>
        </div>
      </div>
    )
  }
}

ActivateRemoteLoginCodePage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  getRemoteLoginCodeApproval: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'activateRemoteLoginCodePage' }),
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
      remoteLoginCode: state.remoteLoginCode,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getRemoteLoginCodeApproval: actions.remoteLoginCode.getRemoteLoginCodeApproval,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      }
    },
  ),
)(ActivateRemoteLoginCodePage)
