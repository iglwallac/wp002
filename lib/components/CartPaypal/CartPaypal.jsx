import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import scriptLoader from 'react-async-script-loader'
import { USD } from 'services/currency'
import { EN } from 'services/languages/constants'
import _isNil from 'lodash/isNil'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import languageMap from './pp_lang_map.json'

const PAYPAL_BUTTON_DISPLAYED = 'paypal payment button displayed'
const PAYPAL_BUTTON_CLICKED = 'paypal payment button clicked'

function buildPaypalDataLayerObject (option) {
  return {
    event: 'customEvent',
    eventCategory: 'paypal',
    eventAction: option,
    eventLabel: 'cart-paypal',
  }
}

function getClassName (className) {
  const baseClassName = 'cart-paypal'
  if (className && _isArray(className)) {
    return [baseClassName].concat(className).join(' ')
  }

  if (className && _isString(className)) {
    return `${baseClassName} ${className}`
  }

  return baseClassName
}

/**
 * Is the currency support by PayPal.
 * {string=} currency - The currency string.
 */
export function isCurrencyIsoSupprted (currencyIso) {
  return _isNil(currencyIso) || currencyIso === USD
}

class CartPaypal extends PureComponent {
  componentDidMount () {
    const { props } = this
    const { setEventPaypalButtonDisplayed } = props
    this.updateData()
    setEventPaypalButtonDisplayed(buildPaypalDataLayerObject(PAYPAL_BUTTON_DISPLAYED))
  }

  componentDidUpdate () {
    if (!process.env.BROWSER) {
      return
    }
    this.updateData()
  }

  componentWillUnmount () {
    const { props } = this
    const {
      setCheckoutBrainTreeReady,
    } = props
    setCheckoutBrainTreeReady(false, false)
  }

  onClickPayPal = () => {
    const {
      setEventPaypalButtonClicked,
      user,
    } = this.props
    if (!this._paypalInstance) {
      return
    }
    setEventPaypalButtonClicked(buildPaypalDataLayerObject(PAYPAL_BUTTON_CLICKED))
    const language = user.getIn(['data', 'language'], List([EN])).first()

    const { setCheckoutPayPalNonce } = this.props
    this._paypalInstance.tokenize(
      {
        flow: 'vault',
        locale: languageMap[language],
        enableShippingAddress: false,
      },
      (err, tokenizationPayload) => {
        // user closed paypal modal or clicked cancel
        if (err) {
          setCheckoutPayPalNonce(undefined)
          return
        }
        setCheckoutPayPalNonce(tokenizationPayload)
      },
    )
  }

  onBrainTreePayPalReady = (paypalErr, paypalInstance) => {
    const { props } = this
    const { setCheckoutBrainTreeReady } = props
    this._paypalInstance = paypalInstance
    setCheckoutBrainTreeReady(true)
  }

  onBrainTreeReady = (err, client) => {
    if (err) {
      return
    }
    global.braintree.paypal.create({ client }, this.onBrainTreePayPalReady)
  }


  updateData = () => {
    const { props } = this
    const {
      getCheckoutPayPalCredentials,
      isScriptLoaded,
      isScriptLoadSucceed,
      checkout,
      setCheckoutBrainTreeProcessing,
    } = props
    if (
      isScriptLoaded &&
      isScriptLoadSucceed &&
      !checkout.get('paypalToken') &&
      !checkout.get('paypalTokenProcessing')
    ) {
      getCheckoutPayPalCredentials()
      return
    }
    if (
      checkout.get('paypalToken') &&
      !checkout.get('brianTreeProcessing') &&
      !checkout.get('brianTreeReady')
    ) {
      setCheckoutBrainTreeProcessing(true)
      const authorization = checkout.get('paypalToken')
      global.braintree.client.create({ authorization }, this.onBrainTreeReady)
    }
  }

  render () {
    const { props } = this
    const {
      isScriptLoaded,
      isScriptLoadSucceed,
      checkout,
      className,
    } = props
    const scriptReady = isScriptLoaded && isScriptLoadSucceed
    const brainTreePaypalReady =
      checkout.get('paypalToken') &&
      checkout.get('brianTreeReady')
    if (!scriptReady || !brainTreePaypalReady) {
      return null
    }

    return (
      <div className={getClassName(className)}>
        <button className="cart-paypal__button" onClick={this.onClickPayPal} />
      </div>
    )
  }
}

CartPaypal.propTypes = {
  location: PropTypes.object,
  checkout: ImmutablePropTypes.map.isRequired,
  getCheckoutPayPalCredentials: PropTypes.func.isRequired,
  setCheckoutPayPalNonce: PropTypes.func.isRequired,
  cartPaypalStaticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  stackedLabel: PropTypes.bool,
  setEventPaypalButtonDisplayed: PropTypes.func.isRequired,
  setEventPaypalButtonClicked: PropTypes.func.isRequired,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
}

export default compose(
  connectRedux(
    state => ({
      user: state.user,
      checkout: state.checkout,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getCheckoutPayPalCredentials:
          actions.checkout.getCheckoutPayPalCredentials,
        setCheckoutPayPalNonce: actions.checkout.setCheckoutPayPalNonce,
        setCheckoutBrainTreeProcessing:
          actions.checkout.setCheckoutBrainTreeProcessing,
        setCheckoutBrainTreeReady: actions.checkout.setCheckoutBrainTreeReady,
        setEventPaypalButtonDisplayed: actions.eventTracking.setEventPaypalButtonDisplayed,
        setEventPaypalButtonClicked: actions.eventTracking.setEventPaypalButtonClicked,
      }
    },
  ),
  connectStaticText({
    storeKey: 'cartPaypal',
    propName: 'cartPaypalStaticText',
  }),
  scriptLoader([
    'https://js.braintreegateway.com/web/3.25.0/js/client.min.js',
    'https://js.braintreegateway.com/web/3.25.0/js/paypal.min.js',
  ]),
)(CartPaypal)
