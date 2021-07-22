import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useEffect } from 'react'
import { Map } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import Button from 'components/Button'
import { requestAnimationFrame } from 'services/animate'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getElementToWindowTopOffset } from 'services/dom'

function ZuoraCreditCard (props) {
  const {
    staticText,
    submitButtonText,
    disclaimer,
    iframeScriptLoaded,
    iframeTokenData = Map(),
    setZuoraIframeClientReady,
    iframeTokenProcessing,
    paymentTokenProcessing,
    paymentTokenError,
    captchaValid,
    iframeRenderComplete,
    setZuoraPaymentTokenError,
    resetZuoraData,
  } = props
  const success = iframeTokenData.get('success')
  const processing = iframeTokenProcessing || !iframeRenderComplete
  const { Z } = global

  const ref = React.useRef(null)

  const setClientReady = () => {
    if (success && iframeScriptLoaded) {
      // we have a token and the zuora script is loaded, so the client is ready
      setZuoraIframeClientReady(true)
    }
  }

  const onComponentUnmount = () => {
    return () => {
      // reset zuora iframe data
      resetZuoraData()
    }
  }

  // use hook like componentDidUpdate
  // watches success, iframeScriptLoaded
  useEffect(setClientReady, [success, iframeScriptLoaded])

  // use hook like componentWillUnmount
  useEffect(onComponentUnmount, [])

  const submit = () => {
    const { setZuoraPaymentTokenProcessing } = props

    if (!Z) {
      return
    }

    setZuoraPaymentTokenProcessing(true)

    if (paymentTokenError) {
      setZuoraPaymentTokenError('')
    }

    Z.submit()

    // scroll to the top of iframe so if there is an error it will be visible
    if (global && global.scrollTo) {
      const offset = getElementToWindowTopOffset(ref.current) - 100 || 0
      requestAnimationFrame(() => global.scrollTo(0, offset))
    }
  }

  const getErrorMessage = (text) => {
    return (
      <div className="zuora-credit-card__error-message">
        {text}
      </div>
    )
  }

  if (captchaValid === false) {
    return (
      <div className="zuora-credit-card">
        {getErrorMessage(staticText.getIn(['data', 'captchaErrorMessage']))}
      </div>
    )
  }

  if (iframeScriptLoaded === false) {
    return (
      <div className="zuora-credit-card">
        {getErrorMessage(staticText.getIn(['data', 'somethingWentWrong']))}
      </div>
    )
  }

  return (
    <div className="zuora-credit-card" ref={ref}>
      {
        processing ?
          <Sherpa type={TYPE_SMALL_WHITE} />
          : null
      }
      <div
        id="zuora_payment"
        className={`zuora-credit-card__iframe-wrapper${iframeRenderComplete ? ' zuora-credit-card__iframe-wrapper--visible' : ''}`}
      />
      {
        disclaimer && iframeRenderComplete ?
          <div className="zuora-credit-card__disclaimer">
            {disclaimer}
          </div>
          : null
      }
      {
        iframeRenderComplete ?
          <Button
            text={submitButtonText}
            buttonClass={[paymentTokenProcessing ? 'button--disabled' : 'button--primary', 'zuora-credit-card__submit']}
            onClick={!paymentTokenProcessing ? submit : null}
          />
          : null
      }
    </div>
  )
}

ZuoraCreditCard.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  disclaimer: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  iframeTokenProcessing: PropTypes.bool.isRequired,
  iframeTokenData: ImmutablePropTypes.map.isRequired,
  iframeScriptLoaded: PropTypes.bool,
  paymentTokenProcessing: PropTypes.bool.isRequired,
  paymentTokenError: PropTypes.string,
  setZuoraIframeClientReady: PropTypes.func.isRequired,
  setZuoraPaymentTokenProcessing: PropTypes.func.isRequired,
  setZuoraPaymentTokenError: PropTypes.func.isRequired,
  captchaValid: PropTypes.bool,
  iframeRenderComplete: PropTypes.bool,
  resetZuoraData: PropTypes.func.isRequired,
}

ZuoraCreditCard.defaultProps = {
  iframeTokenProcessing: false,
  iframeTokenData: Map(),
  paymentTokenProcessing: false,
}

export default compose(
  connectRedux(
    (state) => {
      return {
        iframeTokenData: state.zuora.getIn(['data', 'iframe', 'rsa']),
        iframeTokenProcessing: state.zuora.get('iframeSignatureTokenProcessing'),
        iframeScriptLoaded: state.zuora.getIn(['data', 'iframe', 'scriptLoaded']),
        paymentTokenProcessing: state.zuora.get('iframePaymentTokenProcessing'),
        paymentTokenError: state.zuora.getIn(['data', 'paymentToken', 'error']),
        captchaValid: state.zuora.getIn(['data', 'captcha', 'valid']),
        iframeRenderComplete: state.zuora.getIn(['data', 'iframe', 'renderComplete']),
      }
    },
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setZuoraIframeClientReady: actions.zuora.setZuoraIframeClientReady,
        setZuoraPaymentTokenProcessing: actions.zuora.setZuoraPaymentTokenProcessing,
        setZuoraPaymentTokenError: actions.zuora.setZuoraPaymentTokenError,
        resetZuoraData: actions.zuora.resetZuoraData,
      }
    },
  ),
  connectStaticText({ storeKey: 'zuoraIframe' }),
)(ZuoraCreditCard)
