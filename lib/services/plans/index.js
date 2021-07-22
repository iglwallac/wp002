import {
  get as apiGet,
  TYPE_BROOKLYN_JSON,
} from 'api-client'
import {
  fromJS,
  List,
  Map,
  Set,
} from 'immutable'
import _get from 'lodash/get'
import _template from 'lodash/template'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import { USD, EUR, renderSymbol as renderCurrencySymbol } from 'services/currency'
import { get as getConfig } from 'config'

const config = getConfig()

export const PLAN_SKU_MONTHLY = 'G 1M HH'
export const PLAN_SKU_ANNUAL = 'G 1Y NB'
export const PLAN_SKU_LEGACY_MONTHLY = 'GTV SB ME 1M'
export const PLAN_SKU_LEGACY_ANNUAL = 'GTV SB ME DA NT'
export const PLAN_SKU_LIVE = 'GTV 1Y LIVE'
export const PLAN_SKU_LIVE_DISCOUNTED = 'GTV 1Y LIVE DFY'
export const PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS = 'G 2WMO CB'
export const PLAN_SKU_THREE_MONTH = 'G 3MMO UM'
export const PLAN_SKU_BUY_ONE_GET_ONE_FREE = 'GAIA 2 MO'
export const PLAN_SKU_BUY_TWO_GET_TWO_FREE = 'GAIA 4 MO'
export const PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY = 'G 7DMO TY'
export const PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL = 'G 7DF ANNUAL'
export const PLAN_SKU_FREE_TRIAL = 'GAIA FREE TRIAL'
export const PLAN_SKU_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY = 'G 30DMO TY'
export const PLAN_SKU_GIFT_FOUR_MONTH = 'GAIA 4MO GIFT'
export const PLAN_SKU_GIFT_ANNUAL = 'GAIA 1Y GIFT'
export const PLAN_SKU_GIFT_LIVE = 'GAIA 1Y LIVE GIFT'
export const PLAN_SKU_DECLINE_303 = 'GTV DECLINE'
export const PLAN_SKU_SUMMIT_MONTHLY = 'G 1M TS'
export const PLAN_SKU_SUMMIT_ANNUAL = 'G 1Y TS'
export const PLAN_SKU_ONE_MONTH_TRIAL_TO_ANNUAL = 'G 30DMO TYA'

export const PLAN_ID_NINETY_NINE_CENT_TWO_WEEKS = _get(config, ['planIds', 'fourteenDay99Cent'])
export const PLAN_ID_MONTHLY = _get(config, ['planIds', 'monthly'])
export const PLAN_ID_ANNUAL = _get(config, ['planIds', 'annual'])
export const PLAN_ID_LIVE = _get(config, ['planIds', 'live'])
export const PLAN_ID_LIVE_DISCOUNTED = _get(config, ['planIds', 'liveDiscounted'])
export const PLAN_ID_THREE_MONTH = _get(config, ['planIds', 'threeMonth'])
export const PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY = _get(config, ['planIds', 'oneWeekFreeTrialToMonthly'])
export const PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL = _get(config, ['planIds', 'oneWeekFreeTrialToAnnual'])
export const PLAN_ID_LEGACY_MONTHLY = _get(config, ['planIds', 'legacyMonthly'])
export const PLAN_ID_LEGACY_ANNUAL = _get(config, ['planIds', 'legacyAnnual'])
export const PLAN_ID_BUY_ONE_GET_ONE_FREE = _get(config, ['planIds', 'buyOneGetOneFree'])
export const PLAN_ID_BUY_TWO_GET_TWO_FREE = _get(config, ['planIds', 'buyTwoGetTwoFree'])
export const PLAN_ID_FREE_TRIAL = _get(config, ['planIds', 'freeTrial'])
export const PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY = _get(config, ['planIds', 'oneDollarThirtyDaysToMonthly'])
export const PLAN_ID_GIFT_FOUR_MONTH = _get(config, ['planIds', 'fourMonthGift'])
export const PLAN_ID_GIFT_ANNUAL = _get(config, ['planIds', 'annualGift'])
export const PLAN_ID_GIFT_LIVE = _get(config, ['planIds', 'liveGift'])
export const PLAN_ID_COMPLIMENTARY = _get(config, ['planIds', 'compPlan'])
export const PLAN_ID_DECLINE_303 = '2c92c0f96b93b7fb016b9539517a3825'
export const PLAN_ID_SUMMIT_MONTHLY = _get(config, ['planIds', 'summitMonthly'])
export const PLAN_ID_SUMMIT_ANNUAL = _get(config, ['planIds', 'summitAnnual'])
export const PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL = _get(config, ['planIds', 'oneMonthTrialToAnnual'])

