import _get from 'lodash/get'
import React, { useEffect } from 'react'
import { connect as connectRedux } from 'react-redux'
import { List } from 'immutable'
import { get as getConfig } from 'config'
import compose from 'recompose/compose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import { getBoundActions } from 'actions'
import Icon from 'components/Icon'
import Link from 'components/Link'
import { H5, H4 } from 'components/Heading'
import { Card, STATES, CONTROLS } from 'components/Card'
import { Button } from 'components/Button.v2'
import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_LINK } from 'components/ButtonSignUp'
import MyAccountUpdatePaymentV2 from 'components/MyAccount/MyAccountUpdatePaymentV2'
import MyAccountMessages, { bottom } from 'components/MyAccount/MyAccountMessages'

import { EUR, GBP, renderSymbol } from 'services/currency'
import {
  format as formatDateTime,
  getDateTime,
  subtractDays,
  ordinalDateFormatingi18n,
  getDateLocale,
  formatWithLocale,
  addMonths,
  getCurrentTime,
} from 'services/date-time'
import { isEntitled } from 'services/subscription'
import { TYPE_PAUSE_RESUME } from 'services/dialog'
import {
  USER_ACCOUNT_PAUSED,
  USER_ACCOUNT_CANCELLED,
  USER_ACCOUNT_TRANSACTION_STATUS_DECLINED,
  userShouldReactivate,
  getCurrentPlanInfoFromPlansCall,
  shouldRenderNextPlanSection,
  shouldRenderPauseSection,
  hasScheduledPause,
  hasScheduledOrActivePause,
} from 'services/user-account'
import {
  URL_ACCOUNT_CHANGE_PLAN,
  URL_ACCOUNT,
  URL_ACCOUNT_CANCEL,
  URL_PLAN_SELECTION,
  URL_HELP_CENTER,
  URL_ACCOUNT_PAUSE,
} from 'services/url/constants'
import {
  PLAN_ID_LEGACY_MONTHLY,
  PLAN_ID_LEGACY_ANNUAL,
  PLAN_ID_THREE_MONTH,
  PLAN_ID_MONTHLY,
  PLAN_ID_ANNUAL,
  PLAN_ID_FREE_TRIAL,
  PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL,
  PLAN_ID_NINETY_NINE_CENT_TWO_WEEKS,
  PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY,
  PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL,
  PLAN_ID_COMPLIMENTARY,
  formatPrice,
} from 'services/plans'
import { getPrimary } from 'services/languages'

// If making changes to this file, please look at myAccountDetailsPage as well

// ----------------------------- MY ACCOUNT V2 ---------------------

