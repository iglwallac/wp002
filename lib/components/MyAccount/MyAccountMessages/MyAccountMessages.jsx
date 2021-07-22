import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getDateTime } from 'services/date-time'
import { connect as connectRedux } from 'react-redux'
import _replace from 'lodash/replace'
import { renderSymbol, EUR, GBP } from 'services/currency'
import {
  showChangePlanMessage,
  showReactivateMessage,
  showFmtvReactivateMessage,
  showPaymentErrorMessage,
  showUpdatePaymentMethodMessage,
  showFreeTrialUpgradeMessage,
  showFreeTrialEndingMessage,
} from 'services/user-account'
import MyAccountMessage,
{
  MESSAGE_TYPE_CHANGE,
  MESSAGE_TYPE_REACTIVATE,
  MESSAGE_TYPE_ERROR,
  MESSAGE_TYPE_UPDATE,
  MESSAGE_TYPE_PROMO,
  MESSAGE_TYPE_TRIAL_UPGRADE,
  MESSAGE_TYPE_TRIAL_ENDING,
} from 'components/MyAccount/MyAccountMessage'
import {
  URL_PLAN_SELECTION,
  URL_ACCOUNT_CHANGE_PLAN,
  URL_ACCOUNT,
} from 'services/url/constants'
import {
  PLAN_SKU_MONTHLY,
  PLAN_SKU_ANNUAL,
  PLAN_SUBSCRIPTION_ANNUAL,
  PLAN_SUBSCRIPTION_MONTHLY,
  annualPlanPercentSavings,
} from 'services/plans'

export const top = 'top'
export const bottom = 'bottom'


function getClassName () {
  return 'my-account-messages'
}

function getPricingVariable (planType, plans) {
  const annualPlan = plans.getIn(['data', 'plans']).find((val) => {
    return val.get('sku') === PLAN_SKU_ANNUAL
  })
  const monthlyPlan = plans.getIn(['data', 'plans']).find((val) => {
    return val.get('sku') === PLAN_SKU_MONTHLY
  })

  let annualCostPerMonth
  let monthlyCost
  switch (planType) {
    case PLAN_SUBSCRIPTION_ANNUAL:
      annualCostPerMonth = annualPlan.getIn(['costs', 0])
      return annualCostPerMonth
    case PLAN_SUBSCRIPTION_MONTHLY:
      monthlyCost = monthlyPlan.getIn(['costs', 0])
      return monthlyCost
    default:
      return null
  }
}

