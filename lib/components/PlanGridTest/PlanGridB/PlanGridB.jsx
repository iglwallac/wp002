import PropTypes from 'prop-types'
import { List, Map, fromJS } from 'immutable'
import React, { Fragment, useState, useEffect, useCallback } from 'react'
import compose from 'recompose/compose'
import _get from 'lodash/get'
import _size from 'lodash/size'
import _isFunction from 'lodash/isFunction'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {
  URL_EVENTS,
  URL_ARCHIVED_WORKSHOPS,
  URL_ACCOUNT_CREATION,
  URL_ACCOUNT,
} from 'services/url/constants'
import { historyRedirect } from 'services/navigation'
import { getAuthIsLoggedIn } from 'services/auth'
import { getPrimary } from 'services/languages'
import { EN, DE, ES, FR } from 'services/languages/constants'
import {
  PLAN_SUBSCRIPTION_MONTHLY,
  PLAN_SUBSCRIPTION_ANNUAL,
  PLAN_SUBSCRIPTION_LIVE,
  PLAN_SKU_DECLINE_303,
  PLAN_ID_FREE_TRIAL,
  PLAN_ID_COMPLIMENTARY,
  annualPlanPercentSavings,
  getPlanSkus,
  getPlanSubscriptionType,
  getPlanSubscriptionTypeSku,
  formatPrice,
} from 'services/plans'
import { TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM } from 'services/dialog'
import { LTM } from 'services/currency'
import { getBoundActions } from 'actions'
import { TARGET_BLANK, URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import Icon, { ICON_TYPES } from 'components/Icon.v2'
import SherpaMessage from 'components/SherpaMessage'
import { Button } from 'components/Button.v2'
import { H4 } from 'components/Heading'
import Link from 'components/Link'
import { get as getConfig } from 'config'

const config = getConfig()

const dataLayer = global.dataLayer

/**
 * Handle the Google Analytics event
 * @param {String} eventAction The action for the event
 * @param {String} eventLabel The label for the event
 */
function handleGaEvent (eventAction, eventLabel) {
  if (dataLayer) {
    dataLayer.push({
      event: 'customEvent',
      eventCategory: 'User Engagement',
      eventAction,
      eventLabel,
    })
  }
}

/**
 * Function to run when the user clicks the cta link after choosing their plan
 * @param {Map} plan The selected plan
 * @param {String} currencyIso The currency ISO
 * @param {Object} props The full props
 */
async function onChoosePlanClick (plan, currencyIso, props) {
  const {
    history,
    userAccount = Map(),
    user = Map(),
    auth = Map(),
    setPlansLocalizedSelection,
    isCheckoutChangePlan,
    dismissModal,
    onClickPlan,
  } = props

  const language = user.getIn(['data', 'language'])
  const latamPricing = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'latamPricing'])
  const currency = latamPricing ? LTM : currencyIso
  const eventLabel = plan.get('heading').toLowerCase()
  const eventAction = 'plan grid selection'

  try {
    await setPlansLocalizedSelection({ plan, language, currency })
    if (!isCheckoutChangePlan) {
      historyRedirect({ history, url: URL_ACCOUNT_CREATION, auth, language })
      handleGaEvent(eventAction, eventLabel)
      if (_isFunction(onClickPlan)) {
        onClickPlan()
      }
    }

    if (isCheckoutChangePlan) {
      dismissModal()
    }
  } catch (error) {
    // Do Nothing for now
  }
}

/**
 * Function for determining the chosen plan's type
 * @param {Object} props The props
 * @param {Map} props.plans All available plans
 * @param {Map} props.userAccount The user account data
 * @param {Boolean} props.isAccountChangePlan Whether or not this is account change plan
 * @returns {String} The plan subscription type
 */
function getChosenPlanType (props) {
  const { plans, userAccount, isAccountChangePlan } = props
  let chosenPlanType = getPlanSubscriptionType(plans.getIn(['selection', 'id']))
  let productRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])

  if (productRatePlanId === PLAN_ID_COMPLIMENTARY) {
    productRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productRatePlanId'])
  }

  if (isAccountChangePlan) {
    chosenPlanType = getPlanSubscriptionType(productRatePlanId)
  }

  return chosenPlanType
}

