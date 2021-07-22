import React, { useState } from 'react'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { Map, List } from 'immutable'
import { H6 } from 'components/Heading'
import Link from 'components/Link'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import { TYPE_CART_CHANGE_PLAN } from 'services/dialog'
import {
  formatPrice,
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL,
  PLAN_SKU_LIVE,
} from 'services/plans'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import {
  getCurrentTime,
  getDateLocale,
  getDateTime,
  ordinalDateFormatingi18n,
  formatWithLocale,
  addDays,
} from 'services/date-time'
import { getPrimary } from 'services/languages'

const monthlyValueProps = List([
  'Try free for 7 days',
  'Unlimited access to Gaia\'s 8000+ titles',
  'Watch on your laptop, TV, phone, & tablet',
  'Cancel anytime',
])
const annualValueProps = List([
  'Try free for 7 days',
  '12 months for the price of 9',
  'Unlimited access to Gaia\'s 8000+ titles',
  'Watch on your laptop, TV, phone, & tablet',
  'Cancel anytime',
  'Healthy Habits Guide & Health Magazine (digital downloads)',
])
const liveAccessValueProps = List([
  'Unlimited access to Gaia\'s 8000+ titles',
  'Watch on your laptop, TV, phone, & tablet',
  'Cancel anytime',
  'Healthy Habits Guide & Health Magazine (digital downloads)',
  'Livestream all GaiaSphere events',
  'Chat with members during live events. Participate in Q&A with event speakers.',
  'Access to full library of past events',
])

function CartOrderSummaryV2 (props) {
  const { plans, user } = props
  const selectedPlan = plans.get('selection', Map())

  if (selectedPlan.size === 0) {
    return null
  }

  const onClickChangePlan = () => {
    const { renderModal } = props
    renderModal(TYPE_CART_CHANGE_PLAN)
  }

  const formattedDate = getDateTime(addDays(getCurrentTime(), 7))
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const expireDate = formatWithLocale(formattedDate, dateFormatString, { locale: dateLocale })
  const planSku = selectedPlan.get('sku')
  const initialPrice = selectedPlan.get('costs').first()
  const planPrice = selectedPlan.get('costs').last()
  const currencyIso = selectedPlan.get('currencyIso')
  const formattedPlanPrice = formatPrice(currencyIso, planPrice)
  const planName = `${selectedPlan.get('heading')} Plan`
  let planDescription = ''
  let planValueProps = List([])
  let isTrial = false

  if (planSku === PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY) {
    planDescription = `${formattedPlanPrice} ${currencyIso}/month after 7 day free trial`
    planValueProps = monthlyValueProps
    isTrial = true
  } else if (planSku === PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL) {
    planDescription = `${formattedPlanPrice} ${currencyIso}/year after 7 day free trial`
    planValueProps = annualValueProps
    isTrial = true
  } else if (planSku === PLAN_SKU_LIVE) {
    planDescription = `${formattedPlanPrice} ${currencyIso}/year`
    planValueProps = liveAccessValueProps
  }

  const [expanded, setExpanded] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)

  const onClickShowDetails = () => {
    setExpanded(!expanded)
  }

  const onClickShowMobileDetails = () => {
    setMobileExpanded(!mobileExpanded)
  }

  const getExpandedClassName = (className, isExpanded) => {
    const baseClass = [className]

    if (isExpanded) {
      baseClass.push(`${className}--expanded`)
    }

    return baseClass.join(' ')
  }

  return (
    <div className="cart-order-summary-v2">
      <div className="cart-order-summary-v2__header">
        <H6 className="cart-order-summary-v2__title">
          <span className="cart-order-summary-v2__title-description">
            Order Summary
          </span>
          <Link
            className="cart-order-summary-v2__title-details"
            to={URL_JAVASCRIPT_VOID}
            onClick={onClickShowMobileDetails}
          >
            {planName}
            <IconV2
              className={getExpandedClassName('cart-order-summary-v2__title-details-icon', mobileExpanded)}
              type={ICON_TYPES.CHEVRON_DOWN}
            />
          </Link>
        </H6>
        <Link
          to={URL_JAVASCRIPT_VOID}
          className="cart-order-summary-v2__change-plan"
          onClick={onClickChangePlan}
        >
          change plan
        </Link>
      </div>
      <div className={getExpandedClassName('cart-order-summary-v2__content', mobileExpanded)}>
        <div className="cart-order-summary-v2__plan-name">
          {planName}
        </div>
        <div className="cart-order-summary-v2__plan-description">
          {planDescription}
        </div>
        <div className="cart-order-summary-v2__show-hide">
          <Link
            to={URL_JAVASCRIPT_VOID}
            onClick={onClickShowDetails}
            className="cart-order-summary-v2__show-hide-link"
          >
            <span className="cart-order-summary-v2__show-hide-text">
              {expanded ? 'hide details' : 'show details'}
            </span>
            <IconV2
              className={getExpandedClassName('cart-order-summary-v2__show-hide-icon', expanded)}
              type={ICON_TYPES.CHEVRON_DOWN}
            />
          </Link>
          <ul className={getExpandedClassName('cart-order-summary-v2__value-props', expanded)}>
            {planValueProps.map((item, index) => {
              const row = index
              return (
                <li
                  key={`value-prop-${row}`}
                  className="cart-order-summary-v2__value-item"
                >
                  <span className="cart-order-summary-v2__value-item-text">
                    {item}
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="cart-order-summary-v2__sep" />
          {
            isTrial ?
              <div className="cart-order-summary-v2__footer-info">
                <div className="cart-order-summary-v2__footer-label">
                  {`Total Due on ${expireDate}:`}
                </div>
                <div className="cart-order-summary-v2__footer-price">
                  {formattedPlanPrice}
                </div>
              </div>
              : null
          }
          <div className="cart-order-summary-v2__footer-info cart-order-summary-v2__footer-info--last">
            <div className="cart-order-summary-v2__footer-label">
              Total Due Now:
            </div>
            <div className="cart-order-summary-v2__footer-price">
              {`${formatPrice(currencyIso, initialPrice)} ${currencyIso}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

CartOrderSummaryV2.propTypes = {
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  renderModal: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      plans: state.plans,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
)(CartOrderSummaryV2)
