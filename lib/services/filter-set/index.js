import { get as getConfig } from 'config'
import { all as allPromise, Promise as BluebirdPromise } from 'bluebird'
import { List, fromJS, Map } from 'immutable'
import _get from 'lodash/get'
import {
  isYoga as isUrlYoga,
  isFitness as isUrlFitness,
  isFilm as isUrlFilm,
  isRecipe as isUrlRecipe,
  isOriginal as isUrlOriginal,
  isConscious as isUrlConscious,
} from 'services/url'
import {
  get as getFilter,
  TYPE_SORT_BY,
  TYPE_YOGA_SPECIALITY,
  TYPE_YOGA_LEVEL,
  TYPE_YOGA_STYLE,
  TYPE_YOGA_TEACHER,
  TYPE_YOGA_DURATION,
  TYPE_FITNESS_SPECIALITY,
  TYPE_FITNESS_LEVEL,
  TYPE_FITNESS_STYLE,
  TYPE_FITNESS_TEACHER,
  TYPE_FITNESS_DURATION,
  TYPE_FILM_TYPE,
  TYPE_FILM_SUBJECT,
  TYPE_RECIPE_TYPE,
  TYPE_RECIPE_DIET,
  TYPE_INTRV_HOST,
  TYPE_INTRV_FEATURED_GUEST,
  TYPE_CONSCIOUS_FORMAT,
  TYPE_CONSCIOUS_TOPIC,
} from 'services/filter'
import {
  DEFAULT_PATH_YOGA,
  DEFAULT_PATH_FITNESS,
  DEFAULT_PATH_FILM,
  DEFAULT_PATH_RECIPE,
  DEFAULT_PATH_ORIGINAL,
  DEFAULT_PATH_CONSCIOUS,
} from 'services/url/constants'

const config = getConfig()

export const FILTER_SET_DEFAULT = 'default'
export const FILTER_SET_YOGA = 'yoga'
export const FILTER_SET_FITNESS = 'fitness'
export const FILTER_SET_FILM = 'film'
export const FILTER_SET_RECIPE = 'recipe'
export const FILTER_SET_ORIGINAL = 'interview'
export const FILTER_SET_CONSCIOUS = 'conscious'

const VALID_FILTER_SETS = List([
  FILTER_SET_DEFAULT,
  FILTER_SET_YOGA,
  FILTER_SET_FITNESS,
  FILTER_SET_FILM,
  FILTER_SET_RECIPE,
  FILTER_SET_ORIGINAL,
  FILTER_SET_CONSCIOUS,
])

function omitInvalidOptions (filter) {
  if (filter) {
    return filter.update('options', options => options.filter(option => (!!option.get('name', null))))
  }
  return filter
}

export function get (options) {
  const { filterSet, language } = options
  if (!filterSet) {
    return BluebirdPromise.reject(new Error('The filterSet option is required.'))
  }
  const filterSetData = getFilterSetData(filterSet)
  const promises = filterSetData.map(val => getFilter({
    type: val.get('type'),
    allOptionPath: val.get('allOptionPath'),
    language,
  }))
  return allPromise(promises.toJS()).then((states) => {
    const data = filterSetData.map((val, index) => {
      const filter = omitInvalidOptions(_get(states, index))
      return val.set('filter', filter)
    })
    return Map({ _dataError: undefined, data })
  })
}

export function getSetByPathname (pathname) {
  if (isUrlFitness(pathname)) {
    return FILTER_SET_FITNESS
  } else if (isUrlYoga(pathname)) {
    return FILTER_SET_YOGA
  } else if (isUrlFilm(pathname)) {
    return FILTER_SET_FILM
  } else if (isUrlRecipe(pathname)) {
    return FILTER_SET_RECIPE
  } else if (isUrlOriginal(pathname)) {
    return FILTER_SET_ORIGINAL
  } else if (isUrlConscious(pathname)) {
    return FILTER_SET_CONSCIOUS
  }
  return FILTER_SET_DEFAULT
}

export function isValid (filterSet) {
  return VALID_FILTER_SETS.includes(filterSet)
}

