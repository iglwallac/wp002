import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import _partial from 'lodash/partial'
import _debounce from 'lodash/debounce'
import _assign from 'lodash/assign'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import FormsyForm from 'formsy-react'
import {
  EmailInput,
  PasswordInput,
  TextInput,
  Checkbox,
} from 'components/FormInput.v2'
import FormButton from 'components/FormButton'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { getPasswordValidation, PASSWORD_INPUT_MAX_CHARS } from 'services/password'
import { historyRedirect } from 'services/navigation'
import { LTM } from 'services/currency'
import {
  FORM_INPUT_NAME_FIRST_NAME,
  FORM_INPUT_NAME_LAST_NAME,
  FORM_INPUT_NAME_EMAIL,
  FORM_INPUT_NAME_PASSWORD,
  FORM_INPUT_NAME_TERMS,
  FORM_INPUT_NAME_EMAIL_OPT_IN,
  FORM_INPUT_NAME_EMAIL_CONFIRM,
} from 'services/form'
import { PLAN_SKU_FREE_TRIAL } from 'services/plans'
import { URL_FREE_TRIAL, URL_FREE_TRIAL_CONFIRM } from 'services/url/constants'
import Icon from 'components/Icon'
import { H1, HEADING_TYPES } from 'components/Heading'

const PENDING = 'pending'

