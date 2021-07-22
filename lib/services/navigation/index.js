import _get from 'lodash/get'
import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _startsWith from 'lodash/startsWith'
import { parse as parseUrl, format as formatUrl } from 'url'
import { Map, List } from 'immutable'
import {
  stringify as stringifyQuery,
  parse as parseQuery,
} from 'services/query-string'
import { isFullUrl } from 'services/url'
import { isDefault as isDefaultLanguage } from 'services/languages'
import { getUserLanguage } from 'services/user'

export const HISTORY_METHOD_PUSH = 'push'
export const HISTORY_METHOD_REPLACE = 'replace'
export const ABSOLUTE_URL_REGEX = /https?:\/\//

/**
 * Navigate to a path using a history redirect
 * accounting for all difference between authenticated
 * and anonymous users this is used for all programatic navigation
 * don't use history.push() directly
 * @param {Object} options The options
 * @param {Object} options.history The history singlton
 * @param {import('immutable').Map|Object} options.query The query object
 * @param {Number} options.timeout A timeout to wait to send the redirect which
 * is useful for letting the state settle before changing the url
 * @param {Number} options.timeout A timeout to wait to send the redirect
 * @param {String} [options.historyMethod] The method on the history object to use
 * i.e. HISTORY_METHOD_PUSH or HISTORY_METHOD_REPLACE
 * @param {Function} [cb] An optional callback funcion which is called when the location
 * change has been run
 */
export function historyRedirect (options = {}, cb) {
  const { history, timeout = 100, historyMethod, auth = Map(), user } = options
  let { url, query, language } = options
  if (!history) {
    throw new Error('The history option is required.')
  }
  if (!url) {
    throw new Error('The url option is required.')
  }
  // Convert immutable map to plain javascript object
  if (Map.isMap(query)) {
    query = query.toJS()
  }
  // Append another query
  if (!_isEmpty(query)) {
    const parsedUrl = parseUrl(url)
    const parsedQuery = parseQuery(_get(parsedUrl, 'search'))
    url = formatUrl({
      ...parsedUrl,
      search: stringifyQuery({ ...parsedQuery, ...query }),
    })
  }
  // Add prefix of / if missing
  if (!isFullUrl(url) && !_startsWith(url, '/')) {
    url = `/${url}`
  }
  if (!language && Map.isMap(user)) {
    language = getUserLanguage(user)
  }
  // Convert immutable to array to make it easier to work with.
  if (List.isList(language)) {
    language = language.toJS()
  }
  // Remove language when the user is authenticated or it is the default language
  if (language && (auth.get('jwt') || isDefaultLanguage(language))) {
    language = null
  }
  setTimeout(() => {
    // Use push or replace for the history method
    const redirectMethod = _get(history, historyMethod || HISTORY_METHOD_PUSH)
    redirectMethod(createUrl(url, language))
    if (_isFunction(cb)) {
      cb()
    }
  }, timeout)
}

/**
 * Create a URL applying language correctly
 * @param {String} url A url string
 * @param {String[]} language An array of languages
 * @returns {String} The url
 */
export function createUrl (url, language) {
  if (!language || isDefaultLanguage(language)) {
    return url
  }
  const parsedUrl = parseUrl(url)
  const parsedQuery = parseQuery(_get(parsedUrl, 'search'))
  const queryLanguage = _get(parsedQuery, 'language')
  if (queryLanguage) {
    return url
  }
  return formatUrl({
    ...parsedUrl,
    search: stringifyQuery({ ...parsedQuery, language: createLanguageQueryParam(language) }),
  })
}

/**
 * Create a langauge array to be used in an url query
 * @param {String[]|String} language The languages
 * @returns {String[]} The languages as an array to be used in a
 * url query
 */
export function createLanguageQueryParam (language) {
  if (!language) {
    return []
  }
  return _isArray(language) ? language : [language]
}
