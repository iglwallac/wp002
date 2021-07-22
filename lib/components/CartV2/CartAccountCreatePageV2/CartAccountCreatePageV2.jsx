import React, { useState } from 'react'
import { List } from 'immutable'
import PropTypes from 'prop-types'
import FormsyForm from 'formsy-react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { getBoundActions } from 'actions'
import { get as getConfig } from 'config'
import _get from 'lodash/get'
import _assign from 'lodash/assign'
import _partial from 'lodash/partial'
import compose from 'recompose/compose'
import _debounce from 'lodash/debounce'
import _findIndex from 'lodash/findIndex'
import _startsWith from 'lodash/startsWith'
import _size from 'lodash/size'
import _omit from 'lodash/omit'
import {
  getPasswordValidation,
  getRepeatedPasswordValidation,
  PASSWORD_REGEX,
  PASSWORD_LENGTH,
  PASSWORD_MAX_LENGTH,
} from 'services/password'
import { getLocalPreferences } from 'services/local-preferences'
import { buildEmailDataLayerObject } from 'services/event-tracking'
import { PAYMENT_PROVIDER_NAME_GCSI } from 'services/paytrack'
import { ERROR_EMAIL_INVALID } from 'services/email-signup'
import { ACCOUNT_TYPE_FMTV } from 'services/user-account'
import { URL_CART_BILLING } from 'services/url/constants'
import { historyRedirect } from 'services/navigation'
import { getAuthIsLoggedIn } from 'services/auth'
import { GDPR_COUNTRIES } from 'services/country'
import { TYPE_LOGIN } from 'services/dialog'
import {
  FORM_INPUT_NAME_FIRST_NAME,
  FORM_INPUT_NAME_LAST_NAME,
  FORM_INPUT_NAME_EMAIL,
  FORM_INPUT_NAME_PASSWORD,
  FORM_INPUT_NAME_REPEATED_PASSWORD,
  FORM_INPUT_NAME_EMAIL_OPT_IN,
  FORM_INPUT_NAME_TERMS,
} from 'services/form'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import CartProgressIndicator from 'components/CartProgressIndicator'
import { TARGET_BLANK } from 'components/Link/constants'
import { H1, HEADING_TYPES } from 'components/Heading'
import { Button, TYPES } from 'components/Button.v2'
import FormPassword from 'components/FormPassword'
import FormButton from 'components/FormButton'
import Sherpa from 'components/Sherpa'
import Link from 'components/Link'
import FormInput, {
  FORM_INPUT_TYPE_EMAIL,
  FORM_INPUT_TYPE_TEXT,
  FORM_INPUT_TYPE_CHECKBOX,
} from 'components/FormInput'
import CartOrderSummaryV2 from 'components/CartV2/CartOrderSummaryV2'

const config = getConfig()
const dataLayer = global.dataLayer

function handleOnBlurCheckEmail (e, getUserEmailAvailability) {
  const email = _get(e, ['target', 'value'])
  const valid = _get(e, ['target', 'validity', 'valid'])
  if (!email || !valid) {
    return
  }
  const pattern = /^.+@.+\..{2,}$/
  // We are compensating for Formsy saying the email is valid (when its not)
  if (!pattern.test(email)) {
    return
  }
  getUserEmailAvailability(email)
}

function handleOnChangeEmail (e, props) {
  const {
    user,
    checkout,
    resetUserEmailAvailability,
    resetCheckoutEmailCaptureStatus,
  } = props
  if (user.has('emailAvailable')) {
    resetUserEmailAvailability()
  }
  if (checkout.has('emailCaptureErrorCode')) {
    resetCheckoutEmailCaptureStatus()
  }
}

function handleOnResetEmailInput (e, resetUserEmailAvailability) {
  resetUserEmailAvailability()
}

function handleOnValidSubmit (data, props) {
  const {
    auth,
    plans,
    history,
    user = Map(),
    setCheckoutUserData,
    captureCheckoutEmail,
    setCartAbandonEmailDataLayer,
  } = props
  const language = user.getIn(['data', 'language'])
  const emailCaptureChecked = _get(data, 'emailOptIn', false)

  const { appCountry } = config

  if (!getAuthIsLoggedIn(auth)) {
    setCheckoutUserData(data)
    setCartAbandonEmailDataLayer(buildEmailDataLayerObject('cart abandon'))
    captureCheckoutEmail({
      email: _get(data, 'email'),
      firstName: _get(data, 'firstName'),
      sku: plans.getIn(['selection', 'sku']),
      utm: getLocalPreferences(auth.get('uid'), 'utm'),
      language: user.getIn(['data', 'language'], List()).toJS(),
      country: plans.getIn(['selection', 'country'], appCountry),
    })
  }

  if (emailCaptureChecked === true && dataLayer) {
    dataLayer.push({
      event: 'customEvent',
      eventCategory: 'user engagement',
      eventAction: 'opt-in selection',
      eventLabel: 'receive emails-account creation',
    })
  }

  historyRedirect({ history, url: URL_CART_BILLING, auth, language })
}

