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

function getClassName (className) {
  const baseClassName = 'my-account-update-cart-paypal'
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

class MyAccountUpdatePaymentPaypal extends PureComponent {
  componentDidMount () {
    this.updateData()
  }

  componentDidUpdate () {
    if (!process.env.BROWSER) {
      return
    }
    this.updateData()
  }

  componentWillUnmount () {
    const { props } = this
    const { setUpdatePaymentBrainTreeReady } = props
    setUpdatePaymentBrainTreeReady(false, false)
  }

  onClickPayPal = () => {
    const { user } = this.props
    if (!this._paypalInstance) {
      return
    }

    const language = user.getIn(['data', 'language'], List([EN])).first()

    const { setUpdatePaymentPayPalNonce } = this.props
    this._paypalInstance.tokenize(
      {
        flow: 'vault',
        locale: languageMap[language],
        enableShippingAddress: false,
      },
      (err, tokenizationPayload) => {
        // user closed paypal modal or clicked cancel
        if (err) {
          setUpdatePaymentPayPalNonce(undefined)
          return
        }
        setUpdatePaymentPayPalNonce(tokenizationPayload)
      },
    )
  }

  onBrainTreePayPalReady = (paypalErr, paypalInstance) => {
    const { props } = this
    const { setUpdatePaymentBrainTreeReady } = props
    this._paypalInstance = paypalInstance
    setUpdatePaymentBrainTreeReady(true)
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
      getUpdatePaymentPayPalCredentials,
      isScriptLoaded,
      isScriptLoadSucceed,
      updatePayment,
      setUpdatePaymentBrainTreeProcessing,
    } = props
    if (
      isScriptLoaded &&
      isScriptLoadSucceed &&
      !updatePayment.get('paypalToken') &&
      !updatePayment.get('paypalTokenProcessing')
    ) {
      getUpdatePaymentPayPalCredentials()
      return
    }
    if (
      updatePayment.get('paypalToken') &&
      !updatePayment.get('brianTreeProcessing') &&
      !updatePayment.get('brianTreeReady')
    ) {
      setUpdatePaymentBrainTreeProcessing(true)
      const authorization = updatePayment.get('paypalToken')
      global.braintree.client.create({ authorization }, this.onBrainTreeReady)
    }
  }

  render () {
    const { props } = this
    const {
      isScriptLoaded,
      isScriptLoadSucceed,
      updatePayment,
      cartPaypalStaticText,
      className,
    } = props
    const scriptReady = isScriptLoaded && isScriptLoadSucceed
    const brainTreePaypalReady =
      updatePayment.get('paypalToken') &&
      updatePayment.get('brianTreeReady')
    if (!scriptReady || !brainTreePaypalReady) {
      return null
    }
    return (
      <div className={getClassName(className)}>
        <span className="my-account-update-cart-paypal__label">
          {cartPaypalStaticText.getIn(['data', 'or'])}
        </span>
        {'\u00A0'}
        <button className="my-account-update-cart-paypal__button" onClick={this.onClickPayPal} />
      </div>
    )
  }
}

MyAccountUpdatePaymentPaypal.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  updatePayment: ImmutablePropTypes.map.isRequired,
  getUpdatePaymentPayPalCredentials: PropTypes.func.isRequired,
  setUpdatePaymentPayPalNonce: PropTypes.func.isRequired,
  cartPaypalStaticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      updatePayment: state.updatePayment,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        getUpdatePaymentPayPalCredentials:
          actions.updatePayment.getUpdatePaymentPayPalCredentials,
        setUpdatePaymentPayPalNonce: actions.updatePayment.setUpdatePaymentPayPalNonce,
        setUpdatePaymentBrainTreeProcessing:
          actions.updatePayment.setUpdatePaymentBrainTreeProcessing,
        setUpdatePaymentBrainTreeReady: actions.updatePayment.setUpdatePaymentBrainTreeReady,
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
)(MyAccountUpdatePaymentPaypal)