/* eslint-disable max-len */
function formatStartAndEndDates (reformattedStartDate, reformattedEndDate, formattedEndTime, props) {
  const { staticText } = props
  return (
    <div className="my-account-details-V2__item my-account-details-V2__item--short-details">
      <p className="my-account-details-V2__formatted-trial-time">
        { staticText.get('starts') }
      </p>
      <p className="my-account-details-V2__formatted-trial-time">
        { reformattedStartDate }
      </p>
      <p className="my-account-details-V2__formatted-trial-time">
        {` - ${staticText.get('ends')}`}
      </p>
      <p className="my-account-details-V2__formatted-trial-time">
        { reformattedEndDate }
      </p>
      <p className="my-account-details-V2__formatted-trial-time">
        {staticText.get('at')}
      </p>
      <p className="my-account-details-V2__formatted-trial-time">
        { formattedEndTime }
      </p>
    </div>
  )
}
function hideNextBillDateInCurrentPlanSection (currentPlanId, nextPlanId) {
  if (currentPlanId === PLAN_ID_COMPLIMENTARY) {
    return true
  } else if (
    (currentPlanId === PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL) &&
    (nextPlanId === PLAN_ID_MONTHLY)
  ) {
    return true
  }
  return false
}
function renderFreeTrialDetails (props) {
  const { user, page } = props
  const locale = page.get('locale')
  const freeTrialId = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  const freeTrialData = getCurrentPlanInfoFromPlansCall(props, freeTrialId)
  const freeTrialTitle = freeTrialData.getIn([0, 'title'])
  const shortDetails = freeTrialData.getIn([0, 'shortDetails'])
  const dateFormatString = 'MM/DD/YY'
  const timeFormatString = 'hh:mma'
  const startDateString = user.getIn(['data', 'userEntitlements', 'start'])
  const startDateInMilliseconds = parseInt(startDateString, 10) * 1000
  const formattedStartDate = new Date(startDateInMilliseconds)
  const getStartDate = getDateTime(formattedStartDate)
  const reformattedStartDate = formatDateTime(getStartDate, locale, dateFormatString)
  const endDateString = user.getIn(['data', 'userEntitlements', 'end'])
  const endDateInMilliseconds = parseInt(endDateString, 10) * 1000
  const formattedEndDate = new Date(endDateInMilliseconds)
  const getEndDate = getDateTime(formattedEndDate)
  const reformattedEndDate = formatDateTime(getEndDate, locale, dateFormatString)
  const formattedEndTime = formatDateTime(getEndDate, locale, timeFormatString)

  if (freeTrialId === PLAN_ID_FREE_TRIAL) {
    return (
      <div className="my-account-details-V2__plan-section">
        <div className="my-account-details-V2__plan-details">
          <H5 className="my-account-details-V2__item my-account-details-V2__item--plan-current">
            { freeTrialTitle }
          </H5>
          <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
            { shortDetails }
          </p>
          { formatStartAndEndDates(reformattedStartDate, reformattedEndDate, formattedEndTime, props) }
        </div>
      </div>
    )
  }
  return null
}
function renderPlanDetailsV2 (props, shouldReactivate) {
  const config = getConfig()
  const { features } = config
  const { staticText, userAccount, user, auth } = props
  const accountPause = _get(features, ['userAccount', 'accountPause'])
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const currentPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const endDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'endDate'])
  const freeTrialId = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  const nextBillAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextBillAmount'])
  const nextChargeAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'charges', 0, 'price'])
  const nextPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productRatePlanId'])
  const paidThroughDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const userAccountPlanName = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'name'])
  const zuoraAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])

  // Status
  const currentPlanData = getCurrentPlanInfoFromPlansCall(props, currentPlanId)
  const currentPlanName = currentPlanData.getIn([0, 'title'])
  const duration = currentPlanData.getIn([0, 'duration'])
  const billingSchedule = currentPlanData.getIn([0, 'billingSchedule'])
  const remainingTime = Date.parse(endDate) - Date.now()
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const nextBillPrice = formatPrice(currencyIso, nextBillAmount)
  const nextPayment = renderBillingAmountV2(currencyIso, nextBillAmount)
  const accountPausedOrCancelled = [USER_ACCOUNT_CANCELLED, USER_ACCOUNT_PAUSED].includes(subscriptionStatus)
  const cancelledWithTimeLeft = subscriptionStatus === USER_ACCOUNT_CANCELLED && remainingTime > 0
  const scheduledPause = hasScheduledPause(userAccount)
  const shouldLetReactivate = (
    ((paidThroughDate === endDate) && (subscriptionStatus === USER_ACCOUNT_CANCELLED)) ||
    (!currentPlanId && !nextPlanId && remainingTime <= 0)
  )

  // Dates
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const reformattedPaidThroughDate = getDateTime(paidThroughDate)
  const pauseDate = getDateTime(userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseDate']))
  const resumeDate = getDateTime(userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'resumeDate']))
  const nextChargeDate = resumeDate || reformattedPaidThroughDate

  const formattedNextChargeDate =
    formatWithLocale(
      formatDateTime(nextChargeDate),
      dateFormatString,
      { locale: dateLocale },
    )
  const renderNextChargeDate =
    subscriptionStatus === USER_ACCOUNT_PAUSED && accountPause
      ? `${nextBillPrice} ${staticText.get('on')} ${formattedNextChargeDate}`
      : formattedNextChargeDate
  const formattedCancelDate =
  formatWithLocale(
    formatDateTime(reformattedPaidThroughDate),
    dateFormatString,
    { locale: dateLocale },
  )
  const pauseDateFormatted =
    formatWithLocale(
      formatDateTime(subtractDays(pauseDate, 1)),
      dateFormatString,
      { locale: dateLocale },
    )
  const resumeDateFormatted =
  formatWithLocale(
    formatDateTime(subtractDays(resumeDate, 1)),
    dateFormatString,
    { locale: dateLocale },
  )

  if (!zuoraAccountId && freeTrialId) {
    return (
      renderFreeTrialDetails(props)
    )
  } else if (!shouldReactivate) {
    return (
      <div className="my-account-details-V2__plan-section">
        <div className="my-account-details-V2__plan-details">
          {
            currentPlanName && subscriptionStatus !== USER_ACCOUNT_CANCELLED ?
              <H5 className="my-account-details-V2__item my-account-details-V2__item--plan-current">
                { currentPlanName }
              </H5> : null
          }
          {
            subscriptionStatus === USER_ACCOUNT_PAUSED && accountPause ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                <span className="my-account-details-V2__item--paused">
                  {staticText.get('paused')}
                </span> {staticText.get('until')} { resumeDateFormatted }
              </p> : null
          }
          {
            (billingSchedule && !accountPausedOrCancelled) &&
            (currentPlanId !== PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY) &&
            (currentPlanId !== PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL) &&
            (currentPlanId !== PLAN_ID_NINETY_NINE_CENT_TWO_WEEKS) &&
            (currentPlanId !== PLAN_ID_THREE_MONTH) &&
            (currentPlanId !== PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY) &&
            (currentPlanId !== PLAN_ID_LEGACY_MONTHLY) &&
            (currentPlanId !== PLAN_ID_LEGACY_ANNUAL) &&
            (currentPlanId !== PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL) ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {renderBillingAmountV2(currencyIso, nextChargeAmount)} {billingSchedule}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_NINETY_NINE_CENT_TWO_WEEKS ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {renderBillingAmountV2(currencyIso, nextChargeAmount)} {staticText.get('forTwoWeeks')} {nextPayment} {staticText.get('billedMonthly')}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_THREE_MONTH ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {renderBillingAmountV2(currencyIso, nextChargeAmount)} {staticText.get('forThreeMonths')} {nextPayment} {staticText.get('billedMonthly')}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY && nextPlanId === PLAN_ID_ANNUAL ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {staticText.get('freeOneWeekTrialThen')} {nextPayment} {staticText.get('billedAnnually')}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL && nextPlanId === PLAN_ID_MONTHLY ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {staticText.get('freeOneWeekTrialThen')} {nextPayment} {staticText.get('billedMonthly')}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY && nextPlanId === PLAN_ID_MONTHLY ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {staticText.get('freeOneWeekTrialThen')} {nextPayment} {staticText.get('billedMonthly')}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL && nextPlanId === PLAN_ID_ANNUAL ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {staticText.get('freeOneWeekTrialThen')} {nextPayment} {staticText.get('billedAnnually')}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY && nextPlanId === PLAN_ID_MONTHLY ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                {currentPlanData.getIn([0, 'shortDetails'])}
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_LEGACY_MONTHLY ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                { renderBillingAmountV2(currencyIso, nextChargeAmount) } { duration }
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_LEGACY_ANNUAL ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                { renderBillingAmountV2(currencyIso, nextChargeAmount) } { duration }
              </p> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL && nextPlanId === PLAN_ID_MONTHLY ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details" /> : null
          }
          {
            subscriptionStatus !== USER_ACCOUNT_CANCELLED && currentPlanId === PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL && nextPlanId === PLAN_ID_ANNUAL ?
              <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                { renderBillingAmountV2(currencyIso, nextBillAmount) } { duration }
              </p> : null
          }
          {
            currentPlanId === PLAN_ID_COMPLIMENTARY ?
              <H5 className="my-account-details-V2__item my-account-details-V2__item--plan-current">
                { userAccountPlanName }
              </H5> : null
          }
          {
            scheduledPause ?
              <p className="my-account-details-V2__item my-account-details-V2__item--next-charge">
                { staticText.get('ends') } { staticText.get('on') }: { pauseDateFormatted }
              </p> : null
          }
          {
            hideNextBillDateInCurrentPlanSection(currentPlanId, nextPlanId) ? null
              : <span>
                {
                  nextBillAmount && !scheduledPause ?
                    <p className="my-account-details-V2__item my-account-details-V2__item--next-charge">
                      { staticText.get('nextBillDate') }: { renderNextChargeDate }
                    </p> : null
                }
              </span>
          }
        </div>
        {
          cancelledWithTimeLeft ?
            <span className="my-account-details-V2__canceled-section">
              <div className="my-account-details-V2__canceled-description">
                <p className="my-account-details-V2__canceled-title">
                  <Icon
                    iconClass={[
                      'my-account-details-V2__icon',
                      'icon',
                    ]}
                  />
                  { staticText.get('canceled') }
                </p>
                <p className="my-account-details-V2__canceled-valid-through">
                  { `${staticText.get('validThrough')} ${formattedCancelDate}` }
                </p>
              </div>
              <div className="my-account-details-V2__reactivate-contact-link">
                <Link
                  className="my-account-details-V2__reactivate-link"
                  to={URL_ACCOUNT_CHANGE_PLAN}
                  scrollToTop
                >
                  {staticText.get('reactivateYourSubscription')}
                </Link>
                <Icon
                  iconClass={[
                    'my-account-details-V2__arrow-right',
                    'icon--right',
                    'icon--action',
                  ]}
                />
              </div>
            </span> : null
        }
        {
          (shouldLetReactivate && userIsEntitled) && (!cancelledWithTimeLeft) ?
            <span className="my-account-details-V2__canceled-section">
              <div className="my-account-details-V2__canceled-description">
                <p className="my-account-details-V2__canceled-title">
                  { staticText.get('canceled') }
                </p>
                <p className="my-account-details-V2__canceled-valid-through">
                  { `${staticText.get('validThrough')} ${formattedCancelDate}` }
                </p>
              </div>
              <p className="my-account-details-V2__canceled-valid-through">
                { `${staticText.get('cancelledReactivate')} ` }
                <Link
                  to={URL_HELP_CENTER}
                  className="my-account-details-V2__item my-account-details-V2__item--link"
                >
                  {staticText.get('customerService')}
                </Link>
              </p>
            </span> : null
        }
        {
          shouldLetReactivate && !userIsEntitled ?
            <span className="my-account-details-V2__canceled-section">
              <div className="my-account-details-V2__canceled-description">
                <p className="my-account-details-V2__canceled-title">
                  { staticText.get('canceled') }
                </p>
                <p className="my-account-details-V2__canceled-valid-through">
                  { staticText.get('continueEnjoying') }
                </p>
                <span>
                  <Link
                    to={URL_PLAN_SELECTION}
                    className="my-account-details-V2__item my-account-details-V2__item--link"
                  >
                    {staticText.get('reactivate')}
                  </Link>
                  <Icon
                    iconClass={[
                      'my-account-details-V2__arrow-right',
                      'icon--right',
                      'icon--action',
                    ]}
                  />
                </span>
              </div>
            </span> : null
        }
        { subscriptionStatus === USER_ACCOUNT_PAUSED && accountPause
          ? <div className="my-account-details-V2__resume-link">
            {renderResumePlanLinkV2(props)}
          </div>
          : <div className="my-account-details-V2__change-link">
            {renderChangePlanLinkV2(props)}
          </div>
        }
      </div>
    )
  }

  return (
    <div className="my-account-details-V2__plan-details--section">
      <div className="my-account-details-V2__plan-details--plan">
        <p className="my-account-details-V2__plan-details--title">
          { staticText.get('welcomeBack') }
        </p>
        <p className="my-account-details-V2__plan-details--message">
          { staticText.get('continueEnjoying') }
        </p>
      </div>
      <div className="my-account-details-V2__plan-details--link">
        <ButtonSignUp
          type={BUTTON_SIGN_UP_TYPE_LINK}
          className="my-account-details-V2__item my-account-details-V2__item--link"
          text={staticText.get('reactivate')}
          scrollToTop
        />
        <Icon
          iconClass={[
            'my-account-details-V2__arrow-right',
            'icon--right',
            'icon--action',
          ]}
        />
      </div>
    </div>
  )
}
/* eslint-enable max-len */

