import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useEffect, useState } from 'react'
import _get from 'lodash/get'
import { List, Map } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import { get as getConfig } from 'config'
import {
  CHECKOUT_ORDER_ERROR_TYPE_ALREADY_SUBSCRIBED,
  CHECKOUT_ORDER_ERROR_TYPE_PAYMENT,
  PAYMENT_TYPE_PAYPAL,
} from 'services/checkout'
import { USD } from 'services/currency'
import { PLAN_ID_LIVE } from 'services/plans'
import { getPrimary } from 'services/languages'
import { isEntitled } from 'services/subscription'
import { ES } from 'services/languages/constants'
import { historyRedirect } from 'services/navigation'
import { format as formatDateTime } from 'services/date-time'
import { getAuthIsLoggedIn } from 'services/auth'
import { URL_HELP_CENTER_ES, URL_CART_CONFIRMATION } from 'services/url/constants'
import { ACCOUNT_TYPE_FMTV_GIFT, ACCOUNT_TYPE_FMTV_COMP } from 'services/user-account'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import ZuoraCreditCard from 'components/ZuoraIframe/ZuoraCreditCard'
import CartProgressIndicator from 'components/CartProgressIndicator'
import CartBillingProcessing from 'components/CartBillingProcessing'
import CartOrderSummaryV2 from 'components/CartV2/CartOrderSummaryV2'
import { TARGET_BLANK } from 'components/Link/constants'
import { H1, H5, HEADING_TYPES } from 'components/Heading'
import { Button, TYPES } from 'components/Button.v2'
import ErrorMessage from 'components/ErrorMessage'
import Link from 'components/Link'
import { requestAnimationFrame } from 'services/animate'


const config = getConfig()
const MEMBERSHIP_BUTTON_CLICKED = 'start membership button clicked'

