import React from 'react'
import PropTypes from 'prop-types'
import OldCrustyButton from 'components/Button'
import IconV2 from 'components/Icon.v2'
import ImmutablePropTypes from 'react-immutable-proptypes'

export const TYPES = {
  PILL_SECONDARY: 'PILL_SECONDARY',
  ICON_SECONDARY: 'ICON_SECONDARY',
  ICON_PRIMARY: 'ICON_PRIMARY',
  ICON_OUTLINE: 'ICON_OUTLINE',
  ICON_FILL: 'ICON_FILL',
  ICON_PILL: 'ICON_PILL',
  SECONDARY: 'SECONDARY',
  TERTIARY: 'TERTIARY',
  DEFAULT: 'DEFAULT',
  PRIMARY: 'PRIMARY',
  GHOST: 'GHOST',
  ICON: 'ICON',
  PILL: 'PILL',
  LINK: 'LINK',
}

export const SIZES = {
  DEFAULT: 'DEFAULT',
  XSMALL: 'XSMALL',
  LARGE: 'LARGE',
  SMALL: 'SMALL',
}

function getText ({ children, icon, type }) {
  switch (type) {
    case TYPES.ICON:
    case TYPES.ICON_FILL:
    case TYPES.ICON_PILL:
    case TYPES.ICON_OUTLINE:
    case TYPES.ICON_PRIMARY:
    case TYPES.ICON_SECONDARY:
      return children ? (
        <React.Fragment>
          <IconV2 type={icon} />
          {children}
        </React.Fragment>
      ) : <IconV2 type={icon} />
    default:
      return children
  }
}

function getSize (size) {
  switch (size) {
    case SIZES.XSMALL:
      return 'button--x-small'
    case SIZES.LARGE:
      return 'button--large'
    case SIZES.SMALL:
      return 'button--small'
    default:
      return ''
  }
}

function getType (type) {
  switch (type) {
    case TYPES.PILL_SECONDARY:
      return 'button--pill-secondary'
    case TYPES.ICON_OUTLINE:
      return 'button--icon-outline'
    case TYPES.ICON_PRIMARY:
      return 'button--icon-primary'
    case TYPES.ICON_SECONDARY:
      return 'button--icon-secondary'
    case TYPES.ICON_FILL:
      return 'button--icon-fill'
    case TYPES.ICON_PILL:
      return 'button--icon-pill'
    case TYPES.SECONDARY:
      return 'button--secondary'
    case TYPES.PRIMARY:
      return 'button--primary'
    case TYPES.TERTIARY:
      return 'button--tertiary'
    case TYPES.GHOST:
      return 'button--ghost'
    case TYPES.ICON:
      return 'button--icon'
    case TYPES.PILL:
      return 'button--pill'
    case TYPES.LINK:
      return 'button--link'
    default:
      return ''
  }
}

function getClass ({
  type,
  size,
  shadow,
  stacked,
  inverted,
  disabled,
  className,
}) {
  const cls = []
  const sizeClass = getSize(size)
  const typeClass = getType(type)
  if (sizeClass) cls.push(sizeClass)
  if (typeClass) cls.push(typeClass)
  if (className) cls.push(className)
  if (stacked) cls.push('button--stacked')
  if (inverted) cls.push('button--inverted')
  if (disabled) cls.push('button--disabled')
  if (shadow) cls.push('button--shadow')
  return cls.join(' ')
}

export function Button (props) {
  const {
    className,
    eventData,
    disabled,
    children,
    inverted,
    stacked,
    onClick,
    submit,
    onBlur,
    shadow,
    icon,
    type,
    size,
    url,
  } = props

  const buttonClass = getClass({ type, size, stacked, inverted, disabled, className, shadow })
  const text = getText({ children, type, icon })
  const role = url ? 'link' : 'button'

  if (submit) {
    return (
      <button
        {...props}
        className={`button ${buttonClass}`}
        disabled={disabled}
        onClick={onClick}
        onBlur={onBlur}
        type="submit"
      >{text}
      </button>
    )
  }

  return (
    <OldCrustyButton
      {...props}
      buttonClass={buttonClass}
      eventData={eventData}
      disabled={disabled}
      onClick={onClick}
      onBlur={onBlur}
      text={text}
      role={role}
      url={url}
    />
  )
}

Button.defaultProps = {
  size: SIZES.DEFAULT,
  type: TYPES.DEFAULT,
  onClick: undefined,
  icon: undefined,
  inverted: false,
  disabled: false,
  stacked: false,
  url: undefined,
  className: '',
  submit: false,
  shadow: false,
}

Button.propTypes = {
  url: PropTypes.string,
  submit: PropTypes.bool,
  icon: PropTypes.string,
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
  stacked: PropTypes.bool,
  inverted: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  eventData: ImmutablePropTypes.map,
  size: PropTypes.oneOf([
    SIZES.DEFAULT,
    SIZES.XSMALL,
    SIZES.LARGE,
    SIZES.SMALL,
  ]),
  type: PropTypes.oneOf([
    TYPES.ICON_SECONDARY,
    TYPES.ICON_PRIMARY,
    TYPES.SECONDARY,
    TYPES.ICON_FILL,
    TYPES.ICON_PILL,
    TYPES.TERTIARY,
    TYPES.PRIMARY,
    TYPES.DEFAULT,
    TYPES.GHOST,
    TYPES.ICON,
    TYPES.PILL,
    TYPES.LINK,
  ]),
  shadow: PropTypes.bool,
}
