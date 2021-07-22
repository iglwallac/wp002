import React, { useCallback } from 'react'
import compose from 'recompose/compose'
import PropTypes from 'prop-types'
import isBool from 'lodash/isBoolean'
import { withFormsy } from 'formsy-react'
import { TYPES, getTag, getClass, getLabelId, getInputId } from './utils'

export const STYLES = {
  SECONDARY: 'SECONDARY',
}

function CheckboxInput (props) {
  const { name, note, asSlider } = props
  // -----------------------------
  // memoize the onChange for out main input
  // -----------------------------
  const onChange = useCallback((e) => {
    const { currentTarget } = e
    const { value, checked } = currentTarget
    const { setValue, onChange: _onChange } = props
    let modifiedValue = checked
    if (_onChange) {
      modifiedValue = !!_onChange(name, checked, value)
    }
    setValue(modifiedValue)
  }, [name])
  // -----------------------------
  // memoize the onBlur for out main input
  // -----------------------------
  const onBlur = useCallback((e) => {
    const { currentTarget } = e
    const { value, checked } = currentTarget
    const { setValue, onBlur: _onBlur } = props
    if (_onBlur) {
      const modifiedValue = _onBlur(name, checked, value)
      if (isBool(modifiedValue)) {
        setValue(modifiedValue)
      }
    }
  }, [name])

  const className = getClass(asSlider ? TYPES.SLIDER : TYPES.CHECKBOX, props)
  const labelId = getLabelId(name)
  const id = getInputId(name)

  return (
    <div className={className}>
      {React.createElement(getTag(TYPES.CHECKBOX), {
        className: 'forminput__input',
        'aria-labelledby': labelId,
        checked: props.getValue(),
        required: props.required,
        readOnly: props.readonly,
        disabled: props.disabled,
        value: props.htmlValue,
        type: TYPES.CHECKBOX,
        note: props.note,
        name: id,
        onChange,
        onBlur,
        id,
      })}
      <label
        className="forminput__label"
        tab-index="-1"
        htmlFor={id}
        id={labelId}
      >{props.label}</label>
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

CheckboxInput.propTypes = {
  validationErrors: PropTypes.object,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  name: PropTypes.string.isRequired,
  validationError: PropTypes.string,
  checkable: PropTypes.bool,
  asSlider: PropTypes.bool,
  required: PropTypes.bool,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  note: PropTypes.string,
  onBlur: PropTypes.func,
  value: PropTypes.any,
  block: PropTypes.bool,
  style: PropTypes.oneOf([
    STYLES.SECONDARY,
    STYLES.PRIMARY,
  ]),
  validations: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
}

export default compose(
  withFormsy,
)(CheckboxInput)
