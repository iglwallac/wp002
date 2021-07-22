import React from 'react'
import get from 'lodash/get'
import PropTypes from 'prop-types'
import toInt from 'lodash/parseInt'
import isString from 'lodash/isString'
import compose from 'recompose/compose'
import { withFormsy } from 'formsy-react'
import { copyToClipboard } from 'services/share'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { TYPES, getTag, getType, getClass, getLabelId, getInputId } from './utils'

function getComputedHeight (el) {
  if (global.getComputedStyle
    && el && el.tagName === 'TEXTAREA') {
    const currentHeight = el.offsetHeight
    const styles = global.getComputedStyle(el, null)
    const unusableHeight = toInt(styles.borderTopWidth)
      + toInt(styles.borderBottomWidth)
    el.style.height = '' // eslint-disable-line
    const height = el.scrollHeight + unusableHeight
    el.style.height = `${currentHeight}px` // eslint-disable-line
    return height > 0 ? height : 'auto'
  }
  return 'auto'
}

function getMaxLength ({ validations }) {
  if (isString(validations)) {
    const value = /maxLength:\s?(\d+)/.exec(validations)
    return value && toInt(value[1])
  }
  return get(validations, 'maxLength')
}

function getCount (props) {
  const { showCharCount } = props
  const maxLength = getMaxLength(props)
  if (showCharCount && maxLength) {
    const count = props.getValue().length
    return `${count}/${maxLength}`
  }
  return null
}

/**
 * Add additional format to the current errorMessage, i.e the length of the value
 * which is not accesible outside of this component.
 *
 * @param {string} errorMessage
 * @param {string} value
 * @returns {string}
 */
function formatError (errorMessage, value) {
  if (isString(errorMessage) && isString(value)) {
    return errorMessage.replace(/\$\{ passwordLength \}/, value.length)
  }
  return errorMessage
}

