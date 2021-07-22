import PropTypes from 'prop-types'
// eslint-disable-next-line no-unused-vars
import React from 'react'
import { connect as connectRedux } from 'react-redux'
import _get from 'lodash/get'
import _find from 'lodash/find'
import matchPath from 'services/resolver/match-path'

function RouterSwitch (props) {
  const { pathname, children } = props
  const component = _find(children, (child) => {
    const path = _get(child, ['props', 'path'])
    if (!path) return false
    if (path === pathname || path === '*') return true
    return matchPath({ path, pathname })
  })
  return component || null
}

RouterSwitch.propTypes = {
  pathname: PropTypes.string.isRequired,
}

export default connectRedux(
  state => ({ pathname: state.resolver.get('location', {}).pathname || '/' }),
)(RouterSwitch)