/**
 * Function for updating the local state when the user chooses a plan
 * @param {String} type The subscription type of the plan (monthly, annual, etc)
 * @param {String} sku The sku of the plan
 * @param {String} selectedType The subscription type of the selected plan (monthly, annual, etc)
 * @param {String} selectedSku The sku of the selected plan
 * @param {Function} update The function to run to update the local state
 */
function onPlanSelected (type, sku, selectedType, selectedSku, update) {
  update({ type, sku })
}

/**
 * Function for generating the plan grid highlight className
 * @param {String} selectedType The selected plan subscription type (monthly, annual, etc)
 * @returns {String} The complete className string
 */
function getPlanHighlightClass (selectedType) {
  const cls = ['plan-grid-v2__highlight']

  if (selectedType === PLAN_SUBSCRIPTION_ANNUAL) {
    cls.push('plan-grid-v2__highlight--annual')
  } else if (selectedType === PLAN_SUBSCRIPTION_MONTHLY) {
    cls.push('plan-grid-v2__highlight--monthly')
  } else if (selectedType === PLAN_SUBSCRIPTION_LIVE) {
    cls.push('plan-grid-v2__highlight--live')
  }

  return cls.join(' ')
}

function getPlanSelectButtonClassName (selectedType, userLanguage) {
  const baseClsName = 'plan-grid-v2__button'
  const cls = ['button--primary', 'button--stacked', baseClsName]

  if (selectedType) {
    cls.push(`${baseClsName}--${selectedType}`)
  } else {
    cls.push(`${baseClsName}--unknown`)
  }

  if (selectedType && userLanguage) {
    cls.push(`${baseClsName}--${selectedType}-${userLanguage}`)
  } else if (!selectedType && userLanguage) {
    cls.push(`${baseClsName}--unknown-${userLanguage}`)
  }

  return cls.join(' ')
}

/**
 * Function for generating a className
 * @param {String} className The base default className
 * @param {String} type The plan subscription type (monthly, annual, etc)
 * @param {String} selectedType The selected plan subscription type (monthly, annual, etc)
 * @param {Boolean} wrap Whether or not to add the --wrap className
 * @param {String} userLanguage The users language
 * @param {Boolean} isAccountChangePlan Whether or not this is account change plan
 * @returns {String} The complete className string
 */
function getItemClassName (
  className,
  type,
  selectedType,
  wrap = false,
  userLanguage = null,
  isAccountChangePlan = false,
  userPlanSubscriptionType = null,
) {
  const cls = [className]

  if (wrap) {
    cls.push(`${className}--wrap`)
  }

  if (type === selectedType) {
    cls.push(`${className}--selected`)
  }

  if (userLanguage) {
    cls.push(`${className}--${userLanguage}`)
  }

  if (isAccountChangePlan && userPlanSubscriptionType === type) {
    cls.push(`${className}--current`)
  }

  return cls.join(' ')
}

const staticDataSchema = {
  text: '',
  linkText: null,
  linkUrl: null,
  linkEventAction: null,
  linkEventLabel: null,
  textLinkFirst: false,
  trialOnly: false,
  englishOnly: false,
  monthlyCheckmark: false,
  annualCheckmark: false,
  liveCheckmark: false,
  excludeFr: false,
}

/**
 * Function to get the static row data for the plan grid
 * @param {Map} staticText The static text per chosen user language
 * @param {String} userLanguage The 2 character string of the user's chosen language
 * @returns {List} The complete list of static data needed to render the plan grid
 */
