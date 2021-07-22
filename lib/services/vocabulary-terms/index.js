/* eslint-disable global-require import/prefer-default-export */
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _parseInt from 'lodash/parseInt'
import _range from 'lodash/range'
import { TYPE_PLACEHOLDER } from 'services/content-type'
import strictUriEncode from 'strict-uri-encode'

export const CENTERS_VOCABULARY_ID = 61

const SCHEMA = {
  limit: null,
  page: null,
  currentPage: 0,
  totalCount: 0,
  totalPages: 0,
  terms: [],
  _dataError: null,
}

const VOCABULARY_TERM_SCHEMA = {
  id: null,
  vocabularyId: null,
  name: null,
  weight: null,
  path: null,
  isLeaf: null,
  description: null,
  heroImage: {
    small: null,
    mediumSmall: null,
    medium: null,
    large: null,
  },
  tileImage: {
    small: null,
    medium: null,
    large: null,
  },
}

export const DEFAULT_LIMIT = 100

export function getPlaceholderVocabulary () {
  return _map(_range(-3, 0), () => ({ type: TYPE_PLACEHOLDER }))
}

async function getVocabulary (options) {
  const {
    vocabularyId,
    page = 0,
    limit = DEFAULT_LIMIT,
    language,
    xff,
  } = options
  const apiQuery = {
    p: page,
    pp: limit,
    language,
  }
  // api/vocabulary/:vocabularyId?p=0&pp=22
  try {
    const res = await apiGet(
      `vocabulary/${strictUriEncode(vocabularyId)}`,
      apiQuery,
      { xff },
      TYPE_BROOKLYN,
    )
    return handleVocabularyResponse(res, vocabularyId, page, limit)
  } catch (e) {
    return handleVocabularyResponse({}, vocabularyId, page, limit, true)
  }
}

export function handleVocabularyResponse (res, vocabularyId, page, limit, _dataError) {
  const data = _get(res, 'body', {})
  return createModel(data, vocabularyId, page, limit, _dataError)
}

function createModel (data, vocabularyId, page, limit, _dataError) {
  const totalCount = _parseInt(_get(data, 'totalCount', 0))
  const currentPage = _parseInt(_get(data, 'currentPage', 1))
  const totalPages =
    totalCount > 0 && limit > 0 ? Math.ceil(totalCount / limit) : 0
  return _assign(_cloneDeep(SCHEMA), {
    _dataError,
    limit,
    page,
    currentPage,
    totalCount,
    totalPages,
    terms: _map(_get(data, 'terms', []), term =>
      createVocabularyTermModel(term),
    ),
  })
}

function createVocabularyTermModel (term) {
  return _assign(_cloneDeep(VOCABULARY_TERM_SCHEMA), {
    id: _parseInt(_get(term, 'tid', null)),
    vocabularyId: _parseInt(_get(term, 'vid', null)),
    name: _get(term, 'name', null),
    weight: _get(term, 'weight', 0),
    path: _get(term, 'path', null),
    isLeaf: _get(term, 'isLeaf', null),
    description: _get(term, 'description', null),
    heroImage: {
      small: _get(term, 'termImages.hero.hero_320x200', null),
      mediumSmall: _get(term, 'termImages.hero.hero_750x276', null),
      medium: _get(term, 'termImages.hero.hero_700x300', null),
      large: _get(term, 'termImages.hero.hero_1070x300', null),
    },
    tileImage: {
      small: _get(term, 'termImages.tile.tile_374x156', null),
      medium: _get(term, 'termImages.tile.tile_561x234', null),
      large: _get(term, 'termImages.tile.tile_532x400', null),
    },
  })
}

export function get (vocabularyId, options, page, limit) {
  const { language } = options
  return getVocabulary({ vocabularyId, options, page, limit, language })
}
