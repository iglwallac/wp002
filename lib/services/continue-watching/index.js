/* eslint-disable global-require import/prefer-default-export */
import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isNil from 'lodash/isNil'
import {
  createModel as createTileModel,
} from 'services/tile'
import { EN } from 'services/languages/constants'

export const DEFAULT_LIMIT = 12

const SCHEMA = {
  currentPage: 0,
  totalCount: 0,
  titles: [],
  _dataError: null,
}


function ensureLanguageDefault (language) {
  return _isNil(language) || language === '' ? EN : language
}

export async function getContinueWatching (options) {
  const {
    page = 0,
    limit = DEFAULT_LIMIT,
    auth,
    xff,
  } = options
  const language = ensureLanguageDefault(_get(options, 'language'))

  try {
    const res = await apiGet(
      'user/continue-watching-plays',
      { p: page, pp: limit, language },
      { auth, xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleContinueWatchingResponse(res)
  } catch (e) {
    return handleContinueWatchingResponse({}, true)
  }
}

export function handleContinueWatchingResponse (res, _dataError) {
  const {
    body = {},
  } = res
  const {
    currentPage = 0,
    totalCount = 0,
    titles = [],
  } = body

  return _assign(_cloneDeep(SCHEMA), {
    currentPage,
    totalCount,
    _dataError,
    titles: _map(titles, title => createTileModel(title)),
  })
}
