import { URL_FILMS_DOCS } from 'services/url/constants'
import { SET_RESOLVER_DATA } from 'services/resolver/actions'
import { getFilterSetData } from 'services/filter-set/actions'
import {
  FILTER_SET_FILM,
} from 'services/filter-set'
import {
  SET_USER_DATA_LANGUAGE,
} from 'services/user/actions'
import _get from 'lodash/get'
import { get as getConfig } from 'config'

const config = getConfig()

// TODO: implement for all classic facet pages, not just films & docs
function isFilteredPage ({ state }) {
  const { resolver } = state
  const { features } = config
  const filmFiltersEnabled = _get(features, ['filmFilters', 'enabled'])
  const isFilm = resolver.get('path').includes(URL_FILMS_DOCS)
  return isFilm && filmFiltersEnabled
}

function getFilterSetByLocation () {
  // TODO: Update when used on other pages
  return FILTER_SET_FILM
}

// eslint-disable-next-line import/prefer-default-export
export function getFilterSet ({ after }) {
  return after(SET_RESOLVER_DATA, async ({ dispatch, state }) => {
    const { user } = state
    dispatch(getFilterSetData({ filterSet: getFilterSetByLocation(), user }))
  })
    .when(isFilteredPage)
}

export function filterLanguageChange ({ after }) {
  return after(SET_USER_DATA_LANGUAGE, async ({ state, dispatch }) => {
    const { user } = state
    dispatch(getFilterSetData({ filterSet: getFilterSetByLocation(), user }))
  })
    .when(isFilteredPage)
}