export const PLAN_SUBSCRIPTION_ANNUAL = 'annual'
export const PLAN_SUBSCRIPTION_MONTHLY = 'monthly'
export const PLAN_SUBSCRIPTION_LIVE = 'live'
export const PLAN_SUBSCRIPTION_COMP = 'comp'
export const PLAN_SUBSCRIPTION_UNKNOWN = 'unknown'
export const PLAN_SUBSCRIPTION_CANCELLED = 'Cancelled'
export const PLAN_TYPE_UPGRADE = 'Upgrade'
export const PLAN_TYPE_DOWNGRADE = 'Downgrade'

export const ANONYMOUS_PLAN_SKUS = List([
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_ANNUAL,
  PLAN_SKU_LIVE,
])

export const AUTHENTICATED_PLAN_SKUS = List([
  PLAN_SKU_MONTHLY,
  PLAN_SKU_ANNUAL,
  PLAN_SKU_LIVE,
])

export const GIFT_PLAN_SKUS = List([
  PLAN_SKU_GIFT_FOUR_MONTH,
  PLAN_SKU_GIFT_ANNUAL,
  PLAN_SKU_GIFT_LIVE,
])

export const PRIMARY_PLAN_SKUS = Set().union(
  ANONYMOUS_PLAN_SKUS,
  AUTHENTICATED_PLAN_SKUS,
)

export function getPlanSkus (props = {}) {
  const { isGift, auth, user } = props
  const userRatePlanId = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  const userBillingAccountId = user.getIn(['data', 'billing_account_id'])
  const allowAuthenticatedFreeTrialSkus = userRatePlanId === PLAN_ID_FREE_TRIAL && !userBillingAccountId && auth.get('jwt')
  let skus = ANONYMOUS_PLAN_SKUS

  if (isGift) {
    skus = GIFT_PLAN_SKUS
  } else if (allowAuthenticatedFreeTrialSkus) {
    skus = ANONYMOUS_PLAN_SKUS
  } else if (auth.get('jwt')) {
    skus = AUTHENTICATED_PLAN_SKUS
  }

  return skus
}

const PLAN_SCHEMA = fromJS({
  id: null,
  heading: null,
  title: null,
  sku: null,
  firstPayment: null,
  billingPeriod: [],
  currencyIso: USD,
  currencySymbol: '$',
  costs: [],
})

/**
 * Determine if the users plan is monthly, comp, or annual, or live.
 * @param {String} productRatePlanId - The product rate plan id from Zuora.
 * @returns {String} The type (monthly, annual, live, unknown)
 */
export function getPlanSubscriptionType (productRatePlanId) {
  switch (productRatePlanId) {
    case PLAN_ID_NINETY_NINE_CENT_TWO_WEEKS:
    case PLAN_ID_MONTHLY:
    case PLAN_ID_THREE_MONTH:
    case PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY:
    case PLAN_ID_LEGACY_MONTHLY:
    case PLAN_ID_BUY_ONE_GET_ONE_FREE:
    case PLAN_ID_BUY_TWO_GET_TWO_FREE:
    case PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY:
    case PLAN_ID_SUMMIT_MONTHLY:
      return PLAN_SUBSCRIPTION_MONTHLY
    case PLAN_ID_ANNUAL:
    case PLAN_ID_LEGACY_ANNUAL:
    case PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL:
    case PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL:
    case PLAN_ID_SUMMIT_ANNUAL:
      return PLAN_SUBSCRIPTION_ANNUAL
    case PLAN_ID_LIVE:
    case PLAN_ID_LIVE_DISCOUNTED:
      return PLAN_SUBSCRIPTION_LIVE
    default:
      return PLAN_SUBSCRIPTION_UNKNOWN
  }
}