function getStaticRowData (staticText, userLanguage) {
  let videoTitlesNum = '8000'
  let unlimitedAccessText = staticText.getIn(['data', 'unlimitedAccess'])

  if (userLanguage === DE) {
    videoTitlesNum = '1000'
  } else if (userLanguage === FR) {
    videoTitlesNum = ''
  } else if (userLanguage === ES) {
    videoTitlesNum = '2.000'
  }

  if (userLanguage === FR) {
    unlimitedAccessText = unlimitedAccessText.replace(/\$\{ numOfTitles \}\s/g, videoTitlesNum)
  } else {
    unlimitedAccessText = unlimitedAccessText.replace(/\$\{ numOfTitles \}/g, videoTitlesNum)
  }

  const staticRowData = fromJS([
    {
      ...staticDataSchema,
      text: staticText.getIn(['data', 'tryFreeForSevenDays']),
      trialOnly: true,
      monthlyCheckmark: true,
      annualCheckmark: true,
    },
    {
      ...staticDataSchema,
      text: staticText.getIn(['data', 'twelveMonthsforNine']),
      annualCheckmark: true,
    },
    {
      ...staticDataSchema,
      text: unlimitedAccessText,
      monthlyCheckmark: true,
      annualCheckmark: true,
      liveCheckmark: true,
    },
    {
      ...staticDataSchema,
      text: staticText.getIn(['data', 'watchOnYour']),
      monthlyCheckmark: true,
      annualCheckmark: true,
      liveCheckmark: true,
      excludeFr: true,
    },
    {
      ...staticDataSchema,
      text: staticText.getIn(['data', 'cancelAnytime']),
      monthlyCheckmark: true,
      annualCheckmark: true,
      liveCheckmark: true,
    },
    {
      ...staticDataSchema,
      text: `${staticText.getIn(['data', 'healthyHabits'])} ${staticText.getIn(['data', 'digitalDownloads'])}`,
      englishOnly: true,
      annualCheckmark: true,
      liveCheckmark: true,
    },
    {
      ...staticDataSchema,
      text: staticText.getIn(['data', 'livestreamAll']),
      linkText: staticText.getIn(['data', 'gaiaSphereEvents']),
      linkUrl: URL_EVENTS,
      linkEventAction: 'plan grid hyperlink',
      linkEventLabel: 'live access live events',
      textLinkFirst: true,
      liveCheckmark: true,
    },
    {
      ...staticDataSchema,
      text: `${staticText.getIn(['data', 'chatWithMembers'])} ${staticText.getIn(['data', 'participate'])}`,
      liveCheckmark: true,
    },
    {
      ...staticDataSchema,
      text: staticText.getIn(['data', 'accessFullLibrary']),
      linkText: staticText.getIn(['data', 'pastEvents']),
      linkUrl: URL_ARCHIVED_WORKSHOPS,
      linkEventAction: 'plan grid hyperlink',
      linkEventLabel: 'live access past events',
      liveCheckmark: true,
    },
  ])

  return staticRowData
}

function TopCells (props) {
  const {
    availablePlans,
    staticText,
    plans,
    userLanguage,
    userPlanSubscriptionType,
    isAccountChangePlan,
  } = props

  const cells = (
    availablePlans.map((plan, index) => {
      const id = index
      const type = getPlanSubscriptionType(plan.get('id'))

      if (isAccountChangePlan && type === userPlanSubscriptionType) {
        return (
          <div key={`savings--${id}`} className="plan-grid-v2__cell">
            <span className="plan-grid-v2__current-plan">
              {staticText.getIn(['data', 'currentPlan'])}
            </span>
          </div>
        )
      }

      if (type === PLAN_SUBSCRIPTION_ANNUAL) {
        return (
          <div key={`savings--${id}`} className="plan-grid-v2__cell plan-grid-v2__annual-savings">
            <p className={`plan-grid-v2__savings plan-grid-v2__savings--${userLanguage}`}>
              {`${staticText.getIn(['data', 'save'])} ${annualPlanPercentSavings(plans)}%`}
            </p>
          </div>
        )
      }

      return <div key={`savings--${id}`} className="plan-grid-v2__cell" />
    })
  )

  return (
    <div className="plan-grid-v2__cell-wrapper plan-grid-v2__cell-wrapper--sticky plan-grid-v2__cell-wrapper--first">
      {cells}
    </div>
  )
}

