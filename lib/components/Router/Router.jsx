import PropTypes from 'prop-types'
// eslint-disable-next-line no-unused-vars
import React, { Component, Children } from 'react'

class Router extends Component {
  getChildContext () {
    return { history: this.props.history }
  }

  render () {
    const { props } = this
    const { children } = props
    return Children.only(children)
  }
}

Router.propTypes = {
  history: PropTypes.object.isRequired,
}

Router.childContextTypes = {
  history: PropTypes.object.isRequired,
}

export default Router
