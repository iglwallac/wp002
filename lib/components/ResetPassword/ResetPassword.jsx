import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import FormsyForm from 'formsy-react'
import FormPassword from 'components/FormPassword'
import FormButton from 'components/FormButton'
import Button from 'components/Button'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import Loading, { LOADING_ICON_BLUE_DARK_BG_WHITE } from 'components/Loading'
import _assign from 'lodash/assign'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import { TYPE_FORGOT_PASSWORD, TYPE_LOGIN } from 'services/dialog'
import { getPasswordValidation } from 'services/password'
import { connect as staticTextConnect } from 'components/StaticText/connect'
import { URL_HOME } from 'services/url/constants'
import { requestAnimationFrame } from 'services/animate'
import { H1, HEADING_TYPES } from 'components/Heading'

function onValidSubmit (
  model,
  expiry,
  token,
  uid,
  resetPassword,
  doResetPassword,
) {
  doResetPassword({
    uid,
    expiry,
    token,
    newPassword: model.password,
  })

  // scroll to the top of the page on every redirect
  if (global && global.scrollTo) {
    requestAnimationFrame(() => global.scrollTo(0, 0))
  }
}

function handleClickLogin (e, props, dialogName) {
  const { onClickLogin, setOverlayDialogVisible } = props
  e.preventDefault()
  setOverlayDialogVisible(dialogName)
  if (_isFunction(onClickLogin)) {
    onClickLogin(e)
  }
}

function renderResetPasswordForm (
  props,
  canSubmit,
  setCanSubmit,
) {
  const {
    expiry,
    token,
    uid,
    auth,
    resetPassword,
    doResetPassword,
    staticText,
  } = props
  const processing = resetPassword.get('processing', false)
  let message
  const success = resetPassword.getIn(['data', 'success'])
  const authToken = auth.get('jwt')

  if (!authToken && success === true) {
    message = staticText.getIn(['data', 'passwordHasBeenReset'])
  } else if (authToken && success === true) {
    message = staticText.getIn(['data', 'passwordHasBeenResetShort'])
  } else if (success === false) {
    message = staticText.getIn(['data', 'passwordResetError'])
  }

  return (
    <FormsyForm
      onValidSubmit={_partial(
        onValidSubmit,
        _partial.placeholder,
        expiry,
        token,
        uid,
        resetPassword,
        doResetPassword,
      )}
      onInvalid={_partial(setCanSubmit, false)}
      onValid={_partial(setCanSubmit, true)}
    >
      {success ? null : (
        <p className="reset-password__message-item">
          {staticText.getIn(['data', 'resetPasswordMessage'])}
        </p>
      )}
      {!message ? null : (
        <p
          className={
            `reset-password__message${success === false ? ' reset-password__error' : ''}`
          }
        >
          {message}
        </p>
      )}
      {success ? null : (
        <FormPassword
          name="password"
          label={staticText.getIn(['data', 'password'])}
          validations={getPasswordValidation()}
          validationErrors={{
            minLength: staticText.getIn(['data', 'passwordMinLengthMessage']),
            matchRegexp: staticText.getIn(['data', 'passwordRegexMessage']),
            maxLength: staticText.getIn(['data', 'passwordMaxLengthMessage']),
          }}
          required
          hasValidation
          showProgress
        />
      )}
      {success ? null : (
        <FormPassword
          name="passwordConfirm"
          label={staticText.getIn(['data', 'confirmPassword'])}
          validations={_assign(
            { equalsField: 'password' },
            getPasswordValidation(),
          )}
          validationErrors={{
            equalsField: staticText.getIn(['data', 'passwordsMustMatch']),
          }}
          required
          hasValidation
        />
      )}
      {processing || success ? null : (
        <FormButton
          formButtonClass={['form-button--primary', 'form-button--stacked']}
          type="submit"
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          text={staticText.getIn(['data', 'save'])}
          disabled={!canSubmit}
        />
      )}
      {authToken || processing || !success ? null : (
        <Button
          buttonClass={['button--primary', 'button--stacked']}
          text={staticText.getIn(['data', 'login'])}
          onClick={_partial(
            handleClickLogin,
            _partial.placeholder,
            props,
            TYPE_LOGIN,
          )}
        />
      )}
      {authToken && success ? (
        <Button
          buttonClass={['button--primary', 'button--stacked']}
          text={staticText.getIn(['data', 'goToGaiaHome'])}
          url={URL_HOME}
        />
      )
        : null
      }
      {!processing ? null : (
        <div className="reset-password__loading">
          <Loading visible icon={LOADING_ICON_BLUE_DARK_BG_WHITE} />
        </div>
      )}
    </FormsyForm>
  )
}

function renderResetPasswordExpired (props) {
  const { setOverlayDialogVisible, staticText } = props
  return (
    <div className="reset-password--expired">
      <p>{staticText.getIn(['data', 'resetLinkExpired'])}</p>
      <Button
        buttonClass={['button--primary', 'button--stacked']}
        text={staticText.getIn(['data', 'requestNewLink'])}
        onClick={_partial(
          onClickPasswordResetExpired,
          _partial.placeholder,
          setOverlayDialogVisible,
        )}
      />
    </div>
  )
}

function onClickPasswordResetExpired (e, setOverlayDialogVisible) {
  e.preventDefault()
  setOverlayDialogVisible(TYPE_FORGOT_PASSWORD)
}

function getTitle (props) {
  const { serverTime, expiry, resetPassword, staticText } = props
  const success = resetPassword.getIn(['data', 'success'])
  if (serverTime.getIn(['data', 'serverTime']) >= expiry) {
    return staticText.getIn(['data', 'linkExpired'])
  } else if (success) {
    return staticText.getIn(['data', 'success'])
  }
  return staticText.getIn(['data', 'resetPassword'])
}

class ResetPassword extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      canSubmit: false,
    }
  }

  componentDidMount () {
    const { auth, getServerTimeData, resetResetPassword } = this.props
    getServerTimeData(auth)
    resetResetPassword()
  }

  setCanSubmit = (canSubmit) => {
    this.setState(() => ({ canSubmit }))
  }

  render () {
    const props = this.props
    const { canSubmit } = this.state
    const { setCanSubmit } = this
    const { expiry, serverTime } = props
    const currentServerTime = serverTime.getIn(['data', 'serverTime'])
    if (!currentServerTime || serverTime.get('processing')) {
      return null
    }
    return (
      <div className="reset-password">
        <H1 as={HEADING_TYPES.H3} className="reset-password__title">{getTitle(props)}</H1>
        {currentServerTime < expiry
          ? renderResetPasswordForm(
            props,
            canSubmit,
            setCanSubmit,
          )
          : renderResetPasswordExpired(props)}
      </div>
    )
  }
}

ResetPassword.propTypes = {
  expiry: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  uid: PropTypes.number.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  serverTime: ImmutablePropTypes.map.isRequired,
  getServerTimeData: PropTypes.func.isRequired,
  onClickLogin: PropTypes.func,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  doResetPassword: PropTypes.func.isRequired,
  resetResetPassword: PropTypes.func.isRequired,
  resetPassword: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

const ResetPasswordStaticText = staticTextConnect({ storeKey: 'resetPassword' })(
  ResetPassword,
)

export default ResetPasswordStaticText
