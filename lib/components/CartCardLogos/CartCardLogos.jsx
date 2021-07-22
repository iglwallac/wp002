import PropTypes from 'prop-types'
import React from 'react'

function CartCardLogos () {
  return (
    <div className="card-logos">
      <div className="card-logos__logo card-logos__mastercard" />
      <div className="card-logos__logo card-logos__visa" />
      <div className="card-logos__logo card-logos__amex" />
    </div>
  )
}

CartCardLogos.propTypes = {
  currencyIso: PropTypes.string,
}

export default CartCardLogos