/**
 * Get the sku that relates to the plan subscription type (monthly, annual, or live).
 * @param {String} type - The plan subscription type
 * @returns {String} The sku
 */
export function getPlanSubscriptionTypeSku (type) {
  let sku

  if (!type) {
    return
  }

  switch (type) {
    case PLAN_SUBSCRIPTION_MONTHLY:
      sku = PLAN_SKU_MONTHLY
      break
    case PLAN_SUBSCRIPTION_ANNUAL:
      sku = PLAN_SKU_ANNUAL
      break
    case PLAN_SUBSCRIPTION_LIVE:
      sku = PLAN_SKU_LIVE
      break
    default:
      sku = null
  }

  return sku // eslint-disable-line
}

export function determinePlanUpgradeDowngrade (selectedId, currentId) {
  const currentPlanType = getPlanSubscriptionType(currentId)
  const selectedPlanType = getPlanSubscriptionType(selectedId)

  if (currentPlanType === PLAN_SUBSCRIPTION_LIVE && selectedPlanType === PLAN_SUBSCRIPTION_ANNUAL) {
    return PLAN_TYPE_DOWNGRADE
  } else if (currentPlanType === PLAN_SUBSCRIPTION_LIVE &&
     selectedPlanType === PLAN_SUBSCRIPTION_MONTHLY) {
    return PLAN_TYPE_DOWNGRADE
  } else if (currentPlanType === PLAN_SUBSCRIPTION_MONTHLY &&
    selectedPlanType === PLAN_SUBSCRIPTION_ANNUAL) {
    return PLAN_TYPE_UPGRADE
  } else if (currentPlanType === PLAN_SUBSCRIPTION_MONTHLY &&
     selectedPlanType === PLAN_SUBSCRIPTION_LIVE) {
    return PLAN_TYPE_UPGRADE
  } else if (currentPlanType === PLAN_SUBSCRIPTION_ANNUAL &&
    selectedPlanType === PLAN_SUBSCRIPTION_LIVE) {
    return PLAN_TYPE_UPGRADE
  } else if (currentPlanType === PLAN_SUBSCRIPTION_ANNUAL &&
    selectedPlanType === PLAN_SUBSCRIPTION_MONTHLY) {
    return PLAN_TYPE_DOWNGRADE
  }
  return null
}

/**
 * Get plans data for the primary plans, currently uses data from this service.
 * {object} options - The options.
 * {string} options.language - The the language string,
 */
export function getPlans (options = {}) {
  const { language } = options
  const userLanguge = getPrimaryLanguage(language)
  switch (userLanguge) {
    case 'es':
    case 'es-LA':
      return import('./lang_es-LA.json').then(fromJS)
    case 'de':
    case 'de-DE':
      return import('./lang_de-DE.json').then(fromJS)
    case 'fr':
    case 'fr-FR':
      return import('./lang_fr-FR.json').then(fromJS)
    case 'en':
    case 'en-US':
    default:
      return import('./lang_en.json').then(fromJS)
  }
}

/**
 * Get a plan by SKU from the Billing API.
 * {object} options - The options.
 * {List} options.skus - A immutable List of SKUs to be looked up.
 * {defaultPlans=} options.defaultPlans - A List of plans to be merged with the response.
 * {currencyOverride} options.currencyOverride - an optional currency string to use for
 * for logged in users instead of country
 */
export async function getPlansLocalized (options = {}) {
  const {
    skus,
    language,
    defaultPlans = List(),
    currencyOverride,
  } = options
  if (!List.isList(skus)) {
    throw new Error('Get plans localized requires a list of skus')
  }
  try {
    const res = await apiGet('v1/billing/plans', { skus: skus.toJS(), language, currencyOverride }, null, TYPE_BROOKLYN_JSON)
    return handlePlansLocalized(res, defaultPlans, language)
  } catch (e) {
    return handlePlansLocalized({}, defaultPlans, language, true)
  }
}