function renderNextPlanV2 (props) {
  const { userAccount, staticText, page } = props
  const dateFormatString = 'MM/DD/YY'
  const locale = page.get('locale')
  const currentPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const nextPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productRatePlanId'])
  const nextPlanData = getCurrentPlanInfoFromPlansCall(props, nextPlanId)
  const nextPlanName = nextPlanId === PLAN_ID_COMPLIMENTARY ? staticText.get('comp') : nextPlanData.getIn([0, 'title'])
  const nextPlanBillingSchedule = nextPlanData.getIn([0, 'billingSchedule'])
  const nextChargeAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'charges', 0, 'price'])
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const nextChargeDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  const reformattedNextChargeDate = getDateTime(nextChargeDate)
  const formattedNextChargeDate =
    formatDateTime(reformattedNextChargeDate, locale, dateFormatString)
  const renderNextPlanSection = shouldRenderNextPlanSection(props)

  if (renderNextPlanSection) {
    return (
      <div className="my-account-details-V2__next-plan-section">
        <div className="my-account-details-V2__next-plan-title">
          {staticText.get('nextPlan')}
        </div>
        <div>
          <p className="my-account-details-V2__next-plan-name">{nextPlanName}</p>
        </div>
        {
          currentPlanId === PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL && nextPlanId === PLAN_ID_MONTHLY ?
            <p className="my-account-details-V2__next-plan-charge">
              { staticText.get('nextBillDate') }: { formattedNextChargeDate }
            </p> : null
        }
        {
          nextPlanId === PLAN_ID_COMPLIMENTARY ?
            null :
            <p className="my-account-details-V2__next-plan-short-details">
              { renderBillingAmountV2(currencyIso, nextChargeAmount) } { nextPlanBillingSchedule }
            </p>
        }
        {
          currentPlanId === PLAN_ID_COMPLIMENTARY ?
            <p className="my-account-details-V2__next-plan-charge">
              { staticText.get('nextBillDate') }: { formattedNextChargeDate }
            </p> : null
        }
      </div>
    )
  }
  return null
}

