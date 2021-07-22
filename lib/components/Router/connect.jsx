import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { Component } from 'react'
import _assign from 'lodash/assign'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'

const COMPONENT_NAME =
  process.env.NODE_ENV === 'production' ? 'rc' : 'RouterConnect'

/**
 * Connects page level behaviors for seo and language to child components.
 */
export function connect () {
  return function wrapComponent (WrappedComponent) {
    // eslint-disable-next-line react/prefer-stateless-function
    class RouterConnect extends Component {
      render () {
        const { props, context } = this
        const { history } = context
        const { resolver } = props
        if (!WrappedComponent) return null
        const componentProps = _assign({}, props, {
          location: resolver.get('location'),
          history,
        })
        return <WrappedComponent {...componentProps} />
      }
    }

    RouterConnect.displayName = `${COMPONENT_NAME}(${getDisplayName(
      WrappedComponent,
    )})`

    RouterConnect.propTypes = {
      resolver: ImmutablePropTypes.map.isRequired,
    }

    RouterConnect.contextTypes = {
      history: PropTypes.object.isRequired,
    }

    return compose(
      connectRedux(
        state => ({
          resolver: state.resolver,
        }),
      ),
    )(RouterConnect)
  }
}

export default connect

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