function setFormValid (props, valid) {
  const { checkout, setCheckoutAccountValid } = props
  if (valid !== checkout.get('accountValid')) {
    setCheckoutAccountValid(valid)
  }
}

function renderPrivacyTerms () {
  return (
    <span>
      {'To start your subscription, you must agree to the '}
      <Link
        directLink
        to="/terms-privacy"
        target={TARGET_BLANK}
      >
        {'Terms of Use and our Privacy Policy'}
      </Link>
      {' by checking this box.'}
    </span>
  )
}

function CartAccountCreatePageV2 (props) {
  const {
    checkout,
    paytrack,
    plans,
    getUserEmailAvailability,
    resetUserEmailAvailability,
    setOverlayDialogVisible,
    user,
    userAccount,
  } = props

  const [formError, setFormError] = useState(false)
  const freeTrialId = user.getIn(['data', 'userFreeTrial', 'ratePlanId'])
  const gaiaAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  // const isSubmitDisabled = handleIsSubmitDisabled(props)
  const debounceSetFormValid = _debounce(setFormValid, 100)
  const creationSource = user.getIn(['data', 'creation_source'])
  const creationSourceFMTV = _startsWith(creationSource, ACCOUNT_TYPE_FMTV, 0)
  const externalEmail = user.getIn(['data', 'email_registered_externally'])
  const providerName = paytrack.getIn(['lastTransaction', 'provider_name'])
  const { appCountry } = config
  const country = plans.getIn(['selection', 'country'], appCountry)
  const gdprCountryIndex = _findIndex(GDPR_COUNTRIES, c => c === country)
  const isGdprCountry = gdprCountryIndex !== -1
  const hideOptIn = !isGdprCountry
  const isChildAccount = user.get('childProfile') === true
  let errors = {}

  const onClickLoginButton = () => {
    setOverlayDialogVisible(TYPE_LOGIN)
  }

  const onInvalidSubmit = (model, resetForm, invalidateForm) => {
    validateInputFields(model)
    if (!model.firstName) {
      _assign(errors, { [FORM_INPUT_NAME_FIRST_NAME]: 'Please enter first name. Numbers and special characters are not allowed.' })
    }
    if (!model.lastName) {
      _assign(errors, { [FORM_INPUT_NAME_LAST_NAME]: 'Please enter last name. Numbers and special characters are not allowed.' })
    }
    if (!model.email) {
      _assign(errors, { [FORM_INPUT_NAME_EMAIL]: 'Please enter a valid email address.' })
    }
    if (!model.password) {
      _assign(errors, { [FORM_INPUT_NAME_PASSWORD]: 'Passwords must be at least 7 characters. Passwords must contain 1 uppercase letter and 1 number.' })
    }
    if (!model.repeatedPassword) {
      _assign(errors, { [FORM_INPUT_NAME_REPEATED_PASSWORD]: 'Please reenter password.' })
    }

    // This is a janky work around - there is a problem if you fat finger the password field
    // but get the confirm password field correct and hit submit.
    // If you then change the password to match and don't interact with the confirm password field
    // Then the form won't validate. Not sure if it is a problem with formsy,
    // or with the password field. This work around is a bit janky...
    // if there are no errors from the fields, then go ahead and pretend this is a valid submit
    // This is fragile and should be rethought before being productized
    if (_size(errors) === 0) {
      return handleOnValidSubmit(model, props)
    }

    setFormError(true)
    invalidateForm(errors)
    errors = {}

    return errors
  }

  const validateEmail = () => {
    let errorMessage = null
    if (user.get('emailAvailable') === false && !isChildAccount) {
      errorMessage = 'Looks like that email address is already being used. Login to your account.'
    } else if (checkout.get('emailCaptureErrorCode') === ERROR_EMAIL_INVALID) {
      errorMessage = 'There appears to be something wrong with your email address format. Please check and try again.'
    }
    return errorMessage
  }

  const validateInputFields = (model) => {
    const isNameValid = new RegExp(/^[A-Za-z]+$/)
    const isEmailValid = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)

    if (model.firstName && !isNameValid.test(model.firstName)) {
      _assign(errors, { [FORM_INPUT_NAME_FIRST_NAME]: 'Numbers and special characters are not allowed.' })
    }

    if (model.lastName && !isNameValid.test(model.lastName)) {
      _assign(errors, { [FORM_INPUT_NAME_LAST_NAME]: 'Numbers and special characters are not allowed.' })
    }

    if (model.email && !isEmailValid.test(model.email)) {
      _assign(errors, { [FORM_INPUT_NAME_EMAIL]: 'Please enter a valid email address.' })
    }

    if (model.password && (
      model.password.length < PASSWORD_LENGTH || !PASSWORD_REGEX.test(model.password))
    ) {
      _assign(errors, { [FORM_INPUT_NAME_PASSWORD]: 'Passwords must be at least 7 characters. Passwords must contain 1 uppercase letter and 1 number.' })
    } else if (model.password && model.password.length > PASSWORD_MAX_LENGTH) {
      _assign(errors, { [FORM_INPUT_NAME_PASSWORD]: `Passwords must contain no more than 32 characters. Current count: ${model.password.length}` })
    }

    if (model.repeatedPassword && model.repeatedPassword !== model.password) {
      _assign(errors, { [FORM_INPUT_NAME_REPEATED_PASSWORD]: 'Passwords do not match.' })
    }
  }

  let isProcessing
  if (user.get('processing')) {
    isProcessing = true
  } else if (freeTrialId && !gaiaAccount) {
    isProcessing = false
  } else if (
    // Allow users migrated from FMTV to create an account
    (creationSourceFMTV && !gaiaAccount) ||
    (!creationSourceFMTV && externalEmail && !gaiaAccount) ||
    (creationSourceFMTV && !externalEmail && !gaiaAccount)
  ) {
    isProcessing = false
  } else if (user.getIn(['data', 'entitled']) && providerName !== PAYMENT_PROVIDER_NAME_GCSI) {
    isProcessing = true
  }

  return (
    <div className="cart-account-create-v2">
      <div className="cart-account-create-v2__content">
        <div className="cart-account-create-v2__content-left">
          <CartProgressIndicator />
          <H1 as={HEADING_TYPES.H3} className="cart-account-create-v2__title">
            Create your account
          </H1>
          {isProcessing ? (
            <Sherpa className={['cart-account-create-v2__sherpa']} />
          ) :
            <FormsyForm
              onValid={_partial(debounceSetFormValid, props, true)}
              onInvalid={_partial(debounceSetFormValid, props, false)}
              onValidSubmit={_partial(handleOnValidSubmit, _partial.placeholder, props)}
              onInvalidSubmit={onInvalidSubmit}
              className={`cart-account-create-v2__form ${formError ? 'cart-account-create-v2__form-error' : ''}`}
              noValidate
            >
              <div className="cart-account-create-v2__form-inline-container">
                <FormInput
                  name={FORM_INPUT_NAME_FIRST_NAME}
                  label={'First Name'}
                  type={FORM_INPUT_TYPE_TEXT}
                  validations="isSpecialWords"
                  // validationErrors={{
                  //   isSpecialWords: 'Numbers and special characters are not allowed.',
                  // }}
                  maxLength={32}
                  className={['cart-account-create-v2__first-name']}
                  textInputClassName={['cart-account-create__text-input']}
                  labelClassName={['cart-account-create-v2__text-label']}
                  required
                />
                <FormInput
                  name={FORM_INPUT_NAME_LAST_NAME}
                  label={'Last Name'}
                  type={FORM_INPUT_TYPE_TEXT}
                  validations="isSpecialWords"
                  // validationErrors={{
                  //   isSpecialWords: 'Numbers and special characters are not allowed.',
                  // }}
                  maxLength={32}
                  className={['cart-account-create-v2__last-name']}
                  textInputClassName={['cart-account-create-v2__text-input']}
                  labelClassName={['cart-account-create-v2__text-label']}
                  required
                />
              </div>
              <FormInput
                onBlur={_partial(
                  handleOnBlurCheckEmail,
                  _partial.placeholder,
                  getUserEmailAvailability,
                )}
                onReset={e => handleOnResetEmailInput(e, resetUserEmailAvailability)}
                onChange={_partial(handleOnChangeEmail, _partial.placeholder, props)}
                disabled={user.get('emailAvailabilityProcessing') === true}
                error={validateEmail()}
                name={FORM_INPUT_NAME_EMAIL}
                // errorsVisibleDelay={1250}
                label={'Email'}
                type={FORM_INPUT_TYPE_EMAIL}
                validations={{ isEmail: true }}
                // validationErrors={{
                //   isEmail: 'Please enter a valid email address.',
                // }}
                required
                className={[`cart-account-create-v2__email ${isChildAccount ? 'cart-account-create-v2__email--child-error' : ''}`]}
                labelClassName={['cart-account-create-v2__text-label']}
                textInputClassName={['cart-account-create-v2__text-input']}

              />
              {
                user.get('emailAvailable') === false && !isChildAccount ?
                  <Button
                    type={TYPES.PRIMARY}
                    className="cart-account-create-v2__login-button"
                    onClick={onClickLoginButton}
                  >
                    {'Log In'}
                  </Button>
                  :
                  null
              }
              { isChildAccount ?
                <span className="cart-account-create-v2__email-child-error">
                  {'This email is connected to another account. Please try another email or contact '}
                  <Link
                    directLink
                    to="https://gaiasupportcenter.zendesk.com/hc/en-us/requests/new?ticket_form_id=360000892371"
                    target={TARGET_BLANK}
                  >
                    {'Customer Service '}
                  </Link>
                  {'to separate this email from the other account.'}
                </span>
                :
                null
              }
              <FormPassword
                name={FORM_INPUT_NAME_PASSWORD}
                label={'Create Password'}
                validations={_omit(getPasswordValidation(), ['maxLength'])}
                // validationErrors={{
                //   minLength: 'Passwords must be at least 7 characters',
                //   matchRegexp: 'Passwords must contain 1 uppercase letter and 1 number',
                // }}
                formPasswordInputClassName={['cart-account-create-v2__text-input']}
                formPasswordLabelClassName={[`cart-account-create-v2__text-label ${isChildAccount ? 'cart-account-create-v2__password--child-error' : ''}`]}
                showProgress
                required
              />
              <FormPassword
                name={FORM_INPUT_NAME_REPEATED_PASSWORD}
                label={'Reenter Password'}
                validations={getRepeatedPasswordValidation(FORM_INPUT_NAME_PASSWORD)}
                // validationErrors={{
                //   minLength: 'Passwords must be at least 7 characters',
                //   matchRegexp: 'Passwords must contain 1 uppercase letter and 1 number',
                // }}
                formPasswordInputClassName={['cart-account-create-v2__text-input']}
                formPasswordLabelClassName={['cart-account-create-v2__text-label']}
                showProgress
                required
              />
              <FormInput
                name={FORM_INPUT_NAME_EMAIL_OPT_IN}
                label={'I would like to sign up to receive Gaia emails to get the latest news about new content & features. You can unsubscribe at any time.'}
                type={FORM_INPUT_TYPE_CHECKBOX}
                value={!isGdprCountry}
                checkedValue
                hidden={hideOptIn}
                labelClassName={['cart-account-create-v2__checkbox-label']}
              />
              <FormInput
                name={FORM_INPUT_NAME_TERMS}
                label={renderPrivacyTerms()}
                type={FORM_INPUT_TYPE_CHECKBOX}
                checkedValue
                required
                labelClassName={['cart-account-create-v2__checkbox-label']}
              />
              <FormButton
                type={FORM_BUTTON_TYPE_SUBMIT}
                formButtonClass={[
                  'form-button--primary',
                  'form-button--primary',
                  'form-button--stacked',
                  'form-button--submit',
                  'cart-account-create-v2__continue-button',
                ]}
                renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                text={user.get('emailAvailabilityProcessing') ? 'processing' : 'continue'}
              />
              {formError ? (
                <p className="cart-account-create-v2__error">
                  Please complete all required fields above.
                </p>
              ) :
                null
              }
            </FormsyForm>
          }
        </div>
        <div className="cart-account-create-v2__content-right">
          <div className="cart-account-create-v2__order-summary">
            <CartOrderSummaryV2 />
          </div>
        </div>
      </div>
    </div>
  )
}

