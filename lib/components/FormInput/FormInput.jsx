import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withFormsy as HOC } from 'formsy-react'
import Icon from 'components/Icon'
import _partial from 'lodash/partial'
import _debounce from 'lodash/debounce'
import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'

export const FORM_INPUT_TYPE_TEXT = 'text'
export const FORM_INPUT_TYPE_NUMBER = 'number'
export const FORM_INPUT_TYPE_TEL = 'tel'
export const FORM_INPUT_TYPE_MONTH = 'month'
export const FORM_INPUT_TYPE_EMAIL = 'email'
export const FORM_INPUT_TYPE_CHECKBOX = 'checkbox'

function getClassName (props, state) {
  const { className, error, showError } = props
  const { errorsVisible } = state
  const classes = ['form-input']
  if (errorsVisible && (error || showError())) {
    classes.push('form-input--error')
  }
  return classes.concat(className || []).join(' ')
}

function getLabelClassName (labelClass, props) {
  const { labelClassName } = props
  const className = [labelClass]

  return className.concat(labelClassName || []).join(' ')
}

function getCheckboxClassName (checked, disabled, hidden) {
  const prefix = 'form-input__checkbox'
  const className = [prefix]

  if (disabled) {
    className.push(`${prefix}--disabled`)
  }
  if (checked && !disabled) {
    className.push(`${prefix}--active`)
  }
  if (hidden) {
    className.push(`${prefix}--hidden`)
  }
  return className.join(' ')
}

function getTextInputClassName (disabled, classes) {
  const prefix = 'form-input__type'
  const className = [prefix]
  const customClassName = classes && _isArray(classes) ? classes.join(' ') : null

  if (disabled) {
    className.push(`${prefix}--disabled`)
  }

  if (customClassName) {
    className.push(customClassName)
  }

  return className.join(' ')
}

function onClickReset (e, props) {
  const { resetValue, onReset } = props
  resetValue()
  if (_isFunction(onReset)) {
    onReset(e)
  }
  e.target.focus()
}

class FormInput extends Component {
  constructor (props) {
    super(props)
    const { errorsVisibleDelay } = props
    if (errorsVisibleDelay) {
      this._setErrorsVisibleDelayed = _debounce(
        this.setErrorsVisible,
        errorsVisibleDelay,
      )
    }
    this.state = {
      errorsVisible: !errorsVisibleDelay,
    }
  }

  componentWillUnmount () {
    // Cancel debounce so we do not get errors about setState fire on unmounted component.
    if (this._setErrorsVisibleDelayed) {
      this._setErrorsVisibleDelayed.cancel()
    }
  }

  onChangeInput = (e) => {
    const { onChange, disabled } = this.props

    if (disabled) {
      return
    }

    this.setValue(e.target.value)
    if (_isFunction(onChange)) {
      onChange(e)
    }
  }

  onChangeInputProxy = (e, value) => {
    const { onChange, disabled } = this.props

    if (disabled) {
      return
    }

    this.setValue(value)
    if (_isFunction(onChange)) {
      if (!e.target.value) {
        e.target.value = value
      }
      onChange(e, value)
    }
  }

  setErrorsVisible = (errorsVisible) => {
    this.setState(() => ({ errorsVisible }))
  }

  setValue = (value) => {
    const { errorsVisibleDelay, setValue } = this.props
    const { errorsVisible } = this.state
    setValue(value)
    if (errorsVisibleDelay) {
      if (errorsVisible) {
        this.setErrorsVisible(false)
      }
      if (this._setErrorsVisibleDelayed) {
        this._setErrorsVisibleDelayed(true)
      }
    }
  }

