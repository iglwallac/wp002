import React from 'react'
import PropTypes from 'prop-types'
import _isArray from 'lodash/isArray'
import _partial from 'lodash/partial'
import _reduce from 'lodash/reduce'
import _assign from 'lodash/assign'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import Icon from 'components/Icon'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'

export function getIcon (icon, setHovered) {
  if (_isArray(icon)) {
    return <Icon iconClass={icon} setHovered={setHovered} />
  }
  return null
}

export function handleOnClick (e, props) {
  e.stopPropagation()
  const { url, onClick, setDefaultGaEvent, eventData } = props
  if (!url && !onClick) {
    e.preventDefault()
  }
  if (onClick) {
    if (eventData) setDefaultGaEvent(eventData)
    onClick(e)
  }
  return e
}

// TODO: move this to shared place as it's duplicated in <Link />
function getDOMElementAttrs (props) {
  return _reduce(props, (attrs, propValue, propName) => {
    if (/^(title|role|aria-|data-|onBlur|disabled)/.test(propName)) {
      return _assign({}, attrs, { [propName]: propValue })
    }
    return attrs
  }, {})
}

function Button (props) {
  const {
    url,
    text,
    query,
    target,
    element,
    iconClass,
    buttonClass,
    scrollToTop,
    directLink,
    setHovered,
  } = props
  const itemClass = _isArray(buttonClass) ? buttonClass.join(' ') : buttonClass
  const onClickPartial = _partial(handleOnClick, _partial.placeholder, props)
  const attrs = getDOMElementAttrs(props)

  return (
    <Link
      {...attrs}
      className={itemClass ? `button ${itemClass}` : 'button'}
      role={url ? 'link' : 'button'}
      to={url || URL_JAVASCRIPT_VOID}
      query={query}
      data-element={element || null}
      onClick={onClickPartial}
      scrollToTop={scrollToTop}
      target={target}
      directLink={directLink}
    >
      {iconClass ? getIcon(iconClass, setHovered) : null}
      {text}
    </Link>
  )
}

Button.defaultProps = {
  scrollToTop: false,
}

Button.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  buttonClass: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  scrollToTop: PropTypes.bool,
  iconClass: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  directLink: PropTypes.bool,
  element: PropTypes.string,
  target: PropTypes.string,
  query: PropTypes.object,
  onClick: PropTypes.func,
  rel: PropTypes.string,
  url: PropTypes.string,
  eventData: ImmutablePropTypes.map,
}

export default connectRedux(
  null,
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
    }
  },
)(Button)
