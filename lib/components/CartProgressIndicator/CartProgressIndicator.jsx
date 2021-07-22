
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import _replace from 'lodash/replace'
import { CHECKOUT_TOTAL_STEPS } from 'services/checkout'

function CartProgressIndicator (props) {
  const { staticText, checkout, v2 } = props
  const currentStep = checkout.get('step', 1)

  let stepText = staticText.getIn(['data', 'step'])
  /* eslint-disable no-template-curly-in-string */
  stepText = _replace(stepText, '${ currentStep }', currentStep)
  stepText = _replace(stepText, '${ totalSteps }', CHECKOUT_TOTAL_STEPS)
  /* eslint-enable no-template-curly-in-string */

  if (!v2) {
    return (
      <div className="cart-progress-indicator">
        {stepText}
      </div>
    )
  }
  return (
    <div className="cart-progress-indicator cart-progress-indicator--v2">
      {stepText}
    </div>
  )
}

CartProgressIndicator.propTypes = {
  checkout: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  v2: PropTypes.bool,
}

export default compose(
  connectRedux(
    state => ({
      checkout: state.checkout,
    }),
  ),
  connectStaticText({ storeKey: 'cartProgressIndicator' }),
)(CartProgressIndicator)
