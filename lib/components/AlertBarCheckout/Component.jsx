import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'

function AlertBarCheckout (props) {
  const { staticText } = props

  return (
    <div className="alert-bar-checkout">
      <span>
        {staticText.getIn(['data', 'message'])}
      </span>
    </div>
  )
}

AlertBarCheckout.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'alertBarCheckout' }),
)(AlertBarCheckout)