function renderNonErrorBannerMessages (props) {
  const { userAccount } = props
  const scheduledOrActivePause = hasScheduledOrActivePause(userAccount)

  return (
    <div className="my-account-details-V2__messages-section">
      <MyAccountMessages
        userAccount={userAccount}
        region={bottom}
        scheduledOrActivePause={scheduledOrActivePause}
      />
    </div>
  )
}

function renderCancelOptionV2 (props) {
  const { staticText, userAccount, user } = props
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const zuoraAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const freeTrialId = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])

  if (!zuoraAccountId && freeTrialId) {
    return null
  } else if (subscriptionStatus !== USER_ACCOUNT_CANCELLED) {
    return (
      <div className="my-account-details-V2__cancel-section">
        <div className="my-account-details-V2__cancel-text">
          <H5 className="my-account-details-V2__cancel-title">
            { staticText.get('cancelMembership') }
          </H5>
          <p className="my-account-details-V2__cancel-description">
            { staticText.get('sorry') }
          </p>
        </div>
        <div className="my-account-details-V2__cancel-link">
          { renderCancelLinkV2(props) }
        </div>
      </div>
    )
  }
  return null
}

function renderPauseOptionV2 (props) {
  const { staticText, userAccount, user } = props
  const scheduledPause = hasScheduledPause(userAccount)
  const pauseMonths = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseMonths'])
  const nextBillAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextBillAmount'])
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const price = formatPrice(currencyIso, nextBillAmount)

  // Dates
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const pauseDate = getDateTime(userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseDate']))
  const resumeDate = getDateTime(userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'resumeDate']))
  const pauseEnd = getDateTime(subtractDays(resumeDate, 1))
  const pauseDateFormatted =
    formatWithLocale(
      formatDateTime(pauseDate),
      dateFormatString,
      { locale: dateLocale },
    )
  const resumeDateFormatted =
    formatWithLocale(
      formatDateTime(resumeDate),
      dateFormatString,
      { locale: dateLocale },
    )
  const pauseEndFormatted =
    formatWithLocale(
      formatDateTime(pauseEnd),
      dateFormatString,
      { locale: dateLocale },
    )
  const pauseStart = pauseDateFormatted.split(',')[0]

  if (shouldRenderPauseSection(props)) {
    return (
      <div className="my-account-details-V2__pause-section">
        <div className="my-account-details-V2__pause-text">
          <H5 className="my-account-details-V2__pause-title">
            { scheduledPause ? staticText.get('pauseScheduled') : staticText.get('pauseMembership') }
          </H5>
          {
            scheduledPause ? (
              <div className="my-account-details-V2__pause-scheduled-info">
                <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                  <span className=" my-account-details-V2__item--paused">
                    {`${pauseMonths} ${staticText.get('month')} ${staticText.get('pause')}: `}
                  </span>
                  {pauseStart} - {pauseEndFormatted}
                </p>
                <p className="my-account-details-V2__item my-account-details-V2__item--short-details">
                  { staticText.get('nextBillDate') }:  {`${price} ${staticText.get('on')} ${resumeDateFormatted}`}
                </p>
              </div>
            ) : (
              <p className="my-account-details-V2__pause-description">
                { staticText.get('pauseMembershipDescription') }
              </p>
            )}
        </div>
        <div className="my-account-details-V2__pause-link">
          { scheduledPause ? renderRemovePauseLink(props) : renderPauseLinkV2(props) }
        </div>
      </div>
    )
  }
  return null
}