  renderCheckboxInput = () => {
    const { props } = this
    const {
      name,
      value,
      label,
      disabled,
      checkedValue,
      getValue,
      onBlur,
      onFocus,
      isPristine,
      autoComplete,
      hidden,
    } = props
    const iconWrapperPrefix = 'form-input__checkbox-icon-wrapper'
    const iconWrapperClassName = [iconWrapperPrefix]
    const iconPrefix = 'form-input__checkbox-icon'
    const iconClassName = [iconPrefix]
    // If the input is pristine our initial checked state is true only if we have a value also.
    let checked = isPristine() && value ? true : checkedValue === getValue()
    if (disabled) {
      checked = checkedValue
      iconWrapperClassName.push(`${iconWrapperPrefix}--disabled`)
      iconClassName.push(`${iconPrefix}--disabled`)
    }
    if (checked && !disabled) {
      iconWrapperClassName.push(`${iconWrapperPrefix}--active`)
    }
    const nextValue = checked ? undefined : checkedValue
    /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
    return (
      <div className={getCheckboxClassName(checked, disabled, hidden)}>
        <input
          className="form-input__checkbox-input"
          name={name}
          type={FORM_INPUT_TYPE_CHECKBOX}
          onChange={_partial(
            this.onChangeInputProxy,
            _partial.placeholder,
            nextValue,
          )}
          onBlur={onBlur}
          onFocus={onFocus}
          checked={checked}
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <div
          className={iconWrapperClassName.join(' ')}
          onClick={_partial(
            this.onChangeInputProxy,
            _partial.placeholder,
            nextValue,
          )}
        >
          <Icon
            iconClass={iconClassName.concat([checked ? 'icon--check' : ''])}
          />
        </div>
        <label
          onClick={_partial(
            this.onChangeInputProxy,
            _partial.placeholder,
            nextValue,
          )}
          className={getLabelClassName('form-input__checkbox-label', props)}
          htmlFor={name}
        >
          {label}
        </label>
      </div>
    )
    /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
  }

  renderCheckbox = () => {
    const { props, state } = this
    return (
      <div className={getClassName(props, state)}>
        {this.renderCheckboxInput()}
      </div>
    )
  }

  render () {
    const { props, state } = this
    const { errorsVisible } = this.state
    // error is something you can pass manually via props getErrorMessage is Formsy.
    // error helps us work out AJAX validation.
    const {
      error,
      getErrorMessage,
      name,
      getValue,
      label,
      type,
      placeholder,
      disabled,
      onBlur,
      onFocus,
      autoFocus,
      maxLength,
      textInputClassName,
    } = props
    if (type === FORM_INPUT_TYPE_CHECKBOX) {
      return this.renderCheckbox()
    }
    /* eslint-disable jsx-a11y/no-autofocus */
    return (
      <div className={getClassName(props, state)}>
        <label className={getLabelClassName('form-input__label', props)} htmlFor={name}>
          {label}
        </label>
        <input
          className={getTextInputClassName(disabled, textInputClassName)}
          name={name}
          type={type}
          onChange={this.onChangeInput}
          onBlur={onBlur}
          onFocus={onFocus}
          autoFocus={autoFocus}
          maxLength={maxLength}
          value={getValue() || ''}
          placeholder={placeholder}
          disabled={disabled}
        />
        <span
          className="form-input__reset icon icon--close"
          onClick={_partial(onClickReset, _partial.placeholder, props)}
        />
        {!errorsVisible || !error ? null : (
          <span className={'form-input__error'}>{error}</span>
        )}
        {!errorsVisible || !getErrorMessage() ? null : (
          <span className={'form-input__error'}>{getErrorMessage()}</span>
        )}
      </div>
    )
    /* eslint-enable jsx-a11y/no-autofocus */
  }
}

FormInput.propTypes = {
  className: PropTypes.array,
  hidden: PropTypes.bool,
  labelClassName: PropTypes.array,
  textInputClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  value: PropTypes.any,
  type: PropTypes.oneOf([
    FORM_INPUT_TYPE_TEXT,
    FORM_INPUT_TYPE_NUMBER,
    FORM_INPUT_TYPE_TEL,
    FORM_INPUT_TYPE_MONTH,
    FORM_INPUT_TYPE_EMAIL,
    FORM_INPUT_TYPE_CHECKBOX,
  ]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  errorsVisibleDelay: PropTypes.number,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
  resetValue: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  checkedValue: PropTypes.any,
  autoFocus: PropTypes.bool,
  autoComplete: PropTypes.string,
  maxLength: PropTypes.number,
}

export default HOC(FormInput)
