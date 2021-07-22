import { Promise as BluebirdPromise } from 'bluebird'
import { fromJS, List } from 'immutable'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import languages from './languages.json'
import { EN, EN_US } from './constants'

/**
 * Get languages from local data.
 */
export function get () {
  return new BluebirdPromise(((resolve) => {
    resolve(fromJS(languages))
  }))
}

/**
 * Check if the language or if the primary language is default i.e. english.
 */
export function isDefault (language) {
  const primaryLanguage = getPrimary(language)
  return primaryLanguage === EN || primaryLanguage === EN_US
}

/**
 * Get the primary language from a List, Array or string.
 */
export function getPrimary (language) {
  if (List.isList(language)) {
    return language.first()
  } else if (_isArray(language)) {
    return _get(language, 0)
  }
  return language
}
