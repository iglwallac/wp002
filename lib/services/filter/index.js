import { Map, List, fromJS } from 'immutable'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { get as getSortBy } from 'services/filter-sort-by'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _filter from 'lodash/filter'
import { ES, DE, FR } from 'services/languages/constants'
import enJSON from 'components/FilterContainer/lang_en.json'
import esJSON from 'components/FilterContainer/lang_es-LA.json'
import deJSON from 'components/FilterContainer/lang_de-DE.json'
import frJSON from 'components/FilterContainer/lang_fr-FR.json'
import {
  DEFAULT_PATH_YOGA,
  DEFAULT_PATH_FITNESS,
  DEFAULT_PATH_FILM,
  DEFAULT_PATH_RECIPE,
} from 'services/url/constants'
import { SCHEMA, SCHEMA_OPTION } from './schema'

export const TYPE_SORT_BY = 'sort_by'

export const TYPE_YOGA_SPECIALITY = 'studio_yoga_speciality'
export const TYPE_YOGA_LEVEL = 'studio_yoga_level'
export const TYPE_YOGA_STYLE = 'studio_yoga_style'
export const TYPE_YOGA_TEACHER = 'studio_yoga_teacher'
export const TYPE_YOGA_DURATION = 'studio_yoga_duration'

export const TYPE_FITNESS_SPECIALITY = 'studio_fitness_speciality'
export const TYPE_FITNESS_LEVEL = 'studio_fitness_level'
export const TYPE_FITNESS_STYLE = 'studio_fitness_style'
export const TYPE_FITNESS_TEACHER = 'studio_fitness_teacher'
export const TYPE_FITNESS_DURATION = 'studio_fitness_duration'

export const TYPE_FILM_TYPE = 'film_type'
export const TYPE_FILM_SUBJECT = 'film_subject'

export const TYPE_RECIPE_TYPE = 'recipe_type'
export const TYPE_RECIPE_DIET = 'recipe_diet'

export const TYPE_INTRV_HOST = 'orig_intrv_host'
export const TYPE_INTRV_FEATURED_GUEST = 'orig_intrv_featured_guest'
export const TYPE_INTRV_COLLECTION = 'orig_intrv_collection'
export const TYPE_INTRV_TOPIC = 'orig_intrv_topic'

export const TYPE_CONSCIOUS_DURATION = 'conscious_duration'
export const TYPE_CONSCIOUS_FORMAT = 'conscious_format'
export const TYPE_CONSCIOUS_TOPIC = 'conscious_topic'

export const CLASSIC_FACET_YOGA = 'yoga'
export const CLASSIC_FACET_YOGA_STYLE = 'style'
export const CLASSIC_FACET_YOGA_FOCUS = 'focus'
export const CLASSIC_FACET_YOGA_TEACHER = 'teacher'
export const CLASSIC_FACET_YOGA_DURATION = 'duration'
export const CLASSIC_FACET_YOGA_LEVEL = 'level'

export const CLASSIC_FACET_FITNESS = 'fitness'
export const CLASSIC_FACET_FITNESS_SPECIALTY = 'specialty'
export const CLASSIC_FACET_FITNESS_LEVEL = 'level'
export const CLASSIC_FACET_FITNESS_STYLE = 'style'
export const CLASSIC_FACET_FITNESS_INSTRUCTOR = 'instructor'
export const CLASSIC_FACET_FITNESS_DURATION = 'duration'

export const CLASSIC_FACET_FILM = 'film'
export const CLASSIC_FACET_FILM_TYPE = 'type'
export const CLASSIC_FACET_FILM_SUBJECT = 'subject'

export const CLASSIC_FACET_RECIPE = 'recipe'
export const CLASSIC_FACET_RECIPE_TYPE = 'type'
export const CLASSIC_FACET_RECIPE_DIET = 'diet'


export async function get (options = {}) {
  const { type, allOptionPath, language } = options
  if (!type) {
    throw new Error('The type options is required.')
  }
  if (type === TYPE_SORT_BY) {
    return getSortBy({ language }).then((sortBy) => {
      const res = { body: sortBy }
      return handleResponse({ res, type, filterFacetValues: null, language })
    })
  }
  try {
    const res = await apiGet(
      `fields/classic_facet/${type}`,
      { language },
      null,
      TYPE_BROOKLYN,
    )
    return handleResponse({ res, type, allOptionPath, language })
  } catch (e) {
    return handleResponse({ res: {}, type, allOptionPath, language, _dataError: true })
  }
}

function _filterFacetValues (v) {
  return _get(v, 'path') !== null
}