function getMessageVariable (
  userAccount,
  plans,
  staticText,
  messageType,
) {
  let annualPriceString
  let monthlyPriceString
  let percentSavingsString
  let euroSymbol
  let poundSymbol
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const annualPrice = getPricingVariable('annual', plans, userAccount)
  const monthlyPrice = getPricingVariable('monthly', plans, userAccount)
  const currencySymbol = renderSymbol()

  /* eslint-disable no-template-curly-in-string */
  switch (messageType) {
    case MESSAGE_TYPE_CHANGE:
    case MESSAGE_TYPE_TRIAL_UPGRADE:
      if (currencyIso === EUR) {
        euroSymbol = renderSymbol('EUR')
        annualPriceString = _replace(staticText.getIn(['data', 'changeV2', 'body1']), '${ annualPlanPrice }', `${annualPrice} ${euroSymbol}`)
        percentSavingsString = _replace(staticText.getIn(['data', 'changeV2', 'body2']), '${ percentSavings }', annualPlanPercentSavings(plans))
      } else if (currencyIso === GBP) {
        poundSymbol = renderSymbol('GBP')
        annualPriceString = _replace(staticText.getIn(['data', 'changeV2', 'body1']), '${ annualPlanPrice }', `${poundSymbol}${annualPrice}`)
        percentSavingsString = _replace(staticText.getIn(['data', 'changeV2', 'body2']), '${ percentSavings }', annualPlanPercentSavings(plans))
      } else {
        annualPriceString = _replace(staticText.getIn(['data', 'changeV2', 'body1']), '${ annualPlanPrice }', `${currencySymbol}${annualPrice}`)
        percentSavingsString = _replace(staticText.getIn(['data', 'changeV2', 'body2']), '${ percentSavings }', annualPlanPercentSavings(plans))
      }
      return ([annualPriceString, percentSavingsString])
    case MESSAGE_TYPE_PROMO:
      if (currencyIso === EUR) {
        euroSymbol = renderSymbol('EUR')
        annualPriceString = _replace(staticText.getIn(['data', 'promo', 'body']), '${ annualPlanPrice }', `${annualPrice} ${euroSymbol}`)
      } else if (currencyIso === GBP) {
        poundSymbol = renderSymbol('GBP')
        annualPriceString = _replace(staticText.getIn(['data', 'promo', 'body']), '${ annualPlanPrice }', `${poundSymbol}${annualPrice}`)
      } else {
        annualPriceString = _replace(staticText.getIn(['data', 'promo', 'body']), '${ annualPlanPrice }', `${currencySymbol}${annualPrice}`)
      }
      return annualPriceString
    case MESSAGE_TYPE_REACTIVATE:
      if (currencyIso === EUR) {
        euroSymbol = renderSymbol('EUR')
        annualPriceString = _replace(staticText.getIn(['data', 'reactivateV2', 'body1']), '${ annualPlanPrice }', `${annualPrice} ${euroSymbol}`)
        monthlyPriceString = _replace(staticText.getIn(['data', 'reactivateV2', 'body2']), '${ monthlyPlanPrice }', `${monthlyPrice} ${euroSymbol}`)
      } else if (currencyIso === GBP) {
        poundSymbol = renderSymbol('GBP')
        annualPriceString = _replace(staticText.getIn(['data', 'reactivateV2', 'body1']), '${ annualPlanPrice }', `${poundSymbol}${annualPrice}`)
        monthlyPriceString = _replace(staticText.getIn(['data', 'reactivateV2', 'body2']), '${ monthlyPlanPrice }', `${poundSymbol}${monthlyPrice}`)
      } else {
        annualPriceString = _replace(staticText.getIn(['data', 'reactivateV2', 'body1']), '${ annualPlanPrice }', `${currencySymbol}${annualPrice}`)
        monthlyPriceString = _replace(staticText.getIn(['data', 'reactivateV2', 'body2']), '${ monthlyPlanPrice }', `${currencySymbol}${monthlyPrice}`)
      }
      return ([annualPriceString, monthlyPriceString])
    default:
      return null
  }
  /* eslint-enable no-template-curly-in-string */
}

