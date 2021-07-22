import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'
import _get from 'lodash/get'
import { createModel as createTileModel } from 'services/tile'

export const SEARCH_CONTENT_TYPES = {
  VIDEO: 'VIDEO',
  DEFAULT: 'VIDEO',
}

/**
 * The default response limit
 */
export const DEFAULT_LIMIT = 16

/**
 * Get the search auto complete
 * @param {Object} param0 The parameters
 * @param {import('immutable').Map} [param0.auth] The auth object if the user is logged in
 * @param {String|String[]} [param0.language] The request language
 * @param {String} [param0.value] The search term for auto complete
 */
export async function getSearchAutocomplete ({ auth, language, value } = {}) {
  try {
    const { body } = await apiGet(
      'search/autocomplete',
      { searchTerm: value, language },
      { auth, languageShouldBeString: true },
      TYPE_BROOKLYN_JSON,
    )
    return body
  } catch (e) {
    return {}
  }
}

export async function searchContent ({
  user,
  searchTerm,
  contentType,
  limit = DEFAULT_LIMIT,
  page = 1,
}) {
  const contentTypeFilter = {
    [SEARCH_CONTENT_TYPES.VIDEO]: 'video',
  }[contentType || SEARCH_CONTENT_TYPES.DEFAULT]
  // Search returns 0 as the first page by default.
  // We do not want user's to see this so we control the offset here
  const offsetPage = page - 1

  const language = user.getIn(['data', 'language', 0], 'en')
  const options = {
    p: offsetPage,
    pp: limit,
    language,
    useFTS: true,
    contentType: contentTypeFilter,
  }
  const res = await apiGet(`videos/search/${searchTerm}`,
    options,
    {},
    TYPE_BROOKLYN_JSON,
  )
  const body = _get(res, 'body', {})
  const data = {
    ...body,
    titles: body.titles.map(t => createTileModel(t)),
    currentPage: _get(body, 'currentPage') + 1,
  }
  const results = { data, searchTerm }
  return results
}

export default {
  getSearchAutocomplete,
  searchContent,
}