class Input extends React.Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      showError: false,
      copied: false,
      style: {},
    }
  }

  componentDidMount () {
    const { props } = this
    if (props.autogrow) {
      this.applyAutoGrow()
    }
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const { value: prevValue } = prevProps
    const { value: nextValue } = props
    // only do if the value was reset
    if (props.autogrow
      && (prevValue && !nextValue)) {
      // some hackery to re-measure the input
      // because even though the new value is empty
      // the Element value is still holding onto the old value.
      this.$input.value = ''
      this.applyAutoGrow()
    }
  }

  onChange = (e) => {
    const { props } = this
    const { currentTarget } = e
    const { value } = currentTarget
    const {
      autogrow,
      onChange,
      setValue,
      isValidValue,
      validationTimeout,
    } = props

    let nextValue = value

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    e.preventDefault()

    if (onChange) {
      const valueOnChange = onChange(nextValue, props, e)
      if (valueOnChange !== undefined) {
        nextValue = valueOnChange
      }
    }

    const nextState = {}

    if (autogrow) {
      const height = getComputedHeight(currentTarget)
      nextState.style = { height }
    }

    if (isValidValue(nextValue)) {
      nextState.showError = false
      this.setState(nextState)
    } else {
      // set state immediately incase autogrow
      this.setState(nextState)
      // delay error state setting
      this.timer = setTimeout(() => {
        this.setState({ showError: true })
        this.timer = null
      }, validationTimeout)
    }
    setValue(nextValue)
  }

  onBlur = (e) => {
    const { props } = this
    const { currentTarget } = e
    const { value } = currentTarget
    const { isValidValue, setValue, onBlur } = props

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    let modifiedValue = value

    if (onBlur) {
      modifiedValue = onBlur(value, props)
      if (modifiedValue) {
        setValue(modifiedValue)
      }
    }

    this.setState({
      showError: !isValidValue(modifiedValue),
    })
  }

  onCheckboxChange = (e) => {
    const { props } = this
    const { currentTarget } = e
    const { checked } = currentTarget
    const { onChecked, name } = props

    if (onChecked) {
      onChecked(name, checked)
    }
  }

  onCopy = (e) => {
    e.preventDefault()
    const { props } = this
    const { name, onClick } = props
    const id = getInputId(name)
    const input = document.getElementById(id)
    this.setState(() => ({
      copied: input
        ? copyToClipboard(input)
        : false,
    }))
    if (onClick) {
      onClick()
    }
  }

  getCopyClassName = () => {
    const { state } = this
    const { copied } = state
    const baseClass = ['forminput__copy']
    if (copied) {
      baseClass.push(`${baseClass}--copied`)
      return baseClass.join(' ')
    }
    return baseClass
  }

  getError () {
    const { props, state } = this
    const { staticText, showRequired } = props
    const { showError } = state

    if (showError) {
      const {
        getErrorMessage,
        showCharCount,
        isPristine,
        forceError,
        getValue,
      } = props

      const maxLength = getMaxLength(props)
      const required = showRequired()
      const value = getValue()

      if (required) {
        return staticText.getIn(['data', 'required'])
      }
      // custom functionality for showing the character count in red
      // instead of showing an error message. Requested by design team.
      if ((maxLength && showCharCount)
        && (value && value.length > maxLength)) {
        return getCount(props)
      }

      const currentError = getErrorMessage()
      const pristine = isPristine()

      if ((currentError || forceError) && !pristine) {
        const { validationError, validationErrors, validationErrorFormat } = props
        const formatErrorFn = validationErrorFormat || formatError
        return forceError
          ? get(validationErrors, forceError, validationError)
          : formatErrorFn(currentError, value)
      }
    }
    return null
  }

  applyAutoGrow () {
    const { style } = this.state
    const { height: prevHeight } = style
    const height = getComputedHeight(this.$input)
    if (height !== prevHeight) {
      this.setState({
        style: { height },
      })
    }
  }

  ref = (el) => {
    this.$input = el
  }

  renderCheckbox () {
    const { props, onCheckboxChange } = this
    const { checkable, checked, name } = props
    const id = `${getInputId(name)}-checkbox`
    if (checkable) {
      return (
        <span className="forminput__checkbox">
          <input
            onChange={onCheckboxChange}
            checked={checked}
            type="checkbox"
            value="1"
            name={id}
            id={id}
          />
          <label htmlFor={id}>
            <span className="assistive">
              {`Select ${props.label}`}
            </span>
          </label>
        </span>
      )
    }
    return null
  }

  render () {
    const { props, state } = this
    const { copied } = state
    const {
      showCharCount,
      showCheckMark,
      staticText,
      note,
      name,
      type,
    } = props

    const error = this.getError()
    const className = getClass(type, props, error)
    const labelId = getLabelId(name)
    const id = getInputId(name)
    const hidden = type === TYPES.HIDDEN

    const characterCount = getCount(props)

    return (
      <div className={className}>
        {this.renderCheckbox()}
        {React.createElement(getTag(type), {
          autoComplete: props.autocomplete,
          placeholder: props.placeholder,
          className: 'forminput__input',
          maxLength: props.maxLength,
          'aria-labelledby': labelId,
          required: props.required,
          readOnly: props.readonly,
          disabled: props.disabled,
          value: props.getValue(),
          onChange: this.onChange,
          checked: props.checked,
          onBlur: this.onBlur,
          type: getType(type),
          style: state.style,
          note: props.note,
          ref: this.ref,
          name: id,
          id,
        })}
        {!hidden ? (
          <label
            className="forminput__label"
            tab-index="-1"
            htmlFor={id}
            id={labelId}
          >
            {props.label}
          </label>
        ) : null}
        {props.copyable ? (
          <button
            className={this.getCopyClassName()}
            onClick={this.onCopy}
            type="button"
          >
            {(showCheckMark && copied) ? <IconV2 type={ICON_TYPES.CHECK} /> : null}
            {staticText.getIn(['data', copied ? 'copied' : 'copy'])}
          </button>
        ) : null}
        {showCharCount && characterCount && !error && !note ? (
          <span
            className="forminput__maxlength"
          >{characterCount}</span>
        ) : null}
        {note && !error ? (
          <span
            className="forminput__note"
          >{note}</span>
        ) : null}
        {error ? (
          <span
            role="alert"
            aria-live="polite"
            className="forminput__error"
          >{error}</span>
        ) : null}
      </div>
    )
  }
}

Input.defaultProps = {
  validationTimeout: 1,
  autogrow: false,
}

Input.propTypes = {
  validationTimeout: PropTypes.number,
  autocomplete: PropTypes.oneOf(['on', 'off']),
  validationErrors: PropTypes.object,
  validationErrorFormat: PropTypes.func,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  validationError: PropTypes.string,
  placeholder: PropTypes.string,
  showCharCount: PropTypes.bool,
  identifier: PropTypes.string,
  forceError: PropTypes.string,
  maxLength: PropTypes.number,
  onChecked: PropTypes.func,
  checkable: PropTypes.bool,
  onChange: PropTypes.func,
  inverted: PropTypes.bool,
  copyable: PropTypes.bool,
  required: PropTypes.bool,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  restrict: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  note: PropTypes.string,
  onBlur: PropTypes.func,
  value: PropTypes.any,
  mono: PropTypes.bool,
  autogrow: PropTypes.bool,
  validations: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  type: PropTypes.oneOf([
    TYPES.COMMENTBOX,
    TYPES.TIMECODE,
    TYPES.TEXTAREA,
    TYPES.PASSWORD,
    TYPES.CHECKBOX,
    TYPES.HIDDEN,
    TYPES.NUMBER,
    TYPES.EMAIL,
    TYPES.TEXT,
    TYPES.FILE,
    TYPES.TEL,
  ]),
}

export default compose(
  connectStaticText({ storeKey: 'formInputV2' }),
  withFormsy,
)(Input)
