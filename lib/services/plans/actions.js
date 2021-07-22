import {
  getPlans,
  getPlansLocalized,
} from 'services/plans'
import {
  List,
  Map,
} from 'immutable'

export const RESET_PLANS_DATA = 'RESET_PLANS_DATA'
export const SET_PLANS_LOCALIZED_PROCESSING = 'SET_PLANS_LOCALIZED_PROCESSING'
export const SET_PLANS_DATA = 'SET_PLANS_DATA'
export const SET_PLANS_SELECTION = 'SET_PLANS_SELECTION'
export const SET_PLANS_PROCESSING = 'SET_PLANS_PROCESSING'
export const SET_PLANS_ERROR = 'SET_PLANS_ERROR'
export const SET_PLAN_CHANGE_SELECTED = 'SET_PLAN_CHANGE_SELECTED'

export function resetPlansData () {
  return {
    type: RESET_PLANS_DATA,
  }
}

/**
 * Get plans data to be used in plan displays.
 * {object} options - The options.
 * {string|array} options.language - The language or array of languages.
 */
export function getPlansData (options) {
  const { language, currency } = options
  return async function getPlansDataThunk (dispatch) {
    try {
      dispatch(setPlansProccesing(true))
      const data = await getPlans({ language })
      const plans = data.get('plans', List())
      const skus = plans.map(plan => plan.get('sku'))

      // We are not done yet, now we need to localize
      const plansLocalized = await getPlansLocalized({
        skus,
        language,
        defaultPlans: plans,
        currencyOverride: currency,
      })
      dispatch(setPlansData(plansLocalized))

      return plansLocalized
    } catch (e) {
      dispatch(setPlansProccesing(false))
    }

    return Map()
  }
}

/**
 * Get a localized version of the selected plan and set the selection.
 * {string|Map} value - A string SKU will just use fetched data, a Map will cause
 * the fetched data to be merged.
 */
export function setPlansLocalizedSelection (options) {
  return async function setPlansLocalizedSelectionThunk (dispatch) {
    try {
      const { sku, plan, language, currency } = options || {}
      // If there is a SKU use it otherwise use the plan
      const skus = List([sku || plan.get('sku')])
      const defaultPlans = Map.isMap(plan) ? List([plan]) : undefined
      dispatch(setPlansLocalizedProccesing(true))
      const data = await getPlansLocalized({
        skus,
        defaultPlans,
        language,
        currencyOverride: currency,
      })
      const plans = data.get('plans', List())

      if (data.get('_dataError') || plans.size === 0) {
        dispatch(setPlansError(true))
      } else {
        dispatch(setPlansSelection(plans.first()))
      }

      return data
    } catch (e) {
      dispatch(setPlansLocalizedProccesing(false))
      dispatch(setPlansError(true))
    }

    return Map()
  }
}

export function setPlansLocalizedProccesing (value) {
  return {
    type: SET_PLANS_LOCALIZED_PROCESSING,
    payload: value,
  }
}

export function setPlansData (data, processing = false) {
  return {
    type: SET_PLANS_DATA,
    payload: { data, processing },
  }
}

export function setPlansSelection (data, processing = false) {
  return {
    type: SET_PLANS_SELECTION,
    payload: { data, processing },
  }
}

export function setPlansProccesing (value) {
  return {
    type: SET_PLANS_PROCESSING,
    payload: value,
  }
}

export function setPlansError (error, processing = false) {
  return {
    type: SET_PLANS_ERROR,
    payload: { error, processing },
  }
}

export function setPlanChangeSelected (data) {
  return {
    type: SET_PLAN_CHANGE_SELECTED,
    payload: data,
  }
}
