/* eslint-disable import/prefer-default-export */
import { createStore as reduxCreateStore, applyMiddleware, compose } from 'redux'
import { createMiddleware as createWitnessMiddleware } from 'redux-witness'
import thunkMiddleware from 'redux-thunk'
import rootReducer from 'reducers'
import { fromJS } from 'immutable'
import _assign from 'lodash/assign'
import _get from 'lodash/get'
import _concat from 'lodash/concat'
import authMiddleware from 'services/auth/middleware'
import assetsMiddleware from 'services/assets/middleware'
import eventTrackingMiddleware from 'services/event-tracking/middleware'
import userMiddleware from 'services/user/middleware'
import dispatchWhenMiddleware from 'services/dispatch-when/middleware'
import optimizelyMiddleware from 'services/optimizely/middleware'
import dialogMiddleware from 'services/dialog/middleware'
import featureTrackingMiddleware from 'services/feature-tracking/middleware'
import tileRowsMiddleware from 'components/TileRows/middleware'
import paytrackMiddleware from 'services/paytrack/middleware'
import userAccountMiddleware from 'services/user-account/middleware'
import searchMiddleware from 'services/search/middleware'
import toolTipMiddleware from 'services/tool-tip/middleware'
import liveAccessEventsMiddleware from 'services/live-access-events/middleware'
import seriesMiddleware from 'services/series/middleware'
import videosMiddleware from 'services/videos/middleware'
import userNodeInfoMiddleware from 'services/user-node-info/middleware'
import pmScreenMiddleware from 'services/pm-screen/middleware'
import pmSectionMiddleware from 'services/pm-section/middleware'
import pmListMiddleware from 'services/pm-list/middleware'
import pmPlacementMiddleware from 'services/pm-placement/middleware'
import onboardingMiddleware from 'services/onboarding/middleware'
import guidesMiddleware from 'services/guides/middleware'
import guideDaysMiddleware from 'services/guide-days/middleware'
// new middleware pattern for Redux-Witness
import * as abuseWatchers from 'services/abuse/watchers'
import * as appWatchers from 'services/app/watchers'
import * as authWatchers from 'services/auth/watchers'
import * as checkoutWatchers from 'services/checkout/watchers'
import * as cookieWatchers from 'services/cookie/watchers'
import * as communityWatchers from 'services/community/watchers'
import * as detailWatchers from 'services/detail/watchers'
import * as dialogWatchers from 'services/dialog/watchers'
import * as emailSignupWatchers from 'services/email-signup/watchers'
import * as filterSetWatchers from 'services/filter-set/watchers'
import * as getstreamWatchers from 'services/getstream/watchers'
import * as giftWatchers from 'services/gift/watchers'
import * as hiddenContentWatchers from 'services/hidden-content-preferences/watchers'
import * as hideWatchedWatchers from 'services/hide-watched/watchers'
import * as inboundTrackingWatchers from 'services/inbound-tracking/watchers'
import * as interstitialWatchers from 'services/interstitial/watchers'
import * as jumbotronWatchers from 'services/jumbotron/watchers'
import * as notificationWatchers from 'services/notifications/watchers'
import * as onboardingWatchers from 'services/onboarding/watchers'
import * as plansWatchers from 'services/plans/watchers'
import * as playlistWatchers from 'services/playlist/watchers'
import * as portalWatchers from 'services/portal/watchers'
import * as profitwellWatchers from 'services/profitwell/watchers'
import * as referralWatchers from 'services/referral/watchers'
import * as serverTimeWatchers from 'services/server-time/watchers'
import * as shareWatchers from 'services/share/watchers'
import * as subscriptionWatchers from 'services/subscription/watchers'
import * as termWatchers from 'services/term/watchers'
import * as testarossaWatchers from 'services/testarossa/watchers'
import * as userAccountWatchers from 'services/user-account/watchers'
import * as userProfilesWatchers from 'services/user-profiles/watchers'
import * as zuoraWatchers from 'services/zuora/watchers'
import * as videoWatchers from 'services/video/watchers'

// special watchers that require configuration parameters are imported differently
import createNavigationWatchers from 'services/navigation/watchers'

const { BROWSER } = process.env

/**
 * Get the middleware for use in the store.
 * @param {Dbject} options The options for the function
 * @param {String} [options.enableReduxLogger] Enable Redux logger middleware
 * @param {Object} [options.history] The application history object from npm history package
 * @returns {Array} An array of middleware
 */
