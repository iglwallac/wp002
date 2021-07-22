import { get as getConfig } from 'config'
import _first from 'lodash/first'
import _split from 'lodash/split'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _includes from 'lodash/includes'
import _isString from 'lodash/isString'
import _isNumber from 'lodash/isNumber'
import _parseInt from 'lodash/parseInt'
import _startsWith from 'lodash/startsWith'
import _toString from 'lodash/toString'
import { ROLE_VIEW_SITE } from 'services/auth-access'
import { ES, DE } from 'services/languages/constants'
import { getUrl, TYPE_BROOKLYN } from 'api-client'
import {
  URL_CONTACT,
  URL_HELP_CENTER,
  URL_HELP_CENTER_ES,
  URL_EMAIL_CUSTOMER_SERVICE,
  URL_EMAIL_CUSTOMER_SERVICE_ES,
  URL_EMAIL_CUSTOMER_SERVICE_DE,
  URL_FAQ,
  URL_FAQ_ES,
  URL_WATCH_GAIA_ON_TV,
  URL_PLAN_SELECTION,
  URL_PLAN_SELECTION_PLANS,
  URL_ACCOUNT,
  URL_ACCOUNT_CREATION,
  URL_CART_ACCOUNT_CREATION_CREATE,
  URL_CART_BILLING,
  URL_CART_BILLING_PAYMENT,
  URL_CART_CONFIRMATION,
  URL_CART_ACCESS_DENIED,
  URL_ACCOUNT_PROFILE,
  URL_ACCOUNT_SETTINGS,
  URL_ACCOUNT_CANCEL,
  URL_ACCOUNT_CANCEL_CONFIRM,
  URL_ACCOUNT_CANCEL_OFFER,
  URL_ACCOUNT_PAUSE,
  URL_ACCOUNT_PAUSE_CONFIRM,
  URL_REFER_JOIN,
  URL_REFER,
  URL_HOME,
  URL_LOGOUT,
  URL_LOGIN,
  URL_LIVE_PAGE,
  OPTIMIZELY_DISABLED,
  URL_EMAIL_SETTINGS,
  URL_FREE_TRIAL,
  URL_FREE_TRIAL_ACCOUNT,
  URL_FREE_TRIAL_CONFIRM,

  URL_GIFT_SELECT,
  URL_GIFT,
  URL_GIFT_THEME,
  URL_GIFT_RECIPIENT,
  URL_GIFT_PREVIEW,
  URL_GIFT_PAYMENT,
  URL_GIFT_CONFIRM,
  URL_GIFT_REDEEM,
  URL_GIFT_ACCOUNT_CREATE,
  URL_TECHNICAL_PLAY_ISSUES_EN,
  URL_TECHNICAL_PLAYBACK_ISSUES_DE,
  URL_TECHNICAL_PLAYBACK_ISSUES_ES,
  URL_TECHNICAL_OFFLINE_CONTENT_DOWNLOAD_EN,
  URL_TECHNICAL_OFFLINE_CONTENT_DOWNLOAD_DE,
  URL_TECHNICAL_OFFLINE_CONTENT_DOWNLOAD_ES,
  URL_TECHNICAL_SETUP_CONTENT_TV_EN,
  URL_TECHNICAL_SETUP_CONTENT_TV_DE,
  URL_TECHNICAL_SETUP_CONTENT_TV_ES,
  URL_TECHNICAL_TROUBLE_FINDING_CONTENT_EN,
  URL_TECHNICAL_TROUBLE_FINDING_CONTENT_DE,
  URL_TECHNICAL_TROUBLE_FINDING_CONTENT_ES,
  URL_TECHNICAL_HELP_EN,
  URL_TECHNICAL_HELP_DE,
  URL_TECHNICAL_HELP_ES,
} from './constants'

const { origin, baseHref } = getConfig()

