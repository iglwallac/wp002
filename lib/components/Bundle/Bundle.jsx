import React from 'react'
import get from 'lodash/get'
import omit from 'lodash/omit'
import Loadable from 'react-loadable'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'

const OMISSIONS = [
  'timeout', 'loading', 'loader', 'render', 'delay',
]

function prop (key, props, options) {
  return get(props, key, get(options, key, null))
}

function createLoadingHandler (props, options) {
  return function handleLoading (state) {
    if (state.pastDelay) {
      const style = prop('loadingStyles', props, options) || {}
      return (<section style={style} className="bundle bundle--loading">
        <Sherpa type={TYPE_LARGE} />
      </section>)
    }
    // if state.error
    // if state.timedOut
    return null
  }
}

function createComponent (props, options) {
  const loader = prop('loader', props, options)
  const loading = prop('loading', props, options)
    || createLoadingHandler(props, options)
  const delay = prop('delay', props, options)
  const render = prop('render', props, options)
  const timeout = prop('timeout', props, options)
  const settings = { loader, loading }
  if (delay) settings.delay = delay
  if (render) settings.render = render
  if (timeout) settings.timeout = timeout
  const Component = Loadable(settings)
  return Component
}

export default function createBundle (options = {}) {
  return class Bundle extends React.Component {
    static getDerivedStateFromProps (props, prevState) {
      if (!process.env.BROWSER) {
        return null
      }
      if (prevState.Component) return null
      return { Component: createComponent(props, options) }
    }
    constructor (props) {
      super(props)
      this.state = {}
    }
    render () {
      if (!process.env.BROWSER) {
        return null
      }
      const { state, props: allProps } = this
      const { Component } = state
      const props = omit(allProps, OMISSIONS)
      return <Component {...props} />
    }
  }
}
