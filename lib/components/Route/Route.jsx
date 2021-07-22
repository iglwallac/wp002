import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { Component } from 'react'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import _assign from 'lodash/assign'

// eslint-disable-next-line react/prefer-stateless-function
class Route extends Component {
  render () {
    const { props, context } = this
    const {
      component: Element,
      resolver,
    } = props
    const { history } = context
    const componentProps = _assign({}, props, {
      location: resolver.get('location'),
      history,
    })
    return <Element {...componentProps} />
  }
}

Route.propTypes = {
  path: PropTypes.string.isRequired,
  resolver: ImmutablePropTypes.map.isRequired,
  // component: PropTypes.string.isRequired,
}

Route.contextTypes = {
  history: PropTypes.object.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      resolver: state.resolver,
    }),
  ),
)(Route)
