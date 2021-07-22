import React from 'react' // eslint-disable-line no-unused-vars
import _first from 'lodash/first'
import _isArray from 'lodash/isArray'
import { connect as connectRedux } from 'react-redux'
import { connect as connectApp } from 'components/App/connect'
import { compose } from 'recompose'

function FooterApp (props) {
  const { enableFooter, children } = props
  if (enableFooter) {
    const component = _isArray(children)
      ? _first(children)
      : children
    return component || null
  }
  return null
}

FooterApp.propTypes = {}

export default compose(
  connectApp({ className: 'footer-app' }),
  connectRedux(({ app }) => ({
    enableFooter: app.get('enableFooter'),
  })),
)(FooterApp)

