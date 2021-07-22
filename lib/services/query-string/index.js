import {
  stringify as stringifyQs,
  parse as parseQs,
} from 'query-string'

const ARRAY_FORMAT = 'bracket'

export const STRINGIFY_OPTIONS = {
  arrayFormat: ARRAY_FORMAT,
}

export const PARSE_OPTIONS = {
  arrayFormat: ARRAY_FORMAT,
}

export function stringify (query) {
  return stringifyQs(query, STRINGIFY_OPTIONS)
}

/**
 * Parse a URL for a query string
 * @param {String} url The url to parse
 */
export function parse (url) {
  try {
    return parseQs(url, PARSE_OPTIONS)
  } catch (e) {
    if (!(e instanceof URIError)) {
      throw e
    }
  }
  return {}
}
