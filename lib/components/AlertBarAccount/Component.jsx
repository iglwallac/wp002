import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'

function AlertBarAccount (props) {
  const { staticText } = props

  return (
    <div className="alert-bar-account">
      <span>
        {staticText.getIn(['data', 'message'])}
      </span>
    </div>
  )
}

AlertBarAccount.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'alertBarAccount' }),
)(AlertBarAccount)
