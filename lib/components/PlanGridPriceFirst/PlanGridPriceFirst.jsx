import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { USD, EUR } from 'services/currency'
import _parseInt from 'lodash/parseInt'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'

export function renderText (plan, free, freeText) {
  if (!plan) {
    return null
  }
  const price = plan.getIn(['segments', 0, 'price'])

  // for USD, format anything less than $1
  if (plan.get('currencyIso') === USD && price < 1.0 && price > 0) {
    const priceString = String(price).replace(/^[0]+\./, '')
    return `${priceString}¢`
  }

  // for EUR, format anything less than 1 €
  if (plan.get('currencyIso') === EUR && price < 1.0 && price > 0) {
    const priceString = String(price).replace(/\./, ',')
    return `${priceString} ${plan.get('currencySymbol')}`
  }

  // If the price is zero
  if (_parseInt(price) === 0) {
    const zeroPrice = plan.get('currencyIso') === EUR ? `0.00 ${plan.get('currencySymbol')}` : `${plan.get('currencySymbol')}0.00`

    if (free) {
      return freeText
    }

    return zeroPrice
  }

  const priceAmount = parseFloat(price)
  // format EUR pricing
  if (plan.get('currencyIso') === EUR) {
    return `${String(priceAmount.toFixed(2)).replace(/\.00$/, '').replace(/\./, ',')} ${plan.get('currencySymbol')}`
  }

  return `${plan.get('currencySymbol')}${String(priceAmount.toFixed(2)).replace(/\.00$/, '')}`
}

function getClassNames (classes) {
  const classNames = ['plan-grid-price-first'].concat(classes || [])
  return classNames.join(' ')
}

function PlanGridPriceFirst (props) {
  const { className, plan, showFree, staticText } = props
  const freeText = staticText.getIn(['data', 'free'])

  return (
    <div className={getClassNames(className)}>
      {renderText(plan, showFree, freeText)}
    </div>
  )
}

PlanGridPriceFirst.propTypes = {
  plan: ImmutablePropTypes.map,
  className: PropTypes.array,
  showFree: PropTypes.bool,
}

export default compose(
  connectRedux(
    state => ({
      plans: state.plans,
      staticText: state.staticText,
    }),
  ),
  connectStaticText({ storeKey: 'planGridPriceFirst' }),
)(PlanGridPriceFirst)