export function handleResponse (options = {}) {
  const {
    res,
    type,
    allOptionPath,
    filterFacetValues = _filterFacetValues,
    _dataError,
    language,
  } = options
  if (!res) {
    throw new Error('res is a required option.')
  }
  if (!type) {
    throw new Error('type is a required option.')
  }
  let facetValues = _get(res, ['body', 'facetValues'], [])

  if (filterFacetValues) {
    facetValues = _filter(facetValues, filterFacetValues)
  }
  const selectOptions = allOptionPath ? [getAllOption(allOptionPath, language)] : []
  const facetOptions = _map(facetValues, createOptionModel)
  return Map(
    _assign(_cloneDeep(SCHEMA), {
      type,
      _dataError,
      options: List(selectOptions.concat(facetOptions)),
    }),
  )
}

export function handleFilterResponse (type, data, language) {
  const immutableFilters = fromJS(data).get(0, [])
  const mappedFilters = immutableFilters.map((filters, style) => {
    return transformFilters(filters, style, type, language)
  })
  let list = List()
  mappedFilters.forEach((val) => {
    list = list.push(val)
  })
  return list
}

function transformFilters (data, style, type, language) {
  return Map({
    allOptionPath: getAllOptionPath(type),
    filter: Map({
      options: setFacetOptions(data, type, language),
      type: getClassicFacetsType(style),
    }),
    param: style,
    type: getClassicFacetsType(style),
  })
}

function setFacetOptions (data, type, language) {
  const options = data.map(option => transformFacetOption(option))
  const allOption = Map(
    _assign(_cloneDeep(SCHEMA_OPTION), {
      name: translateAll(language),
      value: null,
      path: getAllOptionPath(type),
    }),
  )
  return options.unshift(allOption)
}

function transformFacetOption (data) {
  const path = data.get('path') ?
    data.get('path').replace('/', '') :
    null
  return Map(
    _assign(_cloneDeep(SCHEMA_OPTION), {
      name: data.get('name', null),
      value: data.get('d6Id', null),
      path,
    }),
  )
}

function getAllOptionPath (type) {
  switch (type) {
    case CLASSIC_FACET_YOGA:
      return DEFAULT_PATH_YOGA
    case CLASSIC_FACET_FITNESS:
      return DEFAULT_PATH_FITNESS
    case CLASSIC_FACET_FILM:
      return DEFAULT_PATH_FILM
    case CLASSIC_FACET_RECIPE:
      return DEFAULT_PATH_RECIPE
    default:
      return null
  }
}

function getClassicFacetsType (style) {
  switch (style) {
    case CLASSIC_FACET_YOGA_STYLE:
      return TYPE_YOGA_STYLE
    case CLASSIC_FACET_YOGA_FOCUS:
      return TYPE_YOGA_SPECIALITY
    case CLASSIC_FACET_YOGA_TEACHER:
      return TYPE_YOGA_TEACHER
    case CLASSIC_FACET_YOGA_DURATION:
      return TYPE_YOGA_DURATION
    case CLASSIC_FACET_YOGA_LEVEL:
      return TYPE_YOGA_LEVEL
    case CLASSIC_FACET_FITNESS_SPECIALTY:
      return TYPE_FITNESS_SPECIALITY
    case CLASSIC_FACET_FITNESS_LEVEL:
      return TYPE_FITNESS_LEVEL
    case CLASSIC_FACET_FITNESS_STYLE:
      return TYPE_FITNESS_STYLE
    case CLASSIC_FACET_FITNESS_INSTRUCTOR:
      return TYPE_FITNESS_TEACHER
    case CLASSIC_FACET_FITNESS_DURATION:
      return TYPE_FITNESS_DURATION
    case CLASSIC_FACET_FILM_TYPE:
      return TYPE_FILM_TYPE
    case CLASSIC_FACET_FILM_SUBJECT:
      return TYPE_FILM_SUBJECT
    case CLASSIC_FACET_RECIPE_TYPE:
      return TYPE_RECIPE_TYPE
    case CLASSIC_FACET_RECIPE_DIET:
      return TYPE_RECIPE_DIET
    default:
      return null
  }
}

function createOptionModel (data) {
  return Map(
    _assign(_cloneDeep(SCHEMA_OPTION), {
      name: _get(data, 'name', null),
      value: _get(data, 'value', null),
      path: _get(data, 'path', null),
    }),
  )
}

function getAllOption (path, language) {
  return createOptionModel({
    name: translateAll(language),
    value: null,
    path: path.replace(/^\\/, ''),
  })
}

function translateAll (language) {
  const lang = typeof language === 'string' ? language : language[0]
  switch (lang) {
    case ES:
      return esJSON.all
    case DE:
      return deJSON.all
    case FR:
      return frJSON.all
    default:
      return enJSON.all
  }
}
