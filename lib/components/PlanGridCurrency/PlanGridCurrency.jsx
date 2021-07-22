import PropTypes from 'prop-types'
import React from 'react'
import compose from 'recompose/compose'
import _replace from 'lodash/replace'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'

function PlanGridCurrency (props) {
  const {
    currencyIso,
    staticText,
  } = props
  return (
    <div className="plan-grid-currency">
      {
        // eslint-disable-next-line no-template-curly-in-string
        _replace(staticText.getIn(['data', 'currency']), '${ currencyIso }', currencyIso)
      }
    </div>
  )
}

PlanGridCurrency.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  currencyIso: PropTypes.string.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'planGridCurrency' }),
)(PlanGridCurrency)