function renderResumeModal (props) {
  const {
    updateUserAccountResume,
    isProcessingAccountResume,
    renderModal,
    userAccount,
    user,
    page,
  } = props
  const locale = page.get('locale')
  const status = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const nextBillAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextBillAmount'])
  const paidThrough = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  const resumeDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'resumeDate'])
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const price = formatPrice(currencyIso, nextBillAmount)
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const dateFormat = 'YYYY-MM-DD'
  const today = formatDateTime(getCurrentTime(), locale, dateFormat)
  const formattedResumeDate = formatDateTime(getDateTime(resumeDate), locale, dateFormat)
  // set the default nextBillingDate as the paidThroughDate
  // this will cover the case of the user still being active before their pause takes effect
  let nextBillingDate = formatDateTime(getDateTime(paidThrough), locale, dateFormat)

  // add a month to nextBillingDate until we hit the proper next bill date
  while (nextBillingDate && nextBillingDate < today && nextBillingDate < formattedResumeDate) {
    nextBillingDate = formatDateTime(addMonths(nextBillingDate, 1), locale, dateFormat)
  }

  const nextStandardBillingDate = formatWithLocale(
    nextBillingDate,
    dateFormatString,
    { locale: dateLocale },
  )

  renderModal(TYPE_PAUSE_RESUME, {
    price,
    status,
    userAccount,
    userLanguage,
    onReturnFocus: () => null,
    resumeAccount: updateUserAccountResume,
    hideDismiss: isProcessingAccountResume,
    resumeDate: nextStandardBillingDate,
  })
}

