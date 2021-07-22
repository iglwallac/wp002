import _first from 'lodash/first'
import _get from 'lodash/get'
import _has from 'lodash/has'
import { get as getConfig } from 'config'

export const LANG = getConfig().appLang

/**
 * Get the message using a language fallback pattern
 */
export function getLangMessages (lang, messages) {
  const langOnly = _first(lang.split('-'))
  if (_has(messages, lang)) {
    // Language and region match
    return _get(messages, lang)
  } else if (lang !== langOnly && _has(messages, langOnly)) {
    // Language match
    return _get(messages, langOnly)
  }
  // Default language fallback
  return _get(messages, LANG, {})
}