const FILE_REGEX = /\.[a-z0-9/-]{0,}$/i
const NOT_RELATIVE_REGEX = /^(https?:\/\/|\/)/
const FULL_URL_REGEX = /^https?:\/\//
const ANCHOR_REGEX = /^#{1}[^#]+/
const ACCOUNT_REGEX = /^\/account/
const ACCOUNT_CANCEL_REGEX = /^\/account\/cancel/

export function isRelative (url) {
  return !NOT_RELATIVE_REGEX.test(url)
}

export function isFullUrl (url) {
  return FULL_URL_REGEX.test(url)
}

export function isAnchor (url) {
  return ANCHOR_REGEX.test(url)
}

export function isJavascript (url) {
  return (
    _toString(url)
      .replace(';', '')
      // eslint-disable-next-line no-script-url
      .toLowerCase() === 'javascript:void(0)'
  )
}

export function createAbsolute (url) {
  if (isRelative(url) && !isAnchor(url)) {
    return baseHref + url
  }
  return url
}

export function createNextUrl (options) {
  const { totalPages, pathname, page } = options
  if (!_isNumber(totalPages) || (!_isNumber(page) && !_isString(page))) {
    return null
  }
  const pageNumber = _parseInt(page)
  if (pageNumber >= totalPages || pageNumber <= 0) {
    return null
  }
  return `${origin}${pathname}?page=${pageNumber + 1}`
}

export function createPrevUrl (options) {
  const { totalPages, pathname, page } = options
  if (!_isNumber(totalPages) || (!_isNumber(page) && !_isString(page))) {
    return null
  }
  const pageNumber = _parseInt(page)
  if (pageNumber <= 1 || pageNumber > totalPages) {
    return null
  }
  const queryString = pageNumber === 2 ? '' : `?page=${pageNumber - 1}`
  return `${origin}${pathname}${queryString}`
}

export function createCanonicalUrl ({ pathname, query }) {
  const queryPage = _get(query, 'page')
  const pageNumber =
    _isString(queryPage) || _isNumber(queryPage) ? _parseInt(queryPage) : null
  const correctedPathname = _toString(pathname).replace(/\/$/, '')
  return `${origin}${correctedPathname}${_isNumber(pageNumber)
    ? `?page=${pageNumber}`
    : ''}`
}

export function getHelpCenterUrl (language) {
  switch (language) {
    case ES:
      return URL_HELP_CENTER_ES
    default:
      return URL_HELP_CENTER
  }
}


export function getTechnicalPlaybackIssuesUrl (language) {
  switch (language) {
    case DE:
      return URL_TECHNICAL_PLAYBACK_ISSUES_DE
    case ES:
      return URL_TECHNICAL_PLAYBACK_ISSUES_ES
    default:
      return URL_TECHNICAL_PLAY_ISSUES_EN
  }
}

export function getTechnicalOfflineDownloadUrl (language) {
  switch (language) {
    case DE:
      return URL_TECHNICAL_OFFLINE_CONTENT_DOWNLOAD_DE
    case ES:
      return URL_TECHNICAL_OFFLINE_CONTENT_DOWNLOAD_ES
    default:
      return URL_TECHNICAL_OFFLINE_CONTENT_DOWNLOAD_EN
  }
}

export function getTechnicalSetupUrl (language) {
  switch (language) {
    case DE:
      return URL_TECHNICAL_SETUP_CONTENT_TV_DE
    case ES:
      return URL_TECHNICAL_SETUP_CONTENT_TV_ES
    default:
      return URL_TECHNICAL_SETUP_CONTENT_TV_EN
  }
}

export function getTechnicalTroubleFindingContentUrl (language) {
  switch (language) {
    case DE:
      return URL_TECHNICAL_TROUBLE_FINDING_CONTENT_DE
    case ES:
      return URL_TECHNICAL_TROUBLE_FINDING_CONTENT_ES
    default:
      return URL_TECHNICAL_TROUBLE_FINDING_CONTENT_EN
  }
}