function renderResumePlanLinkV2 (props) {
  const { staticText } = props
  return (
    <div className="my-account-details-V2__resume-plan-link">
      <span>
        <Button
          onClick={() => renderResumeModal(props)}
          className="my-account-details-V2__item my-account-details-V2__item--link"
        >
          {staticText.get('resumeButton')}
        </Button>

        <Icon
          iconClass={[
            'my-account-details-V2__arrow-right',
            'icon--right',
            'icon--action',
          ]}
        />
      </span>

    </div>
  )
}

function renderChangePlanLinkV2 (props) {
  const { staticText, userAccount } = props
  const scheduledOrActivePause = hasScheduledOrActivePause(userAccount)
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const endDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'endDate'])
  const startDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'startDate'])
  const paymentSourceType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'type'])
  const remainingTime = Date.parse(endDate) - Date.now()
  const errorCode = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'errors', 0, 'status'])
  const lastTransactionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'lastTransactionStatus'])
  const lastTransactionDeclined = lastTransactionStatus === USER_ACCOUNT_TRANSACTION_STATUS_DECLINED
  const date = new Date()
  const formattedStartDate = getDateTime(startDate)
  const formattedCurrentDate = getDateTime(date)
  const futureStartDate = (formattedStartDate > formattedCurrentDate)

  if (errorCode > 299) {
    return (
      null
    )
  } else if (
    !paymentSourceType &&
    subscriptionStatus === USER_ACCOUNT_CANCELLED &&
    endDate &&
    remainingTime > 0
  ) {
    return (
      <div className="my-account-details-V2__reactivate-contact">
        { staticText.get('reactivateContact')}
      </div>
    )
  } else if (subscriptionStatus !== USER_ACCOUNT_CANCELLED && !scheduledOrActivePause) {
    return (
      <div className="my-account-details-V2__change-plan-link">
        {
          !lastTransactionDeclined && !futureStartDate ?
            <span>
              <Link
                to={URL_ACCOUNT_CHANGE_PLAN}
                className="my-account-details-V2__item my-account-details-V2__item--link"
              >
                {staticText.get('change')}
              </Link>
              <Icon
                iconClass={[
                  'my-account-details-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </span>
            : null
        }
        {
          lastTransactionDeclined ?
            <span>
              <Link
                to={URL_ACCOUNT}
                className="my-account-details-V2__item my-account-details-V2__item--link"
              >
                { staticText.get('update') }
              </Link>
              <Icon
                iconClass={[
                  'my-account-details-V2__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </span>
            : null
        }
      </div>
    )
  }

  return null
}

function renderCancelLinkV2 (props) {
  const {
    staticText,
    userAccount,
    resetUserAccountManageSubscriptionData,
    resetUserComp,
  } = props
  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const endDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'endDate'])
  const paymentSourceType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'type'])
  const remainingTime = Date.parse(endDate) - Date.now()
  const errorCode = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'errors', 0, 'status'])

  const resetUserCancelFlowData = () => {
    resetUserAccountManageSubscriptionData()
    resetUserComp()
  }

  if (errorCode > 299) {
    return (
      null
    )
  } else if (
    !paymentSourceType &&
    subscriptionStatus === USER_ACCOUNT_CANCELLED &&
    endDate &&
    remainingTime > 0
  ) {
    return (
      <div className="my-account-details-V2__reactivate-contact">
        { staticText.get('reactivateContact')}
      </div>
    )
  } else if (subscriptionStatus !== USER_ACCOUNT_CANCELLED) {
    return (
      <div className="my-account-details-V2__cancel-subscription-link">
        <Link
          to={URL_ACCOUNT_CANCEL}
          className="my-account-details-V2__item my-account-details-V2__item--link"
          onClick={resetUserCancelFlowData}
        >
          { staticText.get('cancelMembership') }
        </Link>
        <Icon
          iconClass={[
            'my-account-details-V2__arrow-right',
            'icon--right',
            'icon--action',
          ]}
        />
      </div>
    )
  }

  return (
    <div className="my-account-details-V2__plan-links">
      <ButtonSignUp
        type={BUTTON_SIGN_UP_TYPE_LINK}
        className="my-account-details-V2__item my-account-details-V2__item--link"
        text={staticText.get('reactivate')}
        scrollToTop
      />
    </div>
  )
}

