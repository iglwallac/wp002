import { getPrimary } from 'services/languages'
import { ES } from 'services/languages/constants'
import { URL_HELP_CENTER_ES, URL_ACCOUNT } from 'services/url/constants'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { get as getConfig } from 'config'
import _get from 'lodash/get'
import _partial from 'lodash/partial'
import _includes from 'lodash/includes'
import { List } from 'immutable'
import CartCardLogos from 'components/CartCardLogos'
import MyAccountUpdatePaymentPaypal from 'components/MyAccount/MyAccountUpdatePaymentPaypal'
import Link from 'components/Link'
import { requestAnimationFrame } from 'services/animate'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import FormsyForm from 'formsy-react'
import FormButton from 'components/FormButton'
import ZuoraCreditCard from 'components/ZuoraIframe/ZuoraCreditCard'
import { H5, HEADING_TYPES } from 'components/Heading'
import { FORM_BUTTON_TYPE_SUBMIT, FORM_BUTTON_TYPE_BUTTON } from 'components/FormButton/types'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { TARGET_BLANK } from 'components/Link/constants'
import { TYPE_UPDATE_PAYMENT_SUCCESS } from 'services/dialog'
import ErrorMessage from 'components/ErrorMessage'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { USD } from 'services/currency'

const PAYMENT_TYPE_PAYPAL = 'paypal'

const config = getConfig()

async function updatePaymentConfirmation (options, orderData) {
  const {
    setDialogOptions,
    setOverlayCloseOnClick,
    setOverlayDialogVisible,
    getUserAccountDataBillingSubscriptionsWithDetails,
    doAuthRenew,
    setMessageBoxVisible,
    auth,
    setUpdatePaymentOrderComplete,
  } = options
  // orderData has to be checked since a rejected promise still triggers this function.
  // due to chain being restored after .catch in the action.
  if (orderData && orderData.get('success')) {
    setDialogOptions(null, true)
    setOverlayCloseOnClick(false)
    setOverlayDialogVisible(TYPE_UPDATE_PAYMENT_SUCCESS)
    getUserAccountDataBillingSubscriptionsWithDetails({ auth })
    setUpdatePaymentOrderComplete(true)
    await doAuthRenew(auth)
    setMessageBoxVisible(false)
  }
}

function onSubmitPaypal (props) {
  const {
    auth,
    updatePayment,
    processPaymentMethodUpdate,
  } = props

  const updatePaymentPaypalOptions = {
    auth,
    country: updatePayment.getIn(['paypalPaymentInfo', 'details', 'billingAddress', 'countryCode']),
    postalCode: updatePayment.getIn(['paypalPaymentInfo', 'details', 'billingAddress', 'postalCode']),
    state: updatePayment.getIn(['paypalPaymentInfo', 'details', 'billingAddress', 'state']),
    payPalNonce: updatePayment.getIn(['paypalPaymentInfo', 'nonce']),
  }

  processPaymentMethodUpdate(updatePaymentPaypalOptions)
}

function renderPayPal (props) {
  const { updatePayment, myAccountUpdatePaymentV2StaticText, userAccount } = props
  if (updatePayment.get('paymentType') === PAYMENT_TYPE_PAYPAL) {
    return null
  }
  const paypalCurrencies = _get(config, ['features', 'checkout', 'paypalCurrencies'])
  const paypal = _get(config, ['features', 'checkout', 'paypal'])
  const selectedCurrencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'], USD)
  return (
    <div>
      <p className="my-account-update-payment-V2__secure">
        <i className="my-account-update-payment-V2__lock-icon" />{'  '}
        {myAccountUpdatePaymentV2StaticText.getIn(['data', 'securePayment'])}
      </p>
      <CartCardLogos
        currencyIso={selectedCurrencyIso}
      />
      {
        _includes(paypalCurrencies, selectedCurrencyIso) && paypal ?
          <MyAccountUpdatePaymentPaypal
            className={['cart-paypal--active']}
          /> :
          null
      }
    </div>
  )
}

function renderPaymentError (props) {
  const { updatePayment, user, zuora, myAccountUpdatePaymentV2StaticText } = props
  const updatePaymentError = updatePayment.get('orderError')
  const zuoraPaymentTokenError = zuora.getIn(['data', 'paymentToken', 'error'])
  const errorShouldRender = updatePaymentError || zuoraPaymentTokenError

  if (!errorShouldRender) {
    return null
  }

  const langIsEs = getPrimary(user.getIn(['data', 'language'], List())) === ES
  const { features } = config
  let contactUrl = '/contact'
  if (langIsEs && _get(features, ['userLanguage', 'esZendeskHelpLink'])) {
    contactUrl = URL_HELP_CENTER_ES
  }
  const orderErrorMessages = [
    `${myAccountUpdatePaymentV2StaticText.getIn(['data', 'orderErrorMessage'])} `,
    <Link
      className="error-message__link"
      to={contactUrl}
      directLink
      target={TARGET_BLANK}
    >
      {myAccountUpdatePaymentV2StaticText.getIn(['data', 'orderErrorLink'])}
    </Link>,
  ]

  return (
    <ErrorMessage
      errorMessages={orderErrorMessages}
      errorMessageClass={['my-account-update-payment-V2__error-message']}
    />
  )
}

