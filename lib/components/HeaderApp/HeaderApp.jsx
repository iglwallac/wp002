import React from 'react' // eslint-disable-line no-unused-vars
import _first from 'lodash/first'
import _isArray from 'lodash/isArray'
import { compose } from 'recompose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectApp } from 'components/App/connect'

function HeaderApp (props) {
  const { children, enableHeader } = props
  if (enableHeader) {
    const component = _isArray(children)
      ? _first(children)
      : children
    return component || null
  }
  return null
}

HeaderApp.propTypes = {}

export default compose(
  connectApp({ className: 'header-app' }),
  connectRedux(({ app }) => ({
    enableHeader: app.get('enableHeader'),
  })),
)(HeaderApp)