async function getMiddleware (options = {}) {
  const { enableReduxLogger = false, history } = options
  // Do not assign middleware on the server since it does nothing
  if (!BROWSER) {
    return []
  }
  // create a new Witness middleware
  const witnessMiddleware = createWitnessMiddleware()
  const navigationWatchers = createNavigationWatchers(history)
  // apply watcher functions to middleware
  witnessMiddleware.run(
    navigationWatchers,
    appWatchers,
    authWatchers,
    interstitialWatchers,
    testarossaWatchers,
    userProfilesWatchers,
    onboardingWatchers,
    notificationWatchers,
    shareWatchers,
    getstreamWatchers,
    portalWatchers,
    playlistWatchers,
    termWatchers,
    checkoutWatchers,
    giftWatchers,
    abuseWatchers,
    emailSignupWatchers,
    cookieWatchers,
    communityWatchers,
    plansWatchers,
    dialogWatchers,
    zuoraWatchers,
    profitwellWatchers,
    detailWatchers,
    referralWatchers,
    userAccountWatchers,
    filterSetWatchers,
    jumbotronWatchers,
    serverTimeWatchers,
    subscriptionWatchers,
    hideWatchedWatchers,
    hiddenContentWatchers,
    inboundTrackingWatchers,
    videoWatchers,
  )

  const middleware = [
    thunkMiddleware,
    authMiddleware,
    assetsMiddleware,
    witnessMiddleware,
    dispatchWhenMiddleware,
    dialogMiddleware,
    eventTrackingMiddleware,
    userMiddleware,
    optimizelyMiddleware,
    tileRowsMiddleware,
    featureTrackingMiddleware,
    paytrackMiddleware,
    userAccountMiddleware,
    searchMiddleware,
    toolTipMiddleware,
    liveAccessEventsMiddleware,
    seriesMiddleware,
    videosMiddleware,
    userNodeInfoMiddleware,
    pmScreenMiddleware,
    pmSectionMiddleware,
    pmListMiddleware,
    pmPlacementMiddleware,
    onboardingMiddleware,
    guidesMiddleware,
    guideDaysMiddleware,
  ]

  if (enableReduxLogger) {
    // eslint-disable-next-line global-require
    try {
      // const { whyDidYouUpdate } = await import('why-did-you-update')
      // whyDidYouUpdate(React, { exclude: /Formsy|Testarossa/ })
      const { logger: reduxLoggerMiddleware } = await import('redux-logger')
      return _concat(middleware, reduxLoggerMiddleware)
    } catch (err) {
      // Do nothing just return the middleware below
    }
  }
  return middleware
}

/**
 * Prepare the redux store for the app.
 * @param {Object} options The options for the function
 * @param {Object} [options.initialState] The initial state for the store
 * @param {Object} [options.hydrate] The data to replace in initial state
 * @param {String} [options.logLevel] The logging level
 * @param {Object} [options.history] The application history object from npm history package
 * @returns {Object} A redux store instance
 */
