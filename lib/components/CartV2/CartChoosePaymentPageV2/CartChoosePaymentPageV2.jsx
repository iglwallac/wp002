import PropTypes from 'prop-types'
import React, { useState } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
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
import { URL_CART_BILLING_PAYMENT } from 'services/url/constants'
import { USD } from 'services/currency'
import Icon from 'components/Icon'
import Link from 'components/Link'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import CartPaypal from 'components/CartPaypal'
import { H1, HEADING_TYPES } from 'components/Heading'
import {
  getCurrentTime,
  getDateLocale,
  getDateTime,
  ordinalDateFormatingi18n,
  formatWithLocale,
  addDays,
} from 'services/date-time'
import { getPrimary } from 'services/languages'
import {
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL,
} from 'services/plans'
import CartOrderSummaryV2 from 'components/CartV2/CartOrderSummaryV2'

const config = getConfig()

function CartChoosePaymentPageV2 (props) {
  const {
    staticText,
    plans,
    user,
    checkout,
    location,
    getZuoraIframeSignatureToken,
  } = props
  const paypalCurrencies = _get(config, ['features', 'checkout', 'paypalCurrencies'])
  const selectedCurrencyIso = plans.getIn(['selection', 'currencyIso'], USD)
  const selectedPlanSku = plans.getIn(['selection', 'sku'])
  const shouldShowDetails = selectedPlanSku === PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY ||
    selectedPlanSku === PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL
  const paypal = _get(config, ['features', 'checkout', 'paypal'])
  const shouldRenderPaypal = _includes(paypalCurrencies, selectedCurrencyIso) && paypal
  const paypalReady = checkout.get('paypalToken') &&
    !checkout.get('brianTreeProcessing') &&
    checkout.get('brianTreeReady')
  const formattedDate = getDateTime(addDays(getCurrentTime(), 7))
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const expireDate = formatWithLocale(formattedDate, dateFormatString, { locale: dateLocale })

  const [displayPayPalButton, setPaypalButton] = useState(false)
  const paymentMethodSelectionClass = displayPayPalButton ? 'cart-choose-payment-v2__hide' : 'cart-choose-payment-v2__show'
  const paypalButtonClass = displayPayPalButton ? 'cart-choose-payment-v2__show' : 'cart-choose-payment-v2__hide'

  const renderPaypalOption = (shouldRender) => {
    if (!shouldRender) {
      return null
    }

    return (
      <React.Fragment>
        {
          paypalReady ?
            <p className="cart-choose-payment-v2__description">
              {staticText.getIn(['data', 'payPalFlow'])}
            </p> :
            <div className="cart-choose-payment-v2__placeholder">
              <Sherpa className={['cart-choose-payment-v2__sherpa']} type={TYPE_SMALL_BLUE} />
              <p className="cart-choose-payment-v2__placeholder-text">
                {staticText.getIn(['data', 'loadingPaypal'])}
              </p>
            </div>
        }
        <CartPaypal
          stackedLabel
          location={location}
        />
      </React.Fragment>
    )
  }

  return (
    <div className="cart-choose-payment-v2">
      <div className="cart-choose-payment-v2__content">
        <div className="cart-choose-payment-v2__content-left">
          <div className="cart-choose-payment-v2__progress">
            <CartProgressIndicator />
          </div>
          <H1 as={HEADING_TYPES.H3} className="cart-choose-payment-v2__title">
            Choose a secure payment method
          </H1>
          <div className={paymentMethodSelectionClass}>
            {
              shouldShowDetails ?
                <p className="cart-choose-payment-v2__description">
                  {`Enter your credit card information to start your free 7-day trial. You will not be charged until the end of your free trial on ${expireDate}.`}
                </p>
                : null
            }
            <div className="cart-choose-payment-v2__buttons-container">
              <Link
                className="cart-choose-payment-v2__payment-method"
                to={URL_CART_BILLING_PAYMENT}
                onClick={() => getZuoraIframeSignatureToken()}
              >
                <div className="cart-choose-payment-v2__payment-container">
                  <div className="cart-choose-payment-v2__payment-items">
                    <div className="cart-choose-payment-v2__payment-text">
                      {staticText.getIn(['data', 'creditOrDebit'])}
                    </div>
                    <div className="cart-choose-payment-v2__payment-logos">
                      <CartCardLogos
                        currencyIso={selectedCurrencyIso}
                      />
                    </div>
                  </div>
                  <Icon
                    iconClass={[
                      'cart-choose-payment-v2__arrow',
                      'icon--right',
                      'icon--action',
                    ]}
                  />
                </div>
              </Link>
              {
                shouldRenderPaypal ?
                  <Link
                    className="cart-choose-payment-v2__payment-method"
                    onClick={() => setPaypalButton(true)}
                    to={URL_JAVASCRIPT_VOID}
                  >
                    <div className="cart-choose-payment-v2__payment-container cart-choose-payment-v2__payment-container--last">
                      <div className="cart-choose-payment-v2__payment-items">
                        <div className="cart-choose-payment-v2__payment-text">
                          {staticText.getIn(['data', 'payPal'])}
                        </div>
                        <div className="cart-choose-payment-v2__payment-logos">
                          <div className="cart-choose-payment-v2__paypal-logo" />
                        </div>
                      </div>
                      <Icon iconClass={[
                        'cart-choose-payment-v2__arrow',
                        'icon--right',
                        'icon--action',
                      ]}
                      />
                    </div>
                  </Link>
                  : null
              }
              <div className="cart-choose-payment-v2__secure-payment">
                {staticText.getIn(['data', 'securePaymentEncryption'])}
              </div>
            </div>
          </div>
          <div className={paypalButtonClass}>
            <div className="cart-choose-payment-v2__buttons-container-paypal">
              {renderPaypalOption(shouldRenderPaypal, paypalReady, staticText, location)}
            </div>
          </div>
        </div>
        <div className="cart-choose-payment-v2__content-right">
          <div className="cart-choose-payment-v2__order-summary">
            <CartOrderSummaryV2 />
          </div>
        </div>
      </div>
    </div>
  )
}

CartChoosePaymentPageV2.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  serverTime: ImmutablePropTypes.map.isRequired,
  setCheckoutStep: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      checkout: state.checkout,
      plans: state.plans,
      user: state.user,
      serverTime: state.serverTime,
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
)(CartChoosePaymentPageV2)