function CartPaymentPageV2 (props) {
  const {
    auth,
    checkout,
    history,
    inboundTracking,
    page,
    plans,
    processCheckoutOrder,
    processRenewOrder,
    setEventStartMembershipClicked,
    userAccount,
    user = Map(),
    zuora,
  } = props
  const { features } = config
  const checkoutProcessing = checkout.get('processing')
  const paymentType = checkout.get('paymentType')
  const checkoutOrderError = checkout.get('orderError')
  const zuoraPaymentTokenProcessing = zuora.get('iframePaymentTokenProcessing')
  const zuoraPaymentTokenError = zuora.getIn(['data', 'paymentToken', 'error'])
  const errorShouldRender = checkoutOrderError || zuoraPaymentTokenError
  const userLanguage = getPrimary(user.getIn(['data', 'language'], List()))
  const langIsEs = userLanguage === ES
  const locale = page.get('locale')
  const dateFormatString = 'YYYY-MM-DD'
  const entitlementEnd = parseInt(user.getIn(['data', 'userEntitlements', 'end']), 10) * 1000
  const formattedEndDate = formatDateTime(entitlementEnd, locale, dateFormatString)
  const currencyIso = getAuthIsLoggedIn(auth) ?
    userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'], USD) :
    plans.getIn(['selection', 'currencyIso'], USD)
  const country = zuora.getIn(['data', 'paymentToken', 'data', 'country'])
  const postalCode = zuora.getIn(['data', 'paymentToken', 'data', 'postalCode'])
  const userInfo = checkout.get('account', Map())
  const productRatePlanId = plans.getIn(['selection', 'id'])
  const language = user.getIn(['data', 'language'], List()).toJS()
  const creationSource = (user.getIn(['data', 'creation_source']))
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const zuoraAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])

  const orderSuccess = checkout.getIn(['orderData', 'success'])
  const paymentMethodId = zuora.getIn(['data', 'paymentToken', 'data', 'refId'])
  const [prevOrderSuccess] = useState(checkout.getIn(['orderData', 'success']))
  const [prevPaymentMethodId] = useState(zuora.getIn(['data', 'paymentToken', 'data', 'refId']))


  useEffect(() => {
    // When we transition from not having an order to having a successful order
    // Begin the redirect process
    if (prevOrderSuccess !== orderSuccess) {
      renderCheckoutConfirmation()
    }
  }, [prevOrderSuccess, orderSuccess])

  useEffect(() => {
    const paymentInfo = {
      currencyIso,
      country,
      postalCode,
      productRatePlanId,
      creditCard: {
        paymentMethodId,
      },
    }
    const startDateOverrideInfo =
    shouldOverrideStartDate() ? {
      formattedEndDate,
    }
      : null

    // if we just received the payment method from the iframe
    if (paymentMethodId && paymentMethodId !== prevPaymentMethodId) {
      if (window.scrollTo) {
        requestAnimationFrame(() => window.scrollTo(0, 0))
      }

      // process authenticated user
      // credit card  renew (update) order
      if (getAuthIsLoggedIn(auth)) {
        processRenewOrder({
          auth,
          paymentInfo,
          startDateOverrideInfo,
        })
        return
      }

      // process anonymous user credit card order
      processCheckoutOrder({
        userInfo,
        paymentInfo,
        language,
        tracking: inboundTracking,
      })

      setEventStartMembershipClicked(buildMembershipDataLayerObject(MEMBERSHIP_BUTTON_CLICKED))
    }
  }, [auth, paymentMethodId, prevPaymentMethodId])

  const buildMembershipDataLayerObject = (option) => {
    return {
      event: 'customEvent',
      eventCategory: 'paypal',
      eventAction: option,
      eventLabel: 'cart-paypal',
    }
  }

  const onSubmitPaypalOrder = () => {
    const paymentInfo = {
      currencyIso,
      country: checkout.getIn(['paypalPaymentInfo', 'details', 'billingAddress', 'countryCode']),
      postalCode: checkout.getIn(['paypalPaymentInfo', 'details', 'billingAddress', 'postalCode']),
      state: checkout.getIn(['paypalPaymentInfo', 'details', 'billingAddress', 'state']),
      payPal: {
        payPalNonce: checkout.getIn(['paypalPaymentInfo', 'nonce']),
      },
      productRatePlanId,
    }

    const startDateOverrideInfo =
    shouldOverrideStartDate() ? {
      formattedEndDate,
    }
      : null

    setEventStartMembershipClicked(buildMembershipDataLayerObject(MEMBERSHIP_BUTTON_CLICKED))

    // process authenticated user
    // paypal renew (update) order
    if (auth.get('jwt')) {
      processRenewOrder({
        auth,
        paymentInfo,
        startDateOverrideInfo,
      })

      if (window.scrollTo) {
        requestAnimationFrame(() => window.scrollTo(0, 0))
      }

      return
    }

    // process anonymous user paypal order
    processCheckoutOrder({
      userInfo,
      paymentInfo,
      language,
      tracking: inboundTracking,
    })
  }

  const shouldOverrideStartDate = () => {
    if (
      (creationSource === ACCOUNT_TYPE_FMTV_GIFT || creationSource === ACCOUNT_TYPE_FMTV_COMP) &&
      userIsEntitled &&
      !zuoraAccount &&
      productRatePlanId !== PLAN_ID_LIVE
    ) {
      return true
    }
    return false
  }

  const renderCheckoutConfirmation = () => {
    // orderData has to be checked since a rejected promise still triggers this function.
    // due to chain being restored after .catch in the action.
    if (orderSuccess) {
      historyRedirect({ history, url: URL_CART_CONFIRMATION, auth, language })

      if (window.scrollTo) {
        requestAnimationFrame(() => window.scrollTo(0, 0))
      }
    }
  }

  const renderDisclaimerCopy = () => {
    return (
      <span className="cart-payment-v2__disclaimer">
        {'By clicking Start Membership, you are authorizing Gaia to bill you for access to our content. There is no contract and you may '}
        <Link
          className="cart-payment-v2__disclaimer-link"
          directLink
          to={'https://gaiasupportcenter.zendesk.com/hc/en-us/articles/226578588-How-do-I-unsubscribe-or-cancel-my-account-'}
          target={TARGET_BLANK}
        >
          {'cancel at any time '}
        </Link>
        {'through your account. This price is not inclusive of local taxes and fees.'}
      </span>
    )
  }

  const renderOrderError = () => {
    let message = '* There was a problem submitting your information. Please try again in a few minutes. If this problem persists, please contact customer support (error 101)'
    let contactUrl = '/contact'

    if (!errorShouldRender) {
      return null
    }

    if (
      checkoutOrderError === CHECKOUT_ORDER_ERROR_TYPE_PAYMENT ||
      zuoraPaymentTokenError
    ) {
      message = '* There was a problem with your card, please use a different payment method and try again. If this problem continues, please contact customer support (error 102)'
    } else if (checkoutOrderError === CHECKOUT_ORDER_ERROR_TYPE_ALREADY_SUBSCRIBED) {
      message = '* There was a problem, please try again. If this problem continues, please contact customer support (error 103)'
    }

    if (langIsEs && _get(features, ['userLanguage', 'esZendeskHelpLink'])) {
      contactUrl = URL_HELP_CENTER_ES
    }

    const orderErrorMessages = [
      `${message} `,
      <Link
        className="cart-payment-v2__billing-error-link"
        to={contactUrl}
        directLink
        target={TARGET_BLANK}
      >
        {'CUSTOMER SUPPORT'}
      </Link>,
    ]
    return (
      <ErrorMessage
        errorMessages={orderErrorMessages}
        errorMessageClass={['cart-payment-v2__billing-error']}
      />
    )
  }

  const getItemCheckoutProcessingClassName = (baseClassName, processing) => {
    const className = [baseClassName]

    if (processing) {
      className.push(`${baseClassName}--hidden`)
    }

    return className.join(' ')
  }

  return (
    <div className="cart-payment-v2">
      {checkoutProcessing ? <CartBillingProcessing /> : null}
      <div className={getItemCheckoutProcessingClassName('cart-payment-v2__content', checkoutProcessing)}>
        <div className="cart-payment-v2__content-left">
          <CartProgressIndicator />
          {
            paymentType === PAYMENT_TYPE_PAYPAL ?
              <H1 as={HEADING_TYPES.H3} className="cart-payment-v2__title cart-payment-v2__title--paypal">
                {'Confirm payment'}
              </H1> :
              <React.Fragment>
                <H1 as={HEADING_TYPES.H3} className="cart-payment-v2__title cart-payment-v2__title--card">
                  {'Enter your card information'}
                </H1>
                <div className="cart-payment-v2__secure-payment">
                  {'Secure payment encryption'}
                </div>
              </React.Fragment>
          }
          {renderOrderError()}
          {
            paymentType === PAYMENT_TYPE_PAYPAL ?
              <React.Fragment>
                <div className="cart-payment-v2__paypal-logo" />
                <H5 as={HEADING_TYPES.H6} className="cart-payment-v2__paypal-email-title">
                  {'Paypal Email'}
                </H5>
                <p className="cart-payment-v2__paypal-email">
                  {checkout.getIn(['paypalPaymentInfo', 'details', 'email'])}
                </p>
                <Button
                  className="cart-payment-v2__paypal-submit"
                  type={TYPES.PRIMARY}
                  onClick={onSubmitPaypalOrder}
                >
                  {'Start Membership'}
                </Button>
              </React.Fragment> :
              <ZuoraCreditCard
                submitButtonText={zuoraPaymentTokenProcessing ? 'Processing...' : 'Start Membership'}
                disclaimer={renderDisclaimerCopy()}
              />
          }
        </div>
        <div className="cart-payment-v2__content-right">
          <div className="cart-payment-v2__order-summary">
            <CartOrderSummaryV2 />
          </div>
        </div>
      </div>
    </div>
  )
}

CartPaymentPageV2.propTypes = {
  history: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  setEventStartMembershipClicked: PropTypes.func.isRequired,
  processCheckoutOrder: PropTypes.func.isRequired,
  processRenewOrder: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      checkout: state.checkout,
      user: state.user,
      userAccount: state.userAccount,
      inboundTracking: state.inboundTracking,
      page: state.page,
      zuora: state.zuora,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setEventStartMembershipClicked: actions.eventTracking.setEventStartMembershipClicked,
        processCheckoutOrder: actions.checkout.processCheckoutOrder,
        processRenewOrder: actions.checkout.processRenewOrder,

      }
    },
  ),
  connectStaticText({ storeKey: 'cartPaymentPage' }),
)(CartPaymentPageV2)