function renderRemovePauseLink (props) {
  const { staticText } = props
  return (
    <div className="my-account-details-V2__remove-pause-link">
      <span>
        <Button
          onClick={() => renderResumeModal(props)}
          className="my-account-details-V2__item my-account-details-V2__item--link"
        >
          {staticText.get('removePause')}
        </Button>

        <Icon
          iconClass={[
            'my-account-details-V2__arrow-right',
            'icon--right',
            'icon--action',
          ]}
        />
      </span>

    </div>
  )
}

function renderPauseLinkV2 (props) {
  const {
    staticText,
    userAccount,
  } = props
  const errorCode = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'errors', 0, 'status'])

  const handlePauseAccountClick = () => {}

  if (errorCode > 299) {
    return (
      null
    )
  }

  return (
    <div className="my-account-details-V2__pause-subscription-link">
      <Link
        to={URL_ACCOUNT_PAUSE}
        className="my-account-details-V2__item my-account-details-V2__item--link"
        onClick={handlePauseAccountClick}
      >
        { staticText.get('pauseMembership') }
      </Link>
      <Icon
        iconClass={[
          'my-account-details-V2__arrow-right',
          'icon--right',
          'icon--action',
        ]}
      />
    </div>
  )
}

function renderBillingAmountV2 (currencyIso, amount) {
  switch (currencyIso) {
    case EUR:
      return (
        <span>
          { `${amount} ${renderSymbol(currencyIso)}` }
        </span>
      )
    case GBP:
      return (
        <span>
          { `${renderSymbol(currencyIso)}${amount}` }
        </span>
      )
    default:
      return (
        <span>
          { `${renderSymbol(currencyIso)}${amount}` }
        </span>
      )
  }
}

