/* eslint-disable react/jsx-indent */

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { get as getConfig } from 'config'
import compose from 'recompose/compose'
import CartProgressIndicator from 'components/CartProgressIndicator'
import CartCardLogos from 'components/CartCardLogos'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { connect as connectStaticText } from 'components/StaticText/connect'
import CartOrderSummary from 'components/CartOrderSummary'
import { historyRedirect } from 'services/navigation'
import { CHECKOUT_STEP_THREE } from 'services/checkout'
import { URL_CART_BILLING_PAYMENT } from 'services/url/constants'
import { USD } from 'services/currency'
import Icon from 'components/Icon'
import Link from 'components/Link'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import CartPaypal from 'components/CartPaypal'
import OptimizelyTest from 'components/OptimizelyTest'
import CartChoosePaymentPageV2 from 'components/CartV2/CartChoosePaymentPageV2'
import { H2, HEADING_TYPES } from 'components/Heading'

const config = getConfig()

function renderPaypal (shouldRender, paypalReady, staticText, location) {
  if (!shouldRender) {
    return null
  }

  return (
    <div>
      {
        paypalReady ?
          <p className="cart-choose-payment__paypal-text">
            {staticText.getIn(['data', 'payPalFlow'])}
          </p> :
          <div className="cart-choose-payment__placeholder">
            <Sherpa className={['cart-choose-payment__sherpa']} type={TYPE_SMALL_BLUE} />
            <p className="cart-choose-payment__placeholder-text">
              {staticText.getIn(['data', 'loadingPaypal'])}
            </p>
          </div>
      }
      <CartPaypal
        stackedLabel
        location={location}
      />
    </div>
  )
}

class CartChoosePaymentPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      displayPayPalButton: false,
    }
  }

  componentDidMount () {
    const { setCheckoutStep } = this.props
    setCheckoutStep(CHECKOUT_STEP_THREE)
  }

  componentWillReceiveProps (nextProps) {
    const { history, checkout, auth, user = Map() } = nextProps
    const nextPaypalNonce = checkout.getIn(['paypalPaymentInfo', 'nonce'])
    const previousPaypalNonce = this.props.checkout.getIn(['paypalPaymentInfo', 'nonce'])
    const language = user.getIn(['data', 'language'])

    if (nextPaypalNonce !== previousPaypalNonce) {
      historyRedirect({ history, url: URL_CART_BILLING_PAYMENT, auth, language })
    }
  }

  setPaypalButton (value) {
    this.setState(() => ({ displayPayPalButton: value }))
  }

  getContent (props) {
    const { plans, checkout, staticText, location, getZuoraIframeSignatureToken } = props
    const paypalCurrencies = _get(config, ['features', 'checkout', 'paypalCurrencies'])
    const selectedCurrencyIso = plans.getIn(['selection', 'currencyIso'], USD)
    const paypal = _get(config, ['features', 'checkout', 'paypal'])
    const shouldRenderPaypal = _includes(paypalCurrencies, selectedCurrencyIso) && paypal
    const displayPayPalButton = this.state.displayPayPalButton
    const paypalReady = checkout.get('paypalToken') &&
      !checkout.get('brianTreeProcessing') &&
      checkout.get('brianTreeReady')
    const paymentMethodSelectionClass = displayPayPalButton ?
      'cart-choose-payment__hide' : 'cart-choose-payment__show'
    const paypalButtonClass = displayPayPalButton ?
      'cart-choose-payment__show' : 'cart-choose-payment__hide'

    return (
      <div className="cart-choose-payment">
        <div className="cart-choose-payment__mobile-summary">
          <CartOrderSummary mobile />
        </div>
        <div className="cart-choose-payment__content">
          <CartProgressIndicator />
          <H2 as={HEADING_TYPES.H3} className="cart-choose-payment__main-title">
            {staticText.getIn(['data', 'makePayment'])}
          </H2>
          <div className={paymentMethodSelectionClass}>
            <div className="cart-choose-payment__buttons-container">
              <div className="cart-choose-payment__subtitle">
                <span>{staticText.getIn(['data', 'paymentMethod'])}</span>
              </div>
              <Link
                className="cart-choose-payment__card-method"
                to={URL_CART_BILLING_PAYMENT}
                onClick={() => getZuoraIframeSignatureToken()}
              >
                <div className="cart-choose-payment__container">
                  <div className="cart-choose-payment__title">
                    {staticText.getIn(['data', 'creditOrDebit'])}
                  </div>
                  <div className="cart-choose-payment__payment-logos">
                    <div className="cart-choose-payment__card-logos-container">
                      <CartCardLogos
                        currencyIso={selectedCurrencyIso}
                      />
                    </div>
                  </div>
                  <Icon
                    iconClass={[
                      'cart-choose-payment__arrow-1',
                      'icon--right',
                      'icon--action',
                    ]}
                  />
                </div>
              </Link>
              {
                shouldRenderPaypal ?
                  <Link
                    className="cart-choose-payment__paypal-method"
                    onClick={() => this.setPaypalButton({ displayPayPalButton: true })}
                    to={URL_JAVASCRIPT_VOID}
                  >
                    <div className="cart-choose-payment__paypal-container">
                      <span className="cart-choose-payment__paypal-button-text">
                        {staticText.getIn(['data', 'payPal'])}
                      </span>
                      <div className="cart-choose-payment__paypal-logo" />
                      <Icon iconClass={[
                        'cart-choose-payment__arrow-2',
                        'icon--right',
                        'icon--action',
                      ]}
                      />
                    </div>
                  </Link>
                  : null
              }
              <div className="cart-choose-payment__secure-payment">
                {staticText.getIn(['data', 'securePaymentEncryption'])}
              </div>
            </div>
          </div>
          <div className={paypalButtonClass}>
            <div className="cart-choose-payment__buttons-container-paypal">
              <div className="cart-choose-payment__subtitle">
                <span>{staticText.getIn(['data', 'paymentMethod'])}</span>
              </div>
              {renderPaypal(shouldRenderPaypal, paypalReady, staticText, location)}
            </div>
          </div>
          <div className="cart-choose-payment__order-summary">
            <CartOrderSummary desktop />
          </div>
        </div>
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
          <CartChoosePaymentPageV2 />
        </OptimizelyTest>
      </React.Fragment>
    )
  }
}

CartChoosePaymentPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setCheckoutStep: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      auth: state.auth,
      checkout: state.checkout,
      plans: state.plans,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setCheckoutStep: actions.checkout.setCheckoutStep,
        getZuoraIframeSignatureToken: actions.zuora.getZuoraIframeSignatureToken,
      }
    },
  ),
  connectStaticText({ storeKey: 'cartChoosePaymentPage' }),
)(CartChoosePaymentPage)
