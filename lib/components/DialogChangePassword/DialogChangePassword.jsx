import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import FormPassword from 'components/FormPassword'
import FormsyForm from 'formsy-react'
import { RENDER_TYPE_FORM_BUTTON_INPUT } from 'render'
import _partial from 'lodash/partial'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { getPasswordValidation } from 'services/password'
import _assign from 'lodash/assign'
import PropTypes from 'prop-types'
import Button from 'components/Button'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { TYPE_FORGOT_PASSWORD } from 'services/dialog'
import { H3 } from 'components/Heading'

function onValidSubmit (model, props) {
  const { auth, updateUser } = props
  const password = {
    current: model.password,
    updated: model.newPassword,
  }

  updateUser({ auth, password })
}

function renderSuccessContent (props) {
  const { staticText, setOverlayDialogVisible } = props
  return (
    <div className="dialog-change-password__success">
      <div className="dialog-change-password__success-text">
        {staticText.getIn(['data', 'changed'])}
      </div>
      <Button
        buttonClass={['button--secondary', 'dialog-change-password__success-btn']}
        text={staticText.getIn(['data', 'goToProfile'])}
        onClick={() => setOverlayDialogVisible(null, false)}
      />
    </div>
  )
}

class DialogChangePassword extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      canSubmit: false,
    }
  }

  componentDidMount () {
    const { clearUserProfileData } = this.props
    clearUserProfileData()
  }

  componentWillUnmount () {
    const { clearUserProfileData } = this.props
    clearUserProfileData()
  }

  onClickForgotPassword = (e, props) => {
    e.preventDefault()
    const { setOverlayDialogVisible } = props
    setOverlayDialogVisible(TYPE_FORGOT_PASSWORD)
  }

  setCanSubmit = (canSubmit) => {
    this.setState(() => ({ canSubmit }))
  }

  render () {
    const props = this.props
    const state = this.state
    const {
      staticText,
      user,
    } = props
    const { canSubmit } = state
    const { setCanSubmit, onClickForgotPassword } = this
    const updateUserSuccess = user.getIn(['updateUser', 'success'])
    const updateUserStatusCode = user.getIn(['updateUser', 'statusCode'])
    const submitError = user.get('updateUser') && (!updateUserSuccess || updateUserStatusCode > 299)
    const processing = user.get('updateUserProcessing')

    return (
      <div className="dialog-change-password">
        {
          processing ?
            <div className="dialog-change-password__processing">
              <Sherpa className={['dialog-change-password__sherpa']} type={TYPE_SMALL_BLUE} />
              <div className="dialog-change-password__processing-text">
                {`${staticText.getIn(['data', 'savingPassword'])}...`}
              </div>
            </div>
            : null
        }
        <H3 className="dialog-change-password__title">
          {
            updateUserSuccess ?
              staticText.getIn(['data', 'success'])
              : staticText.getIn(['data', 'title'])}
        </H3>
        {
          submitError ?
            <div className="dialog-change-password__error">
              {staticText.getIn(['data', 'recognizeError'])}
            </div>
            : null
        }
        {
          updateUserSuccess ?
            renderSuccessContent(props)
            :
            <div className="dialog-change-password__content">
              <FormsyForm
                onValidSubmit={_partial(
                  onValidSubmit,
                  _partial.placeholder,
                  props,
                )}
                onInvalid={_partial(setCanSubmit, false)}
                onValid={_partial(setCanSubmit, true)}
              >
                <FormPassword
                  name="password"
                  label={staticText.getIn(['data', 'currentPassword'])}
                  validations={{ minLength: 1 }}
                  required
                />
                <FormPassword
                  name="newPassword"
                  label={staticText.getIn(['data', 'newPassword'])}
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
                <FormPassword
                  name="passwordConfirm"
                  label={staticText.getIn(['data', 'confirmNewPassword'])}
                  validations={_assign(
                    { equalsField: 'newPassword' },
                    getPasswordValidation(),
                  )}
                  validationErrors={{
                    equalsField: staticText.getIn(['data', 'noMatch']),
                  }}
                  required
                  hasValidation
                />
                <div className="dialog-change-password__buttons">
                  <Button
                    url={'/'}
                    text={staticText.getIn(['data', 'cancel'])}
                    buttonClass={['button--tertiary dialog-change-password__form-button']}
                  />
                  <FormButton
                    disabled={!canSubmit}
                    formButtonClass={[
                      'form-button--secondary',
                      'dialog-change-password__next-button',
                      'dialog-change-password__form-button',
                      'dialog-change-password__button--save',
                    ]}
                    renderType={RENDER_TYPE_FORM_BUTTON_INPUT}
                    type={FORM_BUTTON_TYPE_SUBMIT}
                    text={staticText.getIn(['data', 'save'])}
                  />
                </div>
              </FormsyForm>
              <Button
                buttonClass={['dialog-change-password__forgot-button']}
                text={staticText.getIn(['data', 'forgot'])}
                onClick={e => onClickForgotPassword(e, props)}
              />
            </div>
        }
      </div>
    )
  }
}

DialogChangePassword.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  updateUser: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  clearUserProfileData: PropTypes.func.isRequired,
}
export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        updateUser: actions.user.updateUser,
        clearUserProfileData: actions.user.clearUserProfileData,
      }
    },
  ),
  connectStaticText({ storeKey: 'dialogChangePassword' }),
)(DialogChangePassword)