const renderMessages = (props) => {
  const { staticText, userAccount, plans, region, page, scheduledOrActivePause } = props
  const messages = []
  const startDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'startDate'])
  const date = new Date()
  const formattedStartDate = getDateTime(startDate)
  const formattedCurrentDate = getDateTime(date)
  const futureStartDate = (formattedStartDate > formattedCurrentDate)
  const locale = page.get('locale')

  if (showFreeTrialEndingMessage(props, locale) && region === top) {
    messages.push(
      <MyAccountMessage
        key={MESSAGE_TYPE_TRIAL_ENDING}
        type={MESSAGE_TYPE_TRIAL_ENDING}
        title={staticText.getIn(['data', 'change', 'title'])}
        message={staticText.getIn(['data', 'trial', 'ending'])}
        url={URL_PLAN_SELECTION}
        urlText={staticText.getIn(['data', 'trial', 'subscribe'])}
        region={region}
      />,
    )
  }

  if (showFreeTrialUpgradeMessage(props) && region === bottom) {
    messages.push(
      <MyAccountMessage
        key={MESSAGE_TYPE_TRIAL_UPGRADE}
        type={MESSAGE_TYPE_TRIAL_UPGRADE}
        title={staticText.getIn(['data', 'change', 'title'])}
        message={staticText.getIn(['data', 'trial', 'body'])}
        url={URL_PLAN_SELECTION}
        urlText={staticText.getIn(['data', 'trial', 'seePlans'])}
        region={region}
      />,
    )
  }

  if (
    showChangePlanMessage(props)
    && (region === bottom && !futureStartDate)
    && !scheduledOrActivePause
  ) {
    messages.push(
      <MyAccountMessage
        key={MESSAGE_TYPE_CHANGE}
        type={MESSAGE_TYPE_CHANGE}
        title={staticText.getIn(['data', 'change', 'title'])}
        message={getMessageVariable(
          userAccount,
          plans,
          staticText,
          MESSAGE_TYPE_CHANGE,
        )}
        url={URL_ACCOUNT_CHANGE_PLAN}
        urlText={staticText.getIn(['data', 'change', 'title'])}
        region={region}
      />,
    )
  }

  if (showFmtvReactivateMessage(props) && region === bottom && !scheduledOrActivePause) {
    messages.push(
      <MyAccountMessage
        key={MESSAGE_TYPE_REACTIVATE}
        type={MESSAGE_TYPE_REACTIVATE}
        title={staticText.getIn(['data', 'reactivate', 'title'])}
        message={getMessageVariable(
          userAccount,
          plans,
          staticText,
          MESSAGE_TYPE_REACTIVATE,
        )}
        url={URL_PLAN_SELECTION}
        urlText={staticText.getIn(['data', 'reactivate', 'details'])}
        region={region}
      />,
    )
  }

  if (showReactivateMessage(props) && region === bottom && !scheduledOrActivePause) {
    messages.push(
      <MyAccountMessage
        key={MESSAGE_TYPE_REACTIVATE}
        type={MESSAGE_TYPE_REACTIVATE}
        title={staticText.getIn(['data', 'reactivate', 'title'])}
        message={getMessageVariable(
          userAccount,
          plans,
          staticText,
          MESSAGE_TYPE_REACTIVATE,
        )}
        url={URL_PLAN_SELECTION}
        urlText={staticText.getIn(['data', 'reactivate', 'details'])}
        region={region}
      />,
    )
  }

  if (showPaymentErrorMessage(props) && region === top) {
    messages.push(
      <MyAccountMessage
        key={MESSAGE_TYPE_ERROR}
        type={MESSAGE_TYPE_ERROR}
        title={staticText.getIn(['data', 'error', 'title'])}
        message1={staticText.getIn(['data', 'error', 'body1'])}
        message2={staticText.getIn(['data', 'error', 'body2'])}
        url={URL_ACCOUNT}
        urlText={staticText.getIn(['data', 'errorV2', 'details'])}
        region={region}
      />,
    )
  }

  if (showUpdatePaymentMethodMessage(props) && region === top) {
    messages.push(
      <MyAccountMessage
        key={MESSAGE_TYPE_UPDATE}
        type={MESSAGE_TYPE_UPDATE}
        title={staticText.getIn(['data', 'update', 'title'])}
        message1={staticText.getIn(['data', 'updateV2', 'body1'])}
        message2={staticText.getIn(['data', 'updateV2', 'body2'])}
        url={URL_ACCOUNT}
        urlText={staticText.getIn(['data', 'updateV2', 'details'])}
        region={'top'}
      />,
    )
  }

  return messages
}

function MyAccountMessages (props) {
  const { plans } = props
  const plansLoaded = plans.getIn(['data', 'plans'])

  if (!plansLoaded) {
    return null
  }

  return (
    <div className={getClassName()}>
      {renderMessages(props)}
    </div>
  )
}

MyAccountMessages.propTypes = {
  plans: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  paytrack: ImmutablePropTypes.map.isRequired,
  scheduledOrActivePause: PropTypes.bool,
}

export default compose(
  connectRedux(
    state => ({
      plans: state.plans,
      language: state.user.getIn(['data', 'language', 0], 'en'),
      auth: state.auth,
      userAccount: state.userAccount,
      paytrack: state.paytrack,
      user: state.user,
      page: state.page,
    }),
  ),
  connectStaticText({ storeKey: 'myAccountMessages' }),
)(MyAccountMessages)
