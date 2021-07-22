import React from 'react'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { getPrimary } from 'services/languages'
import { List } from 'immutable'
import PropTypes from 'prop-types'
import { Button, TYPES } from 'components/Button.v2'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { H4 } from 'components/Heading'
import { EN } from 'services/languages/constants'
import {
  PLAN_ID_LEGACY_MONTHLY,
  PLAN_ID_MONTHLY,
  PLAN_ID_ANNUAL,
} from 'services/plans'
import {
  renderSymbol,
  EUR,
} from 'services/currency'
import {
  URL_ACCOUNT_CHANGE_PLAN,
} from 'services/url/constants'

const dataLayer = global.dataLayer

function AccountCancelPlans (props) {
  const {
    staticText,
    plans,
    productRatePlanId,
    user,
  } = props
  const currentPlans = plans.getIn(['data', 'plans'], List())

  if (!productRatePlanId && currentPlans.size === 0) {
    return null
  }

  const ratePlanId = productRatePlanId === PLAN_ID_LEGACY_MONTHLY ?
    PLAN_ID_LEGACY_MONTHLY : PLAN_ID_MONTHLY
  const currentMonthly = currentPlans.find(plan => plan.get('id') === ratePlanId)
  const getMonthlyPrice = currentMonthly.getIn(['costs', 0])
  const getAnnual = currentPlans.find(plan => plan.get('id') === PLAN_ID_ANNUAL)
  const currencyIso = getAnnual.getIn(['currencyIso'])
  const getAnnualPriceFull = getAnnual.getIn(['costs', 0])
  const getAnnualAveragePlan = (getAnnualPriceFull / 12).toFixed(2)
  const billedAnnuallyText = staticText.getIn(['data', 'billedAnnually'])
    .replace(/\$\{ currencySymbol \}/g, '')
    .replace(/\$\{ annualPrice \}/g, '')
  const perMonthAbbreviation = staticText.getIn(['data', 'annualAverage'])
    .replace(/\$\{ currencySymbol \}/g, '')
    .replace(/\$\{ annualPlanAveragePrice \}/g, '')
  const billedEach = staticText.getIn(['data', 'billedEach'])
  const bestValue = staticText.getIn(['data', 'best'])
  const title = staticText.getIn(['data', 'title'])
  const save = staticText.getIn(['data', 'save'])
  const guide = staticText.getIn(['data', 'guide'])
  const calender = staticText.getIn(['data', 'calender'])
  const monthlyPlan = staticText.getIn(['data', 'monthly'])
  const annually = staticText.getIn(['data', 'annually'])
  const annualPlan = staticText.getIn(['data', 'annual'])
  const overMonthlyPlan = staticText.getIn(['data', 'overMonthlyPlan'])
  const languageEn = getPrimary(user.getIn(['data', 'language'])) === EN
  const isEuros = currencyIso === EUR
  const calculateSavings = ((getMonthlyPrice * 12) - getAnnualPriceFull).toFixed(2)

  const renderMonthlyPrice = () => {
    if (isEuros) {
      return (
        <div className="account-cancel-plans__cost">
          {getMonthlyPrice}{renderSymbol(currencyIso)}
          <span className="account-cancel-plans__per-month">{perMonthAbbreviation}</span>
        </div>
      )
    }
    return (
      <div className="account-cancel-plans__cost">
        {renderSymbol(currencyIso)}{getMonthlyPrice}
        <span className="account-cancel-plans__per-month">{perMonthAbbreviation}</span>
      </div>
    )
  }

  const renderSavingsPrice = () => {
    if (isEuros) {
      return (
        <span>{save} {calculateSavings}{renderSymbol(currencyIso)}</span>
      )
    }
    return (
      <span>{save} {renderSymbol(currencyIso)}{calculateSavings} </span>
    )
  }

  const renderAnnualAveragePrice = () => {
    if (isEuros) {
      return (
        <div className="account-cancel-plans__cost">
          {getAnnualAveragePlan}{renderSymbol(currencyIso)}
          <span className="account-cancel-plans__per-month">{perMonthAbbreviation}</span>
        </div>
      )
    }
    return (
      <div className="account-cancel-plans__cost">
        {renderSymbol(currencyIso)}{getAnnualAveragePlan}
        <span className="account-cancel-plans__per-month">{perMonthAbbreviation}</span>
      </div>
    )
  }

  const renderAnnualPriceFull = () => {
    if (isEuros) {
      return (
        <p className="account-cancel-plans__billed">
          {getAnnualPriceFull}{renderSymbol(currencyIso)} {billedAnnuallyText}
        </p>
      )
    }
    return (
      <p className="account-cancel-plans__billed">
        {renderSymbol(currencyIso)}{getAnnualPriceFull} {billedAnnuallyText}
      </p>
    )
  }

  const onClickChangePlan = () => {
    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'User Engagement',
        eventAction: 'too expensive change plan',
        eventLabel: 'change plan CTA',
      })
    }
  }

  const renderCancelPlanCards = () => {
    return (
      <div className="account-cancel-plans__container">
        <div className={`account-cancel-plans__plan-card${!languageEn ? ' account-cancel-plans__plan-card--non-en' : ''}`}>
          <div className="account-cancel-plans__price_container">
            <H4 className="account-cancel-plans__plan-type">{monthlyPlan}</H4>
            <div className="account-cancel-plans__price-row">
              {renderMonthlyPrice()}
              <p className="account-cancel-plans__billed">{billedEach}</p>
            </div>
            <Button
              disabled
              type={TYPES.PRIMARY}
              className="account-cancel-plans__buttons"
            >
              {staticText.getIn(['data', 'current'])}
            </Button>
            <div className="account-cancel-plans__value-props">
              <div className="account-cancel-plans__value-props-text">
                <span className="icon-v2 icon-v2--close" />
                {renderSavingsPrice()} {annually}
              </div>
              {languageEn ?
                <React.Fragment>
                  <div className="account-cancel-plans__value-props-text">
                    <span className="icon-v2 icon-v2--close" />
                    <span>{guide}</span>
                  </div>
                  <div className="account-cancel-plans__value-props-text">
                    <span className="icon-v2 icon-v2--close" />
                    <span>{calender}</span>
                  </div>
                </React.Fragment>
                : null
              }
            </div>
          </div>
        </div>
        <div className={`account-cancel-plans__plan-card${!languageEn ? ' account-cancel-plans__plan-card--non-en' : ''}`}>
          <div className="account-cancel-plans__banner-container">
            <div className="account-cancel-plans__banner">
              <strong className="account-cancel-plans__banner-content">{bestValue}</strong>
            </div>
          </div>
          <div className="account-cancel-plans__price_container">
            <H4 className="account-cancel-plans__plan-type">{annualPlan}</H4>
            <div className="account-cancel-plans__price-row">
              {renderAnnualAveragePrice()}
            </div>
            {renderAnnualPriceFull()}
            <Button
              type={TYPES.SECONDARY}
              className="account-cancel-plans__buttons"
              url={URL_ACCOUNT_CHANGE_PLAN}
              onClick={onClickChangePlan}
            >
              {staticText.getIn(['data', 'changePlan'])}
            </Button>
            <div className="account-cancel-plans__value-props">
              <div className="account-cancel-plans__value-props-text">
                <span className="icon-v2 icon-v2--check" />
                {renderSavingsPrice()} {overMonthlyPlan}
              </div>
              {languageEn ?
                <React.Fragment>
                  <div className="account-cancel-plans__value-props-text">
                    <span className="icon-v2 icon-v2--check" />
                    <span>{guide}</span>
                  </div>
                  <div className="account-cancel-plans__value-props-text">
                    <span className="icon-v2 icon-v2--check" />
                    <span>{calender}</span>
                  </div>
                </React.Fragment>
                : null
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-cancel-plans">
      <H4 className="account-cancel-plans__title">{title}</H4>
      {renderCancelPlanCards()}
    </div>
  )
}

AccountCancelPlans.propTypes = {
  plans: ImmutablePropTypes.map.isRequired,
  onClickPlan: PropTypes.func,
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'accountCancelPlans' }),
  connectRedux(state => ({
    user: state.user,
    plans: state.plans,
    productRatePlanId: state.userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId']),
  }),
  ),
)(AccountCancelPlans)