export function getTechnicalHelpUrl (language) {
  switch (language) {
    case DE:
      return URL_TECHNICAL_HELP_DE
    case ES:
      return URL_TECHNICAL_HELP_ES
    default:
      return URL_TECHNICAL_HELP_EN
  }
}

export function getEmailCustomerServiceUrl (language) {
  switch (language) {
    case DE:
      return URL_EMAIL_CUSTOMER_SERVICE_DE
    case ES:
      return URL_EMAIL_CUSTOMER_SERVICE_ES
    default:
      return URL_EMAIL_CUSTOMER_SERVICE
  }
}

export function getFaqUrl (language) {
  switch (language) {
    case ES:
      return URL_FAQ_ES
    default:
      return URL_FAQ
  }
}

export function isYoga (pathname) {
  const pattern = /^\/yoga$|^\/yoga\/|^\/level\/|^\/duration\/|^\/focus\/|^\/style\/|^\/teacher\//
  return pattern.test(pathname)
}

export function isFitness (pathname) {
  const pattern = /^\/yoga\/pilates-fitness$|^\/workout-level\/|^\/length\/|^\/collections\/|^\/workout-style\/|^\/instructor\//
  return pattern.test(pathname)
}

// Film filters are different than yoga and fitness because we do not expose the filter options
// under their own paths, e.g. film-subject/metaphysics does not exist
export function isFilm (pathname) {
  const enabled = _get(getConfig(), ['features', 'filmFilters', 'enabled'])
  if (!enabled) {
    return false
  }
  const pattern = /^\/films-docs$|^\/films-docs\//
  return pattern.test(pathname)
}

export function isRecipe (pathname) {
  const pattern = /^\/recipes$|^\/recipes\/|^\/recipe\/|^\/diet\//
  return pattern.test(pathname)
}

export function isOriginal (pathname) {
  const pattern = /^\/seeking-truth\/original-programs$|^\/people\/|^\/program\/|^\/topic\//
  return pattern.test(pathname)
}

export function isConscious (pathname) {
  const pattern = /^\/transformation\/expanded-consciousness$|^\/duration\/|^\/format\/|^\/topic\//
  return pattern.test(pathname)
}

export function isVideo (pathname) {
  return _startsWith(pathname, '/video/')
}

export function isPortal (pathname) {
  return _startsWith(pathname, '/portal/')
}

export function isSeries (pathname) {
  return (
    _startsWith(pathname, '/tv/') ||
    _startsWith(pathname, '/show/') ||
    _startsWith(pathname, '/series/')
  )
}

export function isVideoOrSeries (pathname) {
  return isVideo(pathname) || isSeries(pathname)
}

export function isContentPreferences (pathname) {
  return pathname === '/account/content-preferences' ||
    pathname === '/account/settings'
}

export function isPlaylist (pathname) {
  return pathname === '/playlist'
}

export function isActivate (pathname) {
  return pathname === '/activate'
}

export function isGetStarted (pathname) {
  return pathname === '/get-started'
}

export function isPolicy (pathname) {
  return pathname === '/terms-privacy'
}

export function isPasswordReset (pathname) {
  return pathname === '/password-reset'
}

export function isSearch (pathname) {
  return pathname === '/search'
}

export function isTopics (pathname) {
  return pathname === '/topics'
}

export function isArticles (pathname) {
  return pathname === '/articles' || pathname === '/articles/latest'
}

export function isArticle (pathname) {
  return _startsWith(pathname, '/article/')
}

export function isMemberHome (pathname, loggedIn) {
  return pathname === URL_HOME && loggedIn
}

export function isAnonymousHome (pathname, loggedIn) {
  return pathname === URL_HOME && !loggedIn
}

export function isGo (pathname) {
  return pathname === '/go'
}

export function isNotFound (pathname) {
  return pathname === '/not-found'
}

