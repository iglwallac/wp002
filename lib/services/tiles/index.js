import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _has from 'lodash/has'
import _last from 'lodash/last'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import _range from 'lodash/range'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'
import _parseInt from 'lodash/parseInt'
import _isNil from 'lodash/isNil'
import { Promise as BluebirdPromise } from 'bluebird'
import {
  get as apiGet,
  TYPE_BROOKLYN,
  TYPE_BROOKLYN_JSON,
} from 'api-client'
import {
  createModel as createTileModel,
  createStandardModel as createStandardTileModel,
  createSeriesLinkModel as createTileSeriesLinkModel,
} from 'services/tile'
import {
  PLAYLIST_TYPE_DEFAULT,
} from 'services/playlist'
import { TYPE_PLACEHOLDER } from 'services/content-type'
import {
  RESOLVER_TYPE_SUBCATEGORY,
  RESOLVER_TYPE_NODE,
  RESOLVER_TYPE_CLASSIC_FACET,
} from 'services/resolver/types'
import {
  isValid as isValidFilterSet,
} from 'services/filter-set'
import { get as getRelated } from 'services/related'
import strictUriEncode from 'strict-uri-encode'
import { EN } from 'services/languages/constants'
import {
  YOGA_FITNESS_ID,
  ALL_YOGA_PRACTICES_ID,
  ALL_FILMS_ID,
  RECIPES_ID,
} from 'services/upstream-context'

export const TYPE_RELATED = 'related'
export const TYPE_FEATURED_EPISODE = 'featuredEpisode'
export const TYPE_NEXT_EPISODE = 'nextEpisode'
export const TYPE_EXACT = 'exact'
export const TYPE_PLAYLIST = 'playlist'
export const TYPE_NEXT_VIDEO = 'nextVideo'
export const TYPE_SEARCH = 'search'
export const TYPE_RECENTLY_ADDED = 'recentlyAdded'
export const TYPE_WATCH_HISTORY = 'watchHistory'
export const TYPE_SERIES_SEASON = 'seriesSeason'
export const TYPE_SERIES_EPISODES = 'seriesEpisodes'
export const DEFAULT_LIMIT = 16
export const TILE_LIMIT_LARGE = 36

const SCHEMA = {
  id: null,
  _dataError: null,
  limit: null,
  page: null,
  totalCount: 0,
  currentPage: 0,
  totalPages: 0,
  nextPage: null,
  prevPage: null,
  titles: [],
  classicFacets: null,
  sortType: '',
}

/**
 * Create tile placeholder for use in an application while tiles are loading
 */
export function getPlaceholderTitles () {
  return _map(_range(-4, 0), id => ({ id, type: { content: TYPE_PLACEHOLDER } }))
}

/**
 * Create tiles given content data models
 * @param {Object} data The data
 * @param {Object[]} data.titles The content data as titles
 * @param {Number} id The tile id
 * @param {Number} page The current page
 * @param {Number} limit The limit per page
 * @param {Boolean} _dataError True when an error is encountered
 * @param {String} locale The data locale
 */
function createModel (data, id, page, limit, _dataError, locale) {
  const totalCount = _parseInt(_get(data, 'totalCount', 0))
  const totalPages =
    totalCount > 0 && limit > 0 ? Math.ceil(totalCount / limit) : 0
  const currentPage = _parseInt(_get(data, 'currentPage', 1))
  const classicFacets = _get(data, 'classicFacets', null)
  const sortType = _get(data, 'sortType', '')
  let nextPage = null
  let prevPage = null
  if (totalPages !== 0 && currentPage < totalPages) {
    nextPage = currentPage + 1
  }
  if (totalPages !== 0 && currentPage > 0) {
    prevPage = currentPage - 1
  }
  return _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    limit,
    page,
    totalCount,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    titles: _map(_get(data, 'titles', []), tile => createTileModel(tile, locale)),
    messages: _get(data, 'messages', []),
    classicFacets,
    sortType,
  })
}

function createStandardModel (data, id, page, limit, _dataError) {
  const totalCount = _parseInt(_get(data, 'totalCount', 0))
  const totalPages =
    totalCount > 0 && limit > 0 ? Math.ceil(totalCount / limit) : 0
  const currentPage = _parseInt(_get(data, 'currentPage', 1))
  let nextPage = null
  let prevPage = null
  if (totalPages !== 0 && currentPage < totalPages) {
    nextPage = currentPage + 1
  }
  if (totalPages !== 0 && currentPage > 0) {
    prevPage = currentPage - 1
  }
  return _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    limit,
    page,
    totalCount,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    titles: _map(_get(data, 'videos', []), tile => createStandardTileModel(tile)),
  })
}

