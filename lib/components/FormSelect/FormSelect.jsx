import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { fromJS } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { withFormsy as HOC } from 'formsy-react'
import { SimpleSelect } from 'react-selectize'
import _get from 'lodash/get'
import _range from 'lodash/range'
import _isFunction from 'lodash/isFunction'

export const DAY_OPTIONS = fromJS([..._range(1, 32)].map((item) => {
  const stringItem = item.toString()
  return {
    value: stringItem,
    label: stringItem,
  }
}))
export const MONTH_OPTIONS = fromJS([..._range(1, 13)].map((item) => {
  const stringItem = item.toString()
  return {
    value: stringItem,
    label: stringItem,
  }
}))
export const YEAR_OPTIONS = fromJS([..._range(1900, 2020)].map((item) => {
  const stringItem = item.toString()
  return {
    value: stringItem,
    label: stringItem,
  }
}))

function getClassName (props) {
  const { className } = props
  return ['form__select'].concat(className || []).join(' ')
}

function getLabelClassName (props) {
  const { labelClassName } = props
  const classes = ['form-select__label'].concat(labelClassName || [])
  return classes.join(' ')
}

function getWrapperClassName (props) {
  const { wrapperClassName } = props
  return ['form-select'].concat(wrapperClassName || []).join(' ')
}

function createPlaceholderOption (placeholder) {
  return { label: placeholder, value: '' }
}

class FormSelect extends Component {
  onValueChange = (option) => {
    const { setValue, onChange } = this.props
    const value = _get(option, 'value')
    setValue(value)
    if (_isFunction(onChange)) {
      onChange(value)
    }
  }

  render () {
    const props = this.props
    const {
      error,
      defaultOption,
      placeholder,
      name,
      label,
      options,
      required,
      getValue,
      onBlur,
    } = props
    /* eslint-disable no-nested-ternary */
    const defaultValue = defaultOption
      ? defaultOption.toJS()
      : placeholder ? createPlaceholderOption(placeholder) : undefined
    /* eslint-enable no-nested-ternary */
    /* eslint-disable jsx-a11y/label-has-for */
    return (
      <div className={getWrapperClassName(props)}>
        <input name={name} value={getValue() || ''} type="hidden" />
        {label ? <label className={getLabelClassName(props)}>{label}</label> : null}
        <SimpleSelect
          className={getClassName(props)}
          name={`${name}-react-selectize`}
          onValueChange={this.onValueChange}
          defaultValue={defaultValue}
          options={options.toJS()}
          theme=""
          hideResetButton
          editable={false}
          required={required}
          onBlur={onBlur}
        />
        <span className="form-select__error">{error}</span>
      </div>
    )
    /* eslint-enable jsx-a11y/label-has-for */
  }
}

FormSelect.defaultProps = {
  required: true,
}

FormSelect.propTypes = {
  defaultOption: ImmutablePropTypes.map,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: ImmutablePropTypes.list.isRequired,
  placeholder: PropTypes.string,
  wrapperClassName: PropTypes.array,
  required: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
}

export default HOC(FormSelect)