function renderProcessing (processingText, stayOnPageText) {
  return (
    <div className="my-account-update-payment-V2__processing">
      <Sherpa type={TYPE_SMALL_WHITE} />
      <p className="my-account-update-payment-V2__processing-message">
        {processingText}
        <br />
        {stayOnPageText}
      </p>
    </div>
  )
}

function renderLoading () {
  return (
    <div className="my-account-update-payment-V2__wrapper">
      <div className="my-account-update-payment-V2__placeholder">
        <Sherpa type={TYPE_SMALL_WHITE} />
      </div>
    </div>
  )
}

function getClassName (props) {
  const { updatePayment } = props
  const className = ['my-account-update-payment-V2']
  if (updatePayment.get('processing')) {
    className.push(['my-account-update-payment-V2--hidden'])
  }
  return className.join(' ')
}

function onClickCancel (props) {
  const { history, setUpdatePaymentOrderComplete, toggleUpdatePaymentCardState } = props
  requestAnimationFrame(() => window.scrollTo(0, 0))
  setUpdatePaymentOrderComplete(false)
  history.push(URL_ACCOUNT)
  toggleUpdatePaymentCardState()
}

class MyAccountUpdatePaymentV2 extends PureComponent {
  componentDidMount () {
    const {
      auth,
      userAccount,
      getUserAccountDataBillingSubscriptionsWithDetails,
      getZuoraIframeSignatureToken,
    } = this.props
    const accountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])

    if (!accountId) {
      getUserAccountDataBillingSubscriptionsWithDetails({ auth })
    }

    getZuoraIframeSignatureToken()
  }

  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER) {
      const {
        auth,
        updatePayment,
        zuora,
        processPaymentMethodUpdate,
        setOverlayDialogVisible,
        setDialogOptions,
        setOverlayCloseOnClick,
        getUserAccountDataBillingSubscriptionsWithDetails,
        doAuthRenew,
        setMessageBoxVisible,
        setUpdatePaymentOrderComplete,
      } = nextProps

      const country = zuora.getIn(['data', 'paymentToken', 'data', 'country'])
      const postalCode = zuora.getIn(['data', 'paymentToken', 'data', 'postalCode'])
      const nextPaymentMethodId = zuora.getIn(['data', 'paymentToken', 'data', 'refId'])
      const previousPaymentMethodId = this.props.zuora.getIn(['data', 'paymentToken', 'data', 'refId'])
      const nextUpdatePaymentSuccess = updatePayment.getIn(['orderData', 'success'])
      const previoiusUpdatePaymentSuccess = this.props.updatePayment.getIn(['orderData', 'success'])
      const updatePaymentConfirmationPartial = _partial(updatePaymentConfirmation, {
        setOverlayDialogVisible,
        setDialogOptions,
        setOverlayCloseOnClick,
        getUserAccountDataBillingSubscriptionsWithDetails,
        doAuthRenew,
        setMessageBoxVisible,
        auth,
        setUpdatePaymentOrderComplete,
      }, updatePayment.get('orderData'))

      // if we just received the payment method from the iframe
      // send the data to brooklyn for update payment for credit card
      if (nextPaymentMethodId && nextPaymentMethodId !== previousPaymentMethodId) {
        const updatePaymentCreditCardOptions = {
          auth,
          country,
          postalCode,
          paymentMethodId: nextPaymentMethodId,
        }
        processPaymentMethodUpdate(updatePaymentCreditCardOptions)
      }

      // if the payment update was successful
      if (
        nextUpdatePaymentSuccess && nextUpdatePaymentSuccess !== previoiusUpdatePaymentSuccess
      ) {
        updatePaymentConfirmationPartial()
      }
    }
  }

  componentWillUnmount () {
    const { setUpdatePaymentOrderError } = this.props
    setUpdatePaymentOrderError(false)
  }

  renderIframe = () => {
    const { props } = this
    const {
      myAccountUpdatePaymentV2StaticText,
    } = props

    return (
      <ZuoraCreditCard
        submitButtonText={myAccountUpdatePaymentV2StaticText.getIn(['data', 'save'])}
      />
    )
  }

  render () {
    const { props, state } = this
    const {
      updatePayment,
      myAccountUpdatePaymentV2StaticText,
      userAccount,
    } = props

    const paymentType = updatePayment.get('paymentType')
    const processingMessage = myAccountUpdatePaymentV2StaticText.getIn(['data', 'paymentProcessing'])
    const processingStayOnPageMessage = myAccountUpdatePaymentV2StaticText.getIn(['data', 'pleaseStayOnThisPage'])

    // prevent from loading until subscription info is in the store
    if (!userAccount.getIn(['details', 'data', 'billing', 'subscriptions'])) {
      return renderLoading()
    }

    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <div className="my-account-update-payment-V2__wrapper">
        {
          updatePayment.get('processing') || _get(state, ['paymentProcessing']) ?
            renderProcessing(processingMessage, processingStayOnPageMessage) : null
        }
        <div className={getClassName(props, state)}>
          <H5 className="my-account-update-payment-V2__title">
            {myAccountUpdatePaymentV2StaticText.getIn(['data', 'choosePayment'])}
          </H5>
          {
            renderPayPal(props)
          }
          {
            renderPaymentError(props)
          }
          {
            paymentType !== PAYMENT_TYPE_PAYPAL ?
              this.renderIframe() :
              <FormsyForm
                onSubmit={_partial(onSubmitPaypal, props)}
              >
                <fieldset className="my-account-update-payment-V2__paypal-info">
                  <div className="my-account-update-payment-V2__paypal-logo" />
                  <H5 as={HEADING_TYPES.H6}>
                    {myAccountUpdatePaymentV2StaticText.getIn(['data', 'paypalEmail'])}
                  </H5>
                  <p className="my-account-update-payment-V2__paypal-email">
                    {updatePayment.getIn(['paypalPaymentInfo', 'details', 'email'])}
                  </p>
                </fieldset>
                <div className="my-account-update-payment-V2__button-container">
                  <FormButton
                    type={FORM_BUTTON_TYPE_BUTTON}
                    onClick={() => onClickCancel(props)}
                    formButtonClass={[
                      'form-button--tertiary',
                      'form-button--cancel',
                      'my-account-update-payment-V2__button',
                      'my-account-update-payment-V2__button--cancel',
                    ]}
                    renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                    text={myAccountUpdatePaymentV2StaticText.getIn(['data', 'cancel'])}
                  />
                  <FormButton
                    type={FORM_BUTTON_TYPE_SUBMIT}
                    formButtonClass={[
                      'form-button--secondary',
                      'form-button--submit',
                      'my-account-update-payment-V2__button',
                      'my-account-update-payment-V2__button--submit',
                      'button--square',
                    ]}
                    renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                    text={myAccountUpdatePaymentV2StaticText.getIn(['data', 'submitPayment'])}
                  />
                </div>
              </FormsyForm>
          }
        </div>
      </div>
    )
  }
}

