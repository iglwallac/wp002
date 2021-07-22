import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import Link from 'components/Link'
import { URL_ACCOUNT } from 'services/url/constants'


function AlertBarPaymentError (props) {
  const { staticText } = props
  return (
    <div>
      <Link
        to={URL_ACCOUNT}
        className=""
      >
        {staticText.getIn(['data', 'verifyPaymentInfo'])}
      </Link>
    </div>
  )
}

AlertBarPaymentError.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'alertBarPaymentError' }),
  connectRedux(
    state => ({
      user: state.user,
    }),
  ),
)(AlertBarPaymentError)
