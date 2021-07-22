import React from 'react'

function FormLine () {
  /* eslint-disable jsx-a11y/label-has-for */
  return (
    <div className="form__line">
      <label>{this.props.fieldLabel}</label>
      <input type={this.props.fieldType} />
    </div>
  )
  /* eslint-enable jsx-a11y/label-has-for */
}

export default FormLine
