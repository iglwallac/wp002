import React from 'react'
import PropTypes from 'prop-types'
import { TextLink } from 'components/Link'

export default function RowAccessor (props = {}) {
  const { onFocus, className, onClick, onBlur, target, title, to } = props
  const cls = className ? ` ${className}` : ''
  const role = onClick ? 'button' : 'link'
  const scrollToTop = !onClick

  return (
    <TextLink
      className={`row-v2__accessor${cls}`}
      scrollToTop={scrollToTop}
      onFocus={onFocus}
      onClick={onClick}
      onBlur={onBlur}
      target={target}
      title={title}
      role={role}
      to={to}
    />
  )
}

RowAccessor.defaultProps = {
  onClick: undefined,
  onFocus: undefined,
  onBlur: undefined,
  className: '',
}

RowAccessor.propTypes = {
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  className: PropTypes.string,
  target: PropTypes.string,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
}
