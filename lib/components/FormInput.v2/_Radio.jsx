import React from 'react'
import PropTypes from 'prop-types'
import { TYPES, getClass } from './utils'

export const STYLES = {
  SECONDARY: 'SECONDARY',
  PRIMARY: 'PRIMARY',
}

export default function Radio (props) {
  const {
    onChange,
    disabled,
    required,
    readOnly,
    checked,
    value,
    name,
    note,
    label,
  } = props
  const className = getClass(TYPES.RADIO, props)
  const id = `input-${name}-${value}`
  const labelId = `${id}-label`
  return (
    <div className={className}>
      <input
        className="forminput__input"
        aria-labelledby={labelId}
        onChange={onChange}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        checked={checked}
        value={value}
        name={name}
        type="radio"
        id={id}
      />
      <label
        className="forminput__label"
        tab-index="-1"
        htmlFor={id}
        id={labelId}
      >{label}</label>
      {note ? (
        <span
          role="alert"
          aria-live="polite"
          className="forminput__note"
        >{note}</span>
      ) : null}
    </div>
  )
}

Radio.propTypes = {
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  note: PropTypes.string,
  block: PropTypes.bool,
  value: PropTypes.any,
  style: PropTypes.oneOf([
    STYLES.SECONDARY,
    STYLES.PRIMARY,
  ]),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
}