export function handlePlansLocalized (res, defaultPlans, language, _dataError) {
  const plans = fromJS(_get(res, 'body', []))

  return Map({
    _dataError,
    language,
    plans: plans.map((val) => {
      const defaultPlan = defaultPlans.find(item => item.get('sku') === val.get('sku'))
      const plan = _dataError && defaultPlan ? defaultPlan : val
      return createPlanLocalized(plan, defaultPlan, _dataError)
    }),
  })
}

export function createPlanLocalized (plan, defaultPlan) {
  const billingPeriod = plan.get('billingPeriod', List())
  let shortDetails
  /* eslint-disable no-template-curly-in-string */
  if (defaultPlan) {
    shortDetails = defaultPlan.get('shortDetails', '')
    shortDetails = String(shortDetails)
      .replace(/\$\{ currencySymbol \}/g, plan.get('currencySymbol', '$'))
      .replace(/\$\{ costs\[0\] \}/g, plan.getIn(['costs', 0]))
      .replace(/\$\{ costs\[1\] \}/g, plan.getIn(['costs', 1]))
      .replace(/\$\{ currencyIso \}/g, plan.get('currencyIso', USD))
      .replace(/\$\{ entitlementDays \}/g, plan.get('entitlementDays', ''))
  }

  const dataPlan = PLAN_SCHEMA.merge({
    id: plan.get('id', null),
    heading: plan.get('heading', null),
    title: plan.get('title', null),
    sku: plan.get('sku', null),
    firstPayment: plan.get('firstPayment', null),
    billingPeriod: billingPeriod && billingPeriod.size > 0 ? billingPeriod.map(period => renderPlanTemplate(plan, period)) : '',
    shortDetails,
    currencyIso: plan.get('currencyIso', USD),
    currencySymbol: plan.get('currencySymbol', '$'),
    costs: plan.get('costs', List()),
    segments: plan.get('segments', List()),
    country: plan.get('country', ''),
    entitlementDays: plan.get('entitlementDays', null),
  })

  // We were provide a plan which means we should merge the plan.
  if (defaultPlan) {
    const defaultBillingPeriod = defaultPlan.get('billingPeriod', List())

    // Render the details from the defaultPlan using the fetched plan.
    return defaultPlan.merge(Map({
      id: plan.get('id', null),
      currencyIso: plan.get('currencyIso', USD),
      currencySymbol: plan.get('currencySymbol', '$'),
      costs: plan.get('costs', List()),
      segments: plan.get('segments', List()),
      billingPeriod: defaultBillingPeriod && defaultBillingPeriod.size > 0 ? defaultBillingPeriod.map(period => renderPlanTemplate(dataPlan, period)) : '',
      shortDetails,
      country: plan.get('country', ''),
      entitlementDays: plan.get('entitlementDays', null),
    }))
  }
  return dataPlan
  /* eslint-enable no-template-curly-in-string */
}

/**
 * Replace text tokens using plan data.
 * {Map} plan - The plan data as an immutable map.
 * {string} text - The text with tokens to replace.
 */
export function renderPlanTemplate (plan, template) {
  try {
    return _template(template)(plan.toJS())
  } catch (e) {
    // Do nothing
  }
  return template
}

