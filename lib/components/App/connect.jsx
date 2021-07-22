import PropTypes from 'prop-types'
import React from 'react'
import { compose } from 'recompose'
import { connect as connectRouter } from 'components/Router/connect'
import _partial from 'lodash/partial'
import _isString from 'lodash/isString'

const COMPONENT_NAME =
  process.env.NODE_ENV === 'production' ? 'ac' : 'AppConnect'

export function connect (options) {
  const { className } = options
  if (!_isString(className)) {
    throw new Error(`${COMPONENT_NAME} requires a className option.`)
  }
  return _partial(wrapComponent, options)
}

export default connect

function wrapComponent (options, WrappedComponent) {
  function AppConnect (props) {
    const { className } = options
    if (!WrappedComponent) {
      return null
    }
    return (
      <div className={className}>
        <WrappedComponent {...props} />
      </div>
    )
  }

  AppConnect.displayName = `${COMPONENT_NAME}(${getDisplayName(
    WrappedComponent,
  )})`

  AppConnect.propTypes = {
    location: PropTypes.object.isRequired,
  }

  return compose(
    connectRouter(),
  )(AppConnect)
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