export function isLogin (pathname) {
  return pathname === URL_LOGIN || pathname === '/beta-sign-in'
}

export function isLogout (pathname) {
  return pathname === URL_LOGOUT
}

export function isPlans (pathname) {
  return (
    pathname === URL_PLAN_SELECTION ||
    pathname === URL_PLAN_SELECTION_PLANS
  )
}

export function isReferJoin (pathname) {
  return pathname === URL_REFER_JOIN
}

export function isRefer (pathname) {
  return pathname === URL_REFER
}
export function isPlanSelectionPlans (pathname) {
  return pathname === URL_PLAN_SELECTION_PLANS
}

export function isLivePage (pathname) {
  return pathname === URL_LIVE_PAGE
}

export function isCart (pathname) {
  return (
    pathname === URL_ACCOUNT_CREATION ||
    pathname === URL_CART_ACCOUNT_CREATION_CREATE ||
    pathname === URL_CART_BILLING ||
    pathname === URL_CART_BILLING_PAYMENT ||
    pathname === URL_CART_CONFIRMATION
  )
}

export function isCartCreateAccount (pathname) {
  return pathname === URL_ACCOUNT_CREATION
}

export function isCartAccountCreationCreate (pathname) {
  return pathname === URL_CART_ACCOUNT_CREATION_CREATE
}

export function isCartBilling (pathname) {
  return pathname === URL_CART_BILLING
}

export function isCartBillingPayment (pathname) {
  return pathname === URL_CART_BILLING_PAYMENT
}

export function isCartConfirmation (pathname) {
  return pathname === URL_CART_CONFIRMATION
}

export function isCartAccessDenied (pathname) {
  return pathname === URL_CART_ACCESS_DENIED
}

export function isMyAccountContactUsPage (pathname) {
  return pathname === '/user/contact-us'
}

export function isMyAccount (pathname) {
  return ACCOUNT_REGEX.test(pathname)
}

export function isAccountCancelPath (pathname) {
  return ACCOUNT_CANCEL_REGEX.test(pathname)
}

export function isManageProfilesPage (pathname) {
  return pathname === '/manage-profiles'
}

export function isNotificationsPage (pathname) {
  return pathname === '/notifications'
}

export function isAccountPage (pathname) {
  return _startsWith(pathname, '/account')
}

export function isMyAccountPage (pathname) {
  return pathname === '/account' || pathname === '/account-details'
}

export function isFreeMonth (pathname) {
  return pathname === '/account/free-month'
}

export function isAccountCancelConfirmPage (pathname) {
  return pathname === URL_ACCOUNT_CANCEL_CONFIRM
}

export function isAccountCancel (pathname) {
  return pathname === URL_ACCOUNT_CANCEL
}

export function isAccountCancelOfferPage (pathname) {
  return pathname === URL_ACCOUNT_CANCEL_OFFER
}

export function isAccountCancelFlow (pathname) {
  return (
    pathname === URL_ACCOUNT_CANCEL ||
    pathname === URL_ACCOUNT_CANCEL_OFFER ||
    pathname === URL_ACCOUNT_CANCEL_CONFIRM
  )
}

export function isAccountPauseFlow (pathname) {
  return (
    pathname === URL_ACCOUNT_PAUSE ||
    pathname === URL_ACCOUNT_PAUSE_CONFIRM
  )
}

export function isAccountChangePlan (pathname) {
  return pathname === '/account/change-plan'
}

export function isEmailSettings (pathname) {
  return pathname === URL_EMAIL_SETTINGS
}

export function isFreeTrialPage (pathname) {
  return _startsWith(pathname, URL_FREE_TRIAL)
}

export function isFreeTrial (pathname) {
  return pathname === URL_FREE_TRIAL
}

export function isFreeTrialAccount (pathname) {
  return pathname === URL_FREE_TRIAL_ACCOUNT
}

