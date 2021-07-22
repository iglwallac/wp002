import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { withFormsy as HOC } from 'formsy-react'
import Icon from 'components/Icon'
import _partial from 'lodash/partial'
import _debounce from 'lodash/debounce'
import _isFunction from 'lodash/isFunction'
import _isString from 'lodash/isString'

export const FORM_INPUT_GROUP_TYPE_RADIO = 'radio'

function getClassName (props, state) {
  const { className, error, showError } = props
  const { errorsVisible } = state
  const classes = ['form-input-group']
  if (errorsVisible && (error || showError())) {
    classes.push('form-input-group--error')
  }
  return classes.concat(className || []).join(' ')
}

function getClassNameWithElement (props, state, element = '') {
  const classes = getClassName(props, state)
  if (!element || !_isString(element)) {
    return classes
  }
  return classes.split(' ').map(s => `${s}__${element}`).join(' ')
}

class FormInputGroup extends Component {
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
    const { onChange } = this.props
    this.setValue(e.target.value)
    if (_isFunction(onChange)) {
      onChange(e)
    }
  }

  onChangeInputProxy = (e, value) => {
    const { onChange } = this.props
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

  renderRadioInput = () => {
    const { props, state } = this
    const {
      name,
      value,
      options,
      getValue,
      disabled,
      onBlur,
      onFocus,
      isPristine,
    } = props
    return options.map((option) => {
      const optionValue = option.get('value')
      const optionLabel = option.get('label')
      const optionDisabled = option.get('disabled')
      const checked =
        isPristine() && value
          ? optionValue === value
          : optionValue === getValue()
      /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
      return (
        <div
          key={`form-input-group__radio--${option.get('value')}`}
          className={getClassNameWithElement(props, state, 'radio')}
        >
          <div className="form-input-group__radio-button">
            <input
              value={optionValue}
              className="form-input-group__radio-input"
              name={name}
              type={FORM_INPUT_GROUP_TYPE_RADIO}
              onChange={this.onChangeInput}
              onBlur={onBlur}
              onFocus={onFocus}
              checked={checked}
              disabled={disabled || optionDisabled}
            />
            <Icon
              iconClass={['form-input-group__radio-icon'].concat([
                checked
                  ? 'icon--radio-active form-input-group__radio-icon--active'
                  : 'icon--radio-inactive',
              ])}
              onClick={_partial(
                this.onChangeInputProxy,
                _partial.placeholder,
                optionValue,
              )}
            />
          </div>
          <label
            onClick={_partial(
              this.onChangeInputProxy,
              _partial.placeholder,
              optionValue,
            )}
            className={`form-input-group__label form-input-group__radio-label${checked
              ? ' form-input-group__radio-label--active'
              : ''}`}
            htmlFor={name}
          >
            {optionLabel}
          </label>
        </div>
      )
    })
    /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
  }

  render () {
    const { props, state } = this
    const { errorsVisible } = this.state
    // error is something you can pass manually via props getErrorMessage is Formsy.
    // error helps us work out AJAX validation.
    const { error, getErrorMessage } = props
    return (
      <div className={getClassName(props, state)}>
        {this.renderRadioInput()}
        {!errorsVisible || !error ? null : (
          <span className={'form-input-group__error'}>{error}</span>
        )}
        {!errorsVisible || !getErrorMessage() ? null : (
          <span className={'form-input-group__error'}>{getErrorMessage()}</span>
        )}
      </div>
    )
  }
}

FormInputGroup.propTypes = {
  className: PropTypes.array,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  options: ImmutablePropTypes.list.isRequired,
  type: PropTypes.oneOf([FORM_INPUT_GROUP_TYPE_RADIO]),
  disabled: PropTypes.bool,
  error: PropTypes.string,
  errorsVisibleDelay: PropTypes.number,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
  resetValue: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
}

export default HOC(FormInputGroup)
