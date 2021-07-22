import compile, { getAppData } from 'react-universal/browser'
import { List, Map } from 'immutable'
import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'
import _isEqual from 'lodash/isEqual'
import { join as joinPromise } from 'bluebird'
import { get as getCookie } from 'cookies-js'
import { get as getConfig } from 'config'
import { setLogger, getLogger } from 'log'
import { getLogger as getLoggerBrowser } from 'log/browser'
import { createStore } from 'store/configureStore'
import { initialState } from 'reducers'
import { EN } from 'services/languages/constants'
import { getMenuData } from 'services/menu/actions'
import { setAnonymousUuid } from 'services/user/actions'
import { AUTH_COOKIE_NAME, setTokenDataInStorage } from 'services/auth'
import { getProfiles, initializePrompt } from 'services/user-profiles'
import { getResolverData, setResolverLocation } from 'services/resolver/actions'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import getViewport from 'services/app/_viewport'
import { createHistory } from 'services/resolver'
import { isAnonymousHome, isLogout } from 'services/url'
import { INTERSTITIAL_SELECT_PROFILE } from 'services/interstitial'
import { BOOTSTRAP_PHASE_INIT, BOOTSTRAP_PHASE_PRE_RENDER, BOOTSTRAP_PHASE_POST_RENDER, BOOTSTRAP_PHASE_COMPLETE } from 'services/app'
import { setAppBootstrapPhase } from 'services/app/actions'
import { getAnonymousUuid, refreshUuidOnRefocus } from './browser/anonymous'
import { getStaticTextData } from './services/static-text/actions'
import { init as initNewRelic } from './browser/new-relic'
import { init as initLanguage } from './browser/language'
import { LOCAL } from './environment'

/**
 * Import CSS files
 */
async function importCss () {
  if (!process.env.BROWSER) {
    return
  }
  await import(/* webpackChunkName: 'styles' */ './theme/web-app/_web-app.scss')
  // Third party CSS
  await import(/* webpackChunkName: 'styles' */ 'react-selectize/themes/index.css')
}

const config = getConfig()
const ENV_LOCAL = !process.env.NODE_ENV || process.env.NODE_ENV === LOCAL

/**
 * Reload the page when the data is not syned between
 * the hydrated data and the cookies to prevent inconsitent
 * behavior in the application
 */
function reloadNotSynced () {
  // Don't block the logout page.
  if (isLogout(_get(window, ['location', 'pathname']))) {
    return
  }
  const appData = getAppData()
  try {
    const authCookie = getCookie(AUTH_COOKIE_NAME)
    const auth = authCookie ? JSON.parse(authCookie) : {}
    const cookieJwt = _get(auth, 'jwt')
    const appAuth = _get(appData, ['hydrate', 'auth'])
    const appJwt = _get(appAuth, ['jwt'])
    if (cookieJwt !== appJwt) {
      // Write the app auth to the cookies
      // which will also clean duplicates
      setTokenDataInStorage(appAuth)
      window.location.reload()
    }
  } catch (err) {
    const log = getLogger()
    log.error(err, 'Failed parse auth cookie data in reloadNotSynced')
    // Do nothing
  }
}

/**
 * Initialize a buyan logger and set it in the library
 * as a singleton
 */
function initLogger () {
  const appData = getAppData()
  const uid = _get(appData, ['hydrate', 'auth', 'uid'])
  const logger = getLoggerBrowser(uid)
  setLogger(logger)
  return logger
}

/**
 * Render the application in the DOM using React
 */
function render ({ App, routes, renderAtNode, store, history }) {
  return compile({
    App,
    routes,
    location: global.location,
    renderAtNode,
    store,
    history,
    hmr: !_isUndefined(module.hot), // Apply an HMR strategry if module.hot is present
  })
}

async function renderHeadApp (options = {}) {
  const { store, history } = options
  const [{ default: App }, { default: routes }] = await joinPromise(
    import(/* webpackChunkName: 'headApp' */ 'components/HeadApp'),
    import(/* webpackChunkName: 'headApp' */ './routes/head-routes'),
  )
  return render({
    App,
    routes,
    store,
    history,
    renderAtNode: document.getElementById('head-app'),
  })
}

