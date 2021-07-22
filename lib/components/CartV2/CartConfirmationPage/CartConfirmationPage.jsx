import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import { H3, H4, H5, HEADING_TYPES } from 'components/Heading'
import { Button, TYPES as BUTTON_TYPES } from 'components/Button.v2'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import {
  getDateLocale,
  getDateTime,
  ordinalDateFormatingi18n,
  formatWithLocale,
} from 'services/date-time'
import CartBillingProcessing from 'components/CartBillingProcessing'
import {
  URL_GET_STARTED,
  URL_ACCOUNT_PROFILE,
} from 'services/url/constants'
import { getHelpCenterUrl } from 'services/url'
import {
  formatPrice,
  getPlanSubscriptionType,
  PLAN_SUBSCRIPTION_MONTHLY,
  PLAN_SUBSCRIPTION_ANNUAL,
  PLAN_SUBSCRIPTION_LIVE,
  PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL,
  PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  PLAN_ID_ANNUAL,
  PLAN_ID_LIVE,
  PLAN_ID_MONTHLY,
} from 'services/plans'
import { getPrimary } from 'services/languages'

const dataLayer = global.dataLayer

const getPlanTitle = planId => ({
  [PLAN_SUBSCRIPTION_MONTHLY]: 'Monthly Plan',
  [PLAN_SUBSCRIPTION_ANNUAL]: 'Annual Plan',
  [PLAN_SUBSCRIPTION_LIVE]: 'Live Access Plan',
}[getPlanSubscriptionType(planId)])


const getPlanBillingCadence = (planId) => {
  if (planId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL) {
    return '/year with 7 day free trial'
  }

  if (planId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY) {
    return '/month with 7 day free trial'
  }

  if ([PLAN_ID_ANNUAL, PLAN_ID_LIVE].includes(planId)) {
    return '/year'
  }

  if (planId === PLAN_ID_MONTHLY) {
    return '/month'
  }

  return ''
}

function CartConfirmationPage ({
  checkout,
  user,
  userAccount,
}) {
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const email = user.getIn(['data', 'mail'])
  const firstName = user.getIn(['data', 'firstName'])
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const nextBillAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextBillAmount'])
  const nextBillingDate = getDateTime(userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const formattedNextBillingDate =
    formatWithLocale(nextBillingDate, dateFormatString, { locale: dateLocale })
  const planId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const planTitle = getPlanTitle(planId)
  const price = formatPrice(currencyIso, nextBillAmount)
  const cadence = getPlanBillingCadence(planId)
  const orderData = checkout.get('orderData', Map())

  const onClickEmailLink = () => {
    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'user engagement',
        eventAction: 'call to action',
        eventLabel: 'update email',
      })
    }
  }

  if (orderData.size > 0 && !planId) {
    return (
      <div className="cart-confirmation">
        <div className="cart-confirmation__sherpa">
          <CartBillingProcessing />
        </div>
      </div>
    )
  }

  return (
    <div className="cart-confirmation">
      <div className="cart-confirmation__gradient" />
      <div className="cart-confirmation__background" />
      <div className="cart-confirmation__content">
        <header>
          <H3 className="cart-confirmation__title">
            Welcome to Gaia, {firstName}!
          </H3>
          <H4 className="cart-confirmation__sub-title">
            {'You have successfully subscribed to Gaia\'s'} <span>{planTitle}.</span>
          </H4>
        </header>

        <H4 className="cart-confirmation__sub-title">
          {'We\'ve sent a welcome email to'} <span>{email}.</span>
        </H4>
        <Link
          to={URL_ACCOUNT_PROFILE}
          onClick={onClickEmailLink}
          className="cart-confirmation__text-link"
        >
          Not your email?
        </Link>
        <div className="cart-confirmation__plan-info">
          <H5 as={HEADING_TYPES.H6}>Your Plan Info:</H5>
          <H4 className="cart-confirmation__plan-title">{planTitle}</H4>
          <p className="cart-confirmation__billing-info">
            {price} {currencyIso}{cadence}
          </p>
          <p className="cart-confirmation__next-billing-date">
            <b>Next Billing Date: </b>{formattedNextBillingDate}
          </p>
        </div>

        <div className="cart-confirmation__help-text">
          <p>Need further assistance or have any questions about Gaia?</p>
          <p>
            {'Check out Gaia\'s '}
            <Link
              target={TARGET_BLANK}
              to={getHelpCenterUrl(userLanguage)}
              className="cart-confirmation__text-link"
              directLink
            >
              Help Center
            </Link>
            .
          </p>
        </div>

        <Button
          url={URL_GET_STARTED}
          type={BUTTON_TYPES.PRIMARY}
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}

CartConfirmationPage.propTypes = {
  checkout: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      checkout: state.checkout,
      user: state.user,
      userAccount: state.userAccount,
    }),
  ),
)(CartConfirmationPage)
