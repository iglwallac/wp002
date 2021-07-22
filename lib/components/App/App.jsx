import React from 'react'
import PropTypes from 'prop-types'
import { connect as connectRedux } from 'react-redux'
import Main from 'components/Main'

function App (props, context) {
  const { history } = context
  const { children, location } = props
  return (
    <Main location={location} history={history}>
      {children}
    </Main>
  )
}

App.propTypes = {
  location: PropTypes.object.isRequired,
}

App.contextTypes = {
  history: PropTypes.object.isRequired,
}

export default connectRedux(state => ({
  location: state.resolver.get('location'),
}))(App)
