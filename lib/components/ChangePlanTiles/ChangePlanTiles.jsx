
import React from 'react'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { List } from 'immutable'
import compose from 'recompose/compose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Button from 'components/Button'
import Link from 'components/Link'
import { URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import {
  getPlanData,
  getPlanSubscriptionType,
  annualPlanPercentSavings,
  PLAN_SUBSCRIPTION_ANNUAL,
  PLAN_SUBSCRIPTION_MONTHLY,
  PLAN_SUBSCRIPTION_LIVE,
  PLAN_SUBSCRIPTION_COMP,
  PLAN_SKU_ANNUAL,
  PLAN_SKU_LIVE,
  PLAN_SKU_DECLINE_303,
} from 'services/plans'
import _get from 'lodash/get'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { partial as _partial } from 'lodash'
import { TYPE_CONFIRM_PLAN } from 'services/dialog'
import PropTypes from 'prop-types'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import { EN } from 'services/languages/constants'
import { USER_ACCOUNT_CANCELLED } from 'services/user-account'
import {
  URL_LIVE_ACCESS,
} from 'services/url/constants'
import { get as getConfig } from 'config'
import { H2, HEADING_TYPES } from 'components/Heading'

const config = getConfig()

function getPercentSavings (props) {
  const { staticText, plans } = props
  const percentageValue = annualPlanPercentSavings(plans)
  let save = staticText.getIn(['data', 'saveOnAnnual'])

  save = String(save).replace(/\$\{ percentSavings \}/g, percentageValue)
  return save
}

function onSelectPlanClick (e, setOverlayDialogVisible, setPlanChangeSelected, sku) {
  e.preventDefault()
  setPlanChangeSelected(sku)
  setOverlayDialogVisible(TYPE_CONFIRM_PLAN)
}

function renderValueProps (sku, link, linkText, props) {
  const { staticText, user } = props
  const isAnnual = sku === PLAN_SKU_ANNUAL
  const isLive = sku === PLAN_SKU_LIVE
  const language = getPrimaryLanguage(user.getIn(['data', 'language'], List([EN])))

  if (isAnnual && language === EN) {
    return (
      <ul className={`change-plan-tiles__value-prop-list change-plan-tiles__value-prop-list--${language}`}>
        <li className="change-plan-tiles__value-prop">
          {staticText.getIn(['data', 'healthyHabitGuide'])}
        </li>
        <li className="change-plan-tiles__value-prop">
          {staticText.getIn(['data', 'extras'])}
        </li>
      </ul>
    )
  }

  if (isLive) {
    return (
      <ul className={`change-plan-tiles__value-prop-list change-plan-tiles__value-prop-list--${language}`}>
        <li className="change-plan-tiles__value-prop">
          {staticText.getIn(['data', 'immersive'])}
        </li>
        <li className="change-plan-tiles__value-prop">
          {staticText.getIn(['data', 'liveChat'])}
        </li>
        <li className="change-plan-tiles__value-prop">
          {staticText.getIn(['data', 'replay'])}
        </li>
        <li className="change-plan-tiles__value-prop">
          {staticText.getIn(['data', 'spanishTranslation'])}
        </li>
        <li className="change-plan-tiles__value-prop-link">
          <Link className="change-plan-tiles__learn-more-link" to={link}>{linkText}</Link>
        </li>
      </ul>
    )
  }

  return (
    <ul className={`change-plan-tiles__value-prop-list change-plan-tiles__value-prop-list--${language}`}>
      <li className="change-plan-tiles__value-prop">
        {staticText.getIn(['data', 'monthlyDescription'])}
      </li>
    </ul>
  )
}

const renderTile = (tileData, onSelectPlanClickPartial, props) => {
  const {
    best,
    plan,
    price,
    perMonth,
    body,
    current,
    yourPlanText,
    select,
    className,
    sku,
    description,
    link,
    linkText,
    extraDescription,
    highlighted,
    language,
  } = tileData

  return (
    <div className={`change-plan-tiles__tile change-plan-tiles__tile--${className}`}>
      <p className={`change-plan-tiles__content change-plan-tiles__tile-best change-plan-tiles__tile-best--${language}`}>{best}</p>
      <H2 as={HEADING_TYPES.H6} inverted className={`change-plan-tiles__content change-plan-tiles__tile-plan change-plan-tiles__tile-plan-${className}${highlighted ? ' change-plan-tiles__tile-plan--highlighted' : ''} change-plan-tiles__tile-plan--${language}`}>{plan}</H2>
      <div className="change-plan-tiles__price-wrapper">
        <p className="change-plan-tiles__content change-plan-tiles__tile-price">{price}{'\u00A0'}</p>
        <p className="change-plan-tiles__content change-plan-tiles__tile-price">{perMonth}</p>
      </div>
      <p className="change-plan-tiles__content change-plan-tiles__tile-body">{body}</p>
      {
        description ?
          <p className={`change-plan-tiles__content change-plan-tiles__tile-description change-plan-tiles__tile-description--${language}`}>{description}
            {extraDescription
              ? <React.Fragment>
                <br /><br /><span className="change-plan-tiles__content change-plan-tiles__tile-extra-description">{extraDescription}</span>
              </React.Fragment>
              : null
            }
            {link
              ? <React.Fragment>
                <br /><br /><Link
                  to={link}
                >{linkText}</Link>
              </React.Fragment>
              : null
            }
          </p>
          : null
      }
      {
        renderValueProps(sku, link, linkText, props)
      }
      {current
        ? <p className="change-plan-tiles__content change-plan-tiles__tile-current">{yourPlanText}</p>
        : <Button onClick={e => onSelectPlanClickPartial(e, sku)} buttonClass={[`change-plan-tiles__content button--primary change-plan-tiles__tile-button${!highlighted ? ' change-plan-tiles__tile-button--normal' : ''}`]} text={select} />
      }
    </div>
  )
}

const ChangePlanTiles = (props) => {
  const {
    plans,
    staticText,
    setOverlayDialogVisible,
    setPlanChangeSelected,
    userAccount,
    user,
  } = props
  const planData = getPlanData(plans)
  let productRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  let planSubscriptionType = getPlanSubscriptionType(productRatePlanId)
  const subscriptionCancelled = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status']) === USER_ACCOUNT_CANCELLED
  const language = getPrimaryLanguage(user.getIn(['data', 'language'], List([EN])))

  // If the current plan is a comp, get next plan rate plan id
  if (planSubscriptionType === PLAN_SUBSCRIPTION_COMP) {
    productRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productRatePlanId'])
    planSubscriptionType = getPlanSubscriptionType(productRatePlanId)
  }

  const onSelectPlanClickPartial = _partial(
    onSelectPlanClick,
    _partial.placeholder,
    setOverlayDialogVisible,
    setPlanChangeSelected,
  )

  const monthlyTileData = {
    best: '',
    highlighted: false,
    plan: staticText.getIn(['data', 'monthly']),
    price: _get(planData, 'monthlyPlanPrice'),
    perMonth: staticText.getIn(['data', 'perMonth']),
    body: staticText.getIn(['data', 'renews']),
    description: '',
    current: planSubscriptionType === PLAN_SUBSCRIPTION_MONTHLY && !subscriptionCancelled,
    yourPlanText: staticText.getIn(['data', 'current']),
    select: staticText.getIn(['data', 'select']),
    className: 'monthly',
    sku: _get(planData, 'monthlySku'),
    language,
  }

  const annualTileData = {
    best: getPercentSavings(props),
    highlighted: true,
    plan: staticText.getIn(['data', 'annual']),
    price: _get(planData, 'annualPlanFull'),
    perMonth: staticText.getIn(['data', 'perYear']),
    body: staticText.getIn(['data', 'renewsAnnually']),
    description: '',
    extraDescription: '',
    current: planSubscriptionType === PLAN_SUBSCRIPTION_ANNUAL && !subscriptionCancelled,
    yourPlanText: staticText.getIn(['data', 'current']),
    select: staticText.getIn(['data', 'select']),
    className: 'annual',
    sku: _get(planData, 'annualSku'),
    language,
  }

  const liveTileData = {
    best: '',
    highlighted: false,
    plan: staticText.getIn(['data', 'live']),
    price: _get(planData, 'livePlanFull'),
    perMonth: staticText.getIn(['data', 'perYear']),
    body: staticText.getIn(['data', 'renewsAnnually']),
    description: '',
    current: planSubscriptionType === PLAN_SUBSCRIPTION_LIVE && !subscriptionCancelled,
    yourPlanText: staticText.getIn(['data', 'current']),
    select: staticText.getIn(['data', 'select']),
    className: 'live',
    link: URL_LIVE_ACCESS,
    linkText: staticText.getIn(['data', 'learnMore']),
    sku: _get(planData, 'liveSku'),
    language,
  }

  const liveDiscountedTileData = {
    ...liveTileData,
    price: _get(planData, 'liveDiscountedPlanFull'),
    sku: _get(planData, 'liveDiscountedSku'),
  }

  return (
    <div className="change-plan-tiles">
      <TestarossaSwitch>
        <TestarossaCase campaign="AC-4">
          {
            renderTile(monthlyTileData, onSelectPlanClickPartial, props)
          }
          {
            renderTile(annualTileData, onSelectPlanClickPartial, props)
          }
          {
            renderTile(liveDiscountedTileData, onSelectPlanClickPartial, props)
          }
        </TestarossaCase>
        <TestarossaDefault>
          {renderTile(monthlyTileData, onSelectPlanClickPartial, props)}
          {
            renderTile(annualTileData, onSelectPlanClickPartial, props)
          }
          {
            renderTile(liveTileData, onSelectPlanClickPartial, props)
          }
        </TestarossaDefault>
      </TestarossaSwitch>
      {
        _get(config, ['features', 'userAccount', 'declinePlan303']) ?
          <Link
            to={URL_JAVASCRIPT_VOID}
            className="change-plan-tiles__decline-link"
            onClick={e => onSelectPlanClickPartial(e, PLAN_SKU_DECLINE_303)}
          >
            Decline Plan - Testing Only
          </Link>
          : null
      }
    </div>
  )
}

ChangePlanTiles.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setPlanChangeSelected: PropTypes.func.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      plans: state.plans,
      user: state.user,
      userAccount: state.userAccount,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setPlanChangeSelected: actions.plans.setPlanChangeSelected,
      }
    },
  ),
  connectStaticText({ storeKey: 'changePlanTiles' }),
)(ChangePlanTiles)
