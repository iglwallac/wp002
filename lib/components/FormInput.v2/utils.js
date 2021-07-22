import toLower from 'lodash/toLower'
import isString from 'lodash/isString'

export const TYPES = {
  COMMENTBOX: 'commentbox',
  CHECKBOX: 'checkbox',
  TEXTAREA: 'textarea',
  PASSWORD: 'password',
  HIDDEN: 'hidden',
  SLIDER: 'slider',
  SELECT: 'select',
  NUMBER: 'number',
  TIMECODE: 'text',
  RADIO: 'radio',
  EMAIL: 'email',
  TIME: 'time',
  TEXT: 'text',
  FILE: 'FILE',
  TEL: 'tel',
}

export function getInputId (name) {
  return `input-${name}`
}

export function getLabelId (name) {
  return `input-${name}-label`
}

export function getTag (type) {
  switch (type) {
    case TYPES.SLIDER:
    case TYPES.HIDDEN:
    case TYPES.PASSWORD:
    case TYPES.CHECKBOX:
    case TYPES.NUMBER:
    case TYPES.RADIO:
    case TYPES.EMAIL:
    case TYPES.TEXT:
    case TYPES.TIME:
    case TYPES.FILE:
    case TYPES.TEL:
      return 'input'
    case TYPES.COMMENTBOX:
    case TYPES.TEXTAREA:
      return 'textarea'
    default:
      return type
  }
}

export function getType (type) {
  return (type !== TYPES.TEXTAREA
    && type !== TYPES.COMMENTBOX
    && type) || ''
}

export function getClass (type, attrs, error) {
  const {
    forceError,
    className,
    checkable,
    asSlider,
    readonly,
    inverted,
    disabled,
    required,
    copyable,
    restrict,
    block,
    style,
    note,
    mono,
  } = attrs
  const cls = ['forminput', `forminput--${type}`]
  if (className) cls.push(className)
  if (mono) cls.push('forminput--mono')
  if (block) cls.push('forminput--block')
  if (inverted) cls.push('forminput--inverted')
  if (copyable) cls.push('forminput--copyable')
  if (checkable) cls.push('forminput--checkable')
  if (readonly) cls.push('forminput--readonly')
  if (disabled) cls.push('forminput--disabled')
  if (required) cls.push('forminput--required')
  if (restrict) cls.push('forminput--restrict')
  if (asSlider) cls.push('forminput--slider')
  if (error || forceError) cls.push('forminput--error')
  if (style && isString(style)) cls.push(`forminput--style-${toLower(style)}`)
  if (!note && (type === 'checkbox') && (style === 'SECONDARY')) cls.push('forminput--center')
  return cls.join(' ')
}
