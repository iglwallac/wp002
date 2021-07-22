import { Map, List } from 'immutable'
import { get, isValid } from 'services/filter-set'

export const SET_FILTER_SET_DATA = 'SET_FILTER_SET_DATA'
export const SET_FILTER_SET_PROCESSING = 'SET_FILTER_SET_PROCESSING'
export const SET_FILTER_SET_EXPANDED = 'SET_FILTER_SET_EXPANDED'
export const SET_FILTER_SET_VISIBLE = 'SET_FILTER_SET_VISIBLE'
export const RESET_FILTER_SET_DATA = 'RESET_FILTER_SET_DATA'

export function getFilterSetData (options) {
  const { filterSet, user = Map() } = options
  const userLanguage = user.getIn(['data', 'language'], List())
  const language = userLanguage.size > 0 ? userLanguage.toJS() : undefined

  return function getFilterDataThunk (dispatch) {
    if (!isValid(filterSet)) {
      dispatch(setFilterSetData(filterSet, Map()))
      return
    }
    dispatch(setFilterSetProcessing(filterSet, true))
    get({ filterSet, language }).then((result) => {
      dispatch(setFilterSetData(filterSet, result.get('data')))
    })
  }
}

export function setFilterSetData (filterSet, data, processing = false) {
  return {
    type: SET_FILTER_SET_DATA,
    payload: { filterSet, data, processing },
  }
}

export function resetFilterSetData () {
  return {
    type: RESET_FILTER_SET_DATA,
    payload: {},
  }
}

export function setFilterSetProcessing (filterSet, value) {
  return {
    type: SET_FILTER_SET_PROCESSING,
    payload: { filterSet, value },
  }
}

export function setFilterSetExpanded (value) {
  return {
    type: SET_FILTER_SET_EXPANDED,
    payload: value,
  }
}

export function setFilterSetVisible (value) {
  return {
    type: SET_FILTER_SET_VISIBLE,
    payload: value,
  }
}