async function renderHeaderApp (options = {}) {
  const { store, history } = options
  const [{ default: App }, { default: routes }] = await joinPromise(
    import(/* webpackChunkName: 'headerApp' */ 'components/HeaderApp'),
    import(/* webpackChunkName: 'headerApp' */ './routes/header-routes'),
  )
  return render({
    App,
    routes,
    store,
    history,
    renderAtNode: document.getElementById('header-app'),
  })
}

async function renderApp (options = {}) {
  const { store, history } = options
  const [{ default: App }, { default: routes }] = await joinPromise(
    import(/* webpackChunkName: 'mainApp' */ 'components/App'),
    import(/* webpackChunkName: 'mainApp' */ './routes/routes'),
  )
  return render({
    App,
    routes,
    store,
    history,
    renderAtNode: document.getElementById('main-app'),
  })
}

async function renderFooterApp (options = {}) {
  const { store, history } = options
  const [{ default: App }, { default: routes }] = await joinPromise(
    import(/* webpackChunkName: 'footerApp' */ 'components/FooterApp'),
    import(/* webpackChunkName: 'footerApp' */ './routes/footer-routes'),
  )
  return render({
    App,
    routes,
    store,
    history,
    renderAtNode: document.getElementById('footer-app'),
  })
}

/**
 * Attach a listener to the history object which updates the
 * which dispatches actions resolver actions to redux
 * @param {object} options The options
 * @param {object} options.store A redux store
 * @param {object} options.location The location object from a history api event
 */
function attachResolverHistoryListener ({ store, location }) {
  // Only apply marketing layer proxy to the anonymous home page
  // When you are logged in and the feature is enabled
  const { pathname } = location
  const { auth } = store.getState()
  const jwt = auth.get('jwt')
  if (_get(config, 'features.marketing.proxyAnonymousHome') && isAnonymousHome(pathname, jwt)) {
    window.location.reload()
  }
  const { resolver } = store.getState()

  // location is an object like window.location
  if (pathname !== resolver.get('path')) {
    store.dispatch(getResolverData(location))
  } else if (!_isEqual(location, resolver.get('location'))) {
    // Have have already resolved the path so just update the location
    store.dispatch(setResolverLocation(location))
  }
}

const UNHANDLED_REJECTION_UNKNOWN_MESSAGE = 'Unknown reason in unhandledrejection'

/**
 * Log promise rejections which are not caught properly
 * @param {Object} options The options
 * @param {Object} options.log A logger that implements the console api
 * @param {Event} e A browser window event
 */
function onUnhandledRejection (options = {}, e) {
  const { log = console } = options
  // NOTE: e.preventDefault() must be manually called to prevent the default
  // action which is currently to log the stack trace to console.warn
  e.preventDefault()
  const detailReason = _get(e, ['detail', 'reason'])
  const reason = _get(e, ['reason'])
  log.error(detailReason || reason || UNHANDLED_REJECTION_UNKNOWN_MESSAGE)
}

/**
 * The entry point for the browser code in the Web App.
 */
