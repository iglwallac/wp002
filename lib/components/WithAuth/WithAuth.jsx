import React from 'react'
import { connect as connectRedux } from 'react-redux'

const WithAuth = React.memo((props) => {
  const { jwt, children } = props
  if (jwt) return children
  return null
})

export default connectRedux(
  state => ({ jwt: state.auth.get('jwt') }),
)(WithAuth)