CartAccountCreatePageV2.propTypes = {
  captureCheckoutEmail: PropTypes.func.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  paytrack: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  getUserEmailAvailability: PropTypes.func.isRequired,
  resetCheckoutEmailCaptureStatus: PropTypes.func.isRequired,
  resetUserEmailAvailability: PropTypes.func.isRequired,
  setCartAbandonEmailDataLayer: PropTypes.func.isRequired,
  setCheckoutUserData: PropTypes.func.isRequired,
  setCheckoutAccountValid: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      auth: state.auth,
      checkout: state.checkout,
      paytrack: state.paytrack,
      plans: state.plans,
      resetUserEmailAvailability: PropTypes.func.isRequired,
      user: state.user,
      userAccount: state.userAccount,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        captureCheckoutEmail: actions.checkout.captureCheckoutEmail,
        getUserEmailAvailability: actions.user.getUserEmailAvailability,
        resetCheckoutEmailCaptureStatus: actions.checkout.resetCheckoutEmailCaptureStatus,
        resetUserEmailAvailability: actions.user.resetUserEmailAvailability,
        setCartAbandonEmailDataLayer: actions.eventTracking.setCartAbandonEmailDataLayer,
        setCheckoutUserData: actions.checkout.setCheckoutUserData,
        setCheckoutAccountValid: actions.checkout.setCheckoutAccountValid,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      }
    },
  ),
  connectStaticText({ storeKey: 'cartAccountContinuePage' }),
)(CartAccountCreatePageV2)
