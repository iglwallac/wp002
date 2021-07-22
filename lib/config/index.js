import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _isUndefined from 'lodash/isUndefined'
import _parseInt from 'lodash/parseInt'
import _split from 'lodash/split'
import defaultConfig from './default.json'
import { get as getEnv } from './../environment'

let config = {}

/**
 * True when running in a browser
 */
const BROWSER = process.env.BROWSER

/**
 * Parse an evironment variable into an array
 * @param {String} envValue The environment value
 * @param {Array} defaultValue A default values if the environment variable is undefined
 * @param {String} delimter A delimiter to split the enviorment value into an array
 * @returns {Array} The values as an array
 */
function parseEnvArray (envValue, defaultValue, delimter = ',') {
  return !_isUndefined(envValue) ? _split(envValue, delimter) : defaultValue
}

/**
 * Parse an evironment variable into a boolean
 * @param {String} envValue The environment value
 * @param {Boolean} defaultValue A default values if the environment variable is undefined
 * @returns {Boolean} The value as a boolean
 */
function parseEnvBool (envValue, defaultValue) {
  return !_isUndefined(envValue) ? _parseInt(envValue, 2) : defaultValue
}

/**
 * Parse an evironment variable into a number
 * @param {String} envValue The environment value
 * @param {Number}} defaultValue A default values if the environment variable is undefined
 * @returns {Number} The value as a boolean
 */
function parseEnvInt (envValue, defaultValue) {
  return !_isUndefined(envValue) ? _parseInt(envValue) : defaultValue
}

/**
 * Parse an evironment variable into a float
 * @param {String} envValue The environment value
 * @param {Float}} defaultValue A default values if the environment variable is undefined
 * @returns {Float} The value as a float
 */
function parseEnvFloat (envValue, defaultValue) {
  return !_isUndefined(envValue) ? parseFloat(envValue) : defaultValue
}

/**
 * Get environment variables using the current enviroment (browser or server)
 * @returns {Object} Evironment variables
 */
function getEnvironment () {
  if (BROWSER) {
    // eslint-disable-next-line global-require
    const { getAppData } = require('react-universal/browser')
    return _get(getAppData(), ['hydrate', 'env'], {})
  }
  return process.env || {}
}

/**
 * Initialize the config by parsing the environment variable values
 * @returns {Object} A config object
 */
