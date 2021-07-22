import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Map } from 'immutable'
import { withFormsy as HOC } from 'formsy-react'
import _partial from 'lodash/partial'
import { connect } from 'react-redux'

function onChange (e, props) {
  const { setValue } = props
  setValue(e.target.value)
}

function getClassName (showRequired, showError) {
  const className = ['login-username']
  if (showRequired) {
    className.push('login-username--required')
  }
  if (showError) {
    className.push('login-username--error')
  }
  return className.join(' ')
}

function onRefInput (component) {
  if (component && !component.value) {
    component.focus()
  }
}

class LoginUsername extends Component {
  render () {
    const props = this.props
    const {
      name,
      getValue,
      showError,
      showRequired,
      getErrorMessage,
      loginUsernameStaticText,
      customPlaceholder,
    } = props

    const placeholder = customPlaceholder || loginUsernameStaticText.getIn([
      'data',
      'emailPlaceholder',
    ])
    return (
      <div className={getClassName(showRequired(), showError())}>
        <label className={'login-username__label'} htmlFor={name}>
          {loginUsernameStaticText.getIn(['data', 'userNameOrEmail'])}
        </label>
        <input
          className={'login-username__text-box'}
          name={name}
          type="text"
          onChange={_partial(onChange, _partial.placeholder, props)}
          value={getValue() || ''}
          placeholder={placeholder}
          ref={onRefInput}
        />
        <span className={'login-username__error'}>{getErrorMessage()}</span>
      </div>
    )
  }
}

LoginUsername.propTypes = {
  name: PropTypes.string,
  labelText: PropTypes.string,
}

LoginUsername.contextTypes = {
  store: PropTypes.object.isRequired,
}

const connectedLoginUsername = HOC(LoginUsername)
export default connect(state => ({
  loginUsernameStaticText: state.staticText.getIn(
    ['data', 'loginUsername'],
    Map(),
  ),
}))(connectedLoginUsername)