function createNextEpisodesModel (data, id, seriesLink, _dataError) {
  const model = _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    page: 0,
    totalCount: _size(data),
    currentPage: 1,
    totalPages: 1,
    titles: _map(data, createStandardTileModel),
  })
  if (seriesLink) {
    _set(model, 'titles', createTitlesSeriesLink(model))
  }
  return _assign(model)
}

function createPlaylistModel (data, id, page, limit, _dataError) {
  const totalCount = _parseInt(_get(data, 'totalCount', 0))
  const totalPages =
    totalCount > 0 && limit > 0 ? Math.ceil(totalCount / limit) : 0
  const currentPage = _parseInt(_get(data, 'currentPage', 1))
  let nextPage = null
  let prevPage = null
  if (totalPages !== 0 && currentPage < totalPages) {
    nextPage = currentPage + 1
  }
  if (totalPages !== 0 && currentPage > 0) {
    prevPage = currentPage - 1
  }
  return _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    limit,
    page,
    totalCount,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    titles: _map(_get(data, 'videos', []), tile => createTileModel(tile)),
  })
}

function createNextVideoModel (data, id, _dataError) {
  return _assign(_cloneDeep(SCHEMA), {
    id,
    _dataError,
    titles: _map(_get(data, 'videos', []), tile => createTileModel(tile)),
  })
}

function createFeaturedEpisodeModel (data, id, _dataError) {
  const featuredContent = _get(data, 'featuredVideo', null)
  // if no featured video, use null for titles
  const titles = featuredContent
    ? [createStandardTileModel(featuredContent)]
    : null

  return _assign(_cloneDeep(SCHEMA), {
    id,
    titles,
    _dataError,
  })
}

function ensureLanguageDefault (language) {
  return _isNil(language) || language === '' ? EN : language
}

/**
 * If next episodes key, append link to full series to titles. Need at least one
 *  title to get series path.
 * If shelf episodes key, append link to full series to titles. If 8 titles, replace the last title.
 * Need at least one title to get series path.
 */
export function createTitlesSeriesLink (data, maxLength = 8) {
  const titles = _cloneDeep(_get(data, 'titles', []))
  const length = titles.length
  // Append if < 8. Takes care episodes next (<=3 tiles) or shelf episodes (<=8 tiles).
  const path = _get(_last(titles), 'seriesPath')
  if (length > 0 && length < maxLength) {
    titles.push(createTileSeriesLinkModel(path))
  } else if (length === maxLength) {
    // If maxLength tiles, replace the last one to make it a series link.
    const lastIndex = maxLength - 1
    titles[lastIndex] = createTileSeriesLinkModel(path)
  }
  return titles
}

export function get (id, options, page, limit, query, uid, auth, seriesId) {
  const type = _get(options, 'type')
  const xff = _get(options, 'xff')
  const country = _get(options, 'country')
  const language = ensureLanguageDefault(_get(options, 'language'))
  const playlistType = _get(options, 'playlistType')

  // Avoid pass by reference issues.
  // WIll be deprecated, user getPage instead
  // eslint-disable-next-line no-param-reassign
  query = query ? _cloneDeep(query) : {}
  if (country) {
    // eslint-disable-next-line no-param-reassign
    query.country = country
  }
  switch (type) {
    case TYPE_EXACT:
      return getExact({ id, auth, xff, language })
    case TYPE_FEATURED_EPISODE:
      return getFeaturedEpisode({ id, auth, xff, language })
    case TYPE_RELATED:
      return getRelated({ id, uid, auth, page, limit, xff, language, country })
    case TYPE_NEXT_EPISODE:
      return getNextEpisodes({ seriesId, id, xff, language })
    case TYPE_PLAYLIST:
      return getPlaylist({ id, auth, page, limit, xff, language, playlistType })
    case TYPE_NEXT_VIDEO:
      return getNextVideos({ id, limit, auth, xff, language })
    case TYPE_SEARCH:
      return getSearchTerm({ term: id, page, limit, xff, language, query, country })
    case TYPE_WATCH_HISTORY:
      return getWatchHistory({ id, page, limit, xff, language, auth })
    case RESOLVER_TYPE_NODE:
      if (options.season) {
        return getSeriesSeason({
          id,
          season: options.season,
          page,
          limit,
          xff,
          language,
        })
      }
      return getSeries({ id, page, limit, xff, language })
    case TYPE_RECENTLY_ADDED: {
      const locale = options.locale
      return getRecentlyAdded({ id, page, limit, locale, language })
    }
    case RESOLVER_TYPE_CLASSIC_FACET:
      return getClassicFacet({
        id,
        filterSet: undefined,
        filter: undefined,
        query,
        page,
        limit,
        xff,
        language,
      })
    case RESOLVER_TYPE_SUBCATEGORY:
    default:
      return getTerm({ id, query, page, limit, xff, language })
  }
}