function renderPaymentInfoDisplay (toggleUpdatePaymentCardState, props) {
  const { staticText, userAccount } = props
  const lastFour = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'maskedCardNumber'])
  const paymentSourceType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'type'])
  const expMonth = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'expMonth'])
  const expYear = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'expYear'])
  const zipCode = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'cardPostalCode'])
  const paypalRegex = /paypal/ig
  let cardType = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'cardType'])
  // If the paymentSourceType is of paypal origin
  if (paypalRegex.test(paymentSourceType)) {
    cardType = 'Paypal'
  }

  return (
    <div className="my-account-details-V2__payment-info-details">
      { paymentSourceType ?
        <H5 className="my-account-details-V2__payment-info--title">
          { staticText.get('paymentMethod') }
        </H5> : null
      }
      { paymentSourceType && cardType && lastFour ?
        <p className="my-account-details-V2__item">
          { cardType } { lastFour }
        </p> :
        <p className="my-account-details-V2__item">
          { cardType }
        </p>
      }
      { expMonth && expYear ?
        <div>
          <p className="my-account-details-V2__item">
            { staticText.get('expirationDate') }: { expMonth } / { expYear }
          </p>
          { zipCode ?
            <p>
              { staticText.get('zip') }: { zipCode }
            </p>
            : null
          }
        </div> : null
      }
    </div>
  )
}

function renderPaymentInfoEditMode (toggleUpdatePaymentCardState, props) {
  const { history, location } = props
  return (
    <div>
      <MyAccountUpdatePaymentV2
        toggleUpdatePaymentCardState={toggleUpdatePaymentCardState}
        history={history}
        location={location}
      />
    </div>
  )
}

function displayPaymentInfoCard (props) {
  return (
    <Card
      editable
      editControl={CONTROLS.UPDATE}
    >
      {(editState, toggleState) => (
        editState === STATES.DISPLAY
          ? renderPaymentInfoDisplay(toggleState, props)
          : renderPaymentInfoEditMode(toggleState, props)
      )}
    </Card>
  )
}

function renderMyAccountDetailsPageV2 (props) {
  const { staticText, userAccount } = props
  const zuoraBillingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'])
  const reactivationRequired = userShouldReactivate(props)

  return (
    <div className="my-account-details-V2">
      <div className="my-account-details-V2__plan">
        {renderPlanDetailsV2(props, reactivationRequired)}
        {renderNextPlanV2(props)}
        {renderPauseOptionV2(props)}
        {renderCancelOptionV2(props, reactivationRequired)}
        {renderNonErrorBannerMessages(props)}
      </div>
      {
        zuoraBillingAccountId && !reactivationRequired ?
          <div id="payment-info" className="my-account-details-V2__payment-info">
            <H4 className="my-account-details-V2__payment-title" >
              { staticText.get('paymentInfo') }
            </H4>
            { displayPaymentInfoCard(props) }
          </div>
          : null
      }
    </div>
  )
}

const MyAccountDetailsPage = (props) => {
  useEffect(() => {
    const {
      userAccount,
      isProcessingAccountResume,
    } = props

    const hasError = !userAccount.getIn(['manageSubscription', 'data', 'errors'], List()).isEmpty()
    // call render modal again so that hideDismiss gets updated and errors render
    if (isProcessingAccountResume || hasError) {
      renderResumeModal(props)
    }
  }, [props.isProcessingAccountResume, props.userAccount])

  return (renderMyAccountDetailsPageV2(props))
}

MyAccountDetailsPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  resetUserComp: PropTypes.func.isRequired,
  resetUserAccountManageSubscriptionData: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      page: state.page,
      auth: state.auth,
      user: state.user,
      plans: state.plans,
      userAccount: state.userAccount,
      staticText: state.staticText.getIn(['data', 'myAccountDetails', 'data']),
      isProcessingAccountResume:
        state.userAccount.getIn(['manageSubscription', 'data', 'accountResumeProcessing'], false)
        || state.userAccount.getIn(['manageSubscription', 'data', 'success'], false),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        renderModal: actions.dialog.renderModal,
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        resetUserComp: actions.subscription.resetUserComp,
        resetUserAccountManageSubscriptionData:
          actions.userAccount.resetUserAccountManageSubscriptionData,
        updateUserAccountResume: actions.userAccount.updateUserAccountResume,
      }
    }),
)(MyAccountDetailsPage)
