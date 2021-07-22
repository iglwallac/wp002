/* eslint-disable import/prefer-default-export */
import { get as getConfig } from 'config'
import { getLogger as getLoggerServer } from 'log/server'
import { getSetLogger } from 'log'
import morganMiddlware from 'log/morgan'
import express from 'express'
import { json as jsonParserMiddleware } from 'body-parser'
import { Promise as BluebirdPromise } from 'bluebird'
import _get from 'lodash/get'
import _assign from 'lodash/assign'
import _replace from 'lodash/replace'
import faviconMiddleware from 'serve-favicon'
import compression from 'compression'
import cookieParserMiddleware from 'cookie-parser'
import localeMiddleware from 'express-locale'
import { parse as parseQuery } from 'services/query-string'
import { resolve as resolvePath } from 'path'
import {
  setOrigin as setOriginApiClient, setAgentKeepAlive, setAgentKeepAliveHttps, DEFAULT_TIMEOUT,
} from 'api-client'
import Agent, { HttpsAgent } from 'agentkeepalive'
import proxy from 'express-http-proxy'
import Loadable from 'react-loadable'
import errorMiddleware from 'error-handler/middleware'
import serverStatusMiddleware from './server/server-status/middleware'
import serverInformationMiddleware from './server/server-information/middleware'
import robotsTxtMiddleware from './server/robots-txt/middleware'
import manifestMiddleware, {
  TYPE_JSON as MANIFEST_TYPE_JSON,
  TYPE_IMG_512 as MANIFEST_TYPE_IMG_512,
  TYPE_IMG_192 as MANIFEST_TYPE_IMG_192,
} from './server/manifest/middleware'
import iosPasswordAutofillMiddleware from './server/ios-password-autofill/middleware'
import androidSiteAssociationMiddleware from './server/android-site-association/middleware'
import authMiddleware from './server/auth/middleware'
import resolverMiddleware from './server/resolver/middleware'
import redirectMiddleware from './server/redirect/middleware'
import hydrateMiddleware from './server/hydrate/middleware'
import hydrateFilterSetMiddleware from './server/hydrate-filter-set/middleware'
import hydrateMenuMiddleware from './server/hydrate-menu/middleware'
import hydrateUserFeatureTrackingMiddleware from './server/hydrate-user-feature-tracking/middleware'
import sitemapXmlMiddleware from './server/sitemap-xml/middleware'
import stsMiddleware from './server/strict-transport-security/middleware'
import xRobotsTagMiddleware from './server/x-robots-tag/middleware'
import newRelicMiddleware from './server/new-relic/middleware'
import passwordResetMiddleware from './server/password-reset/middleware'
import reactMiddleware from './server/react/middleware'
import simulationMiddleware from './server/simulate/middleware'
import { init as tplInitMuPartials } from './server/react/mu-partials'
import playlistMiddleware from './server/playlist/middleware'
import shareViewMiddleware from './server/share-view/middleware'
import hydrateWebAppStaticTextMiddleware from './server/hydrate-static-text/middleware'
import anonymousMiddleware from './server/anonymous/middleware'
import varyMiddleware from './server/vary/middleware'
import cacheDeleteMiddleware from './server/cache/middleware-delete'
import marketingLayerMiddleware from './server/marketing-layer/middleware'
import communityBlogLayerMiddleware from './server/community-blog-layer/middleware'
import serviceUnavailableMiddleware from './server/service-unavailable/middleware'
import captchaMiddleware from './server/captcha/middleware'

/* eslint-disable no-process-exit */

const log = getSetLogger(getLoggerServer())
const config = getConfig()
const FORCE_SERVER_EXIT_TIME = 10000
const TPL_MU_ROOT = resolvePath(__dirname, 'components-tpl')
const NEW_RELIC_LICENSE_KEY = process.env.NEW_RELIC_LICENSE_KEY
let gracefulShutdownPartial

const ENV = process.env.APP_ENV || process.env.NODE_ENV || 'local'

function setListeners (options) {
  const { server } = options
  gracefulShutdownPartial = () => gracefulShutdown({ server })
  // listen for TERM signal .e.g. kill
  process.on('SIGTERM', gracefulShutdownPartial)
  // listen for INT signal e.g. Ctrl-C
  process.on('SIGINT', gracefulShutdownPartial)
  log.info('Web App Server Created Graceful Shutdown Signal Listeners')
}