export function isFreeTrialConfirm (pathname) {
  return pathname === URL_FREE_TRIAL_CONFIRM
}

export function isRecentlyAdded (pathname) {
  return pathname === '/recently-added'
}

export function isWatchHistory (pathname) {
  return pathname === '/watch-history'
}

export function isFullPlayer (query) {
  return _has(query, 'fullplayer')
}

export function isEmbedded (query) {
  return _get(query, 'embed') === 'true'
}

export function isOptimizelyDisabled (query) {
  return _has(query, OPTIMIZELY_DISABLED)
}

export function isSeekingTruth (pathname) {
  return pathname === '/seeking-truth'
}

export function isTransformation (pathname) {
  return pathname === '/transformation'
}

export function isMyYoga (pathname) {
  return pathname === '/my-yoga'
}

export function isAccountLanguage (pathname) {
  return pathname === '/account/language'
}

export function isYogaPage (pathname) {
  return pathname === '/yoga'
}

export function isYogaTeachersPage (pathname) {
  return pathname === '/yoga/teachers'
}

export function isWatchGaiaOnTV (url) {
  return url === URL_WATCH_GAIA_ON_TV
}

export function isAccount (pathname) {
  return pathname === URL_ACCOUNT || pathname === '/account-details'
}

export function isAccountSettings (pathname) {
  return pathname === URL_ACCOUNT_SETTINGS
}

export function isAccountProfile (pathname) {
  return pathname === URL_ACCOUNT_PROFILE
}

export function isContact (url) {
  return url === URL_CONTACT
}

export function isHelpCenter (url) {
  return url === URL_HELP_CENTER
}

export function isGiftLandingPage (pathname) {
  return pathname === URL_GIFT
}

export function isGiftSelect (pathname) {
  return pathname === URL_GIFT_SELECT
}

export function isGiftThemePage (pathname) {
  return pathname === URL_GIFT_THEME
}

export function isGiftRecipientInfoPage (pathname) {
  return pathname === URL_GIFT_RECIPIENT
}

export function isGiftPreviewPage (pathname) {
  return pathname === URL_GIFT_PREVIEW
}

export function isGiftPaymentPage (pathname) {
  return pathname === URL_GIFT_PAYMENT
}

export function isGiftConfirmationPage (pathname) {
  return pathname === URL_GIFT_CONFIRM
}

export function isGiftRedeemPage (pathname) {
  return pathname === URL_GIFT_REDEEM
}

export function isGiftAccountCreatePage (pathname) {
  return pathname === URL_GIFT_ACCOUNT_CREATE
}

export function isGift (pathname) {
  return (
    isGiftSelect(pathname) ||
    isGiftThemePage(pathname) ||
    isGiftRecipientInfoPage(pathname) ||
    isGiftPreviewPage(pathname) ||
    isGiftPaymentPage(pathname) ||
    isGiftConfirmationPage(pathname) ||
    isGiftRedeemPage(pathname) ||
    isGiftAccountCreatePage(pathname)
  )
}

export function isFast404 (pathname) {
  return (
    pathname === '/sites/default' ||
    _startsWith(pathname, '/sites/default/') ||
    FILE_REGEX.test(pathname)
  )
}

export function isLive (pathname) {
  return _startsWith(pathname, '/live')
}

export function isLiveAccessPage (pathname) {
  return pathname === '/live-access'
}

export function isLiveChannelPage (pathname) {
  return pathname === '/gaia-now'
}

export function isEventsPage (pathname) {
  return pathname === '/events'
}

export function isLiveEvents (pathname) {
  return _startsWith(pathname, '/events')
}

export function isEventsDetailsPage (pathname) {
  return _startsWith(pathname, '/events/')
}

export function isSharePage (pathname) {
  return _startsWith(pathname, '/share/')
}

export function isTranscendence (pathname) {
  return pathname === '/series/transcendence'
}

