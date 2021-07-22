import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import compose from 'recompose/compose'
import { withFormsy } from 'formsy-react'

function RadioGroup (props) {
  const {
    onChange: _onChange,
    getErrorMessage,
    setValue,
    children,
    name,
  } = props
  const error = getErrorMessage()
  const onChange = useCallback((e) => {
    const { target } = e
    let { value } = target
    if (_onChange) {
      const valueOnChange = _onChange(name, value)
      if (valueOnChange !== undefined) {
        value = valueOnChange
      }
    }
    setValue(value)
  }, [name])
  return (
    <div className="forminput-radiogroup">
      {React.Children.map(children, (c) => {
        return React.cloneElement(c, {
          getErrorMessage,
          onChange,
          name,
        })
      })}
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

RadioGroup.propTypes = {
  name: PropTypes.string.isRequired,
  validationError: PropTypes.string,
  validationErrors: PropTypes.object,
  onChange: PropTypes.func,
  validations: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
}

export default compose(
  withFormsy,
)(RadioGroup)
