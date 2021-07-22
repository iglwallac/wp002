import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { getLocalPreferences } from 'services/local-preferences'
import _get from 'lodash/get'
import _partial from 'lodash/partial'
import _startsWith from 'lodash/startsWith'
import _debounce from 'lodash/debounce'
import _findIndex from 'lodash/findIndex'
import FormsyForm from 'formsy-react'
import OptimizelyPage from 'components/OptimizelyPage'
import { ACCOUNT_TYPE_FMTV } from 'services/user-account'
import FormInput, {
  FORM_INPUT_TYPE_EMAIL,
  FORM_INPUT_TYPE_TEXT,
  FORM_INPUT_TYPE_CHECKBOX,
} from 'components/FormInput'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import FormPassword from 'components/FormPassword'
import { getPasswordValidation } from 'services/password'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import Sherpa from 'components/Sherpa'
import Button from 'components/Button'
import CartProgressIndicator from 'components/CartProgressIndicator'
import { URL_CART_BILLING } from 'services/url/constants'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { historyRedirect } from 'services/navigation'
import { get as getConfig } from 'config'
import { buildEmailDataLayerObject } from 'services/event-tracking'
import CartOrderSummary from 'components/CartOrderSummary'
import {
  FORM_INPUT_NAME_FIRST_NAME,
  FORM_INPUT_NAME_LAST_NAME,
  FORM_INPUT_NAME_EMAIL,
  FORM_INPUT_NAME_PASSWORD,
  FORM_INPUT_NAME_TERMS,
  FORM_INPUT_NAME_EMAIL_OPT_IN,
} from 'services/form'
import { PAYMENT_PROVIDER_NAME_GCSI } from 'services/paytrack'
import { ERROR_EMAIL_INVALID } from 'services/email-signup'
import { TYPE_LOGIN } from 'services/dialog'
import { GDPR_COUNTRIES } from 'services/country'
import { getAuthIsLoggedIn } from 'services/auth'
import OptimizelyTest from 'components/OptimizelyTest'
import CartAccountCreatePageV2 from 'components/CartV2/CartAccountCreatePageV2'
import { H2, H3, HEADING_TYPES } from 'components/Heading'

const config = getConfig()
const dataLayer = global.dataLayer

