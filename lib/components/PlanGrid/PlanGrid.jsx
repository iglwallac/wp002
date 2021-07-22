/* eslint-disable react/jsx-indent */
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import _replace from 'lodash/replace'
import Button from 'components/Button'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {
  List,
  Map,
} from 'immutable'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { PAYMENT_PROVIDER_NAME_GCSI } from 'services/paytrack'
import SherpaMessage from 'components/SherpaMessage'
import PlanGridCurrency from 'components/PlanGridCurrency'
import { renderText as renderPriceFirstText } from 'components/PlanGridPriceFirst'
import Link from 'components/Link'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import Icon from 'components/Icon'
import { requestAnimationFrame } from 'services/animate'
import { getPrimary } from 'services/languages'
import {
  PLAN_SKU_ANNUAL,
  PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS,
  PLAN_SKU_GIFT_ANNUAL,
  getPlanSkus,
  annualPlanPercentSavings,
} from 'services/plans'
import {
  URL_ACCOUNT_CREATION,
  URL_GIFT_THEME,
} from 'services/url/constants'
import {
  GIFT_STEP_ONE,
} from 'services/gift'
import { EUR, LTM } from 'services/currency'

const dataLayer = global.dataLayer

async function handleClickPlan (e, props, plan) {
  const {
    onClickPlan,
    isGift,
    setPlansLocalizedSelection,
    user = Map(),
    userAccount = Map(),
    history,
    setGiftCheckoutStepComplete,
  } = props
  const language = user.getIn(['data', 'language'])
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const latamPricing = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'latamPricing'])
  const currency = latamPricing ? LTM : currencyIso
  try {
    const localizedPlan = await setPlansLocalizedSelection({ plan, language, currency })

    if (_isFunction(onClickPlan)) {
      onClickPlan(e, plan)
    }

    if (isGift) {
      setGiftCheckoutStepComplete(GIFT_STEP_ONE)
      history.push(URL_GIFT_THEME)
    } else {
      history.push(URL_ACCOUNT_CREATION)
    }

    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }

    return localizedPlan
  } catch (error) {
    // Do Nothing
  }
  return Map()
}

function getItemClassName (prefix, index, lastIndex, language, planCount) {
  const className = [prefix]
  const isFirstIndex = index === 0
  const isLastIndex = index === lastIndex

  if (isFirstIndex) {
    className.push(`${prefix}--first`)
  } else if (isLastIndex) {
    className.push(`${prefix}--last`)
  }

  if (language) {
    className.push(`${prefix}--${language}`)
  }

  if (planCount > 3) {
    className.push(`${prefix}--wide`)
  }

  return className.join(' ')
}

function getLanguageClassName (prefix, language) {
  const className = [prefix]

  if (language) {
    className.push(`${prefix}--${language}`)
  }

  return className.join(' ')
}

function getButtonClassName (index, lastIndex, language) {
  const prefix = 'plan-grid__button'
  const className = ['button--stacked', prefix]
  const isFirstIndex = index === 0
  const isLastIndex = index === lastIndex

  if (isFirstIndex) {
    className.push('button--primary', `${prefix}--first`)
  } else if (isLastIndex) {
    className.push('button--primary', `${prefix}--last`)
  } else {
    className.push('button--primary')
  }

  if (language) {
    className.push(`${prefix}--${language}`)
  }

  return className
}

function getWrapperClassName (planCount, isGift) {
  const prefix = 'plan-grid'
  const className = [prefix]

  if (planCount > 3) {
    className.push(`${prefix}--wide`)
  }

  if (isGift) {
    className.push(`${prefix}--gift`)
  }

  return className.join(' ')
}