export function getPage (options) {
  const {
    id,
    seriesId,
    seriesLink,
    season,
    country,
    type,
    filter,
    filterSet,
    query,
    page,
    auth,
    limit = DEFAULT_LIMIT,
    locale,
    xff,
    sort,
    playlistType,
  } = options
  const language = ensureLanguageDefault(_get(options, 'language'))
  // Avoid pass by reference issues.
  const srvQuery = query ? _cloneDeep(query) : {}
  switch (type) {
    case TYPE_EXACT:
      return getExact({ id, auth, xff, language })
    case TYPE_FEATURED_EPISODE:
      return getFeaturedEpisode({ id, auth, xff, language })
    case TYPE_RELATED:
      return getRelated({ id, auth, page, limit, xff, language, country })
    case TYPE_SERIES_EPISODES:
      return getSeries({ id, page, limit, xff, language })
    case TYPE_SERIES_SEASON:
      return _isNil(season)
        ? getSeries({ id, page, limit, xff, language })
        : getSeriesSeason({ id, season, page, limit, xff, language })
    case TYPE_RECENTLY_ADDED:
      return getRecentlyAdded({ id, page, limit, locale, xff, language })
    case TYPE_WATCH_HISTORY:
      return getWatchHistory({ id, page, limit, locale, xff, language, auth })
    case RESOLVER_TYPE_CLASSIC_FACET:
      return getClassicFacet({
        id,
        filterSet,
        filter,
        query: srvQuery,
        page,
        limit,
        xff,
        language,
        country,
        sort,
      })
    case TYPE_NEXT_EPISODE:
      return getNextEpisodes({
        seriesId,
        seriesLink,
        id,
        xff,
        language,
        country,
      })
    case TYPE_PLAYLIST:
      return getPlaylist({ id, auth, page, limit, xff, language, playlistType })
    case TYPE_SEARCH:
      return getSearchTerm({ term: id, page, limit, xff, language, query: srvQuery, country })
    case RESOLVER_TYPE_SUBCATEGORY:
      // make facet call for yoga to refresh filters
      if (id === ALL_YOGA_PRACTICES_ID
        || id === YOGA_FITNESS_ID
        || id === ALL_FILMS_ID
        || id === RECIPES_ID) {
        return getClassicFacet({
          id,
          filterSet,
          filter,
          query: srvQuery,
          page,
          limit,
          xff,
          auth,
          language,
          country,
          sort,
        })
      }
      return getTerm({
        id,
        query: srvQuery,
        page,
        limit,
        xff,
        language,
        country,
        sort,
      })
    default:
      return getTerm({
        id,
        query: srvQuery,
        page,
        limit,
        xff,
        language,
        country,
        sort,
      })
  }
}

export async function getExact (options) {
  const { id, xff, language } = options
  try {
    const res = await apiGet(
      `node/${strictUriEncode(id)}`,
      { language },
      { xff },
      TYPE_BROOKLYN,
    )
    return handleExactResponse(res, id)
  } catch (e) {
    return handleExactResponse({}, id, true)
  }
}

export function handleExactResponse (res, id, _dataError) {
  const data = _get(res, 'body', {})
  return {
    id,
    _dataError,
    titles: [createTileModel(data)],
  }
}

