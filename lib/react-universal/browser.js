/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { hydrate as reactDOMRender } from 'react-dom'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _map from 'lodash/map'
import _isString from 'lodash/isString'
import Router from 'components/Router'
import RouterSwitch from 'components/RouterSwitch'
import Route from 'components/Route'
import { Provider } from 'react-redux'
import Loadable from 'react-loadable'
import { fromCallback } from 'bluebird'
import { decode as decodeBase64 } from 'base-64'
import { APP_DATA_VARIABLE_NAME } from './app-data'

let cachedHistory = null

/**
 * Get the appData from which is located on the window.
 * It starts as a string which is then parsed into an object
 * and the result saved back into the window.
 */
export function getAppData (_window = global) {
  let appData = _get(_window, APP_DATA_VARIABLE_NAME, {})
  // If the data is a string it needs to be parse into an object.
  if (_isString(appData)) {
    try {
      appData = JSON.parse(decodeURIComponent(escape(decodeBase64(appData))))
    } catch (e) {
      appData = {}
    }
    _set(_window, APP_DATA_VARIABLE_NAME, appData)
  }
  return appData
}

/**
 * Complile a React application in the browser
 * {object} options - The options
 * {array} options.routes - An array of react router routes
 * {object} options.location - A location object
 * {object} options.store - A redux store for the react-redux provider
 * {object} options.renderAtNode - A DOM node to apply the react render
 *
 * {boolean} options.hmr - If true enables HMR support
 *  i.e. a random integer on the router key prop to cause renedering
 */
export default async function compile (options = {}) {
  const {
    App,
    routes,
    location,
    store,
    renderAtNode = document,
    history,
    hmr,
  } = options
  if (!location) {
    throw new Error('React universal requires a location.')
  }
  if (!routes) {
    throw new Error('React universal requires routes.')
  }
  if (!renderAtNode) {
    throw new Error('React universal requires renderAtNode.')
  }
  if (!App) {
    throw new Error('React universal requires an App component.')
  }
  if (history) {
    cachedHistory = history
  }
  const routeChildren = _map(routes, (route) => {
    const {
      path: childPath,
      component: childComponent,
    } = route
    return (
      <Route path={childPath} component={childComponent} key={`route-${childPath}`} />
    )
  })
  const component = (
    <Router history={cachedHistory} location={location} key={hmr ? Math.random() : undefined}>
      <App>
        <RouterSwitch>
          {routeChildren}
        </RouterSwitch>
      </App>
    </Router>
  )
  return render({ component, store, renderAtNode, history: cachedHistory })
}

async function render (options) {
  const { store, renderAtNode } = options
  let { component } = options
  if (store) {
    component = <Provider store={store}>{component}</Provider>
  }
  await Loadable.preloadReady()
  await fromCallback(done => reactDOMRender(component, renderAtNode, done))
  return { history }
}