export function getFilterSetData (filterSet) {
  switch (filterSet) {
    case FILTER_SET_YOGA:
      return fromJS([
        {
          type: TYPE_YOGA_STYLE,
          allOptionPath: DEFAULT_PATH_YOGA,
          param: 'style',
        },
        {
          type: TYPE_YOGA_TEACHER,
          allOptionPath: DEFAULT_PATH_YOGA,
          param: 'teacher',
        },
        {
          type: TYPE_YOGA_LEVEL,
          allOptionPath: DEFAULT_PATH_YOGA,
          param: 'level',
        },
        {
          type: TYPE_YOGA_DURATION,
          allOptionPath: DEFAULT_PATH_YOGA,
          param: 'duration',
        },
        {
          type: TYPE_YOGA_SPECIALITY,
          allOptionPath: DEFAULT_PATH_YOGA,
          param: 'specialty',
        },
      ])
    case FILTER_SET_FITNESS:
      return fromJS([
        {
          type: TYPE_FITNESS_STYLE,
          allOptionPath: DEFAULT_PATH_FITNESS,
          param: 'style',
        },
        {
          type: TYPE_FITNESS_TEACHER,
          allOptionPath: DEFAULT_PATH_FITNESS,
          param: 'teacher',
        },
        {
          type: TYPE_FITNESS_LEVEL,
          allOptionPath: DEFAULT_PATH_FITNESS,
          param: 'level',
        },
        {
          type: TYPE_FITNESS_DURATION,
          allOptionPath: DEFAULT_PATH_FITNESS,
          param: 'duration',
        },
        {
          type: TYPE_FITNESS_SPECIALITY,
          allOptionPath: DEFAULT_PATH_FITNESS,
          param: 'specialty',
        },
      ])
    case FILTER_SET_FILM:
      return fromJS([
        {
          type: TYPE_FILM_TYPE,
          allOptionPath: DEFAULT_PATH_FILM,
          param: 'type',
        },
        {
          type: TYPE_FILM_SUBJECT,
          allOptionPath: DEFAULT_PATH_FILM,
          param: 'subject',
        },
        { type: TYPE_SORT_BY,
          allOptionPath: null,
          param: 'sort',
        },
      ])
    case FILTER_SET_RECIPE:
      return fromJS([
        {
          type: TYPE_RECIPE_TYPE,
          allOptionPath: DEFAULT_PATH_RECIPE,
          param: 'type',
        },
        {
          type: TYPE_RECIPE_DIET,
          allOptionPath: DEFAULT_PATH_RECIPE,
          param: 'diet',
        },
      ])
    case FILTER_SET_ORIGINAL:
      return fromJS([
        {
          type: TYPE_INTRV_HOST,
          allOptionPath: DEFAULT_PATH_ORIGINAL,
          param: 'host',
        },
        {
          type: TYPE_INTRV_FEATURED_GUEST,
          allOptionPath: DEFAULT_PATH_ORIGINAL,
          param: 'featured_guest',
        },
        /*
        { type: TYPE_INTRV_COLLECTION, allOptionPath: DEFAULT_PATH_ORIGINAL, param: 'collection' },
        { type: TYPE_INTRV_TOPIC, allOptionPath: DEFAULT_PATH_ORIGINAL, param: 'topic' }
        */
      ])
    case FILTER_SET_CONSCIOUS:
      if (_get(config, ['features', 'filters', FILTER_SET_CONSCIOUS], false)) {
        return fromJS([
          {
            type: TYPE_CONSCIOUS_FORMAT,
            allOptionPath: DEFAULT_PATH_CONSCIOUS,
            param: 'format',
          },
          {
            type: TYPE_CONSCIOUS_TOPIC,
            allOptionPath: DEFAULT_PATH_CONSCIOUS,
            param: 'topic',
          },
          /*
          {type: TYPE_CONSCIOUS_DURATION, allOptionPath: DEFAULT_PATH_CONSCIOUS, param: 'duration'},
          */
        ])
      }
      break
    default:
  }
  return fromJS([
    { type: TYPE_SORT_BY, allOptionPath: null, param: 'sort' },
  ])
}
