import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import { historyRedirect } from 'services/navigation'
import _get from 'lodash/get'
import { getPrimary } from 'services/languages'
import { get as getConfig } from 'config'
import CartProgressIndicator from 'components/CartProgressIndicator'
import CartBillingProcessing from 'components/CartBillingProcessing'
import Link from 'components/Link'
import Button from 'components/Button'
import ErrorMessage from 'components/ErrorMessage'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { ES } from 'services/languages/constants'
import { isEntitled } from 'services/subscription'
import { URL_HELP_CENTER_ES, URL_CART_CONFIRMATION } from 'services/url/constants'
import { ACCOUNT_TYPE_FMTV_GIFT, ACCOUNT_TYPE_FMTV_COMP } from 'services/user-account'
import { TARGET_BLANK } from 'components/Link/constants'
import { format as formatDateTime } from 'services/date-time'
import { PLAN_ID_LIVE } from 'services/plans'
import {
  PAYMENT_TYPE_PAYPAL,
  CHECKOUT_ORDER_ERROR_TYPE_ALREADY_SUBSCRIBED,
  CHECKOUT_ORDER_ERROR_TYPE_PAYMENT,
} from 'services/checkout'
import { USD } from 'services/currency'
import CartOrderSummary from 'components/CartOrderSummary'
import ZuoraCreditCard from 'components/ZuoraIframe/ZuoraCreditCard'
import { H5, H2, HEADING_TYPES } from 'components/Heading'
import OptimizelyTest from 'components/OptimizelyTest'
import CartPaymentPageV2 from 'components/CartV2/CartPaymentPageV2'

const config = getConfig()

const MEMBERSHIP_BUTTON_CLICKED = 'start membership button clicked'

function renderOrderError (props) {
  const { user, checkout, zuora, staticText } = props
  const checkoutOrderError = checkout.get('orderError')
  const zuoraPaymentTokenError = zuora.getIn(['data', 'paymentToken', 'error'])
  const errorShouldRender = checkoutOrderError || zuoraPaymentTokenError

  if (!errorShouldRender) {
    return null
  }

  const langIsEs = getPrimary(user.getIn(['data', 'language'], List())) === ES
  const { features } = config
  let message = staticText.getIn(['data', 'genericErrorMessage'])
  let contactUrl = '/contact'

  if (
    checkoutOrderError === CHECKOUT_ORDER_ERROR_TYPE_PAYMENT ||
    zuoraPaymentTokenError
  ) {
    message = staticText.getIn(['data', 'paymentErrorMessage'])
  } else if (checkoutOrderError === CHECKOUT_ORDER_ERROR_TYPE_ALREADY_SUBSCRIBED) {
    message = staticText.getIn(['data', 'alreadySubscribedErrorMessage'])
  }

  if (langIsEs && _get(features, ['userLanguage', 'esZendeskHelpLink'])) {
    contactUrl = URL_HELP_CENTER_ES
  }

  const orderErrorMessages = [
    `${message} `,
    <Link
      className="error-message__link"
      to={contactUrl}
      directLink
      target={TARGET_BLANK}
    >
      {staticText.getIn(['data', 'orderErrorLink'])}
    </Link>,
  ]

  return (
    <ErrorMessage
      errorMessages={orderErrorMessages}
      errorMessageClass={['cart-billing__error-message']}
    />
  )
}

function getItemCheckoutProcessingClassName (baseClassName, processing) {
  const className = [baseClassName]

  if (processing) {
    className.push(`${baseClassName}--hidden`)
  }

  return className.join(' ')
}

function buildMembershipDataLayerObject (option) {
  return {
    event: 'customEvent',
    eventCategory: 'paypal',
    eventAction: option,
    eventLabel: 'cart-paypal',
  }
}

function shouldOverrideStartDate (props) {
  const { user, plans, userAccount, auth } = props
  const creationSource = (user.getIn(['data', 'creation_source']))
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const productRatePlanId = plans.getIn(['selection', 'id'])
  const zuoraAccount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])

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

