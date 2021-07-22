import React, { PureComponent } from 'react'
import _get from 'lodash/get'
import { connect as connectRedux } from 'react-redux'

class ExternalApp extends PureComponent {
  componentDidMount () {}
  componentWillReceiveProps () {}

  render () {
    const { assets, apiKey } = this.props
    const html = _get(assets, 'html', '')

    /* eslint-disable react/no-danger */
    return (
      <div
        className={`externalApp--${apiKey}`}
        dangerouslySetInnerHTML={html}
      />
    )
    /* eslint-enable react/no-danger */
  }
}

function connectState (state, props) {
  const key = _get(props, 'appKey')

  return {
    assets: _get(state, ['externalApp', key, 'assets']),
    processing: _get(state, ['externalApp', key, 'processing']),
  }
}

export default connectRedux(connectState)(ExternalApp)