export function isTranscendenceGuide (pathname) {
  return pathname === '/guide/transcendence-master-class'
}

export function isCheckoutFlowPage (pathname) {
  return _startsWith(pathname, '/plan-selection') || _startsWith(pathname, '/cart')
}

export function isCommunityPage (pathname) {
  return pathname === '/community'
}

export function isMultiplePlaylistsPage (pathname) {
  return _startsWith(pathname, '/playlist/')
}

/**
 * Evaluates if both paths belong to the same page.
 * @param {string} currentPath
 * @param {string} comparedPath
 * @returns {boolean}
 */
export function isPartialPathAllowed (currentPath, comparedPath) {
  return _startsWith(comparedPath, '/playlist') && isMultiplePlaylistsPage(currentPath)
}

export function anonymousAllowed (path, roles) {
  const allowedPaths = [URL_HOME, '/password-reset']
  // eslint-disable-next-line no-param-reassign
  path = _first(path.split('?'))
  if (
    process.env.NODE_ENV !== 'production' ||
    _includes(roles, ROLE_VIEW_SITE) ||
    _includes(allowedPaths, path)
  ) {
    return true
  }
  return false
}

export function isLandingPage (pathname) {
  return _startsWith(pathname, '/lp/') || _startsWith(pathname, '/es/lp/') || _startsWith(pathname, '/de/lp/') || _startsWith(pathname, '/fr/lp/') || isArticles(pathname) || isArticle(pathname)
}

export function skipGettingStarted (path) {
  const skipUrls = [
    '/get-started',
    '/plan-selection',
    '/cart/account-creation',
    '/cart/billing',
  ]
  return _includes(skipUrls, path)
}

/**
 * Get the SEO data for paths we cannot look up in other data.
 * args: { pathname, loggedIn }
 */