export async function getFeaturedEpisode (options) {
  const { id, auth, xff, language } = options
  try {
    const res = await apiGet(
      `v5/videos/series/${strictUriEncode(id)}/featured`,
      { language },
      { auth, xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleFeaturedEpisode(res, id)
  } catch (e) {
    return handleFeaturedEpisode({}, id, true)
  }
}

export function handleFeaturedEpisode (res, id, _dataError) {
  const data = _get(res, 'body', {})
  return createFeaturedEpisodeModel(data, id, _dataError)
}

export async function getNextVideos (options) {
  const { id, limit, auth, xff, language } = options
  try {
    const res = await apiGet(
      `v2/videos/${strictUriEncode(id)}/next-videos`,
      { limit, language },
      { auth, xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleNextVideosResponse(res, id)
  } catch (e) {
    return handleNextVideosResponse({}, id, true)
  }
}

export function handleNextVideosResponse (res, id, _dataError) {
  const data = _get(res, 'body', {})
  return createNextVideoModel(data, id, _dataError)
}

/**
 * Get a video terms response
 * @param {Object} options The options
 * @returns {Object} The transformed response
 */
export async function getTerm (options) {
  const {
    id,
    query,
    page = 0,
    limit = DEFAULT_LIMIT,
    xff,
    language,
    country = 'US',
    sort, // skunk 156
  } = options
  const apiQuery = {
    language,
    country,
    p: page,
    pp: limit,
  }
  const querySort = _get(query, 'sort')
  if (querySort) {
    _set(apiQuery, 'sort', querySort)
  } else if (sort) {
    _set(apiQuery, 'sort', sort)
  }
  try {
    const res = await apiGet(
      `videos/term/${strictUriEncode(id)}`,
      apiQuery,
      { xff },
      TYPE_BROOKLYN,
    )
    return handleTermResponse(res, id, page, limit)
  } catch (e) {
    return handleTermResponse({}, id, page, limit, true)
  }
}

export function handleTermResponse (res, id, page, limit, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, id, page, limit, _dataError)
}

/**
 * Get recently added data as tites
 * @param {Object} options The options
 * @param {Number} options.id The id
 * @param {Number} options.page The page
 * @param {Number} options.limit The limit per page
 * @param {String} options.locale The locale
 * @param {String} options.language The user language
 */
export async function getRecentlyAdded (options = {}) {
  const { id, page, limit, locale, language } = options
  try {
    const res = await apiGet(
      'videos/recently_added',
      { p: page, pp: limit, language },
      null,
      TYPE_BROOKLYN,
    )
    return handleRecentlyAddedResponse(res, id, page, limit, locale)
  } catch (e) {
    return handleRecentlyAddedResponse({}, id, page, limit, locale, true)
  }
}

export function handleRecentlyAddedResponse (
  res,
  id,
  page,
  limit,
  locale,
  _dataError,
) {
  const data = _get(res, 'body', {})
  return createModel(data, id, page, limit, _dataError, locale)
}

export async function getWatchHistory (options) {
  const { id, page, limit, locale, language, auth } = options
  try {
    const res = await apiGet(
      'v2/user/recently-watched',
      { p: page, pp: limit, language },
      { auth },
      TYPE_BROOKLYN_JSON,
    )
    return handleWatchHistoryResponse(res, id, page, limit, locale)
  } catch (e) {
    return handleWatchHistoryResponse({}, id, page, limit, locale, true)
  }
}

export function handleWatchHistoryResponse (
  res,
  id,
  page,
  limit,
  locale,
  _dataError,
) {
  const data = _get(res, 'body', {})
  return createModel(data, id, page, limit, _dataError, locale)
}

export async function getSeries (options) {
  const { id, page = 0, limit = DEFAULT_LIMIT, xff, language } = options
  try {
    const res = await apiGet(
      `v2/videos/series/${strictUriEncode(id)}`,
      { p: page, pp: limit, language },
      { xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleSeriesResponse(res, id, page, limit)
  } catch (e) {
    return handleSeriesResponse({}, id, page, limit, true)
  }
}

export async function getSeriesSeason (options) {
  const {
    id,
    season,
    page = 0,
    limit = DEFAULT_LIMIT,
    xff,
    language,
  } = options
  try {
    const res = await apiGet(
      `v2/videos/series/${strictUriEncode(id)}/season/${strictUriEncode(
        season,
      )}`,
      { p: page, pp: limit, language },
      { xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleSeriesResponse(res, id, page, limit)
  } catch (e) {
    return handleSeriesResponse({}, id, page, limit, true)
  }
}

export function handleSeriesResponse (res, id, page, limit, _dataError) {
  const data = _get(res, 'body', {})
  return createStandardModel(data, id, page, limit, _dataError)
}

export async function getNextEpisodes (options) {
  // page and limit are not needed for the api call, but needed down the chain
  const {
    seriesId,
    seriesLink,
    id,
    page = 0,
    limit = DEFAULT_LIMIT,
    xff,
    language,
    country,
  } = options
  try {
    const res = await apiGet(
      `v2/videos/series/${strictUriEncode(
        seriesId,
      )}/after-video/${strictUriEncode(id)}`,
      { language, country },
      { xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleNextEpisodeResponse(res, id, page, limit, seriesLink)
  } catch (e) {
    return handleNextEpisodeResponse({}, id, page, limit, seriesLink, true)
  }
}

export function handleNextEpisodeResponse (
  res,
  id,
  page,
  limit,
  seriesLink,
  _dataError,
) {
  const data = _get(res, 'body', {})
  // @TODO Paging is coming keep page and limit
  return createNextEpisodesModel(data, id, seriesLink, _dataError)
}

function createClassicFacetQuery (query = {}) {
  const params = [
    'duration',
    'style',
    'level',
    'teacher',
    'specialty',
    'subject', // film-subject
    'type', // film-type and recipe-type
    'diet', // recipe-diet
    'host',
    'featured_guest',
    'collection',
    'topic',
    'country',
    'focus',
  ]
  return _reduce(
    query,
    (reduction, val, key) => {
      if (_includes(params, key)) {
        // The spelling in the API is different then we want on the web.
        if (key === 'specialty' || key === 'focus') {
          // eslint-disable-next-line no-param-reassign
          key = 'speciality'
        }
        _set(reduction, key, val)
      }
      return reduction
    },
    {},
  )
}

export async function getClassicFacet (options) {
  const {
    id,
    filterSet,
    filter,
    query,
    page = 0,
    limit = DEFAULT_LIMIT,
    xff,
    language,
    country,
    sort,
  } = options
  // @TODO Revisit when we have design for this
  if (filterSet === 'article' || !isValidFilterSet(filterSet)) {
    return BluebirdPromise.resolve(handleClassicFacetResponse({}, id, page, limit))
  }
  const apiQuery = _assign(createClassicFacetQuery(query), {
    language,
    country,
    p: page,
    pp: limit,
  })
  const querySort = _get(query, 'sort')
  if (querySort) {
    _set(apiQuery, 'sort', querySort)
  } else if (sort) {
    _set(apiQuery, 'sort', sort)
  }
  if (filter) {
    _set(apiQuery, filter, id)
  }
  try {
    const res = await apiGet(
      `videos/classic_facet/${strictUriEncode(filterSet)}`,
      apiQuery,
      { xff },
      TYPE_BROOKLYN,
    )
    return handleClassicFacetResponse(res, id, page, limit)
  } catch (e) {
    return handleClassicFacetResponse({}, id, page, limit, true)
  }
}

export function handleClassicFacetResponse (res, id, page, limit, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, id, page, limit, _dataError)
}

export async function getPlaylist (options) {
  const {
    id,
    auth,
    page = 0,
    limit = DEFAULT_LIMIT,
    xff,
    language,
    playlistType = PLAYLIST_TYPE_DEFAULT,
  } = options
  try {
    const res = await apiGet(
      `v2/playlists/${playlistType}`,
      { p: page, pp: limit, language },
      { auth, xff },
      TYPE_BROOKLYN_JSON,
    )

    return handlePlaylistResponse(res, id, auth, page, limit)
  } catch (e) {
    return handlePlaylistResponse({}, id, auth, page, limit, true)
  }
}

export function handlePlaylistResponse (res, id, auth, page, limit, _dataError) {
  const data = _get(res, 'body', {})
  return createPlaylistModel(data, id, page, limit, _dataError)
}

/**
 * Get search content by search term
 * @param {Object} options The options
 * @param {String} options.term The search term
 * @param {Number} [options.page=0] The page for the results
 * @param {Number} [options.limit=16] The limit for the results per page
 * @param {String} [options.xff] The X-FORWRDED-FOR header value
 * @param {String[]|String} [options.language] The language for the search
 * @param {String} [options.country] The country for the request
 * @param {Object} [options.query={}] Additional query parameters
 * @param {String} [options.query.sort] The sorting type
 */
export async function getSearchTerm (options = {}) {
  const { term, page = 0, limit = DEFAULT_LIMIT, xff, language, country, query = {} } = options
  if (!term) {
    return handleSearchResponse({}, term, page, limit, true)
  }
  const sort = _get(query, 'sort')
  try {
    const res = await apiGet(
      `videos/search/${strictUriEncode(term)}`,
      { p: page, pp: limit, language, sort, country },
      { xff },
      TYPE_BROOKLYN_JSON,
    )
    return handleSearchResponse(res, term, page, limit, 'search')
  } catch (e) {
    return handleSearchResponse({}, term, page, limit, true)
  }
}

/**
 * Create a search response object
 * @param {Object} res The API response
 * @param {Object} res.body The API response body
 * @param {String} term The search term
 * @param {Number} page The current page
 * @param {Number} limit The limit for the page
 * @param {Boolean} _dataError True is an error was encountered
 */
export function handleSearchResponse (res, term, page, limit, _dataError) {
  const data = _get(res, 'body', {})
  if (_has(data, 'titles') || _has(data, 'messages')) {
    return createModel(data, term, page, limit, _dataError)
  }
  return undefined
}
