import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import { withFormsy as HOC } from 'formsy-react'
import { partial as _partial } from 'lodash'
import { connect } from 'react-redux'

function onChange (e, setValue) {
  setValue(e.target.value)
}

function getClassName (hasValidation, showRequired, hasErrors) {
  const className = ['login-password']
  if (hasValidation && showRequired) {
    className.push('login-password--required')
  }
  if (hasValidation && hasErrors) {
    className.push('login-password--error')
  }
  return className.join(' ')
}

/* eslint-disable react/prefer-stateless-function */
class LoginPassword extends Component {
  render () {
    const {
      name,
      labelText,
      hasErrors,
      hasValidation,
      loginPasswordStaticText,
      setValue,
      getValue,
      showRequired,
      customPlaceholder,
    } = this.props
    return (
      <div className={getClassName(hasValidation, showRequired(), hasErrors)}>
        <label className={'login-password__label'} htmlFor={name}>
          {labelText || loginPasswordStaticText.getIn(['data', 'password'])}
        </label>
        <input
          name={name}
          type="password"
          onChange={_partial(onChange, _partial.placeholder, setValue)}
          value={getValue() || ''}
          className={'login-password__text-box'}
          placeholder={customPlaceholder || ''}
        />
      </div>
    )
  }
}
/* eslint-enable react/prefer-stateless-function */

LoginPassword.propTypes = {
  name: PropTypes.string,
  labelText: PropTypes.string,
  hasErrors: PropTypes.bool,
  hasValidation: PropTypes.bool,
  loginPasswordStaticText: ImmutablePropTypes.map.isRequired,
}

LoginPassword.contextTypes = {
  store: PropTypes.object.isRequired,
}

const connectedLoginPassword = HOC(LoginPassword)
export default connect(state => ({
  loginPasswordStaticText: state.staticText.getIn(
    ['data', 'loginPassword'],
    Map(),
  ),
}))(connectedLoginPassword)