class FreeTrialAccountPage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      emailMatch: null,
      confirmationEmail: '',
      isActive: false,
      plansLoaded: false,
      [FORM_INPUT_NAME_EMAIL_OPT_IN]: true,
      [FORM_INPUT_NAME_TERMS]: false,
    }
  }

  componentDidMount () {
    /* eslint-disable react/no-did-mount-set-state */
    const {
      auth = Map(),
      userAccount = Map(),
      user = Map(),
      history,
      plans = Map(),
      setPlansLocalizedSelection,
    } = this.props
    const language = user.getIn(['data', 'language'])
    const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
    const latamPricing = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'latamPricing'])
    const currency = latamPricing ? LTM : currencyIso
    const plansList = plans.getIn(['data', 'plans'], List())
    const freeTrial = plansList.find((plan) => {
      return plan.get('sku') === PLAN_SKU_FREE_TRIAL
    })

    if (auth.get('jwt')) {
      history.push('/')
    }

    if (plans.getIn(['data', 'plans'], List()).size > 0) {
      if (freeTrial) {
        this.setState(() => ({ isActive: true }))
        setPlansLocalizedSelection({ plan: freeTrial, language, currency })
      }

      this.setState(() => ({ plansLoaded: true }))
    }
    /* eslint-enable react/no-did-mount-set-state */
  }

  componentDidUpdate (prevProps) {
    /* eslint-disable react/no-did-update-set-state */
    const {
      plans = Map(),
      user = Map(),
      userAccount = Map(),
      history,
      setPlansLocalizedSelection,
    } = prevProps
    const { plansLoaded } = this.state
    const previousPlans = plans.getIn(['data', 'plans'], List())
    const currentPlans = this.props.plans.getIn(['data', 'plans'], List())
    const language = user.getIn(['data', 'language'])
    const currency = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])

    if (!plansLoaded && previousPlans !== currentPlans && currentPlans.size > 0) {
      const freeTrial = currentPlans.find((plan) => {
        return plan.get('sku') === PLAN_SKU_FREE_TRIAL
      })

      this.setState(() => ({ plansLoaded: true }))

      if (freeTrial) {
        setPlansLocalizedSelection({ plan: freeTrial, language, currency })
      } else {
        history.push(URL_FREE_TRIAL)
      }
    }
    /* eslint-enable react/no-did-update-set-state */
  }

  onValidSubmit = (data, props) => {
    const { history, auth = Map(), user = Map(), setCheckoutUserData } = props
    let updatedData

    // strip out the email confirm form data
    // as it should not get posted to the checkout endpoint
    if (_get(data, FORM_INPUT_NAME_EMAIL_CONFIRM)) {
      updatedData = _omit(data, FORM_INPUT_NAME_EMAIL_CONFIRM)
    }

    if (!auth.get('jwt')) {
      setCheckoutUserData(updatedData)
    }

    const language = user.getIn(['data', 'language'])
    historyRedirect({ history, url: URL_FREE_TRIAL_CONFIRM, auth, language })
  }

  onBlurCheckEmail = (value, props, emailConfirmation) => {
    const {
      getUserEmailAvailability,
    } = props
    const pattern = /^.+@.+\..{2,}$/
    const valid = pattern.test(value)

    if (!value || !valid) {
      return
    }

    getUserEmailAvailability(value)
    emailConfirmation(value)
  }

  onChangeEmail = (value, props) => {
    const {
      user = Map(),
      checkout = Map(),
      resetUserEmailAvailability,
      resetCheckoutEmailCaptureStatus,
    } = props

    this.setState(() => ({ email: value }))

    if (user.has('emailAvailable')) {
      resetUserEmailAvailability()
    }

    if (checkout.has('emailCaptureErrorCode')) {
      resetCheckoutEmailCaptureStatus()
    }
  }

  onSelectCheckbox = (name, checked) => {
    this.setState(() => ({
      [name]: checked,
    }))
  }

  getEmailOptInClassName = (plan = Map()) => {
    const country = plan.get('country')
    const baseClassName = 'free-trial-account__email-opt-in'
    const className = [baseClassName].concat(country ? `${baseClassName}--${country}` : [])

    return className.join(' ')
  }

  setFormValid = (props, valid) => {
    const { checkout = Map(), setCheckoutAccountValid } = props
    if (valid !== checkout.get('accountValid')) {
      setCheckoutAccountValid(valid)
    }
  }

  isSubmitDisabled = (props) => {
    const { auth = Map(), user = Map(), checkout = Map(), plans = Map() } = props
    const { email, confirmationEmail } = this.state
    const terms = _get(this.state, FORM_INPUT_NAME_TERMS)

    if (confirmationEmail && confirmationEmail !== email) {
      return true
    } else if (!terms) {
      return true
    } else if (auth.get('jwt')) {
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

  checkEmailMatch = (value) => {
    const { email } = this.state

    this.setState(() => ({ confirmationEmail: value }))

    if (value !== email) {
      this.setState(() => ({ emailMatch: PENDING }))
    } else if (value === email) {
      this.setState(() => ({ emailMatch: true }))
    }
  }

  checkEmailMatchOnBlur = (value) => {
    const { email } = this.state

    this.setState(() => ({ confirmationEmail: value }))

    if (!email) {
      this.setState(() => ({ emailMatch: false }))
    } else if (email === value) {
      this.setState(() => ({ emailMatch: true }))
    }
  }

  emailConfirmation = (emailField) => {
    const { email, confirmationEmail } = this.state
    this.setState(() => ({ email: emailField }))

    if (confirmationEmail) {
      if (email !== confirmationEmail) {
        this.setState(() => ({ emailMatch: false }))
      }
      this.setState(() => ({ emailMatch: true }))
    }
  }

  renderEmailExistsError = () => {
    const { staticText = Map() } = this.props

    return (
      <div className="free-trial-account__error-msg">
        {staticText.getIn(['data', 'emailRecognizedError'])}
      </div>
    )
  }

  renderPrivacyTerms = (props) => {
    const { staticText = Map() } = props
    return (
      <span>
        {`${staticText.getIn(['data', 'disclaimerStart'])} `}
        <Link
          directLink
          to="/terms-privacy"
          target={TARGET_BLANK}
        >
          {staticText.getIn(['data', 'disclaimerLink'])}
        </Link>
        {` ${staticText.getIn(['data', 'disclaimerEnd'])}`}
      </span>
    )
  }

  renderProcessing = () => {
    return (
      <div className="free-trial-account__sherpa">
        <Sherpa type={TYPE_LARGE} />
      </div>
    )
  }

  renderForm = (props, state) => {
    const { staticText = Map(), user = Map(), checkout = Map(), plans = Map() } = props
    const debounceSetFormValid = _debounce(this.setFormValid, 100)
    const submitDisabled = this.isSubmitDisabled(props)
    const { email, confirmationEmail } = state
    const emailSignup = _get(state, FORM_INPUT_NAME_EMAIL_OPT_IN, false)
    const terms = _get(state, FORM_INPUT_NAME_TERMS, false)
    const firstName = checkout.getIn(['account', 'firstName'])
    const lastName = checkout.getIn(['account', 'lastName'])
    const userEmail = checkout.getIn(['account', 'email'])
    const password = checkout.getIn(['account', 'password'])
    // use the first plan in order to get the user's country
    const firstPlan = plans.getIn(['data', 'plans', 0], Map())
    const emailExists = user.get('emailAvailable') === false

    if (!firstPlan) {
      return (
        this.renderProcessing()
      )
    }

    return (
      <FormsyForm
        onValid={_partial(debounceSetFormValid, props, true)}
        onInvalid={_partial(debounceSetFormValid, props, false)}
        onValidSubmit={_partial(this.onValidSubmit, _partial.placeholder, props)}
        className="free-trial-account__form"
      >
        {
          emailExists ?
            this.renderEmailExistsError()
            : null
        }
        <TextInput
          name={FORM_INPUT_NAME_FIRST_NAME}
          label={staticText.getIn(['data', 'firstName'])}
          required
          validations={{
            minLength: 1,
            isSpecialWords: true,
          }}
          validationErrors={{
            minLength: staticText.getIn(['data', 'firstNameError']),
            isSpecialWords: staticText.getIn(['data', 'firstNameError']),
          }}
          maxLength={32}
          value={firstName || ''}
        />
        <TextInput
          name={FORM_INPUT_NAME_LAST_NAME}
          label={staticText.getIn(['data', 'lastName'])}
          required
          validations={{
            minLength: 1,
            isSpecialWords: true,
          }}
          validationErrors={{
            minLength: staticText.getIn(['data', 'lastNameError']),
            isSpecialWords: staticText.getIn(['data', 'lastNameError']),
          }}
          maxLength={32}
          value={lastName || ''}
        />
        <EmailInput
          onBlur={
            _partial(this.onBlurCheckEmail, _partial.placeholder, props, this.emailConfirmation)
          }
          onChange={_partial(this.onChangeEmail, _partial.placeholder, props)}
          name={FORM_INPUT_NAME_EMAIL}
          label={staticText.getIn(['data', 'email'])}
          value={email || userEmail}
          disabled={user.get('emailAvailabilityProcessing') === true}
          required
          validations={{ isEmail: true }}
          validationErrors={{
            isEmail: staticText.getIn(['data', 'emailError']),
          }}
          forceError={emailExists ? 'true' : ''}
        />
        <EmailInput
          onBlur={e => this.checkEmailMatchOnBlur(e)}
          onChange={e => this.checkEmailMatch(e)}
          autocomplete="off"
          name={FORM_INPUT_NAME_EMAIL_CONFIRM}
          label={staticText.getIn(['data', 'emailConfirm'])}
          value={confirmationEmail || userEmail}
          required
          validations={{ equalsField: FORM_INPUT_NAME_EMAIL }}
          validationErrors={{
            equalsField: staticText.getIn(['data', 'emailConfirmError']),
          }}
        />
        <PasswordInput
          name={FORM_INPUT_NAME_PASSWORD}
          label={staticText.getIn(['data', 'createPassword'])}
          value={password || ''}
          maxLength={PASSWORD_INPUT_MAX_CHARS}
          validations={_assign(
            getPasswordValidation(),
          )}
          validationErrors={{
            minLength: staticText.getIn(['data', 'createPasswordError']),
            matchRegexp: staticText.getIn(['data', 'createPasswordError']),
            maxLength: staticText.getIn(['data', 'passwordMaxLengthMessage']),
          }}
          className="free-trial-account__password"
          required
        />
        <Checkbox
          onChange={this.onSelectCheckbox}
          disabled={false}
          name={FORM_INPUT_NAME_EMAIL_OPT_IN}
          label={staticText.getIn(['data', 'emailOptInLabel'])}
          value={emailSignup}
          className={this.getEmailOptInClassName(firstPlan)}
        />
        <Checkbox
          onChange={this.onSelectCheckbox}
          disabled={false}
          name={FORM_INPUT_NAME_TERMS}
          label={this.renderPrivacyTerms(props)}
          value={terms}
          required
          className="free-trial-account__terms-privacy"
        />
        <FormButton
          type={FORM_BUTTON_TYPE_SUBMIT}
          disabled={submitDisabled}
          formButtonClass={[
            `form-button--${submitDisabled ? 'disabled' : 'primary'}`,
            'form-button--submit',
            'free-trial-account__next-button',
          ]}
          renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
          text={staticText.getIn(['data', 'next'])}
        />
      </FormsyForm>
    )
  }

  render () {
    const { props, state } = this
    const { auth = Map(), staticText = Map() } = props

    if (auth.get('jwt')) {
      return null
    }

    return (
      <div className="free-trial-account">
        <div className="free-trial-account__info">
          <GaiaLogo isHref type={TYPE_WHITE} />
          <div className="free-trial-account__info-content">
            <H1 inverted as={HEADING_TYPES.H2} className="free-trial-account__title">
              {staticText.getIn(['data', 'title'])}
            </H1>
            <p className="free-trial-account__description">
              {staticText.getIn(['data', 'description'])}
            </p>
          </div>
          <Link
            to={URL_FREE_TRIAL}
            className="free-trial-account__back"
          >
            <Icon iconClass={['icon--left', 'free-trial-account__icon-left']} />
            {staticText.getIn(['data', 'back'])}
          </Link>
        </div>
        <div className="free-trial-account__arrow" />
        <div className="free-trial-account__action">
          <div className="free-trial-account__action-content">
            {this.renderForm(props, state)}
          </div>
        </div>
      </div>
    )
  }
}

FreeTrialAccountPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setCheckoutUserData: PropTypes.func.isRequired,
  setCheckoutAccountValid: PropTypes.func.isRequired,
  getUserEmailAvailability: PropTypes.func.isRequired,
  getUserUsernameAvailability: PropTypes.func.isRequired,
  resetUserEmailAvailability: PropTypes.func.isRequired,
  resetCheckoutEmailCaptureStatus: PropTypes.func.isRequired,
  setPlansLocalizedSelection: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectStaticText({ storeKey: 'freeTrialAccountPage' }),
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      userAccount: state.userAccount,
      checkout: state.checkout,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setCheckoutUserData: actions.checkout.setCheckoutUserData,
        setCheckoutAccountValid: actions.checkout.setCheckoutAccountValid,
        getUserEmailAvailability: actions.user.getUserEmailAvailability,
        getUserUsernameAvailability: actions.user.getUserUsernameAvailability,
        resetUserEmailAvailability: actions.user.resetUserEmailAvailability,
        resetCheckoutEmailCaptureStatus: actions.checkout.resetCheckoutEmailCaptureStatus,
        setPlansLocalizedSelection: actions.plans.setPlansLocalizedSelection,
      }
    },
  ),
)(FreeTrialAccountPage)
