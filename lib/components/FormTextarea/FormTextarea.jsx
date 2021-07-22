import PropTypes from 'prop-types'
import React, { Component } from 'react'
import _isFunction from 'lodash/isFunction'
import { withFormsy as HOC } from 'formsy-react'

function getClassName (props) {
  const { className } = props
  let classNames = ['form-textarea']
  if (className) {
    classNames = classNames.concat(className)
  }
  return classNames.join(' ')
}

function getLabelClassName (labelClass, props) {
  const { labelClassName } = props
  const className = [labelClass]

  return className.concat(labelClassName || []).join(' ')
}

class FormTextarea extends Component {
  componentDidMount () {
    const { defaultValue, setValue } = this.props
    if (defaultValue) {
      setValue(defaultValue)
    }
  }

  handleOnChange = (e) => {
    const { setValue, onChange } = this.props
    setValue(e.target.value)
    if (_isFunction(onChange)) {
      onChange(e.target.value)
    }
  }

  render () {
    const { props, onComponentRef, handleOnChange } = this
    const {
      name,
      placeholder,
      onFocus,
      onBlur,
      getValue,
      label,
      getErrorMessage,
    } = props
    return (
      <div>
        { label ?
          <label className={getLabelClassName('form-textarea__label', props)} htmlFor={name}>
            {label}
          </label> :
          null
        }
        <textarea
          ref={onComponentRef}
          name={name}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={handleOnChange}
          value={getValue() || ''}
          className={getClassName(props)}
          placeholder={placeholder}
        />
        {!getErrorMessage() ? null : (
          <span className={'form-textarea__error'}>{getErrorMessage()}</span>
        )}
      </div>
    )
  }
}

FormTextarea.propTypes = {
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.array,
  autoResize: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}

export default HOC(FormTextarea)