class CartPaymentPage extends Component {
  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER) {
      const {
        checkout,
        userAccount,
        plans,
        user,
        auth,
        page,
        zuora,
        optimizely,
        inboundTracking,
        processRenewOrder,
        processCheckoutOrder,
        setEventStartMembershipClicked,
      } = nextProps
      const orderSuccess = checkout.getIn(['orderData', 'success'])
      const previousOrderSuccess = this.props.checkout.getIn(['orderData', 'success'])

      // When we transition from not having an order to having a successful order
      // Begin the redirect process
      if (orderSuccess !== previousOrderSuccess) {
        this.checkoutConfirmation(nextProps)
      }

      const userInfo = checkout.get('account', Map())
      // If the user is logged in, get their currency iso from their account
      // Otherwise get the currency iso from the plans
      const currencyIso = auth.get('jwt') ?
        userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'], USD) :
        plans.getIn(['selection', 'currencyIso'], USD)
      const country = zuora.getIn(['data', 'paymentToken', 'data', 'country'])
      const postalCode = zuora.getIn(['data', 'paymentToken', 'data', 'postalCode'])
      const nextPaymentMethodId = zuora.getIn(['data', 'paymentToken', 'data', 'refId'])
      const previousPaymentMethodId = this.props.zuora.getIn(['data', 'paymentToken', 'data', 'refId'])
      const language = user.getIn(['data', 'language'], List()).toJS()
      const entitlementEnd = parseInt(user.getIn(['data', 'userEntitlements', 'end']), 10) * 1000
      const locale = page.get('locale')
      const dateFormatString = 'YYYY-MM-DD'
      const formattedEndDate = formatDateTime(entitlementEnd, locale, dateFormatString)
      const productRatePlanId = plans.getIn(['selection', 'id'])
      const paymentInfo = {
        currencyIso,
        country,
        postalCode,
        productRatePlanId,
        creditCard: {
          paymentMethodId: nextPaymentMethodId,
        },
      }
      const startDateOverrideInfo =
      shouldOverrideStartDate(nextProps) ? {
        formattedEndDate,
      }
        : null

      // remove this outside if statement when Optimizely experiment 19422180075 is complete
      // and keep the code inside the if block
      // starting with if (nextPaymentMethodId && nextPaymentMethodId !== previousPaymentMethodId)
      if (
        !optimizely.getIn(['experiments', '19422180075']) ||
        optimizely.getIn(['experiments', '19422180075', 'variationId']) === '19419760057' ||
        (auth.get('jwt') && optimizely.getIn(['experiments', '19422180075'])) ||
        optimizely.get('disabled') // this is for the integration tests to pass
      ) {
        // if we just received the payment method from the iframe
        if (nextPaymentMethodId && nextPaymentMethodId !== previousPaymentMethodId) {
          // process authenticated user
          // credit card  renew (update) order
          if (auth.get('jwt')) {
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
      }
    }
  }

  getContent = (props) => {
    const { state } = this
    const { staticText, checkout } = props
    const paymentType = checkout.get('paymentType')
    const checkoutProcessing = checkout.get('processing')
    const processing = checkoutProcessing

    return (
      <div className="cart-payment">
        {
          !processing ?
            <div className="cart-payment__mobile-cart-summary">
              <CartOrderSummary mobile />
            </div>
            : null
        }
        {processing ? <CartBillingProcessing /> : null}
        <CartProgressIndicator />
        <div className="cart-payment__contents">
          <div className="cart-payment__left-wrap">
            <div className={getItemCheckoutProcessingClassName('cart-payment__header', processing)}>
              {
                paymentType !== PAYMENT_TYPE_PAYPAL ?
                  <div className="cart-payment__header-content">
                    <H2 as={HEADING_TYPES.H3} className="cart-payment__title">{staticText.getIn(['data', 'enterCardInfo'])}</H2>
                    <div className="cart-payment__secure-payment">
                      {staticText.getIn(['data', 'securePaymentEncryption'])}
                    </div>
                  </div> : null
              }
            </div>
            <div className={getItemCheckoutProcessingClassName('cart-payment__wrapper', processing)}>
              {renderOrderError(props, state)}
              {paymentType === PAYMENT_TYPE_PAYPAL ?
                <div className="cart-payment__paypal-info">
                  <div className="cart-payment__paypal-logo" />
                  <H5>
                    {staticText.getIn(['data', 'paypalEmail'])}
                  </H5>
                  <p className="cart-payment__paypal-email">
                    {checkout.getIn(['paypalPaymentInfo', 'details', 'email'])}
                  </p>
                  <Button
                    buttonClass={['button--primary', 'cart-payment__paypal-submit']}
                    text={staticText.getIn(['data', 'startMembership'])}
                    onClick={this.submitPaypalOrder}
                  />
                </div> :
                this.renderIframe()
              }
            </div>
          </div>
          <div className="cart-payment__order-summary">
            {!processing ? <CartOrderSummary desktop /> : null}
          </div>
        </div>
      </div>
    )
  }

  submitPaypalOrder = () => {
    const {
      auth,
      processCheckoutOrder,
      processRenewOrder,
      checkout,
      plans,
      page,
      inboundTracking,
      user,
      userAccount,
      setEventStartMembershipClicked,
    } = this.props
    // If the user is logged in, get their currency iso from their account
    // Otherwise get the currency iso from the plans
    const currencyIso = auth.get('jwt') ?
      userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'], USD) :
      plans.getIn(['selection', 'currencyIso'], USD)
    const userInfo = checkout.get('account', Map())
    const productRatePlanId = plans.getIn(['selection', 'id'])
    const language = user.getIn(['data', 'language'], List()).toJS()
    const entitlementEnd = parseInt(user.getIn(['data', 'userEntitlements', 'end']), 10) * 1000
    const locale = page.get('locale')
    const dateFormatString = 'YYYY-MM-DD'
    const formattedEndDate = formatDateTime(entitlementEnd, locale, dateFormatString)
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
    shouldOverrideStartDate(this.props) ? {
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

  checkoutConfirmation = (props) => {
    const { checkout, history, auth, user = Map() } = props
    const orderSuccess = checkout.getIn(['orderData', 'success'])
    // orderData has to be checked since a rejected promise still triggers this function.
    // due to chain being restored after .catch in the action.
    if (orderSuccess) {
      const language = user.getIn(['data', 'language'])
      historyRedirect({ history, url: URL_CART_CONFIRMATION, auth, language })
    }
  }

  startMembershipMessage = (props) => {
    const { staticText } = props
    const byClickingStartMembership = staticText.getIn(['data', 'byClickingStartMembership'])
    const priceNotInclusive = staticText.getIn(['data', 'priceNotInclusive'])
    const startMembershipMessage = `${byClickingStartMembership} ${priceNotInclusive}`
    return startMembershipMessage
  }

  renderIframe = () => {
    const { props } = this
    const { staticText } = props

    return (
      <ZuoraCreditCard
        submitButtonText={staticText.getIn(['data', 'startMembership'])}
        disclaimer={this.startMembershipMessage(props)}
      />
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
          <CartPaymentPageV2 />
        </OptimizelyTest>
      </React.Fragment>
    )
  }
}

CartPaymentPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setCheckoutOrderData: PropTypes.func.isRequired,
  setEventStartMembershipClicked: PropTypes.func.isRequired,
  processCheckoutOrder: PropTypes.func.isRequired,
  processRenewOrder: PropTypes.func.isRequired,
  setCheckoutOrderError: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      userAccount: state.userAccount,
      checkout: state.checkout,
      inboundTracking: state.inboundTracking,
      page: state.page,
      zuora: state.zuora,
      optimizely: state.optimizely,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setCheckoutOrderData: actions.checkout.setCheckoutOrderData,
        setEventStartMembershipClicked: actions.eventTracking.setEventStartMembershipClicked,
        processCheckoutOrder: actions.checkout.processCheckoutOrder,
        processRenewOrder: actions.checkout.processRenewOrder,
        setCheckoutOrderError: actions.checkout.setCheckoutOrderError,
      }
    },
  ),
  connectStaticText({ storeKey: 'cartPaymentPage' }),
)(CartPaymentPage)
