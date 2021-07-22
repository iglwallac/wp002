/**
 * React server side rendering shared functionality
 * @module react-universal/server
 */
/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { renderToString, renderToStaticMarkup, renderToNodeStream } from 'react-dom/server'
import _map from 'lodash/map'
import Router from 'components/Router'
import RouterSwitch from 'components/RouterSwitch'
import Route from 'components/Route'
import { Provider } from 'react-redux'
import Loadable from 'react-loadable'
import { RENDER_TYPE_STATIC_MARKUP, RENDER_TYPE_NODE_STREAM } from './render-types'

/**
 * Compile data into a react application and return a render function
 */
export default async function compile (options = {}) {
  const { App, routes, store, history, url, renderType, modules } = options
  if (!url) {
    throw new Error('React universal requires a url.')
  }
  if (!modules) {
    throw new Error('React universal requires modules.')
  }
  if (!history) {
    throw new Error('React universal requires history.')
  }
  if (!routes) {
    throw new Error('React universal requires routes.')
  }
  if (!App) {
    throw new Error('React universal requires an App component.')
  }
  const context = {}
  const routeChildren = _map(routes, (route) => {
    const { path, component: childComponent } = route
    return <Route path={path} component={childComponent} key={`route-${path}`} />
  })
  const component = (
    <Loadable.Capture report={moduleName => modules.push(moduleName)}>
      <Router history={history} location={url} context={context}>
        <App>
          <RouterSwitch>
            {routeChildren}
          </RouterSwitch>
        </App>
      </Router>
    </Loadable.Capture>
  )
  return render({ component, store, renderType })
}

async function render (options) {
  try {
    const { store, renderType } = options
    let { component } = options
    if (store) {
      component = <Provider store={store}>{component}</Provider>
    }
    let renderMethod
    switch (renderType) {
      case RENDER_TYPE_STATIC_MARKUP:
        renderMethod = renderToStaticMarkup
        break
      case RENDER_TYPE_NODE_STREAM:
        renderMethod = renderToNodeStream
        break
      default:
        renderMethod = renderToString
        break
    }
    return renderMethod(component)
  } catch (err) {
    throw err
  }
}