function init () {
  config = _cloneDeep(defaultConfig)
  const envVars = getEnvironment()
  // Set additional environment vars.
  config.env = getEnv()
  // flag used to show a 'temporarily unavailable' screen
  // when an external service is down or having issues.
  config.serviceUnavailable = parseEnvInt(
    envVars.SERVICE_UNAVAILABLE,
    config.serviceUnavailable,
  )

  config.cloudfrontDistributionId =
    envVars.CLOUDFRONT_DISTRIBUTION_ID || config.cloudfrontDistributionId
  config.logLevel = envVars.LOG_LEVEL || config.logLevel
  config.logLevelServer = envVars.LOG_LEVEL_SERVER || config.logLevelServer
  config.loggerName = envVars.LOGGER_NAME || config.loggerName
  config.loggerGroup = envVars.LOGGER_GROUP || config.loggerGroup
  config.loggerStreamName =
    envVars.LOGGER_STREAM_NAME || config.loggerStreamName
  config.nodePath = envVars.NODE_PATH || config.nodePath
  config.userAccountHostname = envVars.USER_ACCOUNT_HOSTNAME || config.userAccountHostname
  config.server.keepAliveTimeout = parseEnvInt(
    envVars.SERVER_KEEPALIVE_TIMEOUT,
    config.server.keepAliveTimeout,
  )
  // Assets Server
  config.servers.brooklyn =
    envVars.SERVERS_BROOKLYN || config.servers.brooklyn
  config.servers.brooklynInternal = envVars.SERVERS_BROOKLYN_INTERNAL ||
    config.servers.brooklynInternal
  config.servers.auth = envVars.SERVERS_AUTH || config.servers.auth
  config.servers.videoAnalytics = envVars.SERVERS_VIDEO_ANALYTICS || config.servers.videoAnalytics
  config.servers.testarossa = envVars.SERVERS_TESTAROSSA || config.servers.testarossa
  config.hostname = envVars.HOSTNAME || config.hostname
  config.origin = envVars.ORIGIN || config.origin
  config.originReact = envVars.ORIGIN_REACT || config.originReact
  config.httpPort = envVars.HTTP_PORT || config.httpPort
  config.adminCmsUrl = envVars.ADMIN_CMS_URL || config.adminCmsUrl
  config.adminAppUrl = envVars.ADMIN_APP_URL || config.servers.adminAppUrl
  config.httpPortReact = envVars.HTTP_PORT_REACT || config.httpPortReact
  config.renderConcurrency = parseEnvInt(
    envVars.RENDER_CONCURRENCY,
    config.renderConcurrency,
  )
  config.marketingLayerUrl = envVars.MARKETING_LAYER_URL || config.marketingLayerUrl
  config.billingIframeOrigin = envVars.BILLING_IFRAME_ORIGIN || config.billingIframeOrigin
  config.zuoraIframeCreditCardPageId = envVars.ZUORA_IFRAME_CREDIT_CARD_PAGE_ID ||
    config.zuoraIframeCreditCardPageId
  config.zuoraIframeUrl = envVars.ZUORA_IFRAME_URL || config.zuoraIframeUrl
  config.baseHref = envVars.BASE_HREF || config.baseHref
  config.robotsCanIndex = parseEnvInt(
    envVars.ROBOTS_CAN_INDEX,
    config.robotsCanIndex,
  )
  config.robotsNoIndexHeader = parseEnvInt(
    envVars.ROBOTS_NO_INDEX_HEADER,
    config.robotsNoIndexHeader,
  )
  config.gtmId = envVars.GTM_ID || config.gtmId

  config.emarsysTestmode = parseEnvBool(envVars.EMARSYS_TESTMODE || config.emarsysTestmode)
  config.emarsysTestmodeUserId = config.emarsysTestmode
    ? parseEnvInt(envVars.EMARSYS_TESTMODE_USER_ID || config.emarsysTestmodeUserId)
    : parseEnvInt(envVars.EMARSYS_TESTMODE_USER_ID)
  config.emarsysTestmodeUserEmail = config.emarsysTestmode
    ? envVars.EMARSYS_TESTMODE_USER_EMAIL || config.emarsysTestmodeUserEmail
    : envVars.EMARSYS_TESTMODE_USER_EMAIL

  config.appLang = envVars.APP_LANG || config.appLang
  config.appLocale = envVars.APP_LOCALE || config.appLocale
  config.appCountry = envVars.APP_COUNTRY || config.appCountry
  config.googleRecaptchaSiteKey = envVars.GOOGLE_RECAPTCHA_SITE_KEY || config.googleRecaptchaSiteKey
  config.googleRecaptchaSecretKey = envVars.GOOGLE_RECAPTCHA_SECRET_KEY ||
    config.googleRecaptchaSecretKey
  config.googleRecaptchaApiUrl = envVars.GOOGLE_RECAPTCHA_API_URL || config.googleRecaptchaApiUrl
  config.googleRecaptchaThreshold = envVars.GOOGLE_RECAPTCHA_THRESHOLD ||
    config.googleRecaptchaThreshold

  config.profitwellApiKey = envVars.PROFITWELL_API_KEY ||
    config.profitwellApiKey

  config.anonymousUuidSecret =
    envVars.ANONYMOUS_UUID_SECRET || config.anonymousUuidSecret

  config.appCache = config.appCache || {}
  config.appCache.maxAge = parseEnvInt(
    envVars.APP_CACHE_MAX_AGE,
    config.appCache.maxAge,
  )

  config.assetsCache = config.assetsCache || {}
  config.assetsCache.maxAge = parseEnvInt(
    envVars.ASSETS_CACHE_MAX_AGE,
    config.assetsCache.maxAge,
  )

  config.youboraAccountCode =
    envVars.YOUBORA_ACCOUNT_CODE || config.youboraAccountCode

  config.debug = config.debug || {}
  config.debug.showUsername = parseEnvInt(
    envVars.DEBUG_SHOW_USERNAME,
    config.debug.showUsername,
  )
  config.debug.react = config.debug.react || {}
  config.debug.react.performance = parseEnvInt(
    envVars.DEBUG_REACT_PERFORMANCE,
    config.debug.react.performance,
  )

  config.redirect = config.redirect || {}
  config.redirect.https = parseEnvInt(
    envVars.REDIRECT_HTTPS,
    config.redirect.https,
  )
  config.redirect.hostname = parseEnvInt(
    envVars.REDIRECT_HOSTNAME,
    config.redirect.hostname,
  )

  config.appMaintenance = config.appMaintenance || {}
  config.appMaintenance.enabled = parseEnvInt(
    envVars.APP_MAINTENANCE_ENABLED,
    config.appMaintenance.enabled,
  )
  config.appMaintenance.maxAge = parseEnvInt(
    envVars.APP_MAINTENANCE_MAX_AGE,
    config.appMaintenance.maxAge,
  )

  config.logStdOut = config.logStdOut || {}
  config.logStdOut.enabled = parseEnvBool(
    envVars.LOG_STD_OUT_ENABLED,
    config.logStdOut.enabled,
  )
  config.logStdOut.serverEnabled = parseEnvBool(
    envVars.LOG_STD_OUT_SERVER_ENABLED,
    config.logStdOut.serverEnabled,
  )

  config.siteName = envVars.SITE_NAME || config.siteName

  config.facebook = config.facebook || {}
  config.facebook.appId = envVars.FACEBOOK_APP_ID || config.facebook.appId
  config.facebook.loginAppId = envVars.FACEBOOK_LOGIN_APP_ID || config.facebook.loginAppId

  config.brightcove = config.brightcove || {}
  config.brightcove.account =
    envVars.BRIGHTCOVE_ACCOUNT || config.brightcove.account
  config.brightcove.player =
    envVars.BRIGHTCOVE_PLAYER || config.brightcove.player
  config.brightcove.liveplayer =
    envVars.LIVE_ACCESS_VIDEO_PLAYER || config.brightcove.liveplayer

  // Services
  config.services = config.services || {}
  config.services.memberHome = config.services.memberHome || {}
  config.services.memberHome.path =
    envVars.SERVICES_MEMBER_HOME_PATH || config.services.memberHome.path

  // Share v3 Additional Media Ids
  config.contentIds = config.contentIds || {}
  config.contentIds.missingLinks =
    parseEnvInt(envVars.SHARE_CONTENT_ID_MISSING_LINKS || config.contentIds.missingLinks)
  config.contentIds.nuevo = parseEnvInt(envVars.SHARE_CONTENT_ID_NUEVO ||
    config.contentIds.nuevo)
  config.contentIds.transcendence =
    parseEnvInt(envVars.SHARE_CONTENT_ID_TRANSCENDENCE || config.contentIds.transcendence)
  config.contentIds.godsWereAstronauts =
    parseEnvInt(envVars.SHARE_CONTENT_ID_GODS_WERE_ASTRONAUTS ||
    config.contentIds.godsWereAstronauts)
  config.contentIds.leclosionDuCoeur =
   parseEnvInt(envVars.SHARE_CONTENT_ID_LECLOSION_DU_COEUR ||
    config.contentIds.leclosionDuCoeur)
  config.contentIds.emotion =
    parseEnvInt(envVars.SHARE_CONTENT_ID_EMOTION || config.contentIds.emotion)
  config.contentIds.ancientCiv =
    parseEnvInt(envVars.SHARE_CONTENT_ID_ANCIENT_CIV || config.contentIds.ancientCiv)

  // Plan Ids
  config.planIds = config.planIds || {}
  config.planIds.threeMonth = envVars.PLAN_ID_THREE_MONTH || config.planIds.threeMonth
  config.planIds.monthly = envVars.PLAN_ID_MONTHLY || config.planIds.monthly
  config.planIds.annual = envVars.PLAN_ID_ANNUAL || config.planIds.annual
  config.planIds.live = envVars.PLAN_ID_LIVE || config.planIds.live
  config.planIds.liveDiscounted = envVars.PLAN_ID_LIVE_DISCOUNTED || config.planIds.liveDiscounted
  config.planIds.fourteenDay99Cent = envVars.PLAN_ID_FOURTEEN_DAY_99_CENT ||
    config.planIds.fourteenDay99Cent
  config.planIds.oneWeekFreeTrialToMonthly = envVars.PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_MONTHLY ||
    config.planIds.oneWeekFreeTrialToMonthly
  config.planIds.oneWeekFreeTrialToAnnual = envVars.PLAN_ID_ONE_WEEK_FREE_TRIAL_TO_ANNUAL ||
    config.planIds.oneWeekFreeTrialToAnnual
  config.planIds.compPlan = envVars.PLAN_ID_COMP ||
    config.planIds.compPlan
  config.planIds.legacyMonthly = envVars.PLAN_ID_LEGACY_MONTHLY ||
    config.planIds.legacyMonthly
  config.planIds.legacyAnnual = envVars.PLAN_ID_LEGACY_ANNUAL ||
    config.planIds.legacyAnnual
  config.planIds.buyOneGetOneFree = envVars.PLAN_ID_BUY_ONE_GET_ONE_FREE ||
    config.planIds.buyOneGetOneFree
  config.planIds.buyTwoGetTwoFree = envVars.PLAN_ID_BUY_TWO_GET_TWO_FREE ||
    config.planIds.buyTwoGetTwoFree
  config.planIds.freeTrial = envVars.PLAN_ID_FREE_TRIAL || config.planIds.freeTrial
  config.planIds.oneDollarThirtyDaysToMonthly =
    envVars.PLAN_ID_ONE_DOLLAR_THIRTY_DAYS_TO_MONTHLY || config.planIds.oneDollarThirtyDaysToMonthly
  config.planIds.fourMonthGift = envVars.PLAN_ID_FOUR_MONTH_GIFT || config.planIds.fourMonthGift
  config.planIds.annualGift = envVars.PLAN_ID_ANNUAL_GIFT || config.planIds.annualGift
  config.planIds.liveGift = envVars.PLAN_ID_LIVE_GIFT || config.planIds.liveGift
  config.planIds.summitMonthly = envVars.PLAN_ID_SUMMIT_MONTHLY || config.planIds.summitMonthly
  config.planIds.summitAnnual = envVars.PLAN_ID_SUMMIT_ANNUAL || config.planIds.summitAnnual
  config.planIds.oneMonthTrialToAnnual = envVars.PLAN_ID_ONE_MONTH_TRIAL_TO_ANNUAL ||
    config.planIds.oneMonthTrialToAnnual

  // Features
  config.features = config.features || {}
  config.features.comments = parseEnvInt(
    envVars.FEATURES_COMMENTS,
    config.features.comments,
  )
  config.features.community.v2 = parseEnvInt(
    envVars.FEATURES_COMMUNITY_V2,
    config.features.community.v2,
  )
  config.features.disableImpressionCap = parseEnvInt(
    envVars.FEATURES_DISABLE_IMPRESSION_CAP,
    config.features.disableImpressionCap,
  )
  config.features.filters.fitness = parseEnvInt(
    envVars.FEATURES_FILTERS_FITNESS,
    config.features.filters.fitness,
  )
  config.features.filters.original = parseEnvInt(
    envVars.FEATURES_FILTERS_ORIGINAL,
    config.features.filters.original,
  )
  config.features.filters.conscious = parseEnvInt(
    envVars.FEATURES_FILTERS_CONSCIOUS,
    config.features.filters.conscious,
  )
  config.features.gift.checkout = parseEnvInt(
    envVars.FEATURES_GIFT_CHECKOUT,
    config.features.gift.checkout,
  )
  config.features.checkout.paypal = parseEnvInt(
    envVars.FEATURES_CHECKOUT_PAYPAL,
    config.features.checkout.paypal,
  )
  config.features.checkout.paypalCurrencies = parseEnvArray(
    envVars.FEATURES_CHECKOUT_PAYPAL_CURRENCIES,
    config.features.checkout.paypalCurrencies,
  )
  config.features.development.kitchenSink = parseEnvInt(
    envVars.FEATURES_DEVELOPMENT_KITCHEN_SINK,
    config.features.development.kitchenSink,
  )
  config.features.emailCapture = parseEnvInt(
    envVars.FEATURES_EMAIL_CAPTURE,
    config.features.emailCapture,
  )
  config.features.smartling = parseEnvInt(
    envVars.FEATURES_SMARTLING,
    config.features.smartling,
  )
  config.features.zendeskChat = parseEnvInt(
    envVars.FEATURES_ZENDESK_CHAT,
    config.features.zendeskChat,
  )
  config.features.marketing.proxyAnonymousHome = parseEnvInt(
    envVars.FEATURES_MARKETING_PROXY_ANONYMOUS_HOME,
    config.features.marketing.proxyAnonymousHome,
  )
  config.features.marketing.specialOfferPromoPopup = parseEnvInt(
    envVars.FEATURES_MARKETING_SPECIAL_OFFER_PROMO_POPUP,
    config.features.marketing.specialOfferPromoPopup,
  )
  config.features.shareView = parseEnvInt(
    envVars.FEATURES_SHARE_VIEW,
    config.features.shareView,
  )
  config.features.player.detectLang = parseEnvInt(
    envVars.FEATURES_PLAYER_DETECT_LANG,
    config.features.player.detectLang,
  )
  config.features.player.gatedPreviews = parseEnvInt(
    envVars.FEATURES_PLAYER_GATED_PREVIEWS,
    config.features.player.gatedPreviews,
  )
  config.features.profitwell.retain = parseEnvInt(
    envVars.FEATURES_PROFIT_WELL_RETAIN,
    config.features.profitwell.retain,
  )
  config.features.languageSelectGlobeAnonymous = parseEnvInt(
    envVars.FEATURES_LANGUAGE_SELECT_GLOBE_ANONYMOUS,
    config.features.languageSelectGlobeAnonymous,
  )
  config.features.languageSelectDialog = parseEnvInt(
    envVars.FEATURES_LANGUAGE_SELECT_DIALOG,
    config.features.languageSelectDialog,
  )
  config.features.languageSelect = parseEnvInt(
    envVars.FEATURES_LANGUAGE_SELECT,
    config.features.languageSelect,
  )
  config.features.languageSelectAnonymous = parseEnvInt(
    envVars.FEATURES_LANGUAGE_SELECT_ANONYMOUS,
    config.features.languageSelectAnonymous,
  )
  config.features.languageSelectFr = parseEnvInt(
    envVars.FEATURES_LANGUAGE_SELECT_FR,
    config.features.languageSelectFr,
  )
  config.features.languageSelectDe = parseEnvInt(
    envVars.FEATURES_LANGUAGE_SELECT_DE,
    config.features.languageSelectDe,
  )
  config.features.apiClient.omitLanguage = parseEnvInt(
    envVars.FEATURES_APICLIENT_OMIT_LANGUAGE,
    config.features.apiClient.omitLanguage,
  )
  config.features.userLanguage.esZendeskHelpLink = parseEnvInt(
    envVars.FEATURES_USER_LANGUAGE_ES_ZENDESK_HELP_LINK,
    config.features.userLanguage.esZendeskHelpLink,
  )
  config.features.anonymousUser.dataPrivacyCompliance = parseEnvInt(
    envVars.FEATURES_ANONYMOUS_USER_DATA_PRIVACY_COMPLIANCE,
    config.features.anonymousUser.dataPrivacyCompliance,
  )
  config.features.userAccount.fmtvMigrationDate = parseEnvInt(
    envVars.FEATURES_USER_ACCOUNT_FMTV_MIGRATION_DATE,
    config.features.userAccount.fmtvMigrationDate,
  )
  config.features.userAccount.cancelOffer = parseEnvInt(
    envVars.FEATURES_USER_ACCOUNT_CANCEL_OFFER,
    config.features.userAccount.cancelOffer,
  )
  config.features.userAccount.accountPause = parseEnvInt(
    envVars.FEATURES_USER_ACCOUNT_ACCOUNT_PAUSE,
    config.features.userAccount.accountPause,
  )
  config.features.userAccount.declinePlan303 = parseEnvInt(
    envVars.FEATURES_USER_ACCOUNT_DECLINE_PLAN_303,
    config.features.userAccount.declinePlan303,
  )
  config.features.userAccount.cancelV2 = parseEnvInt(
    envVars.FEATURES_USER_ACCOUNT_CANCEL_V2,
    config.features.userAccount.cancelV2,
  )
  config.features.userAccount.changePlanV2 = parseEnvInt(
    envVars.FEATURES_USER_ACCOUNT_CHANGE_PLAN_V2,
    config.features.userAccount.changePlanV2,
  )
  config.features.userAccount = config.features.userAccount || {}
  config.features.user = config.features.user || {}
  config.features.skunk150.relatedSeriesNids = parseEnvArray(
    envVars.FEATURES_SKUNK_150_RELATED_SERIES_NIDS,
    config.features.skunk150.relatedSeriesNids,
  ).map(parseEnvInt)

  config.features.showUserPortalSearchResults = parseEnvInt(
    envVars.FEATURES_SHOW_USER_PORTAL_SEARCH_RESULTS,
    config.features.showUserPortalSearchResults,
  )
  config.features.recipes.categoryTermId = parseEnvInt(
    envVars.FEATURES_RECIPES_CATEGORY_TERM_ID,
    config.features.recipes.categoryTermId,
  )
  config.features.filmFilters.enabled = parseEnvBool(
    envVars.FILM_FILTERS_ENABLED,
    config.features.filmFilters.enabled,
  )
  config.features.guides = parseEnvInt(
    envVars.GUIDES_ENABLED,
    config.features.guidesEnabled,
  )
  config.features.zendeskChatOnCheckoutFlowEnabled = parseEnvBool(
    envVars.ZENDESK_CHAT_CHECKOUT_ENABLED,
    config.features.zendeskChatOnCheckoutFlowEnabled,
  )
  config.features.recommendedPractices.blacklistedTermIds = parseEnvArray(
    envVars.FEATURES_RECOMMENDED_PRACTICES_TERM_BLACKLIST,
    config.features.recommendedPractices.blacklistedTermIds,
  ).map(parseEnvInt)
  config.features.detailPageV2 = parseEnvInt(
    envVars.FEATURES_DETAIL_PAGE_V2,
    config.features.detailPageV2,
  )
  config.features.adminAppCMSEnabled = parseEnvInt(
    envVars.ADMIN_APP_CMS_ENABLED,
    config.features.adminAppCMSEnabled,
  )
  config.features.multiplePlaylists = parseEnvInt(
    envVars.FEATURES_MULTIPLE_PLAYLISTS,
    config.features.multiplePlaylists,
  )
}

/**
 * Get the config values which have been set using init
 * @returns {Object} The config
 */
function get () {
  return _cloneDeep(config)
}

init()

export default {
  init,
  parseEnvArray,
  parseEnvBool,
  parseEnvInt,
  parseEnvFloat,
  get,
}
