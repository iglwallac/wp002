import PropTypes from 'prop-types'
import React from 'react'
import _isArray from 'lodash/isArray'
import Icon from 'components/Icon'
import { RENDER_TYPE_FORM_BUTTON_BUTTON, RENDER_TYPE_FORM_BUTTON_INPUT } from 'render'
import { FORM_BUTTON_TYPE_BUTTON, FORM_BUTTON_TYPE_SUBMIT } from './types'

function renderIcon (props) {
  const { iconClass } = props
  if (_isArray(iconClass)) {
    return <Icon iconClass={iconClass} />
  }
  return null
}

function getClassName (props) {
  const { formButtonClass } = props
  return ['form-button'].concat(formButtonClass || []).join(' ')
}

function FormButton (props) {
  const { renderType, text, disabled, name, formId, type, onClick } = props
  const isTypeButton = renderType === RENDER_TYPE_FORM_BUTTON_BUTTON
  const tagName = isTypeButton ? 'button' : 'input'
  return React.createElement(tagName, {
    value: isTypeButton ? undefined : text,
    className: getClassName(props),
    form: formId,
    disabled,
    onClick,
    type,
    name,
  }, isTypeButton ? [
    renderIcon(props),
    text,
  ] : null)
}

FormButton.propTypes = {
  type: PropTypes.oneOf([
    FORM_BUTTON_TYPE_BUTTON,
    FORM_BUTTON_TYPE_SUBMIT,
  ]).isRequired,
  renderType: PropTypes.oneOf([
    RENDER_TYPE_FORM_BUTTON_BUTTON,
    RENDER_TYPE_FORM_BUTTON_INPUT,
  ]).isRequired,
  formId: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  text: PropTypes.string.isRequired,
  formButtonClass: PropTypes.array.isRequired,
  iconClass: PropTypes.array,
  onClick: PropTypes.func,
}

export default FormButton
