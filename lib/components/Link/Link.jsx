import React from 'react'
import PropTypes from 'prop-types'
import { List } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import { stringify as stringifyQuery } from 'services/query-string'
import { createAbsolute, isFullUrl, isAnchor, isJavascript, isLandingPage } from 'services/url'
import { isDefault as isDefaultLanguage } from 'services/languages'
import { requestAnimationFrame } from 'services/animate'
import _isFunction from 'lodash/isFunction'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import _partial from 'lodash/partial'
import _isArray from 'lodash/isArray'
import _reduce from 'lodash/reduce'
import _assign from 'lodash/assign'
import _size from 'lodash/size'
import _split from 'lodash/split'
import _first from 'lodash/first'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _has from 'lodash/has'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { TARGET_BLANK, TARGET_SELF, URL_JAVASCRIPT_VOID } from './constants'

const EMPTY_LIST = List()

function handleOnClick (e, props, options = {}) {
  const {
    to,
    history,
    onClick,
    scrollToTop,
    eventData,
    setDefaultGaEvent,
  } = props
  const { navigateTo } = options
  const hash = getHashFromTo(to)
  // Let the browser handle the event
  e.stopPropagation()

  if (_isFunction(onClick)) onClick(e)
  // If the default was prevented from the onClick handler we should not push
  if (history && navigateTo && !e.isDefaultPrevented()) {
    e.preventDefault()
    history.push(navigateTo)
  }

  if (
    to &&
    !hash &&
    !isJavascript(to) &&
    !isAnchor(to) &&
    !isFullUrl(to) &&
    scrollToTop === true
  ) {
    // Only scroll if there is not a anchor tag.
    // The scroll will cause the page to not jump correctly.
    requestAnimationFrame(() => window.scrollTo(0, 0))
  } else if (hash) {
    requestAnimationFrame(() => scrollToHash(hash))
  }
  if (eventData) setDefaultGaEvent(eventData)
}

/**
 * Scroll the window to an id with retry logic.
 */
function scrollToHash (hash, attempt = 0) {
  if (attempt > 2) return
  const domNode = document.getElementById(hash)
  if (domNode) {
    domNode.scrollIntoView()
  } else {
    // Try again with delay
    requestAnimationFrame(() => (
      scrollToHash(hash, attempt + 1)
    ), 100)
  }
}

function getClassName (inputClassName) {
  return _isArray(inputClassName) ? inputClassName.join(' ') : inputClassName
}

/**
 * Get a hash value from a to object or string
 * @param {string|object} to - The to value
 */
export function getHashFromTo (to) {
  let hash
  if (_isObject(to)) {
    if (_has(to, 'hash')) {
      hash = _get(to, 'hash')
    } else if (_has(to, 'pathname')) {
      hash = getHashFromPath(_get(to, 'pathname'))
    }
  } else if (_isString(to)) {
    hash = getHashFromPath(to)
  }
  return hash
}

/**
 * Get the hash value from a path string.
 * i.e. /path?query=1#hash would return 'hash'
 * @param {string} path - The path string
 */
export function getHashFromPath (path) {
  return _get(_split(path, '#'), 1)
}

function createHrefWithLanguage (props) {
  const { to, query, state } = props
  let { hash } = props
  const pathParts = _split(createAbsolute(to), '#')
  const pathname = _get(pathParts, 0)
  // Get the hash off of the pathname if present
  if (!hash && _has(pathParts, 1)) {
    hash = `#${_get(pathParts, 1)}`
  }
  const search = createSearch(props, query)
  if (query || hash || state) {
    return `${pathname}${search}${hash || ''}`
  }
  return `${pathname}${search}`
}

export function createSearch (props, query = {}) {
  const { isLoggedIn, userLanguage = EMPTY_LIST } = props
  const queryLanguage = _get(query, 'language')
  if (
    !isLoggedIn &&
    !queryLanguage &&
    userLanguage.size > 0 &&
    !isDefaultLanguage(userLanguage.first())
  ) {
    const queryWithLanguage = _assign({}, query, {
      language: userLanguage.toJS(),
    })
    return `?${stringifyQuery(queryWithLanguage)}`
  } else if (query && _size(query) > 0) {
    // Drop the language if it is default i.e. english
    if (queryLanguage && isDefaultLanguage(_first(queryLanguage))) {
      return `?${stringifyQuery(_omit(query, ['language']))}`
    }
    return `?${stringifyQuery(query)}`
  }
  return ''
}

function getDOMElementAttrs (props) {
  return _reduce(props, (attrs, propValue, propName) => {
    if (/^(title|role|aria-|data-|onBlur|onFocus|disabled|onMouseOver|onMouseOut|onMouseEnter|onMouseLeave)/.test(propName)) {
      return _assign({}, attrs, { [propName]: propValue })
    }
    return attrs
  }, {})
}

const Link = (props, context) => {
  const { history } = context
  const {
    setDefaultGaEvent,
    scrollToTop,
    directLink,
    className,
    eventData,
    children,
    onClick,
    target,
    style,
    text,
    rel,
    to,
  } = props
  const child = children || text
  const targetBlankRel = target === TARGET_BLANK ? 'noopener noreferrer' : null
  const isDirectLink = isLandingPage(to) || directLink || isFullUrl(to)
  const onClickPartial = _partial(handleOnClick, _partial.placeholder, {
    scrollToTop, onClick, history, to, eventData, setDefaultGaEvent })

  let relValue = rel

  if (targetBlankRel) {
    relValue = rel ? `${rel} ${targetBlankRel}` : `${targetBlankRel}`
  }

  const attrs = _assign({}, getDOMElementAttrs(props), {
    className: getClassName(className),
    onClick: onClickPartial,
    rel: relValue,
    href: to,
    target,
    style,
  })

  if (!to || to === URL_JAVASCRIPT_VOID) {
    attrs.href = URL_JAVASCRIPT_VOID
  } else if (!isDirectLink) {
    const hrefWithLanguage = createHrefWithLanguage(props)
    attrs.onClick = e => onClickPartial(e, { navigateTo: hrefWithLanguage, history })
    attrs.href = hrefWithLanguage
  }
  return React.createElement('a', attrs, child)
}

Link.defaultProps = {
  scrollToTop: true,
  directLink: false,
}

Link.contextTypes = {
  history: PropTypes.object.isRequired,
}

Link.propTypes = {
  onlyActiveOnIndex: PropTypes.bool,
  activeClassName: PropTypes.string,
  to: PropTypes.string.isRequired,
  activeStyle: PropTypes.object,
  scrollToTop: PropTypes.bool,
  directLink: PropTypes.bool, // Render an a tag instead of a ReactRouterLink
  target: PropTypes.string,
  state: PropTypes.object,
  onClick: PropTypes.func,
  query: PropTypes.object,
  text: PropTypes.string,
  hash: PropTypes.string,
  rel: PropTypes.string,
  auth: ImmutablePropTypes.map,
}

const ConnectedLink = connectRedux(state => ({
  userLanguage: state.user.getIn(['data', 'language'], EMPTY_LIST),
  location: state.resolver.get('location'),
  isLoggedIn: !!state.auth.get('jwt'),
}),
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
  }
},
)(Link)

const TextLink = React.memo(props => (
  <ConnectedLink {...props} />
))

export default ConnectedLink
// Prevent breaking components that already import from Link.
export { TextLink, TARGET_BLANK, TARGET_SELF, URL_JAVASCRIPT_VOID }
