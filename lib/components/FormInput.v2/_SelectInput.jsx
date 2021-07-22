import get from 'lodash/get'
import find from 'lodash/find'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import compose from 'recompose/compose'
import { withFormsy } from 'formsy-react'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { TYPES, getClass, getLabelId, getInputId } from './utils'

class SelectInput extends Component {
  //
  onChange = (e) => {
    const { props } = this
    const { currentTarget } = e
    const { value } = currentTarget
    const { setValue, onChange: _onChange } = props
    let nextValue = value
    if (_onChange) {
      const valueOnChange = _onChange(nextValue)
      if (valueOnChange !== undefined) {
        nextValue = valueOnChange
      }
    }
    setValue(nextValue)
  }

  onBlur = (e) => {
    const { props } = this
    const { currentTarget } = e
    const { value } = currentTarget
    const { setValue, onBlur: _onBlur } = props
    if (_onBlur) {
      const modifiedValue = _onBlur(value)
      if (modifiedValue) {
        setValue(modifiedValue)
      }
    }
  }

  getValueLabel () {
    const { props } = this
    const { children, getValue } = props
    const value = getValue()
    const kids = React.Children.toArray(children)
    const option = find(kids, kid => (
      get(kid, ['props', 'value']) === value
    ))
    return option ? get(option, ['props', 'children']) : ''
  }

  render () {
    const { props, onBlur, onChange } = this
    const {
      placeholder,
      disabled,
      children,
      required,
      readonly,
      name,
      note,
    } = props
    const className = getClass(TYPES.SELECT, props)
    const labelId = getLabelId(name)
    const id = getInputId(name)
    return (
      <div className={className}>
        <div className="forminput__ui">
          <select
            className="forminput__input"
            placeholder={placeholder}
            aria-labelledby={labelId}
            value={props.getValue()}
            required={required}
            readOnly={readonly}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            name={id}
            id={id}
          >
            {children}
          </select>
          <label
            className="forminput__label"
            tab-index="-1"
            htmlFor={id}
            id={labelId}
          >{props.label}</label>
          <span role="presentation" className="forminput__underlay">
            {this.getValueLabel()}
          </span>
        </div>
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
}

SelectInput.propTypes = {
  validationErrors: PropTypes.object,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  validationError: PropTypes.string,
  inverted: PropTypes.bool,
  required: PropTypes.bool,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  note: PropTypes.string,
  onBlur: PropTypes.func,
  block: PropTypes.bool,
  value: PropTypes.any,
  mono: PropTypes.bool,
  validations: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
}

export default compose(
  connectStaticText({ storeKey: 'formInputV2' }),
  withFormsy,
)(SelectInput)
