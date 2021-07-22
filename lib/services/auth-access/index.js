import _find from 'lodash/find'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _uniq from 'lodash/uniq'
import _reduce from 'lodash/reduce'
import _concat from 'lodash/concat'
import rules from './rules.json'
import whitelist from './whitelist.json'

export const TYPE_WHITELIST = 'whitelist'
export const TYPE_REGEX = 'regex'
export const TYPE_INCLUDES = 'includes'

export const ROLE_VIEW_SITE = 'view-site'
export const ROLE_EDITOR = 'editor'

export function getRoles (auth) {
  const roles = _reduce(rules, (acc, rule) => {
    if (ruleMatchesAuth(rule, auth)) {
      // eslint-disable-next-line no-param-reassign
      return _concat(acc, _get(rule, 'roles', []))
    }
    return acc
  }, [])
  return _uniq(roles)
}

export function ruleMatchesAuth (rule, auth) {
  const validate = _get(rule, 'validate')
  const field = _get(rule, 'field')
  const value = _get(auth, field)
  switch (_get(rule, 'type')) {
    case TYPE_WHITELIST:
      if (findWhitelistMatch(field, value)) {
        return true
      }
      break
    case TYPE_REGEX: {
      const check = new RegExp(validate)
      if (check.test(value)) {
        return true
      }
      break
    }
    case TYPE_INCLUDES:
      return _includes(value, validate)
    default:
      return false
  }
  return false
}

export function findWhitelistMatch (field, value) {
  const pattern = {}
  pattern[field] = value
  return _find(whitelist, pattern)
}
