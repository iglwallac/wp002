import React from 'react'
import map from 'lodash/map'
import reduce from 'lodash/reduce'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { withFormsy } from 'formsy-react'
import IconV2 from 'components/Icon.v2'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getClass, getLabelId, getInputId } from './utils'

export const FILE_TYPES = {
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
  PNG: 'image/png',
}

class FileInput extends React.Component {
  //
  constructor (props) {
    super(props)
    this.state = {
      showError: false,
      copied: false,
    }
  }

  onChange = (e) => {
    const { props } = this
    const { currentTarget } = e
    const { files } = currentTarget
    const { onChange, setValue } = props

    e.preventDefault()

    let result = this.getValidValue(files)
    let message = this.getErrorMessage(files)

    if (onChange) {
      const valueOnChange = onChange(result, props)
      if (valueOnChange !== undefined) {
        message = this.getErrorMessage(valueOnChange)
        result = valueOnChange
      }
    }
    this.setState({
      errorMessage: message,
      showError: !!message,
    })
    setValue(result)
  }

  getErrorMessage (files) {
    const { props } = this
    const {
      currentFileCount,
      staticText,
      fileLimit,
      multiple,
      required,
      accepts,
    } = props

    const fileCount = files.length
    const validFiles = this.getValidValue(files)
    const totalFileCount = fileCount + currentFileCount

    if (multiple
      && fileLimit > 0
      && totalFileCount > fileLimit) {
      return staticText.getIn(
        ['data', 'fileLimitExceeded'], '')
        .replace(/\$\{limit\}/, fileLimit)
    }
    if (validFiles.length < fileCount) {
      const mime = accepts.join(', ')
        .replace(/\w+\/(\w+)/g, '$1')
        .toUpperCase()
      return staticText.getIn(
        ['data', 'invalidFileExtension'], '')
        .replace(/\$\{mime\}/, mime)
    }
    if (required && validFiles.length < 1) {
      return staticText.getIn(
        ['data', 'required'])
    }
    return ''
  }

  getValidValue (files) {
    const { props } = this
    const {
      currentFileCount,
      accepts: a,
      fileLimit,
      multiple,
    } = props

    const accepts = [].concat(a)
    const validFiles = reduce(files, (out, file) => {
      if (accepts.length < 1
        || accepts.indexOf(file.type) > -1) {
        out.push(file)
      }
      return out
    }, [])

    if (multiple && fileLimit > 0) {
      const remain = fileLimit - currentFileCount
      return remain > 0
        ? validFiles.splice(0, remain)
        : []
    }
    return validFiles
  }

  getError () {
    const { state } = this
    const { showError, errorMessage } = state
    return showError
      ? errorMessage
      : null
  }

  getAccepts () {
    const { props } = this
    const { accepts } = props
    return accepts.join(',')
  }

  getLabel () {
    const { props } = this
    const {
      placeholder,
      staticText,
      multiple,
      getValue,
      label,
      icon,
    } = props

    if (icon) {
      return (
        <React.Fragment>
          <IconV2 type={icon} />
          {label}
        </React.Fragment>
      )
    }

    const placeholderField = multiple
      ? 'fileMultiplePlaceholder'
      : 'filePlaceholder'
    const value = map(getValue(), f => f.name)
    const labelPlaceholder = value || placeholder
      || staticText.getIn(['data', placeholderField])

    return (
      <React.Fragment>
        {label}
        <span
          className="forminput__placeholder"
          role="presentation"
        >{labelPlaceholder}
        </span>
      </React.Fragment>
    )
  }

  render () {
    const { props } = this
    const { name, note, icon } = props
    const error = this.getError()
    const labelId = getLabelId(name)
    const id = getInputId(name)

    let className = getClass('file', props, error)

    className += icon
      ? ' forminput--file-icon'
      : ' forminput--file-standard'

    return (
      <div className={className}>
        {React.createElement('input', {
          className: 'forminput__input',
          'aria-labelledby': labelId,
          accept: this.getAccepts(props),
          required: props.required,
          readOnly: props.readonly,
          disabled: props.disabled,
          multiple: props.multiple,
          onChange: this.onChange,
          style: props.style,
          note: props.note,
          type: 'file',
          value: '',
          name: id,
          id,
        })}
        <label
          className="forminput__label"
          htmlFor={id}
          id={labelId}
        >{this.getLabel()}
        </label>
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

FileInput.defaultProps = {
  validationTimeout: 1,
  currentFileCount: 0,
  multiple: false,
  accepts: [],
  limit: -1,
}

FileInput.propTypes = {
  currentFileCount: PropTypes.number,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  identifier: PropTypes.string,
  fileLimit: PropTypes.number,
  onChange: PropTypes.func,
  inverted: PropTypes.bool,
  required: PropTypes.bool,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  note: PropTypes.string,
  icon: PropTypes.string,
  value: PropTypes.any,
  validations: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  accepts: PropTypes.arrayOf(
    PropTypes.oneOf([
      FILE_TYPES.JPEG,
      FILE_TYPES.JPG,
      FILE_TYPES.PNG,
    ]),
  ),
}

export default compose(
  connectStaticText({ storeKey: 'formInputV2' }),
  withFormsy,
)(FileInput)