export function getSeo (args) {
  const pathname = _first(_split(_get(args, 'pathname', ''), '?'))
  const loggedIn = _get(args, 'loggedIn', false)
  if (isMemberHome(pathname, loggedIn)) {
    return {
      title: 'My Gaia Home',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isAnonymousHome(pathname, loggedIn)) {
    return {
      title: 'Gaia - Conscious Media, Yoga & More',
      description:
        'Join the Gaia community today to start streaming thousands of consciousness expanding, yoga and transformational videos to all of your favorite devices.',
      noFollow: false,
      noIndex: false,
    }
  } else if (isLiveAccessPage(pathname)) {
    return {
      title: 'Live Access',
      ogTitle: 'Live Access',
      twitterTitle: 'Live Access',
      noFollow: false,
      noIndex: false,
    }
  } else if (isLivePage(pathname)) {
    return {
      title: 'Live',
      ogTitle: 'Live',
      twitterTitle: 'Live',
      noFollow: false,
      noIndex: false,
    }
  } else if (isLiveChannelPage(pathname)) {
    return {
      title: 'GaiaStream',
      ogTitle: 'GaiaStream',
      twitterTitle: 'GaiaStream',
      noFollow: false,
      noIndex: false,
    }
  } else if (isEventsPage(pathname)) {
    return {
      title: 'Events',
      description: 'Get A Year Of Transformation and Global Community. Multi-day Events Streamed Worldwide - Live From Gaia HQ!',
      ogDescription: 'Get A Year Of Transformation and Global Community. Multi-day Events Streamed Worldwide - Live From Gaia HQ!',
      ogTitle: 'Live Access Membership',
      ogImage: getUrl({
        url: '/v1/image-render/5ab611e5-29d5-428f-8b5e-c21ad41a2a21/test.jpg',
        clientType: TYPE_BROOKLYN }),
      twitterCard: 'Summary',
      twitterImage: getUrl({
        url: '/v1/image-render/5ab611e5-29d5-428f-8b5e-c21ad41a2a21/test.jpg',
        clientType: TYPE_BROOKLYN }),
      twitterTitle: 'Live Access Membership',
      twitterDescription: 'Get A Year Of #Transformation and Global #Community with “Live Access” from @joingaia.',
      noFollow: false,
      noIndex: false,
    }
  } else if (pathname === '/events/caroline-myss-revolutionizing-spirituality') {
    return {
      title: 'Caroline Myss - Revolutionizing Spirituality',
      description: '',
      noFollow: false,
      noIndex: false,
      ogTitle: 'Caroline Myss - Revolutionizing Spirituality',
    }
  } else if (pathname === '/events/gregg-braden-human-by-design') {
    return {
      title: 'Gregg Braden - Human by Design',
      description: '',
      noFollow: false,
      noIndex: false,
      ogDescription: 'Special Event: Gregg Braden’s “Human By Design” LIVE June 14-16 @ Gaia Headquarters. Limited Seating. Book Now!',
      ogTitle: 'Gregg Braden - Human by Design',
      ogImage: getUrl({
        url: '/v1/image-render/dac28074-cc9d-41b8-8ae9-05b0b42269d5/test.jpg',
        clientType: TYPE_BROOKLYN }),
    }
  } else if (isEventsDetailsPage(pathname)) {
    return {
      noFollow: false,
      noIndex: false,
    }
  } else if (isGetStarted(pathname)) {
    return {
      title: 'Get Started',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isPasswordReset(pathname)) {
    return {
      title: 'Reset Password',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isSearch(pathname)) {
    return {
      title: 'Search',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isPlaylist(pathname)) {
    return {
      title: 'My Playlist',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isActivate(pathname)) {
    return {
      title: 'Activate Your Device',
      description: 'Activate your TV device with a code',
      noFollow: true,
      noIndex: true,
    }
  } else if (isReferJoin(pathname)) {
    return {
      title: 'Join Gaia',
      description: '',
      ogDescription: 'Explore conscious living with over 8,000 documentaries, original shows, practices, and films on Gaia.',
      ogTitle: 'Join Gaia Today',
      ogImage: 'https://gaia-marketing.s3-us-west-2.amazonaws.com/webapp-assets/IAFmetaimage.png',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Join Gaia Today',
      twitterDescription: 'Explore conscious living with over 8,000 documentaries, original shows, practices, and films on Gaia.',
      twitterImage: 'https://gaia-marketing.s3-us-west-2.amazonaws.com/webapp-assets/IAFmetaimage.png',
      noFollow: false,
      noIndex: false,
    }
  } else if (isRefer(pathname)) {
    return {
      title: 'Invite a Friend',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isPolicy(pathname)) {
    return {
      title: 'Terms of Use, Privacy, Policies',
      description: '',
      noFollow: false,
      noIndex: false,
    }
  } else if (isArticles(pathname)) {
    return {
      title: 'Articles',
      description: '',
      noFollow: false,
      noIndex: false,
    }
  } else if (isGo(pathname)) {
    return {
      title: 'Go',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isNotFound(pathname)) {
    return {
      title: 'Not Found',
      description: 'The page you were looking for could not be found.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isLogin(pathname)) {
    return {
      title: 'Login',
      description: 'Login to gaia to view your videos.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isLogout(pathname)) {
    return {
      title: 'Logout',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isPlans(pathname)) {
    return {
      title: 'Choose a Gaia Subscription Plan',
      description: 'Choose from three great Gaia subscription plans and fuel your conscious journey. Become a member today!',
      noFollow: false,
      noIndex: false,
    }
  } else if (isPlanSelectionPlans(pathname)) {
    return {
      title: 'Select Plan',
      description: 'Select a Gaia plan that is right for you.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isCartCreateAccount(pathname)) {
    return {
      title: 'Create Account | Cart',
      description: 'Set up your Gaia membership.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isCartAccountCreationCreate(pathname)) {
    return {
      title: 'Create Your Account | Cart',
      description: 'Create your gaia account.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isCartBilling(pathname)) {
    return {
      title: 'Billing | Cart',
      description: 'Add checkout billing information.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isCartBillingPayment(pathname)) {
    return {
      title: 'Payment | Cart',
      description: 'Add checkout billing information.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isCartConfirmation(pathname)) {
    return {
      title: 'Confirmation | Cart',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isCartAccessDenied(pathname)) {
    return {
      title: 'Access Denied | Cart',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isCommunityPage(pathname)) {
    return {
      title: 'Gaia Community',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isMyAccountPage(pathname)) {
    return {
      title: 'My Account',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isFreeMonth(pathname)) {
    return {
      title: 'Free Month',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isAccountProfile(pathname)) {
    return {
      title: 'My Profile',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isMyAccountContactUsPage(pathname)) {
    return {
      title: 'My Account',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isAccountCancelOfferPage(pathname)) {
    return {
      title: 'Cancel Subscription - Offer',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isAccountChangePlan(pathname)) {
    return {
      title: 'Change Plan',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isAccountSettings(pathname)) {
    return {
      title: 'Account Settings',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isAccountCancelConfirmPage(pathname)) {
    return {
      title: 'Cancel Subscription - Confirmation Page',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isAccountCancel(pathname)) {
    return {
      title: 'Account Cancel',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isEmailSettings(pathname)) {
    return {
      title: 'Email Settings',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isFreeTrial(pathname)) {
    return {
      title: 'Free Trial',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isFreeTrialAccount(pathname)) {
    return {
      title: 'Free Trial - Create Account',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isFreeTrialConfirm(pathname)) {
    return {
      title: 'Free Trial - Confirm Account',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  } else if (isGiftSelect(pathname)) {
    return {
      title: 'Gift - Selection',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isGiftThemePage(pathname)) {
    return {
      title: 'Gift - Choose Theme',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isGiftPreviewPage(pathname)) {
    return {
      title: 'Gift - Preview',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isGiftPaymentPage(pathname)) {
    return {
      title: 'Gift - Payment',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isGiftRecipientInfoPage(pathname)) {
    return {
      title: 'Gift - Give',
      description: '',
      noFollow: false,
      noIndex: true,
    }
  } else if (isRecentlyAdded(pathname)) {
    return {
      title: 'New in Gaia',
      description: 'Recently added videos on Gaia.',
      noFollow: false,
      noIndex: false,
    }
  } else if (isWatchHistory(pathname)) {
    return {
      title: 'My Watch History',
      description: 'User watched videos on Gaia.',
      noFollow: false,
      noIndex: true,
    }
  } else if (isYogaTeachersPage(pathname)) {
    return {
      title: 'Yoga Teachers on Gaia',
      description: 'Looking for personal yoga instruction in the comfort of your own home? Then choose from one of our excellent yoga teachers today!',
      noFollow: false,
      noIndex: false,
    }
  } else if (isYogaPage(pathname)) {
    return {
      title: 'Streaming Online Yoga Videos',
      description: 'Gaia is known for our immense collection of online yoga videos, which offer you the opportunity to do your yoga workouts on your own schedule. Live your yoga!',
      noFollow: false,
      noIndex: false,
    }
  } else if (isTopics(pathname)) {
    return {
      title: 'Explore Conscious Expanding Topics Today',
      description: 'Gaia has the largest library of conscious expanding videos on the web! Frome esoteric spiritual practices to forbidden sciences, Gaia has it all!',
      noFollow: false,
      noIndex: false,
    }
  } else if (isMultiplePlaylistsPage(pathname)) {
    return {
      title: 'My Playlists',
      description: '',
      noFollow: true,
      noIndex: true,
    }
  }
  return {
    title: 'Streaming Films, Original Interviews, Yoga &amp; Fitness',
    description: '',
    noFollow: false,
    noIndex: true,
  }
}
