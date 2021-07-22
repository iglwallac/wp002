import React from 'react'
import { withFormsy as HOC } from 'formsy-react'
import { connect as connectStaticText } from 'components/StaticText/connect'

function ForgotPasswordUsername (props) {
  const {
    name,
    staticText,
    showRequired,
    showError,
    setValue,
    getValue,
  } = props
  const prefix = 'forgot-password-username'
  let className = null
  if (showRequired()) {
    className = `${prefix} ${prefix}--required`
  }
  if (showError()) {
    className = `${prefix} ${prefix}--error`
  }

  return (
    <div className={className}>
      <label className={`${prefix}__label`} htmlFor={name}>
        {staticText.getIn(['data', 'email'])}
      </label>
      <input
        className={`${prefix}__text-box`}
        name={name}
        type="text"
        onChange={e => setValue(e.target.value)}
        value={getValue() || ''}
      />
    </div>
  )
}

const connectedForgotPasswordUsername = connectStaticText({
  storeKey: 'forgotPasswordUsername',
})(ForgotPasswordUsername)

export default HOC(connectedForgotPasswordUsername)
