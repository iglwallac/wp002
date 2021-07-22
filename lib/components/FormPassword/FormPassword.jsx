import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _partial from 'lodash/partial'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import { withFormsy as HOC } from 'formsy-react'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { PASSWORD_REGEX, PASSWORD_LENGTH, PASSWORD_INPUT_MAX_CHARS } from 'services/password'

function onChange (e, setValue) {
  setValue(e.target.value)
}

function getClassName (showError, showProgress) {
  const className = ['form-password']
  if (showProgress) {
    className.push('form-password--indicator-bar')
  }
  if (showError()) {
    className.push('form-password--error')
  }
  return className.join(' ')
}

function getLabelClassName (labelClass, props) {
  const { formPasswordLabelClassName } = props
  const className = [labelClass]

  return className.concat(formPasswordLabelClassName || []).join(' ')
}

function getFormPasswordInputClassName (classes) {
  const prefix = 'form-password__type'
  const className = [prefix]
  const customClassName = classes && _isArray(classes) ? classes.join(' ') : null

  if (customClassName) {
    className.push(customClassName)
  }

  return className.join(' ')
}

function getPasswordProgress (value) {
  let progress = 0
  const valLength = value.length
  const hasUppercaseAndNumber = PASSWORD_REGEX.test(value)

  if (valLength < 8 && valLength > 1) {
    progress = valLength
  }
  if (valLength > PASSWORD_LENGTH) {
    progress = PASSWORD_LENGTH
  }
  if (hasUppercaseAndNumber) {
    /* eslint-disable no-plusplus */
    progress++
    /* eslint-enable no-plusplus */
  }
  return (
    `form-password__indicator-bar form-password__indicator-bar--${progress}`
  )
}

class FormPassword extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showPassword: false,
    }
  }

  onInputRef = (component) => {
    this._input = component
  }

  togglePassword = () => {
    this.setState(({ showPassword }) => ({ showPassword: !showPassword }))

    if (this._input) {
      this._input.focus()
    }
  }

  /**
 * Add additional format to the current errorMessage, i.e the length of the value
 * which is not accesible outside of this component.
 *
 * @returns {string}
 */
  formatErrorMessage = () => {
    const props = this.props
    const { getErrorMessage, getValue } = props
    const errorMessage = getErrorMessage()
    const value = getValue()

    if (_isString(errorMessage) && _isString(value)) {
      return errorMessage.replace(/\$\{ passwordLength \}/, value.length)
    }
    return errorMessage
  }

  render () {
    const props = this.props
    const { showPassword } = this.state
    const {
      label,
      name,
      showProgress,
      placeholder,
      getValue,
      setValue,
      onBlur,
      onFocus,
      showError,
      getErrorMessage,
      formPasswordStaticText,
      formPasswordInputClassName,
    } = props
    /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
    return (
      <div className={getClassName(showError, showProgress)}>
        <label className={getLabelClassName('form-password__label', props)} htmlFor={name}>
          {label}
        </label>
        <p className="form-password__toggle" onClick={() => this.togglePassword()}>
          {showPassword
            ? formPasswordStaticText.getIn(['data', 'hide'])
            : formPasswordStaticText.getIn(['data', 'show'])}
        </p>
        <input
          className={getFormPasswordInputClassName(formPasswordInputClassName)}
          name={name}
          type={showPassword ? 'text' : 'password'}
          ref={this.onInputRef}
          onChange={
            _partial(onChange, _partial.placeholder, setValue)
          }
          onBlur={onBlur ? _partial(onBlur) : null}
          onFocus={onFocus ? _partial(onFocus) : null}
          value={getValue() || ''}
          placeholder={placeholder}
          maxLength={PASSWORD_INPUT_MAX_CHARS}
        />
        {!showProgress ? null : (
          <span className="form-password__indicator-container">
            <span className={getPasswordProgress(getValue() || '')} />
          </span>
        )}
        {!getErrorMessage() ? null : (
          <span className="form-password__error">{this.formatErrorMessage()}</span>
        )}
      </div>
    )
    /* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
  }
}

FormPassword.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  showProgress: PropTypes.bool,
  formPasswordStaticText: ImmutablePropTypes.map.isRequired,
  formPasswordInputClassName: PropTypes.array,
  formPasswordLabelClassName: PropTypes.array,
}

FormPassword.defaultProps = {
  showProgress: false,
}

FormPassword.contextTypes = {
  store: PropTypes.object.isRequired,
}

const connectedFormPassword = HOC(FormPassword)
export default connectStaticText({
  storeKey: 'formPassword',
  propName: 'formPasswordStaticText',
})(connectedFormPassword)
