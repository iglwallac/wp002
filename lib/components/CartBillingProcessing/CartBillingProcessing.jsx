import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import { connect as connectStaticText } from 'components/StaticText/connect'

function CartBillingProcessing (props) {
  const { staticText } = props
  return (
    <div className="cart-billing-processing">
      <Sherpa type={TYPE_SMALL_WHITE} />
      <p className="cart-billing-processing__message">
        {staticText.getIn(['data', 'yourAccountIsBeingCreated'])}
        <br />
        {staticText.getIn(['data', 'pleaseStayOnThisPage'])}
      </p>
    </div>
  )
}

CartBillingProcessing.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connectStaticText({ storeKey: 'cartBillingProcessing' })(
  CartBillingProcessing,
)