class PlanGrid extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      expansionTracking: List(null),
    }
  }

  onClickDetails = (expansionTracking, index) => {
    // if the index is already in the list, remove it
    if (List.isList(expansionTracking) && expansionTracking.includes(index)) {
      const filteredExpansionTracking = expansionTracking.filter((item) => {
        return item !== index
      })
      this.setState(() => ({ expansionTracking: filteredExpansionTracking }))
    } else {
      this.setState(() => ({ expansionTracking: expansionTracking.push(index) }))
    }

    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'user engagement',
        eventAction: 'Call to Action',
        eventLabel: 'price card expand-collapse',
      })
    }
  }

  renderPlanGridListItems = (props, state, skus) => {
    const { expansionTracking } = state
    const {
      plans,
      staticText,
      user,
      isGift,
    } = props

    const plansList = plans.getIn(['data', 'plans'], List())
    const valuePropsClassName = 'plan-grid__value-list'
    const userLanguage = getPrimary(user.getIn(['data', 'language']))

    const planCount = skus.size

    return plansList
      .filter(val => skus.includes(val.get('sku')))
      .map((plan, index, _plans) => {
        const lastIndex = _plans.size - 1
        const isNinetyNineCentTwoWeeks = plan.get('sku') === PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS
        const isAnnualGift = plan.get('sku') === PLAN_SKU_GIFT_ANNUAL
        const valuePropositions = plan.get('valueProps') ? this.renderValuePropositions(plan) : []
        const isExpanded = expansionTracking.includes(index)

        /* eslint-disable react/no-array-index-key */
        return (
          <li
            key={`offer-${index}`}
            className={getItemClassName('plan-grid__item', index, lastIndex, userLanguage, planCount)}
          >
            <div
              className={getItemClassName(
                'plan-grid__item-header',
                index,
                lastIndex,
                userLanguage,
                planCount,
              )}
            >
              {
                isAnnualGift ?
                  <span className="plan-grid__bubble plan-grid__bubble--right">
                    <span className={getLanguageClassName('plan-grid__bubble-text', userLanguage)}>
                      <span className="plan-grid__bubble-text-inner">{staticText.getIn(['data', 'bestValue'])}</span>
                    </span>
                  </span>
                  : null
              }
              <div className={getLanguageClassName('plan-grid__heading', userLanguage)}>
                {plan.get('title')}
              </div>
              <div className={getLanguageClassName('plan-grid__initial-price', userLanguage)}>
                {
                  renderPriceFirstText(plan)
                }
                {
                  isNinetyNineCentTwoWeeks || isGift ?
                    null
                    : <span className="plan-grid__period-abbreviation">{`/${plan.get('billingPeriodAbbreviation')}`}</span>
                }
              </div>
            </div>
            <Button
              onClick={_partial(
                handleClickPlan,
                _partial.placeholder,
                this.props,
                plan,
              )}
              scrollToTop
              text={isGift ? staticText.getIn(['data', 'select']) : staticText.getIn(['data', 'callToAction'])}
              buttonClass={getButtonClassName(index, lastIndex, userLanguage)}
            />
            <Link
              to={URL_JAVASCRIPT_VOID}
              className={getLanguageClassName('plan-grid__details-toggle', userLanguage)}
              onClick={() => this.onClickDetails(expansionTracking, index)}
            >
              {
                isExpanded ?
                  staticText.getIn(['data', 'hidePlanDetails'])
                  : staticText.getIn(['data', 'seePlanDetails'])
              }
              <Icon iconClass={['icon--down', 'plan-grid__icon-down', isExpanded ? 'plan-grid__icon-down--expanded' : '']} />
            </Link>
            <ul className={isExpanded ? `${valuePropsClassName} ${valuePropsClassName}--expanded` : valuePropsClassName}>
              {valuePropositions}
            </ul>
          </li>
        )
        /* eslint-enable react/no-array-index-key */
      })
  }

  renderPlanGridList = (props, state, skus) => {
    const { plans, staticText } = props
    const plansList = plans.getIn(['data', 'plans'], List())

    if (plansList.size === 0) {
      return <SherpaMessage message={staticText.getIn(['data', 'loadingPlans'])} arrow={false} center />
    }

    return (
      <ul className="plan-grid__list">
        {this.renderPlanGridListItems(props, state, skus)}
      </ul>
    )
  }

  renderValuePropositions = (plan) => {
    /* eslint-disable react/no-array-index-key */
    /* eslint-disable consistent-return */
    /* eslint-disable no-template-curly-in-string */
    const { props } = this
    const { plans, paytrack, userAccount } = props
    const valuePropositions = plan.get('valueProps')

    if (!List.isList(valuePropositions)) {
      return
    }

    const lastProvider = paytrack.getIn(['lastTransaction', 'provider_name'])
    const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
    const gcsiReactivate = !billingAccountId && lastProvider === PAYMENT_PROVIDER_NAME_GCSI

    const sku = plan.get('sku')
    const currencyIso = plan.get('currencyIso')
    const currencySymbol = plan.get('currencySymbol')
    const monthlyCost = plan.getIn(['costs', 1])
    const isAnnualGift = plan.get('sku') === PLAN_SKU_GIFT_ANNUAL
    const lastIndex = valuePropositions && valuePropositions.size > 0 ?
      valuePropositions.size - 1 : null

    const valueProps = valuePropositions.reduce((reduction, proposition, index) => {
      let formattedProposition = proposition
      let formattedMonthlyCost

      // if the user is a gcsiReactivate person,
      // don't show them the percent savings for the annual plan
      if (gcsiReactivate && sku === PLAN_SKU_ANNUAL && proposition.indexOf('${ percentSavings }') !== -1) {
        return reduction
      }

      if (proposition.indexOf('${ monthlyCost }') !== -1 && (sku === PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS)) {
        if (currencyIso === EUR) {
          formattedMonthlyCost = `${monthlyCost} ${currencySymbol}`
        } else {
          formattedMonthlyCost = `${currencySymbol}${monthlyCost}`
        }

        // this code is fragile, but for some reason mobile Safari was not showing
        // the proper price, so just replacing the { monthlyCost } placeholder with
        // empty string, and then concat strings together
        // ugly but seems to work
        formattedProposition = _replace(proposition, /\$\{ monthlyCost \}/, '')
        formattedProposition = `${formattedMonthlyCost}${formattedProposition}`
      }

      if (proposition.indexOf('${ percentSavings }') !== -1 && (sku === PLAN_SKU_ANNUAL || sku === PLAN_SKU_GIFT_ANNUAL)) {
        const percentSavings = annualPlanPercentSavings(plans)
        formattedProposition = _replace(proposition, /\$\{ percentSavings \}/, percentSavings)
      }

      const item = (
        <li
          className={isAnnualGift && index === lastIndex ? 'plan-grid__value-list-item plan-grid__value-list-item--pink' : 'plan-grid__value-list-item'}
          key={`plan-grid-value-prop-${index}`}
        >
          {formattedProposition}
        </li>
      )

      return reduction.push(item)
    }, List())

    return valueProps
    /* eslint-enable react/no-array-index-key */
    /* eslint-enable consistent-return */
    /* eslint-enable no-template-curly-in-string */
  }

  render () {
    const { props, state } = this
    const { plans, isGift } = props
    const currencyIso = plans.getIn(['data', 'plans', 0, 'currencyIso'])
    const skus = getPlanSkus(props)

    const planCount = skus.size

    return (
      <div className={getWrapperClassName(planCount, isGift)}>
        { currencyIso ? <PlanGridCurrency currencyIso={currencyIso} /> : null }
        <div className={isGift ? 'plan-grid__list-contatiner plan-grid__list-contatiner--gift' : 'plan-grid__list-contatiner'}>
          {this.renderPlanGridList(props, state, skus)}
        </div>
      </div>
    )
  }
}

PlanGrid.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
  auth: ImmutablePropTypes.map.isRequired,
  plans: PropTypes.object.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  setPlansLocalizedSelection: PropTypes.func.isRequired,
  onClickPlan: PropTypes.func,
  isGift: PropTypes.bool,
  staticText: ImmutablePropTypes.map.isRequired,
  paytrack: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  setGiftCheckoutStepComplete: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      paytrack: state.paytrack,
      userAccount: state.userAccount,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPlansLocalizedSelection: actions.plans.setPlansLocalizedSelection,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setGiftCheckoutStepComplete: actions.gift.setGiftCheckoutStepComplete,
      }
    },
  ),
  connectStaticText({ storeKey: 'planGrid' }),
)(PlanGrid)
/* eslint-enable react/jsx-indent */