function HeadingCells (props) {
  const {
    availablePlans,
    planSelected,
    updatePlanSelected,
    userLanguage,
    isAccountChangePlan,
    userPlanSubscriptionType,
  } = props

  const headingCellsMarkup = (
    availablePlans.map((plan) => {
      const type = getPlanSubscriptionType(plan.get('id'))
      const sku = plan.get('sku')

      return (
        <div key={plan.get('id')} className="plan-grid-v2__cell">
          <Button
            className={getItemClassName(
              'plan-grid-v2__plan-btn',
              type,
              planSelected.type,
              false,
              userLanguage,
              isAccountChangePlan,
              userPlanSubscriptionType,
            )}
            onClick={() => onPlanSelected(
              type,
              sku,
              planSelected.type,
              planSelected.sku,
              updatePlanSelected,
            )}
          >
            {plan.get('heading')}
          </Button>
        </div>
      )
    })
  )

  return (
    <div className="plan-grid-v2__cell-wrapper plan-grid-v2__cell-wrapper--sticky">
      {headingCellsMarkup}
    </div>
  )
}

function HeaderRow (props) {
  const {
    availablePlans,
    staticText,
    plans,
    planSelected,
    updatePlanSelected,
    userLanguage,
    isAccountChangePlan,
    userPlanSubscriptionType,
  } = props

  return (
    <div className="plan-grid-v2__row plan-grid-v2__header">
      <div className="plan-grid-v2__header-background" />
      <div className="plan-grid-v2__left plan-grid-v2__left--no-padding" />
      <div className="plan-grid-v2__right">
        <TopCells
          staticText={staticText}
          availablePlans={availablePlans}
          plans={plans}
          userLanguage={userLanguage}
          isAccountChangePlan={isAccountChangePlan}
          userPlanSubscriptionType={userPlanSubscriptionType}
        />
        <HeadingCells
          availablePlans={availablePlans}
          planSelected={planSelected}
          updatePlanSelected={updatePlanSelected}
          userLanguage={userLanguage}
          isAccountChangePlan={isAccountChangePlan}
          userPlanSubscriptionType={userPlanSubscriptionType}
        />
        <div className="plan-grid-v2__cell-wrapper">
          <div className="plan-grid-v2__cell">
            <span className={getItemClassName(
              'plan-grid-v2__plan-arrow',
              PLAN_SUBSCRIPTION_MONTHLY,
              planSelected.type,
              false,
              null,
              isAccountChangePlan,
              userPlanSubscriptionType,
            )}
            />
          </div>
          <div className="plan-grid-v2__cell">
            <span className={getItemClassName(
              'plan-grid-v2__plan-arrow',
              PLAN_SUBSCRIPTION_ANNUAL,
              planSelected.type,
              false,
              null,
              isAccountChangePlan,
              userPlanSubscriptionType,
            )}
            />
          </div>
          <div className="plan-grid-v2__cell">
            <span className={getItemClassName(
              'plan-grid-v2__plan-arrow',
              PLAN_SUBSCRIPTION_LIVE,
              planSelected.type,
              false,
              null,
              isAccountChangePlan,
              userPlanSubscriptionType,
            )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const PricingRow = (props) => {
  const {
    availablePlans,
    selectedType,
    currencyIso,
    staticText,
    isAccountChangePlan,
    userPlanSubscriptionType,
  } = props

  const pricingCells = (
    availablePlans.map((plan) => {
      const type = getPlanSubscriptionType(plan.get('id'))

      return (
        <div
          key={plan.get('id')}
          className={
            getItemClassName(
              'plan-grid-v2__cell',
              type,
              selectedType,
              true,
              null,
              isAccountChangePlan,
              userPlanSubscriptionType,
            )
          }
        >
          <H4 className={
            getItemClassName(
              'plan-grid-v2__price',
              type,
              selectedType,
              false,
              null,
              isAccountChangePlan,
              userPlanSubscriptionType,
            )
          }
          >
            {formatPrice(currencyIso, plan.get('costs').last())}
          </H4>
          <p className={
            getItemClassName(
              'plan-grid-v2__billing-schedule',
              type,
              selectedType,
              false,
              null,
              isAccountChangePlan,
              userPlanSubscriptionType,
            )
          }
          >
            {plan.get('billingSchedule')}
          </p>
        </div>
      )
    })
  )

  return (
    <div className="plan-grid-v2__row plan-grid-v2__divider plan-grid-v2__divider--first">
      <div className="plan-grid-v2__left plan-grid-v2__left--price">
        <p className="plan-grid-v2__cell-title plan-grid-v2__cell-title--price">
          { currencyIso ? `${staticText.getIn(['data', 'price'])} (${currencyIso})` : null }
        </p>
      </div>
      <div className="plan-grid-v2__right plan-grid-v2__right--price">
        <div className="plan-grid-v2__cell-wrapper">
          {pricingCells}
        </div>
      </div>
    </div>
  )
}

const StaticRows = (props) => {
  const {
    selectedType,
    userLanguage,
    staticText,
    isLoggedIn,
    allowAuthenticatedFreeTrialSkus,
    isAccountChangePlan,
    userPlanSubscriptionType,

  } = props
  const staticData = getStaticRowData(staticText, userLanguage) || List()
  const lastIndex = staticData.size - 1

  return staticData.reduce((accumulator, row, index) => {
    const id = index
    const text = row.get('text')
    const linkText = row.get('linkText')
    const linkUrl = row.get('linkUrl')
    const linkEventAction = row.get('linkEventAction')
    const linkEventLabel = row.get('linkEventLabel')
    const textLinkFirst = row.get('textLinkFirst')
    const englishOnly = row.get('englishOnly')
    const excludeFr = row.get('excludeFr')
    const trialOnly = row.get('trialOnly')
    const monthlyCheckmark = row.get('monthlyCheckmark')
    const annualCheckmark = row.get('annualCheckmark')
    const liveCheckmark = row.get('liveCheckmark')

    if (englishOnly && userLanguage !== EN) {
      return accumulator
    }

    if (excludeFr && userLanguage === FR) {
      return accumulator
    }

    if (trialOnly && isLoggedIn && !allowAuthenticatedFreeTrialSkus) {
      return accumulator
    }

    const textLink = linkText && linkUrl ? (
      <Link
        onClick={
          linkEventAction && linkEventLabel ?
            () => handleGaEvent(linkEventAction, linkEventLabel) : null
        }
        className="plan-grid-v2__cell-link"
        to={linkUrl}
        target={TARGET_BLANK}
        scrollToTop={false}
        directLink
      >
        {linkText}
      </Link>
    ) : null

    let fullText = (
      <Fragment>
        {text}
        {
          textLink ? ' ' : null
        }
        {textLink}
      </Fragment>
    )

    // For DE we need to format the text so the link is first
    if (textLinkFirst && userLanguage === DE) {
      fullText = (
        <Fragment>
          {textLink || null}
          {
            textLink ? ' ' : null
          }
          {text}
        </Fragment>
      )
    }

    const data = (
      <div
        key={`static-${id}`}
        className={`plan-grid-v2__row plan-grid-v2__divider${index === lastIndex ? ' plan-grid-v2__row plan-grid-v2__divider--last' : ''}`}
      >
        <div className="plan-grid-v2__left">
          <p className="plan-grid-v2__cell-title">
            {fullText}
          </p>
        </div>
        <div className="plan-grid-v2__right">
          <div className="plan-grid-v2__cell-wrapper">
            {
              monthlyCheckmark ?
                <span className={getItemClassName('plan-grid-v2__cell', PLAN_SUBSCRIPTION_MONTHLY, selectedType)}>
                  <Icon
                    className={
                      getItemClassName(
                        'plan-grid-v2__checkmark',
                        PLAN_SUBSCRIPTION_MONTHLY,
                        selectedType,
                        false,
                        null,
                        isAccountChangePlan,
                        userPlanSubscriptionType,
                      )
                    }
                    type={ICON_TYPES.CHECK}
                  />
                </span> :
                <span className="plan-grid-v2__cell" />
            }
            {
              annualCheckmark ?
                <span className={getItemClassName('plan-grid-v2__cell', PLAN_SUBSCRIPTION_ANNUAL, selectedType)}>
                  <Icon
                    className={
                      getItemClassName(
                        'plan-grid-v2__checkmark',
                        PLAN_SUBSCRIPTION_ANNUAL,
                        selectedType,
                        false,
                        null,
                        isAccountChangePlan,
                        userPlanSubscriptionType,
                      )
                    }
                    type={ICON_TYPES.CHECK}
                  />
                </span> :
                <span className="plan-grid-v2__cell" />
            }
            {
              liveCheckmark ?
                <span className={getItemClassName('plan-grid-v2__cell', PLAN_SUBSCRIPTION_LIVE, selectedType)}>
                  <Icon
                    className={
                      getItemClassName(
                        'plan-grid-v2__checkmark',
                        PLAN_SUBSCRIPTION_LIVE,
                        selectedType,
                        false,
                        null,
                        isAccountChangePlan,
                        userPlanSubscriptionType,
                      )
                    }
                    type={ICON_TYPES.CHECK}
                  />
                </span> :
                <span className="plan-grid-v2__cell" />
            }
          </div>
        </div>
      </div>
    )

    return accumulator.push(data)
  }, List())
}

function getCtaText (props, allowAuthenticatedFreeTrialSkus, type, userPlanSubscriptionType) {
  const { staticText, auth, plans, isCheckoutChangePlan, isAccountChangePlan } = props
  const isLoggedIn = getAuthIsLoggedIn(auth)
  const chosenCheckoutChangePlanType = getPlanSubscriptionType(plans.getIn(['selection', 'id']))
  let ctaText = staticText.getIn(['data', 'getStartedNow'])

  if (
    (!isCheckoutChangePlan && !isAccountChangePlan &&
      !isLoggedIn && type !== PLAN_SUBSCRIPTION_LIVE) ||
    (!isCheckoutChangePlan && !isAccountChangePlan && isLoggedIn &&
      allowAuthenticatedFreeTrialSkus && type !== PLAN_SUBSCRIPTION_LIVE)
  ) {
    ctaText = staticText.getIn(['data', 'tryFreeForSevenDays'])
  }

  if (isCheckoutChangePlan && type === chosenCheckoutChangePlanType) {
    ctaText = staticText.getIn(['data', 'keepCurrent'])
  } else if (isCheckoutChangePlan && type !== chosenCheckoutChangePlanType) {
    ctaText = staticText.getIn(['data', 'changePlan'])
  }

  if (isAccountChangePlan && type === userPlanSubscriptionType) {
    ctaText = staticText.getIn(['data', 'keepCurrent'])
  } else if (isAccountChangePlan && type !== userPlanSubscriptionType) {
    ctaText = staticText.getIn(['data', 'changePlan'])
  }

  return ctaText
}

function getCheckoutCtaText (props, allowAuthenticatedFreeTrialSkus, type, userLanguage) {
  const { staticText, auth, isCheckoutChangePlan, isAccountChangePlan } = props
  const isLoggedIn = getAuthIsLoggedIn(auth)
  let ctaText = 'Select a Plan to Continue'
  if (userLanguage === ES) {
    ctaText = 'Selecciona un plan para continuar'
  } else if (userLanguage === DE) {
    ctaText = 'Um Fortzusetzen wähle ein Abo aus'
  } else if (userLanguage === FR) {
    ctaText = 'Sélectionner un abonnement pour continuer'
  }

  if (!type) {
    return ctaText
  }


  if (
    (!isCheckoutChangePlan && !isAccountChangePlan &&
      !isLoggedIn && type !== PLAN_SUBSCRIPTION_LIVE) ||
    (!isCheckoutChangePlan && !isAccountChangePlan && isLoggedIn &&
      allowAuthenticatedFreeTrialSkus && type !== PLAN_SUBSCRIPTION_LIVE)
  ) {
    ctaText = staticText.getIn(['data', 'tryFreeForSevenDays'])
  } else {
    ctaText = staticText.getIn(['data', 'getStartedNow'])
  }

  return ctaText
}

/**
 * Plan Grid component - used in the checkout flow and for marketing
 * @param {Object} props The props
 * @param {Map} props.plans The plans data
 * @param {History} props.history The history object
 * @param {Map} props.user The user data
 * @param {Map} props.staticText The static text per chosen language
 * @param {Boolean} props.isCheckoutChangePlan Whether or not the component is being initialized
 * from the checkout change plan modal
 * @param {Boolean} props.isAccountChangePlan Whether or not the component is being initialized
 * from the account change plan flow
 * @param {Function} props.dismissModal Function to dismiss the modal in checkout change plan
 * @returns The complete plan grid component
 */
function PlanGridB (props) {
  const {
    plans,
    auth,
    user,
    userAccount,
    staticText,
    isCheckoutChangePlan,
    isAccountChangePlan,
    dismissModal,
    renderModal,
    dialogName,
  } = props
  const isLoggedIn = getAuthIsLoggedIn(auth)
  const currencyIso = plans.getIn(['data', 'plans', 0, 'currencyIso'])
  const plansList = plans.getIn(['data', 'plans'], List())
  const userRatePlanId = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  const userBillingAccountId = user.getIn(['data', 'billing_account_id'])
  const allowAuthenticatedFreeTrialSkus = userRatePlanId === PLAN_ID_FREE_TRIAL &&
    !userBillingAccountId
  const skus = getPlanSkus(props)
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const chosenPlanType = getChosenPlanType(props)
  let userProductRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  if (userProductRatePlanId === PLAN_ID_COMPLIMENTARY) {
    userProductRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productRatePlanId'])
  }
  const userPlanSubscriptionType = getPlanSubscriptionType(userProductRatePlanId)
  const accountDataLoaded = isAccountChangePlan && isLoggedIn && !!userProductRatePlanId
  const accountChangePlanSuccess = userAccount.getIn(['data', 'billing', 'planChange', 'success'])
  const shouldRenderChangePlanModal = userAccount.getIn(['billingSubscriptionsProcessing']) || auth.get('processing') || accountChangePlanSuccess

  const onClickAccountChangePlan = (sku) => {
    const { setPlanChangeSelected } = props
    setPlanChangeSelected(sku)
    renderModal(TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM, {
      hideDismiss: false,
    })
  }

  const onClick303 = () => {
    const { setPlanChangeSelected } = props
    setPlanChangeSelected(PLAN_SKU_DECLINE_303)
    renderModal(TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM)
  }

  const [planSelected, updatePlanSelected] = useState({})

  const getPlans = useCallback(() => {
    return plansList.filter(val => skus.includes(val.get('sku')))
  }, [isLoggedIn, plansList, staticText])

  useEffect(() => {
    if (isAccountChangePlan) {
      updatePlanSelected({ type: chosenPlanType, sku: getPlanSubscriptionTypeSku(chosenPlanType) })
    }
  }, [accountDataLoaded])

  // Rerender the account change plan modal
  useEffect(() => {
    if (dialogName === TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM) {
      renderModal(TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM, {
        hideDismiss: !!shouldRenderChangePlanModal,
      })
    }
  }, [shouldRenderChangePlanModal])

  if (plansList.size === 0 && !accountDataLoaded) {
    return (
      <div className="plan-grid-v2">
        <SherpaMessage message={staticText.getIn(['data', 'loadingPlans'])} arrow={false} center />
      </div>
    )
  }

  const availablePlans = getPlans() || List()
  const selectedPlanDetails = availablePlans.find(plan => plan.get('sku') === planSelected.sku)

  return (
    <React.Fragment>
      <div className="plan-grid-v2">
        <div className="plan-grid-v2__table">
          {
            _size(planSelected) > 0 ?
              <div className={getPlanHighlightClass(planSelected.type)} />
              : null
          }
          <div className="plan-grid-v2__table-content">
            <HeaderRow
              availablePlans={availablePlans}
              planSelected={planSelected}
              staticText={staticText}
              plans={plans}
              updatePlanSelected={updatePlanSelected}
              userLanguage={userLanguage}
              isAccountChangePlan={isAccountChangePlan}
              userPlanSubscriptionType={userPlanSubscriptionType}
            />
            <PricingRow
              availablePlans={availablePlans}
              selectedType={planSelected.type}
              staticText={staticText}
              currencyIso={currencyIso}
              isAccountChangePlan={isAccountChangePlan}
              userPlanSubscriptionType={userPlanSubscriptionType}
            />
            <StaticRows
              selectedType={planSelected.type}
              userLanguage={userLanguage}
              staticText={staticText}
              isLoggedIn={isLoggedIn}
              allowAuthenticatedFreeTrialSkus={allowAuthenticatedFreeTrialSkus}
              isAccountChangePlan={isAccountChangePlan}
              userPlanSubscriptionType={userPlanSubscriptionType}
            />
          </div>
        </div>
        <div className={`plan-grid-v2__button-wrapper${isCheckoutChangePlan || isAccountChangePlan ? ' plan-grid-v2__button-wrapper--multiple' : ''}`}>
          {
            !isCheckoutChangePlan && !isAccountChangePlan ?
              <Button
                className={getPlanSelectButtonClassName(planSelected.type, userLanguage)}
                onClick={
                  planSelected.type ?
                    () => onChoosePlanClick(selectedPlanDetails, currencyIso, props)
                    : null
                }
                disabled={!planSelected.type}
              >
                {
                  getCheckoutCtaText(
                    props,
                    allowAuthenticatedFreeTrialSkus,
                    planSelected.type,
                    userLanguage,
                  )
                }
              </Button>
              : null
          }
          {
            isCheckoutChangePlan ?
              <React.Fragment>
                <Button
                  className="button--secondary plan-grid-v2__button"
                  onClick={() => dismissModal()}
                >
                  {staticText.getIn(['data', 'cancel'])}
                </Button>
                <Button
                  className="button--primary plan-grid-v2__button plan-grid-v2__button--last"
                  onClick={
                    planSelected.type !== chosenPlanType ?
                      () => onChoosePlanClick(selectedPlanDetails, currencyIso, props) :
                      () => dismissModal()
                  }
                >
                  {
                    getCtaText(
                      props,
                      allowAuthenticatedFreeTrialSkus,
                      planSelected.type,
                    )
                  }
                </Button>
              </React.Fragment>
              : null
          }
          {
            isAccountChangePlan ?
              <React.Fragment>
                <Button
                  className="button--secondary plan-grid-v2__button"
                  url={URL_ACCOUNT}
                  scrollToTop
                >
                  {staticText.getIn(['data', 'cancel'])}
                </Button>
                <Button
                  className="button--primary plan-grid-v2__button plan-grid-v2__button--last"
                  onClick={
                    planSelected.type !== userPlanSubscriptionType ?
                      () => onClickAccountChangePlan(planSelected.sku)
                      : null
                  }
                  url={planSelected.type === userPlanSubscriptionType ? URL_ACCOUNT : null}
                  scrollToTop
                >
                  {
                    getCtaText(
                      props,
                      allowAuthenticatedFreeTrialSkus,
                      planSelected.type,
                      userPlanSubscriptionType,
                    )
                  }
                </Button>
              </React.Fragment>
              : null
          }
        </div>
      </div>
      {_get(config, ['features', 'userAccount', 'declinePlan303']) && isAccountChangePlan ?
        <Link
          to={URL_JAVASCRIPT_VOID}
          className="my-account-change-plan__decline-link"
          onClick={onClick303}
        >
          Decline Plan - Testing Only
        </Link>
        : null
      }
    </React.Fragment>
  )
}

PlanGridB.propTypes = {
  history: PropTypes.object.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setPlansLocalizedSelection: PropTypes.func.isRequired,
  setPlanChangeSelected: PropTypes.func.isRequired,
  dismissModal: PropTypes.func.isRequired,
  isCheckoutChangePlan: PropTypes.bool,
  isAccountChangePlan: PropTypes.bool,
  renderModal: PropTypes.func.isRequired,
  dialogName: PropTypes.string,
  onClickPlan: PropTypes.func,
}

PlanGridB.defaulProps = {
  history: {},
  plans: Map(),
  auth: Map(),
  user: Map(),
  userAccount: Map(),
  staticText: Map(),
  isCheckoutChangePlan: false,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
      plans: state.plans,
      userAccount: state.userAccount,
      dialogName: state.dialog.get('componentName'),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPlansLocalizedSelection: actions.plans.setPlansLocalizedSelection,
        setPlanChangeSelected: actions.plans.setPlanChangeSelected,
        dismissModal: actions.dialog.dismissModal,
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
  connectStaticText({ storeKey: 'planGridV2' }),
)(PlanGridB)
