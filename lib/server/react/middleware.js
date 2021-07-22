import newrelic from 'newrelic'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _assign from 'lodash/assign'
import _isObject from 'lodash/isObject'
import _reduce from 'lodash/reduce'
import _omit from 'lodash/omit'
import _last from 'lodash/last'
import _split from 'lodash/split'
import _parseInt from 'lodash/parseInt'
import _endsWith from 'lodash/endsWith'
import _concat from 'lodash/concat'
import performanceNow from 'performance-now'
import { Promise as BluebirdPromise } from 'bluebird'
import { getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import {
  getReqAuthUid,
  setFinalCacheHeaders,
  sendRes503RetryAfter,
} from 'server/common'
import { parseBrowserSafe as parseBrowserSafeEnvironment } from 'config/environment'
import { getAppDataAsScriptTag } from 'react-universal/app-data'
import { render as renderMu, parse as parseMu } from 'mustache'
import { isFast404 } from 'services/url'
import { SCRIPT_URL as OPTIMIZELY_SCRIPT_URL } from 'services/optimizely'
import strictUriEncode from 'strict-uri-encode'
import render from 'react-universal/server'
import { RENDER_TYPE_STATIC_MARKUP, RENDER_TYPE_NODE_STREAM } from 'react-universal/render-types'
import { createStore } from 'store/configureStore'
import { initialState as defaultInitialState } from 'reducers'
import { createHistory } from 'services/resolver'
import { getBundles } from 'react-loadable/webpack'
// Components
import Helmet from 'react-helmet'
import HeadApp from 'components/HeadApp'
import HeaderApp from 'components/HeaderApp'
import App from 'components/App'
import FooterApp from 'components/FooterApp'
// Routes
import headRoutes from 'routes/head-routes'
import headerRoutes from 'routes/header-routes'
import routes from 'routes/routes'
import footerRoutes from 'routes/footer-routes'

const APP_HEAD_TPL = '{{> appHead }}'
const APP_FOOT_TPL = '{{> appFoot }}'
const SERVER_ERROR_TPL = '{{> serverError }}'
const FAST_404_APP_TPL = '{{> fast404App }}'
const ENV_LOCAL = !process.env.NODE_ENV || process.env.NODE_ENV === 'local'
let serverErrorHtml = ''
let fast404AppHtml = ''

/**
 * Express middleware that renders a React  application server side
 * @param {Object} options The options
 * @returns {Functon} Express route handler
 */
export default function middleware (options) {
  const { loadables, assets, muPartials, config, app = {} } = options
  // const { serviceUnavailable } = config
  const { name, version } = app
  const ASSETS_SERVER = process.env.ASSETS_SERVER || (ENV_LOCAL ? 'http://localhost:8081' : '')
  const ASSETS_PATH = process.env.ASSETS_PATH || (ENV_LOCAL ? '/' : `/assets/${strictUriEncode(version)}/`)
  const log = getSetLogger(getLoggerServer())

  if (!assets) {
    throw new Error('React Middleware requires an "assets" option.')
  }
  if (!loadables) {
    throw new Error('React Middleware requires an "loadables" option.')
  }
  if (!config) {
    throw new Error('React Middleware requires a "config" option.')
  }
  if (muPartials && !_isObject(muPartials)) {
    throw new Error(
      'React Middleware cannot load muPartials because they are not an object.',
    )
  }
  if (!name) {
    throw new Error('React Middleware an app field of "name".')
  } else if (!version) {
    throw new Error('React Middleware an app field of "version".')
  }
  // Parse the mustache template for performance
  parseMu(APP_HEAD_TPL)
  parseMu(APP_FOOT_TPL)
  serverErrorHtml = renderMu(SERVER_ERROR_TPL, {}, muPartials)
  fast404AppHtml = renderMu(FAST_404_APP_TPL, {}, muPartials)

  /**
   * An express route handler which will render a React app a seciton at a time streaming the data
   * to the client to allow for a big pipe style delivery
   * @param {Object} req An Express request object
   * @param {Object} res An Express response object
   * @param {Function} next An express next callback function
   * @returns {Promise} A promise that is complete when the whole document has been sent
   * to the client
   */
  return async function route (req, res) {
    const { maxAge, retryAfter } = options
    const { logLevel } = config
    const uid = getReqAuthUid(req)
    const { path, url } = req
    const startPerformanceRoute = performanceNow()
    // webview is when native device applications
    // integrate our web pages into the application.
    const isWebView = _get(req, 'query.webview') === 'true'

    log.info({ uid, path }, 'React route start')
    // Routes are known 404 and should not be handled by React
    res.header('Content-Type', 'text/html')

    if (isFast404(path)) {
      res.status(404)
      setFinalCacheHeaders(req, res, { public: true, maxAge })
      res.send(fast404AppHtml)
      log.info({ uid, path }, 'React route complete fast 404')
      return
    }

    setFinalCacheHeaders(req, res, { public: true, maxAge })

    if (retryAfter) {
      sendRes503RetryAfter(res, retryAfter)
    } else if (/\/error\/(403|404|503|500)/.test(path)) {
      const status = _parseInt(_last(_split(path, '/')))
      res.status(status)
    }

    const newRelicScriptTag = newrelic.getBrowserTimingHeader()
    const menu = _get(req.hydrate, ['menu'])
    const appHydration = _get(req.hydrate, 'app', {})
    const hydrate = _assign(req.hydrate || {}, {
      env: parseBrowserSafeEnvironment(),
      app: _assign({}, appHydration, app),
      menu: menu ? menu.toJS() : {},
      assets,
    })
    // Omit items from App Data that are static so they are not encoded
    // They will be fetched by the browser instead so that can be cached
    let appData
    let history
    let initialState
    let store
    let startPerformanceRender
    let assetsUrl
    let optionsResponseHtml
    const modules = []

    try {
      appData = { hydrate: _omit(hydrate, ['staticText', 'menu']) }
      history = createHistory(url)
      initialState = _assign({}, defaultInitialState)
      store = await createStore({ initialState, hydrate, logLevel })
      startPerformanceRender = performanceNow()
      assetsUrl = `${ASSETS_SERVER}${ASSETS_PATH}`
      optionsResponseHtml = _assign({}, options, { assetsUrl, appData })
    } catch (e) {
      e.path = path
      e.uid = uid
      log.error(e, 'React route failed to boostrap')
      res.status(500)
      setFinalCacheHeaders(req, res, { public: true, maxAge })
      res.send(serverErrorHtml)
      return
    }

    try {
      // Start head
      await render({
        renderType: RENDER_TYPE_STATIC_MARKUP,
        routes: headRoutes,
        App: HeadApp,
        loadables,
        modules,
        history,
        appData,
        store,
        url,
      })
      const helmet = Helmet.rewind()
      const head = {
        htmlAttributes: helmet.htmlAttributes.toString(),
        title: helmet.title.toString(),
        meta: helmet.meta.toString(),
        link: helmet.link.toString(),
        inlineScripts: helmet.script.toString(),
      }
      const headHtml = await getResponseHeadHtml(
        optionsResponseHtml, newRelicScriptTag, head)
      res.write(headHtml)
    } catch (e) {
      Helmet.rewind()
      e.path = path
      e.uid = uid
      log.error(e, 'React route headApp error')
    }
    // End head

    // Start headerApp
    // if we are in a native app WebView,
    // skip the header
    if (!isWebView) {
      res.write('<div id="header-app">')
      try {
        const stream = await render({
          App: HeaderApp,
          routes: headerRoutes,
          loadables,
          modules,
          renderType: RENDER_TYPE_NODE_STREAM,
          url,
          history,
          appData,
          store,
        })
        await createResStreamPromise(res, stream)
      } catch (e) {
        e.path = path
        e.uid = uid
        log.error(e, 'React route headerApp error')
      }
      res.write('</div>')
    }
    // End headerApp

    // Start mainApp
    res.write('<div id="main-app">')
    try {
      const stream = await render({
        App,
        routes,
        loadables,
        modules,
        renderType: RENDER_TYPE_NODE_STREAM,
        url,
        history,
        appData,
        store,
      })
      await createResStreamPromise(res, stream)
    } catch (e) {
      res.write(serverErrorHtml)
      e.path = path
      e.uid = uid
      log.error(e, 'React route mainApp error')
    }
    res.write('</div>')
    // End mainApp

    // Start footApp
    // if we are in a native app WebView,
    // skip the footer
    if (!isWebView) {
      res.write('<div id="footer-app">')
      try {
        const stream = await render({
          App: FooterApp,
          routes: footerRoutes,
          loadables,
          modules,
          renderType: RENDER_TYPE_NODE_STREAM,
          url,
          history,
          appData,
          store,
        })
        await createResStreamPromise(res, stream)
      } catch (e) {
        e.path = path
        e.uid = uid
        log.error(e, 'React route footerApp error')
      }
      res.write('</div>')
    }
    // End footApp
    log.info({ uid, path, workTime: (performanceNow() - startPerformanceRender).toFixed(3) }, 'React route render complete')
    optionsResponseHtml.bundles = getBundles(loadables, modules)
    const footHtml = await getResponseFootHtml(optionsResponseHtml)
    res.write(footHtml)
    res.end()
    log.info({ uid, path, workTime: (performanceNow() - startPerformanceRoute).toFixed(3) }, 'React route complete')
  }
}

function createResStreamPromise (res, stream) {
  return new BluebirdPromise((resolve, reject) => {
    stream.pipe(res, { end: false })
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

/**
 * Get the HTML to be render at the foot of the document i.e. tracking scripts
 * after content is rendered
 * @param {Object} options The options
 * @returns {String} The rendered HTML
 */
async function getResponseFootHtml (options) {
  const {
    appData,
    assets,
    config,
    muPartials,
    assetsUrl,
    bundles,
  } = options
  // Remove these vars from appData, things like styles are not used in the app
  // and will bloat HTML size.
  const hydrateIgnoreKey = []
  const filteredHydrate = _omit(_get(appData, 'hydrate', {}), hydrateIgnoreKey)
  const filteredAppData = _assign({}, appData, { hydrate: filteredHydrate })
  const view = {
    foot: { scripts: getAppDataAsScriptTag(filteredAppData) },
    auth: _get(appData, ['hydrate', 'auth']),
    assets,
    assetsUrl,
    bundles: _reduce(bundles, (acc, bundle) => {
      const file = _get(bundle, 'file')
      if (_endsWith(file, '.js')) {
        return _concat(acc, file)
      }
      return acc
    }, []),
    config,
    smartling: _get(config, ['features', 'smartling'], false)
      ? _get(config, ['features', 'smartling'])
      : null,
    optimizely: OPTIMIZELY_SCRIPT_URL,
  }
  return renderMu(APP_FOOT_TPL, view, muPartials)
}

/**
 * Get the HTML to be render at the head of the document i.e. scripts
 * that need to be loaded before render
 * @param {Object} options The options
 * @returns {String} The rendered HTML
 */
async function getResponseHeadHtml (options, newRelicScriptTag, head) {
  const {
    appData,
    assets,
    config,
    muPartials,
    assetsUrl,
  } = options
  const view = {
    head,
    auth: _get(appData, ['hydrate', 'auth']),
    assets,
    assetsCssEnabled: _has(assets, ['styles', 'css']) && !ENV_LOCAL,
    assetsUrl,
    config,
    newRelicScriptTag,
    smartling: _get(config, ['features', 'smartling'], false)
      ? _get(config, ['features', 'smartling'])
      : null,
    optimizely: OPTIMIZELY_SCRIPT_URL,
    appLang: _get(appData, ['hydrate', 'user', 'data', 'language', 0], 'en'),
    appRoute: _get(appData, ['hydrate', 'resolver', 'path'], '/'),
  }
  return renderMu(APP_HEAD_TPL, view, muPartials)
}