function removeListeners () {
  process.removeListener('SIGTERM', gracefulShutdownPartial)
  process.removeListener('SIGINT', gracefulShutdownPartial)
  log.info('Web App Server Removed Graceful Shutdown Signal Listeners')
}

function startServer (app) {
  return new BluebirdPromise(async (resolve) => {
    log.info('Starting Web App Server')
    const { httpPort, hostname } = getConfig()
    await Loadable.preloadAll()
    const server = app.listen(httpPort, hostname, function onServerListen () {
      const { address, port } = this.address()
      log.info(`Web App Server Started and Listening at ${address}:${port}`)
      resolve(this)
    })
    server.keepAliveTimeout = _get(config, 'server.keepAliveTimeout', 65000)
    setListeners({ server })
  })
}

function configureExpress (options) {
  const { loadables, assets, tplMuPartials, version, name } = options
  const {
    appLocale,
    appCache,
    appMaintenance,
    redirect,
    robotsCanIndex,
    robotsNoIndexHeader,
    renderConcurrency,
    origin,
    cloudfrontDistributionId,
    marketingLayerUrl,
    servers = {},
  } = config
  const { brooklyn } = servers

  const cookieParser = cookieParserMiddleware()
  const jsonParser = jsonParserMiddleware()
  const retryAfter = appMaintenance.enabled ? appMaintenance.retryAfter : false
  log.info('Web App Server Configure Express')
  const app = express()
  app.disable('etag')
  app.disable('x-powered-by')
  if (ENV !== 'local') {
    app.enable('view cache')
    app.use(compression())
    app.set('trust proxy', true)
  } else {
    app.disable('view cache')
  }
  app.set('query parser', parseQuery)
  app.use(serverInformationMiddleware({ version, name }))
  app.use(morganMiddlware())
  app.use(xRobotsTagMiddleware({ noindex: robotsNoIndexHeader }))
  if (ENV !== 'local') {
    app.use(stsMiddleware({ 'max-age': appCache.maxAge }))
  }
  app.get('/server-status', serverStatusMiddleware())
  app.get('/favicon.ico', faviconMiddleware(resolvePath(__dirname, 'favicon/img/favicon.ico')))
  app.get('/robots.txt',
    redirectMiddleware({
      maxAge: appCache.maxAge,
      https: redirect.https,
      hostname: redirect.hostname,
    }),
    robotsTxtMiddleware({
      maxAge: appCache.maxAge,
      canIndex: robotsCanIndex,
      retryAfter,
    }),
  )
  app.get('/manifest.json',
    manifestMiddleware({
      type: MANIFEST_TYPE_JSON,
      maxAge: appCache.maxAge,
      canIndex: robotsCanIndex,
      retryAfter,
    }),
  )
  app.get('/manifest/img/homescreen512.png',
    manifestMiddleware({
      type: MANIFEST_TYPE_IMG_512,
      maxAge: appCache.maxAge,
      canIndex: robotsCanIndex,
      retryAfter,
    }),
  )
  app.get('/manifest/img/homescreen192.png',
    manifestMiddleware({
      type: MANIFEST_TYPE_IMG_192,
      maxAge: appCache.maxAge,
      canIndex: robotsCanIndex,
      retryAfter,
    }),
  )
  app.get('/sitemap.xml',
    sitemapXmlMiddleware({
      url: brooklyn,
      retryAfter,
      maxAge: appCache.maxAge,
      log,
    }),
  )
  app.get('/.well-known/apple-app-site-association',
    iosPasswordAutofillMiddleware({
      maxAge: appCache.maxAge,
      retryAfter,
    }),
  )
  app.get('/.well-known/assetlinks.json',
    androidSiteAssociationMiddleware({
      maxAge: appCache.maxAge,
      canIndex: robotsCanIndex,
      retryAfter,
    }),
  )
  app.post(
    '/simulate',
    express.urlencoded({ extended: false }),
    simulationMiddleware(),
  )

  /**
   * Endpoint to verify Google Recaptcha tokens
   */
  app.post('/v1/captcha/verify-token',
    jsonParser,
    captchaMiddleware({ log }),
  )

  /**
   * Middleware chain used to make HTTP request corrections and hydrate data for
   * React application using Redux
   * @type {Array}
   */
  const applicationMiddleware = [
    cookieParser,
    authMiddleware(),
    varyMiddleware(),
    localeMiddleware({
      default: appLocale,
      priority: ['accept-language', 'default'],
    }),
    resolverMiddleware({ log }),
    redirectMiddleware({
      maxAge: appCache.maxAge,
      https: redirect.https,
      hostname: redirect.hostname,
    }),
    hydrateUserFeatureTrackingMiddleware(),
    hydrateMiddleware(),
    hydrateWebAppStaticTextMiddleware(),
    hydrateFilterSetMiddleware(),
    hydrateMenuMiddleware(),
    shareViewMiddleware({ origin }),
    newRelicMiddleware({ enabled: !!NEW_RELIC_LICENSE_KEY }),
    passwordResetMiddleware({
      paths: ['/password-reset'],
      log,
    }),
    playlistMiddleware({
      paths: ['/playlist'],
      log,
    }),
  ]

  const reactApplciationMiddleware = [
    serviceUnavailableMiddleware(config, {
      muPartials: tplMuPartials,
    }),
    applicationMiddleware,
    reactMiddleware({
      concurrency: renderConcurrency,
      muPartials: tplMuPartials,
      maxAge: appCache.maxAge,
      app: { version, name },
      retryAfter,
      loadables,
      config,
      assets,
    }),
  ]

  /**
   * Middleware chain to handle both anonymous and authenticated requests
   * to WordPress aka marketing layer
   * @type {Array}
   */
  const marketingLayerAllMiddleware = [
    // resolverMiddleware({ enableHeadersAndStatus: false, log }),
    redirectMiddleware({
      maxAge: appCache.maxAge,
      https: redirect.https,
      hostname: redirect.hostname,
    }),
    marketingLayerMiddleware({
      url: marketingLayerUrl,
      skipAuthenticated: false,
      name,
      version,
    }),
  ]

  /** WP Admin Default */
  const marketingLayerPassThroughProxyMiddleware = proxy(_replace(marketingLayerUrl, /\/$/, ''), {
    timeout: 35000,
  })

  /** WP Admin Post Saves */
  const wordPressAdminPassThroughProxyMiddleware = proxy(_replace(marketingLayerUrl, /\/$/, ''), {
    timeout: 120000, // Large post saves need some extra time to process, especially under admin load (2 mins to buffer it out)
  })

  // Articles
  app.get('/articles/*', marketingLayerAllMiddleware)
  app.get('/articles/?', marketingLayerAllMiddleware)
  app.get('/article/*', marketingLayerAllMiddleware)

  // Handle the careers paths
  app.get('/careers/*', marketingLayerAllMiddleware)
  app.get('/careers/?', marketingLayerAllMiddleware)

  // Handle /tv/* before 2 character catch all URL
  app.get('/tv/*', reactApplciationMiddleware)

  // Handle /go before 2 character catch all URL
  app.get('/go', reactApplciationMiddleware)

  // Admin Get/Post Saves/Loads
  app.get('/wp-admin/post.php*', wordPressAdminPassThroughProxyMiddleware)
  app.get('/wp-admin/post.php?', wordPressAdminPassThroughProxyMiddleware)
  app.post('/wp-admin/post.php*', wordPressAdminPassThroughProxyMiddleware)
  app.post('/wp-admin/post.php?', wordPressAdminPassThroughProxyMiddleware)

  // All other Admin Gets
  app.get('/wp-admin/*', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-admin/?', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-json/*', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-json/?', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-includes/*', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-includes/?', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-login.php*', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-login.php?', marketingLayerPassThroughProxyMiddleware)
  app.get('/wp-admin/options-permalink.php*', wordPressAdminPassThroughProxyMiddleware)
  app.get('/wp-admin/options-permalink.php?', wordPressAdminPassThroughProxyMiddleware)

  // All other Admin Posts
  app.post('/wp-admin/*', marketingLayerPassThroughProxyMiddleware)
  app.post('/wp-admin/?', marketingLayerPassThroughProxyMiddleware)
  app.post('/wp-admin/options-permalink.php*', wordPressAdminPassThroughProxyMiddleware)
  app.post('/wp-admin/options-permalink.php?', wordPressAdminPassThroughProxyMiddleware)
  app.post('/wp-json/*', marketingLayerPassThroughProxyMiddleware)
  app.post('/wp-json/?', marketingLayerPassThroughProxyMiddleware)
  app.post('/wp-includes/*', marketingLayerPassThroughProxyMiddleware)
  app.post('/wp-includes/?', marketingLayerPassThroughProxyMiddleware)
  app.post('/wp-login.php*', marketingLayerPassThroughProxyMiddleware)

  // WordPress files
  app.get('/wp-content/*', marketingLayerPassThroughProxyMiddleware)

  // Admin Login
  app.post('/wp-login.php?', marketingLayerPassThroughProxyMiddleware)

  // 2 character catch all, URLs are passed to the markeing layer i.e. /lp, /es/, /en, etc.
  app.get(/^\/[a-z]{2}\/?$/i, marketingLayerAllMiddleware)

  // 2 character catch all, followed by path i.e. /lp/*, /es/*, etc.
  app.get(/^\/[a-z]{2}\/.*$/i, marketingLayerAllMiddleware)

  // Wordpress sitemap
  app.get(['/us-en-sitemap.xml', '/sitemap-pt-*.xml'], proxy(_replace(marketingLayerUrl, /\/$/, ''), {
    timeout: 10000, // 10 second timeout
  }))

  // Delete entries in the CDN
  app.delete('/cache', jsonParser, cacheDeleteMiddleware({ cloudfrontDistributionId }))

  // Proxy the community blog through the marketing layer
  app.get(
    ['/community-blog', '/community-blog/*'],
    applicationMiddleware, // Needs all data to determine auth
    communityBlogLayerMiddleware({ url: marketingLayerUrl, name, version }),
  )

  // Apply marketing layer proxy to the anonymous home page
  if (_get(config, 'features.marketing.proxyAnonymousHome')) {
    app.get('/',
      applicationMiddleware, // Needs all data to determine auth
      marketingLayerMiddleware({
        url: marketingLayerUrl,
        skipAuthenticated: true,
        name,
        version,
      }),
    )
  }
  // anonymous tracking script
  app.get('/v1/anonymous', anonymousMiddleware(config))

  // React server side HTML rendering related middleware
  app.get('/*', reactApplciationMiddleware)
  app.use(errorMiddleware())
  log.info('Web App Server Configure Express Complete')
  return app
}

export async function run (options) {
  log.info('Web App Server Starting')
  const { version } = options
  let startUpError
  if (!version) {
    startUpError = new Error('Web App Server the version option is required.')
  } else if (!version) {
    startUpError = new Error('Web App Server the name option is required.')
  }
  // Fail if we have a startup error
  if (startUpError) {
    log.warn('Web App Server Not Started')
    log.error(startUpError)
    throw startUpError
  }
  setOriginApiClient(_get(config, 'origin'))
  const agents = Object.freeze({
    http: new Agent({
      maxSockets: 100,
      maxFreeSockets: 10,
      timeout: DEFAULT_TIMEOUT,
      freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
      agentName: 'HttpAgent',
    }),
    https: new HttpsAgent({
      maxSockets: 100,
      maxFreeSockets: 10,
      timeout: DEFAULT_TIMEOUT,
      freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
      agentName: 'HttpsAgent',
    }),
  })
  setAgentKeepAlive(agents.http)
  setAgentKeepAliveHttps(agents.https)
  try {
    log.info('Web App Server Tpl Mu Partials Starting')
    const tplMuPartials = await tplInitMuPartials({ muRoot: TPL_MU_ROOT })
    log.info('Web App Server Tpl Mu Partials Complete')
    log.info('Web App Server Preload Complete')
    const app = configureExpress(_assign({}, options, { agents, tplMuPartials }))
    const server = await startServer(app)
    log.info('Starting Web App React Server Complete')
    return server
  } catch (err) {
    log.error(err, 'Web App Server Not Started')
    throw err
  }
}

function onServerClose (timeout) {
  clearTimeout(timeout)
  log.info('Web App Server Closed out remaining connections')
}

function forceServerExit () {
  log.error(
    `Web App Server Could Not Close Connections After ${FORCE_SERVER_EXIT_TIME /
      1000} Seconds, Forcefully Shutting Down`,
  )
  process.exit()
}

/**
 * This function is called when you want the server to die gracefully
 * i.e. wait for existing connections to close.
 * @param {object} server an express server.
 * @return {undefined}
 */
function gracefulShutdown (options) {
  const { server } = options
  removeListeners()
  log.info('Web App Server Received Kill Signal, Shutting Down Gracefully')
  const timeout = setTimeout(forceServerExit, FORCE_SERVER_EXIT_TIME)
  server.close(() => onServerClose(timeout))
  if (!ENV || ENV === 'local') {
    log.info('Web App Server Received Kill Signal, Local Hard Shutdown')
    setTimeout(() => process.exit(), 10)
  }
}