class CartAccountCreatePage extends Component {
  onValidSubmit = (data, props) => {
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

  onBlurCheckEmail = (e, props) => {
    const { getUserEmailAvailability } = props
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

  onChangeEmail = (e, props) => {
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

  onResetEmailInput = (e, props) => {
    const { resetUserEmailAvailability } = props
    resetUserEmailAvailability()
  }

  onClickLoginButton = () => {
    const { setOverlayDialogVisible } = this.props
    setOverlayDialogVisible(TYPE_LOGIN)
  }

  setFormValid = (props, valid) => {
    const { checkout, setCheckoutAccountValid } = props
    if (valid !== checkout.get('accountValid')) {
      setCheckoutAccountValid(valid)
    }
  }

  getContent = (props) => {
    const { staticText } = props

    return (
      <div className="cart-account-create">
        <CartOrderSummary mobile />
        <div className="cart-account-create__wrapper">
          <div className="cart-account-create__progress">
            <CartProgressIndicator />
          </div>
          <div className="cart-account-create__left-wrap">
            <H2 as={HEADING_TYPES.H3} className="cart-account-create__title">
              {staticText.getIn(['data', 'createYourAccount'])}
            </H2>
            {this.renderForm(props)}
          </div>
          <CartOrderSummary desktop />
        </div>
      </div>
    )
  }

  isSubmitDisabled = (props) => {
    const { auth, user, checkout, plans } = props

    if (auth.get('jwt')) {
      return !checkout.get('accountValid')
    }
    const processing =
      user.get('emailAvailabilityProcessing')
    const available = user.get('emailAvailable')
    const emailCaptureErrorCode = checkout.get('emailCaptureErrorCode')
    return (
      !checkout.get('accountValid') ||
      !available ||
      emailCaptureErrorCode ||
      processing ||
      plans.get('processingLocalized')
    )
  }

  renderForm = (props) => {
    const {
      auth,
      plans,
      user,
      staticText,
      paytrack,
      userAccount,
    } = props
    const freeTrialId = user.getIn(['data', 'userFreeTrial', 'ratePlanId'])
    const gaiaAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
    const submitDisabled = this.isSubmitDisabled(props)
    const debounceSetFormValid = _debounce(this.setFormValid, 100)
    const creationSource = user.getIn(['data', 'creation_source'])
    const creationSourceFMTV = _startsWith(creationSource, ACCOUNT_TYPE_FMTV, 0)
    const externalEmail = user.getIn(['data', 'email_registered_externally'])
    const { appCountry } = config
    const country = plans.getIn(['selection', 'country'], appCountry)
    const gdprCountryIndex = _findIndex(GDPR_COUNTRIES, c => c === country)
    const isGdprCountry = gdprCountryIndex !== -1
    const hideOptIn = !isGdprCountry
    const providerName = paytrack.getIn(['lastTransaction', 'provider_name'])

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
      <div>
        {isProcessing ? (
          <Sherpa className={['cart-account-create__sherpa']} />
        ) :
          <FormsyForm
            onValid={_partial(debounceSetFormValid, props, true)}
            onInvalid={_partial(debounceSetFormValid, props, false)}
            onValidSubmit={_partial(this.onValidSubmit, _partial.placeholder, props)}
          >
            {auth.get('jwt')
              ? this.renderFieldsUnentitled(props)
              : this.renderFieldsAnonymous(props)}
            <FormInput
              name={FORM_INPUT_NAME_EMAIL_OPT_IN}
              label={staticText.getIn(['data', 'emailOptInLabel'])}
              type={FORM_INPUT_TYPE_CHECKBOX}
              value={!isGdprCountry}
              checkedValue
              hidden={hideOptIn}
              labelClassName={['cart-account-create__checkbox-label']}
            />
            <FormInput
              name={FORM_INPUT_NAME_TERMS}
              label={this.renderPrivacyTerms(props)}
              type={FORM_INPUT_TYPE_CHECKBOX}
              checkedValue
              required
              labelClassName={['cart-account-create__checkbox-label']}
            />
            <div className="cart-account-create__submit-wrapper">
              <FormButton
                type={FORM_BUTTON_TYPE_SUBMIT}
                disabled={submitDisabled}
                formButtonClass={[
                  `form-button--${submitDisabled ? 'disabled' : 'primary'}`,
                  'form-button--stacked',
                  'form-button--submit',
                ]}
                renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                text={staticText.getIn(['data', 'continue'])}
              />
            </div>
          </FormsyForm>
        }
      </div>
    )
  }

  renderAccountCheckCartBeginErrors = (props) => {
    const { user, checkout, staticText } = props
    let errorMessage = null

    if (user.get('emailAvailable') === false) {
      errorMessage = staticText.getIn(['data', 'emailAvailableError'])
    } else if (checkout.get('emailCaptureErrorCode') === ERROR_EMAIL_INVALID) {
      errorMessage = staticText.getIn(['data', 'errorMessageInvalidEmail'])
    }

    return errorMessage
  }

  renderPrivacyTerms = (props) => {
    const { staticText } = props
    return (
      <span>
        {`${staticText.getIn(['data', 'termsLabelStart'])} `}
        <Link
          directLink
          to="/terms-privacy"
          target={TARGET_BLANK}
        >
          {staticText.getIn(['data', 'termsLink'])}
        </Link>
        {` ${staticText.getIn(['data', 'termsLabelEnd'])}`}
      </span>
    )
  }

  renderFieldsAnonymous = (props) => {
    const { user, staticText } = props

    /* eslint-disable no-nested-ternary */
    return (
      <div className="cart-account-create__fields-anonymous">
        <div className="cart-account-create__form-inline-container">
          <FormInput
            name={FORM_INPUT_NAME_FIRST_NAME}
            label={staticText.getIn(['data', 'firstName'])}
            type={FORM_INPUT_TYPE_TEXT}
            validations="isSpecialWords"
            validationErrors={{
              isSpecialWords: staticText.getIn(['data', 'nameValidError']),
            }}
            required
            maxLength={32}
            className={['cart-account-create__first-name']}
            textInputClassName={['cart-account-create__text-input']}
            labelClassName={['cart-account-create__text-label']}
          />
          <FormInput
            name={FORM_INPUT_NAME_LAST_NAME}
            label={staticText.getIn(['data', 'lastName'])}
            type={FORM_INPUT_TYPE_TEXT}
            validations="isSpecialWords"
            validationErrors={{
              isSpecialWords: staticText.getIn(['data', 'nameValidError']),
            }}
            required
            maxLength={32}
            className={['cart-account-create__last-name']}
            textInputClassName={['cart-account-create__text-input']}
            labelClassName={['cart-account-create__text-label']}
          />
        </div>
        <FormInput
          onBlur={_partial(this.onBlurCheckEmail, _partial.placeholder, props)}
          onReset={e => this.onResetEmailInput(e, props)}
          onChange={_partial(this.onChangeEmail, _partial.placeholder, props)}
          disabled={user.get('emailAvailabilityProcessing') === true}
          error={this.renderAccountCheckCartBeginErrors(props)}
          errorsVisibleDelay={1250}
          name={FORM_INPUT_NAME_EMAIL}
          label={staticText.getIn(['data', 'email'])}
          type={FORM_INPUT_TYPE_EMAIL}
          validations={{ isEmail: true }}
          validationErrors={{
            isEmail: staticText.getIn(['data', 'emailValidError']),
          }}
          required
          textInputClassName={['cart-account-create__text-input']}
          labelClassName={['cart-account-create__text-label']}
        />
        {
          user.get('emailAvailable') === false ?
            <Button
              text={staticText.getIn(['data', 'logIn'])}
              buttonClass={['button--primary', 'button--x-small', 'cart-account-create__login']}
              onClick={this.onClickLoginButton}
            />
            :
            null
        }
        <FormPassword
          name={FORM_INPUT_NAME_PASSWORD}
          label={staticText.getIn(['data', 'createPassword'])}
          validations={getPasswordValidation()}
          validationErrors={{
            minLength: staticText.getIn(['data', 'passwordMinLengthMessage']),
            matchRegexp: staticText.getIn(['data', 'passwordRegexMessage']),
            maxLength: staticText.getIn(['data', 'passwordMaxLengthMessage']),
          }}
          required
          showProgress
          formPasswordInputClassName={['cart-account-create__text-input']}
          formPasswordLabelClassName={['cart-account-create__text-label']}
        />
        <OptimizelyPage pageName="web_app__cart_account_create_create" />
      </div>
    )
    /* eslint-enable no-nested-ternary */
  }

  renderFieldsUnentitled = (props) => {
    const { auth, staticText } = props
    return (
      <div className="cart-account-create__fields-unentitled">
        <H3 as={HEADING_TYPES.H5} className="cart-account-create__form-title">
          {staticText.getIn(['data', 'yourGaiaAccount'])}
        </H3>
        <p>{staticText.getIn(['data', 'agreeTermsActivate'])}</p>
        <H3 as={HEADING_TYPES.H5} className="cart-account-create__field-title">
          {staticText.getIn(['data', 'email'])}
        </H3>
        <p>{auth.get('email')}</p>
        <H3 as={HEADING_TYPES.H5} className="cart-account-create__field-title">
          {staticText.getIn(['data', 'username'])}
        </H3>
        <p>{auth.get('username')}</p>
      </div>
    )
  }

  render () {
    const { props } = this
    const { auth } = props

    // for Optimizely Test 19422180075, if the user is logged in, show them the old layout
    if (auth.get('jwt')) {
      return this.getContent(props)
    }

    return (
      <React.Fragment>
        <OptimizelyTest
          original
          experimentId={'19422180075'}
          variantId={'19419760057'}
        >
          {this.getContent(props)}
        </OptimizelyTest>
        <OptimizelyTest
          original={false}
          experimentId={'19422180075'}
          variantId={'19431530074'}
        >
          <CartAccountCreatePageV2 />
        </OptimizelyTest>
      </React.Fragment>
    )
  }
}

CartAccountCreatePage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  paytrack: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setCheckoutUserData: PropTypes.func.isRequired,
  setCheckoutAccountValid: PropTypes.func.isRequired,
  getUserEmailAvailability: PropTypes.func.isRequired,
  resetUserUsernameAvailability: PropTypes.func.isRequired,
  resetUserEmailAvailability: PropTypes.func.isRequired,
  captureCheckoutEmail: PropTypes.func.isRequired,
  setCartAbandonEmailDataLayer: PropTypes.func.isRequired,
  resetCheckoutEmailCaptureStatus: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      auth: state.auth,
      checkout: state.checkout,
      plans: state.plans,
      user: state.user,
      userAccount: state.userAccount,
      paytrack: state.paytrack,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setCheckoutUserData: actions.checkout.setCheckoutUserData,
        setCheckoutAccountValid: actions.checkout.setCheckoutAccountValid,
        captureCheckoutEmail: actions.checkout.captureCheckoutEmail,
        getUserEmailAvailability: actions.user.getUserEmailAvailability,
        resetUserUsernameAvailability:
          actions.user.resetUserUsernameAvailability,
        resetUserEmailAvailability: actions.user.resetUserEmailAvailability,
        setCartAbandonEmailDataLayer: actions.eventTracking.setCartAbandonEmailDataLayer,
        resetCheckoutEmailCaptureStatus: actions.checkout.resetCheckoutEmailCaptureStatus,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
      }
    },
  ),
  connectStaticText({ storeKey: 'cartAccountCreatePage' }),
)(CartAccountCreatePage)