export async function run () {
  const { logLevel } = config
  const startTime = new Date().getTime()
  const logger = initLogger()
  /**
   * Handle import errors by logging
   */
  function logBrowserError (error, name) {
    logger.error(error, `Browser run failed for ${name}`)
  }

  try {
    window.addEventListener('unhandledrejection', (e) => {
      onUnhandledRejection({ log: logger }, e)
    })
    importCss()
    initNewRelic({ appData: getAppData(), config })
    reloadNotSynced()

    const history = createHistory()
    const appData = getAppData()
    const rawAuth = _get(appData, ['hydrate', 'auth'])
    const resolverType = _get(appData, ['hydrate', 'resolver', 'data', 'type'])
    const dismissedProfileChooser = _get(appData, [
      'hydrate',
      'featureTracking',
      'data',
      'dismissedProfileChooser',
    ], false)
    const hydrate = _get(appData, 'hydrate', {})
    const isWebView = _get(hydrate, 'app.isWebView', false)

    let promptProfileSelector = false
    let profiles = []

    if (rawAuth && !isWebView) {
      const { data } = await getProfiles(rawAuth)
      profiles = data
      promptProfileSelector = initializePrompt({
        pathname: _get(appData, ['hydrate', 'resolver', 'path']),
        preference: dismissedProfileChooser,
        resolverType,
        profiles,
      })
    }

    hydrate.app.client = true
    hydrate.app.server = false
    hydrate.app.viewport = getViewport()
    hydrate.app.initializationStartTime = startTime
    hydrate.app.enableFooter = !promptProfileSelector
    hydrate.app.enableHeader = !promptProfileSelector
    hydrate.app.enableRoutes = !promptProfileSelector
    // set up the interstitial properties if we need them
    // renderedAt will store a date for us to match later when
    // it comes time to remove the interstitial (see watchers.js)
    hydrate.interstitial.renderedAt = promptProfileSelector
      ? (new Date()).getTime()
      : null
    // right now, the only interstitial that can surface on page
    // initialization is the SELECT_PROFILE view.
    hydrate.interstitial.view = promptProfileSelector
      ? INTERSTITIAL_SELECT_PROFILE
      : null

    hydrate.userProfiles = {
      promptProfileSelector,
      data: profiles,
    }

    // creates an anonymous uuid via script tag
    // which is cached via ETag and sits on the users machine
    // until they wipe out file cache.
    if (!rawAuth) {
      const uuid = await getAnonymousUuid()
      hydrate.user = hydrate.user || {}
      hydrate.user.data = hydrate.user.data || {}
      hydrate.user.data.anonymousUuid = uuid

      refreshUuidOnRefocus((refreshedUuid) => {
        store.dispatch(setAnonymousUuid(refreshedUuid))
      })
    }

    const store = await createStore({
      initialState,
      logLevel,
      hydrate,
      history,
    })

    store.dispatch(setAppBootstrapPhase(
      BOOTSTRAP_PHASE_INIT))

    // Hydrate static-text by just running the action, other actions
    // that return promises can be used the same way.
    // This happens before the application start so data will be hydrated.
    const { user = Map(), auth = Map() } = store.getState()
    const language = getPrimaryLanguage(user.getIn(['data', 'language'], List([EN])))
    const uid = user.getIn(['data', 'uid'])

    try {
      await joinPromise(
        store.dispatch(getMenuData({ language, uid })),
        store.dispatch(getStaticTextData(language)),
      )
    } catch (err) {
      logBrowserError(err, 'getMenuData or getStaticTextData')
    }
    // listen for resolver changes
    history.listen(location => attachResolverHistoryListener({ store, location }))
    // Render the React applications
    store.dispatch(setAppBootstrapPhase(
      BOOTSTRAP_PHASE_PRE_RENDER))

    try {
      await renderHeadApp({ store, history })
      // Webpack Hot Module Replacement API
      if (ENV_LOCAL && module.hot) {
        module.hot.accept([
          'reducers',
          'store/configureStore',
          './routes/header-routes',
          'components/HeadApp',
        ], () => {
          renderHeadApp({ store })
        })
      }
    } catch (err) {
      logBrowserError(err, 'headRoutes')
    }
    // skip rendering the header if we are
    // in a native application WebView
    if (!isWebView) {
      try {
        await renderHeaderApp({ store, history })
        // Webpack Hot Module Replacement API
        if (ENV_LOCAL && module.hot) {
          module.hot.accept([
            'reducers',
            'store/configureStore',
            './routes/header-routes',
            'components/HeaderApp',
          ], () => {
            renderHeaderApp({ store })
          })
        }
      } catch (err) {
        logBrowserError(err, 'headerRoutes')
      }
    }

    try {
      await renderApp({ store, history })
      // Webpack Hot Module Replacement API
      if (ENV_LOCAL && module.hot) {
        module.hot.accept([
          'reducers',
          'store/configureStore',
          './routes/routes',
          'components/App',
        ], () => {
          renderApp({ store })
        })
      }
    } catch (err) {
      logBrowserError(err, 'mainRoutes')
    }
    // skip rendering the footer if we are
    // in a native application WebView
    if (!isWebView) {
      try {
        await renderFooterApp({ store, history })
        // Webpack Hot Module Replacement API
        if (ENV_LOCAL && module.hot) {
          module.hot.accept([
            'reducers',
            'store/configureStore',
            './routes/footer-routes',
            'components/FooterApp',
          ], () => {
            renderFooterApp({ store })
          })
        }
      } catch (err) {
        logBrowserError(err, 'footerRoutes')
      }
    }

    store.dispatch(setAppBootstrapPhase(
      BOOTSTRAP_PHASE_POST_RENDER))

    // Show an alert if anonymous user has
    // different language then the page
    initLanguage({ auth, config, user, store })

    store.dispatch(setAppBootstrapPhase(
      BOOTSTRAP_PHASE_COMPLETE))
  } catch (e) {
    logger.error(e)
  }
}

export default run
