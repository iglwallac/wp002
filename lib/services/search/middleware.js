import _map from 'lodash/map'
import { fromJS } from 'immutable'
import {
  setAutoCompleteSearchData,
  setAutoCompleteSearchProcessing,
  setAutoCompleteSearchError,
  GET_AUTOCOMPLETE_SEARCH_DATA,
} from './actions'
import {
  getSearchAutocomplete,
} from './'

const log = console

async function getAutoCompleteSearchDataHandler ({ store, action }) {
  const { auth, user } = store.getState()

  try {
    store.dispatch(setAutoCompleteSearchProcessing({}))
    const options = {
      auth,
      language: user.getIn(['data', 'language', 0]),
      value: action.payload,
    }
    const data = await getSearchAutocomplete(options)

    store.dispatch(setAutoCompleteSearchData({
      data: fromJS(_map(data, 'value')),
    }))
  } catch (error) {
    log.error(error, 'Error getting titles data for autosuggest.')
    store.dispatch(setAutoCompleteSearchError({
      error,
    }))
  }
}

export default function middleware (store) {
  return next => (action) => {
    const { type } = action
    switch (type) {
      case GET_AUTOCOMPLETE_SEARCH_DATA:
        getAutoCompleteSearchDataHandler({ store, action })
        break
      default:
        break
    }
    next(action)
  }
}
