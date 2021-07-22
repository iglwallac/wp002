import React from 'react'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import { EUR, GBP } from 'services/currency'
import PlanGridPriceFirst from 'components/PlanGridPriceFirst'
import Button from 'components/Button'
import {
  PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS,
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL,
  PLAN_SKU_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY,
  PLAN_SKU_ONE_MONTH_TRIAL_TO_ANNUAL,
  PLAN_SKU_LEGACY_MONTHLY,
  PLAN_SKU_LEGACY_ANNUAL,
  PLAN_SKU_SUMMIT_MONTHLY,
  PLAN_SKU_SUMMIT_ANNUAL,
  PLAN_SKU_MONTHLY,
  PLAN_SKU_ANNUAL,
  PRIMARY_PLAN_SKUS,
  PLAN_SKU_LIVE,
} from 'services/plans'
import { TYPE_CART_CHANGE_PLAN } from 'services/dialog'
import { H3, HEADING_TYPES } from 'components/Heading'


const CartOrderSummary = ({
  plans,
  staticText,
  mobile,
  desktop,
  renderModal,
}) => {
  const selectionSku = plans.getIn(['selection', 'sku'])
  const allowPlanSwitch = PRIMARY_PLAN_SKUS.has(selectionSku)
  const currencyIso = plans.getIn(['selection', 'currencyIso'])
  const dollarIso = (
    currencyIso === EUR ||
      currencyIso === GBP ||
      selectionSku !== PLAN_SKU_LIVE
  ) ? null : plans.getIn(['selection', 'currencyIso'])

  const openModal = () => {
    renderModal(TYPE_CART_CHANGE_PLAN)
  }

  return (
    <div className="cart-order-summary">
      {
        mobile ?
          <div className="cart-order-summary__mobile">
            <p className="cart-order-summary__selected-plan" >{plans.getIn(['selection', 'shortDetails'], '')}
              <span className="cart-order-summary__dollar-iso"> {dollarIso}</span>
            </p>
            {
              allowPlanSwitch ?
                <Button
                  text={staticText.getIn(['data', 'change'])}
                  buttonClass={['cart-order-summary__change-plan']}
                  onClick={openModal}
                />
                : null
            }
          </div>
          : null
      }
      {
        desktop ?
          <section className="cart-order-summary__desktop">
            <H3 as={HEADING_TYPES.H6} className={allowPlanSwitch ? 'cart-order-summary__title' : 'cart-order-summary__title cart-order-summary__title--standalone'}>{staticText.getIn(['data', 'orderSummary'])}</H3>
            {
              allowPlanSwitch ?
                <Button
                  text={staticText.getIn(['data', 'changePlan'])}
                  buttonClass={['cart-order-summary__change-plan']}
                  onClick={openModal}
                />
                : null
            }
            <ul className="cart-order-summary__details">
              <li>
                { (
                  selectionSku === PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS ||
                    selectionSku === PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY ||
                    selectionSku === PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL ||
                    selectionSku === PLAN_SKU_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY ||
                    selectionSku === PLAN_SKU_LEGACY_ANNUAL ||
                    selectionSku === PLAN_SKU_LEGACY_MONTHLY ||
                    selectionSku === PLAN_SKU_SUMMIT_ANNUAL ||
                    selectionSku === PLAN_SKU_SUMMIT_MONTHLY ||
                    selectionSku === PLAN_SKU_ONE_MONTH_TRIAL_TO_ANNUAL ||
                    selectionSku === PLAN_SKU_MONTHLY ||
                    selectionSku === PLAN_SKU_ANNUAL ||
                    selectionSku === PLAN_SKU_LIVE
                ) ?
                  <span className="cart-order-summary__plan-description--two-week">{plans.getIn(['selection', 'shortDetails'], '')}</span>
                  :
                  <span>
                    <span className="cart-order-summary__plan-description">{plans.getIn(['selection', 'heading'], '')}</span>
                    <span className="cart-order-summary__plan-price">
                      <PlanGridPriceFirst className={['cart-order-summary__total-price']} plan={plans.get('selection')} />
                    </span>
                  </span>
                }
              </li>
              <li>
                <span className="cart-order-summary__plan-total">{staticText.getIn(['data', 'total'])}</span>
                <span className="cart-order-summary__plan-total-price">
                  <PlanGridPriceFirst className={['cart-order-summary__total-price']} plan={plans.get('selection')} />
                  <span className="cart-order-summary__dollar-iso">{dollarIso}</span>
                </span>
              </li>
            </ul>
          </section>
          : null
      }
    </div>
  )
}

CartOrderSummary.propTypes = {
  mobile: PropTypes.bool,
  desktop: PropTypes.bool,
  renderModal: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      plans: state.plans,
      staticText: state.staticText,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
  connectStaticText({ storeKey: 'cartOrderSummary' }),
)(CartOrderSummary)
