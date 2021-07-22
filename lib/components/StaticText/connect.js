/*  eslint-disable react/jsx-filename-extension */
import React from 'react'
import { Map } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _partial from 'lodash/partial'
import { connect as connectRedux } from 'react-redux'

const COMPONENT_NAME =
  process.env.NODE_ENV === 'production' ? 'stc' : 'StaticTextConnect'

const defaultValue = Map()

export function connect (options) {
  const { storeKey } = options
  if (!storeKey) {
    throw new Error('The storeKey option is required.')
  }
  return _partial(wrapComponent, options)
}

function wrapComponent (options, WrappedComponent) {
  const { storeKey, propName = 'staticText' } = options

  function StaticTextHOC (props) {
    if (!WrappedComponent) {
      return null
    }
    return <WrappedComponent {...props} />
  }

  StaticTextHOC.displayName = `${COMPONENT_NAME}(${getDisplayName(
    WrappedComponent,
  )})`

  StaticTextHOC.propTypes = {
    [propName]: ImmutablePropTypes.map.isRequired,
  }

  const connectedStaticTextHOC = connectRedux(state =>
    // When modifying redux state props namespace the props
    // used in the HOC to protect other components
    ({
      [propName]: state.staticText.getIn(['data', storeKey], defaultValue),
    }),
  )(StaticTextHOC)

  return connectedStaticTextHOC
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default {
  connect,
}
/*  eslint-enable react/jsx-filename-extension */