MyAccountUpdatePaymentV2.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  updatePayment: ImmutablePropTypes.map.isRequired,
  zuora: ImmutablePropTypes.map.isRequired,
  myAccountUpdatePaymentV2StaticText: ImmutablePropTypes.map.isRequired,
  setDialogOptions: PropTypes.func.isRequired,
  setOverlayCloseOnClick: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  getUserAccountDataBillingSubscriptionsWithDetails: PropTypes.func.isRequired,
  doAuthRenew: PropTypes.func.isRequired,
  setMessageBoxVisible: PropTypes.func.isRequired,
  processPaymentMethodUpdate: PropTypes.func.isRequired,
  setUpdatePaymentOrderComplete: PropTypes.func.isRequired,
  toggleUpdatePaymentCardState: PropTypes.func.isRequired,
  getZuoraIframeSignatureToken: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      updatePayment: state.updatePayment,
      inboundTracking: state.inboundTracking,
      userAccount: state.userAccount,
      zuora: state.zuora,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setDialogOptions: actions.dialog.setDialogOptions,
        setOverlayCloseOnClick: actions.dialog.setOverlayCloseOnClick,
        setUpdatePaymentOrderError: actions.updatePayment.setUpdatePaymentOrderError,
        getUserAccountDataBillingSubscriptionsWithDetails:
          actions.userAccount.getUserAccountDataBillingSubscriptionsWithDetails,
        doAuthRenew: actions.auth.doAuthRenew,
        setMessageBoxVisible: actions.messageBox.setMessageBoxVisible,
        processPaymentMethodUpdate: actions.updatePayment.processPaymentMethodUpdate,
        setUpdatePaymentOrderComplete: actions.updatePayment.setUpdatePaymentOrderComplete,
        getZuoraIframeSignatureToken: actions.zuora.getZuoraIframeSignatureToken,
      }
    },
  ),
  connectStaticText({
    storeKey: 'myAccountUpdatePaymentV2',
    propName: 'myAccountUpdatePaymentV2StaticText',
  }),
)(MyAccountUpdatePaymentV2)