export async function createStore (options = {}) {
  const { initialState = {}, hydrate = {}, history, logLevel } = options
  const state = _assign({}, initialState)
  if (hydrate.menu) {
    state.menu = fromJS({ data: hydrate.menu })
  }
  if (hydrate.resolver) {
    state.resolver = state.resolver.withMutations(mutateState =>
      mutateState
        .set('path', hydrate.resolver.path)
        .set('query', fromJS(hydrate.resolver.query))
        .set('location', hydrate.resolver.location) // Keep this a plain JS object
        .set('data', fromJS(hydrate.resolver.data)),
    )
    state.header = state.header
      .set('id', state.resolver.getIn(['data', 'id']))
      .set('notificationsMenuSection', state.resolver.getIn(['query', 'section']))
  }
  if (hydrate.app) {
    state.app = fromJS(hydrate.app)
  }
  if (hydrate.interstitial) {
    state.interstitial = fromJS(hydrate.interstitial)
  }
  if (hydrate.jumbotron) {
    state.jumbotron = fromJS(hydrate.jumbotron)
  }
  if (hydrate.category) {
    state.category = fromJS(hydrate.category)
  }
  if (hydrate.userProfiles) {
    state.userProfiles = fromJS(hydrate.userProfiles)
  }
  if (hydrate.tiles) {
    state.tiles = fromJS(hydrate.tiles)
  }
  if (hydrate.getstream) {
    state.getstream = fromJS(hydrate.getstream)
  }
  if (hydrate.resetPassword) {
    state.resetPassword = fromJS(hydrate.resetPassword)
  }
  if (hydrate.shareView) {
    state.shareView = fromJS(hydrate.shareView)
  }
  if (hydrate.shareData) {
    state.share = fromJS(hydrate.shareData)
  }
  if (hydrate.videos) {
    const videos = !hydrate.videos.videosData || !hydrate.videos.videoIds
      ? state.videos
      : state.videos.withMutations((mutateState) => {
        hydrate.videos.videoIds.forEach((videoId) => {
          const key = Number(videoId)
          const itemData = _get(hydrate.videos.videosData, [key, 'data'], {})
          const itemError = _get(hydrate.videos.videosData, [key, 'error'])
          if (itemError) {
            mutateState
              .setIn([key, hydrate.videos.language, 'processing'], false)
              .deleteIn([key, hydrate.videos.language, 'data'])
              .setIn([key, hydrate.videos.language, 'error'], itemError)
          } else {
            mutateState
              .setIn([key, hydrate.videos.language, 'processing'], false)
              .setIn([key, hydrate.videos.language, 'data'], fromJS(itemData))
              .deleteIn([key, hydrate.videos.language, 'error'])
          }
        })
      })
    state.videos = videos
  }
  if (hydrate.shelf) {
    state.shelf = fromJS(hydrate.shelf)
  }
  if (hydrate.video) {
    state.video = state.video.withMutations(mutateState =>
      mutateState
        .set('id', hydrate.video.id)
        .set('path', hydrate.resolver.path)
        .set('data', fromJS(hydrate.video.data)),
    )
  }
  if (hydrate.detail) {
    state.detail = fromJS(hydrate.detail)
  }
  if (hydrate.media) {
    state.media = fromJS(hydrate.media)
  }
  if (hydrate.portal) {
    state.portal = fromJS(hydrate.portalData)
  }
  if (hydrate.auth) {
    state.auth = fromJS(hydrate.auth)
  }
  if (hydrate.userVideo) {
    state.userVideo = state.userVideo.withMutations(mutateState =>
      mutateState
        .set('id', hydrate.userVideo.id)
        .set('path', hydrate.resolver.path)
        .set('data', fromJS(hydrate.userVideo.data)),
    )
  }
  if (hydrate.plans) {
    state.plans = fromJS(hydrate.plans)
  }
  if (hydrate.home) {
    state.home = state.home.set('data', fromJS(hydrate.home))
  }
  if (hydrate.tilesArticle) {
    state.tilesArticle = fromJS(hydrate.tilesArticle)
  }
  if (hydrate.serverTime) {
    state.serverTime = fromJS(hydrate.serverTime)
  }
  if (hydrate.page) {
    state.page = fromJS(hydrate.page)
  }
  if (hydrate.filterSet) {
    state.filterSet = fromJS(hydrate.filterSet)
  }
  if (hydrate.recentlyAdded) {
    state.recentlyAdded = fromJS(hydrate.recentlyAdded)
  }
  if (hydrate.article) {
    state.article = fromJS(hydrate.article)
  }
  if (hydrate.languages) {
    state.languages = fromJS(hydrate.languages)
  }
  if (hydrate.staticText) {
    state.staticText = fromJS(hydrate.staticText)
  }
  if (hydrate.featureTracking) {
    state.featureTracking = fromJS(hydrate.featureTracking)
  }
  if (hydrate.user) {
    state.user = fromJS(hydrate.user)
  }
  if (hydrate.optimizely) {
    state.optimizely = fromJS(hydrate.optimizely)
  }
  /**
   * If redux devtools exists and devtools are enable use the extension
   * @see https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en
   */
  const LOG_LEVEL_DEBUG = logLevel === 'debug'
  const devToolsCompose = LOG_LEVEL_DEBUG && global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  const composeEnhancers = devToolsCompose || compose
  const middleware = await getMiddleware({
    // Redux debugging will be handled by Redux logger only if Redux devtools
    // is not loaded as an extension
    enableReduxLogger: !devToolsCompose && LOG_LEVEL_DEBUG,
    history,
  })
  // Combine redux-witness action handlers
  // to work with the witness middleware
  // create the official redux store
  // Configure the store with an initial State
  return reduxCreateStore(
    rootReducer,
    state,
    composeEnhancers(applyMiddleware(...middleware)),
  )
}