export const getPlanData = (plans) => {
  let monthlyPlan = Map()
  let annualPlan
  let livePlan
  let liveDiscountedPlan
  let monthlyPlanPrice
  let annualPlanPrice
  let livePlanPrice
  let liveDiscountedPlanPrice
  let annualPlanFull
  let livePlanFull
  let liveDiscountedPlanFull

  const planData = plans.getIn(['data', 'plans'])
  planData.find((plan) => {
    if (plan.get('sku') === PLAN_SKU_MONTHLY) {
      monthlyPlan = plan
    } else if (plan.get('sku') === PLAN_SKU_ANNUAL) {
      annualPlan = plan
    } else if (plan.get('sku') === PLAN_SKU_LIVE) {
      livePlan = plan
    } else if (plan.get('sku') === PLAN_SKU_LIVE_DISCOUNTED) {
      liveDiscountedPlan = plan
    }
    return null
  })
  const currencySymbol = monthlyPlan.get('currencySymbol')
  const monthlySku = monthlyPlan.get('sku')
  const annualSku = annualPlan.get('sku')
  const liveSku = livePlan.get('sku')
  const liveDiscountedSku = liveDiscountedPlan.get('sku')
  // check if euro to put symbol after amount
  if (monthlyPlan.get('currencyIso') === EUR && annualPlan.get('currencyIso') === EUR) {
    monthlyPlanPrice = monthlyPlan.getIn(['costs', 0]) + currencySymbol
    annualPlanPrice = (annualPlan.getIn(['costs', 0]) / 12).toFixed(2) + currencySymbol
    annualPlanFull = annualPlan.getIn(['costs', 0]) + currencySymbol
    livePlanPrice = (livePlan.getIn(['costs', 0]) / 12).toFixed(2) + currencySymbol
    livePlanFull = livePlan.getIn(['costs', 0]) + currencySymbol
    liveDiscountedPlanPrice = (liveDiscountedPlan.getIn(['costs', 0]) / 12).toFixed(2) + currencySymbol
    liveDiscountedPlanFull = liveDiscountedPlan.getIn(['costs', 0]) + currencySymbol
  } else {
    monthlyPlanPrice = currencySymbol + monthlyPlan.getIn(['costs', 0])
    annualPlanPrice = currencySymbol + (annualPlan.getIn(['costs', 0]) / 12).toFixed(2)
    annualPlanFull = currencySymbol + annualPlan.getIn(['costs', 0])
    livePlanPrice = currencySymbol + (livePlan.getIn(['costs', 0]) / 12).toFixed(2)
    livePlanFull = currencySymbol + livePlan.getIn(['costs', 0])
    liveDiscountedPlanPrice = currencySymbol + (liveDiscountedPlan.getIn(['costs', 0]) / 12).toFixed(2)
    liveDiscountedPlanFull = currencySymbol + liveDiscountedPlan.getIn(['costs', 0])
  }
  return {
    monthlyPlanPrice,
    annualPlanPrice,
    annualPlanFull,
    livePlanPrice,
    livePlanFull,
    liveDiscountedPlanPrice,
    liveDiscountedPlanFull,
    monthlySku,
    annualSku,
    liveSku,
    liveDiscountedSku,
  }
}

export function annualPlanPercentSavings (plans) {
  const planData = plans.getIn(['data', 'plans'])
  const annualPlan = planData.find((plan) => {
    return plan.get('sku') === PLAN_SKU_ANNUAL
  })
  let monthlyPlan = planData.find((plan) => {
    return plan.get('sku') === PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS
  })
  if (!monthlyPlan) monthlyPlan = Map()
  const annualPlanPricePerMonth = (annualPlan.getIn(['costs', 0])) / 12
  const monthlyPlanPrice = monthlyPlan.getIn(['costs']).last()
  const priceDifference = (monthlyPlanPrice - annualPlanPricePerMonth).toFixed(2)
  const percentSavings = Math.floor(((priceDifference / monthlyPlanPrice) * 100).toFixed(2))
  return percentSavings
}

export function formatPrice (currencyIso, amount) {
  if (!currencyIso || !amount) {
    return undefined
  }

  let price = ''

  if (currencyIso === EUR) {
    price = `${String(amount).replace(/\.00$/, '').replace(/\./, ',')} ${renderCurrencySymbol(currencyIso)}`
  } else {
    price = `${renderCurrencySymbol(currencyIso)}${String(amount).replace(/\.00$/, '')}`
  }

  return price
}

export function getNextPriceFromPlan (plan) {
  if (!plan) {
    return null
  }
  const priceNext = plan.getIn(['segments', 1, 'price'])
  if (!priceNext) {
    return 'N/A'
  }

  // if currency is EUR, format EUR pricing
  if (plan.get('currencyIso') === EUR) {
    return `${String(priceNext).replace(/\.00$/, '').replace(/\./, ',')} ${plan.get('currencySymbol')}`
  }
  return `${plan.get('currencySymbol')}${String(priceNext).replace(/\.00$/, '')}`
}
