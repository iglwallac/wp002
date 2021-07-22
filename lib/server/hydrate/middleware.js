import { getSetLogger } from 'log'
import { getLogger as getLoggerServer } from 'log/server'
import { all as allPromise } from 'bluebird'
import { get as getConfig } from 'config'
import _assign from 'lodash/assign'
import _concat from 'lodash/concat'
import _filter from 'lodash/filter'
import _get from 'lodash/get'
import _includes from 'lodash/includes'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _parseInt from 'lodash/parseInt'
import _some from 'lodash/some'
import _split from 'lodash/split'
import {
  getReqResolver,
  getReqAuthToken,
  getReqUserPortal,
  getPathname,
  hydrateReq,
  getReqAuth,
  getReqAuthUid,
  getReqAuthUuid,
  getReqUserLanguage,
} from 'server/common'
import {
  RESOLVER_TYPE_COMMUNITY_ACTIVITY,
  RESOLVER_TYPE_SUBCATEGORY,
  RESOLVER_TYPE_CLASSIC_FACET,
  RESOLVER_TYPE_NODE,
  RESOLVER_TYPE_NOT_FOUND,
  RESOLVER_TYPE_SHARE,
  RESOLVER_TYPE_PORTAL,
} from 'services/resolver/types'
import {
  STORE_KEY_SUBCATEGORY,
  STORE_KEY_DETAIL,
  STORE_KEY_RECENTLY_ADDED,
  STORE_KEY_WATCH_HISTORY,
  STORE_KEY_DETAIL_FEATURED_EPISODE,
} from 'services/store-keys'
import { OPTIMIZELY_DISABLED } from 'services/url/constants'
import { get as getJumbotron } from 'services/jumbotron'
import {
  getPage as getPageTiles,
  TYPE_RECENTLY_ADDED,
  TYPE_WATCH_HISTORY,
  TYPE_FEATURED_EPISODE,
} from 'services/tiles'
import {
  get as getVideo,
  TYPE_FEATURE as VIDEO_TYPE_FEATURE,
  TYPE_PREVIEW as VIDEO_TYPE_PREVIEW,
} from 'services/video'
import { hydrateShare } from 'services/share'
import { get as getDetail } from 'services/detail'
import { getUserPortalResources } from 'services/portal'
import { createSession } from 'services/getstream'
import { get as getHome } from 'services/home'
import {
  getSeo,
  isSeries,
  isVideo,
  isVideoOrSeries,
  isRecentlyAdded,
  isWatchHistory,
  createCanonicalUrl,
  createPrevUrl,
  createNextUrl,
  isFast404,
} from 'services/url'
import { createModel as createPageModel } from 'services/page'
import { getRecentlyAdded } from 'services/recently-added'
import { get as getLanguagesData } from 'services/languages'
import * as languageConstants from 'services/languages/constants'
import { parse as parseUrl, format as formatUrl } from 'url'

let log
const config = getConfig()

export default function middleware () {
  return async function route (req, res, next) {
    const uid = getReqAuthUid(req)
    log = getSetLogger(getLoggerServer(uid))
    log.info('Hydrating')
    if (isFast404(req.path)) {
      log.info('Hydrating Complete Fast 404')
      next()
      return
    }
    let status = 200
    try {
      const successResults = await allPromise([
        hydrateApp(req),
        hydrateJumbotron(req, res, next),
        hydrateDetail(req, res, next),
        hydratePageTiles(req, res, next),
        hydrateVideo(req, res, next),
        hydrateHome(req, res, next),
        hydrateRecentlyAdded(req, res, next),
        hydrateSharePage(req, res, next),
        hydrateMemberPortal(req, res, next),
        hydrateLanguage(req, res, next),
        hydrateGetstream(req, res, next),
        hydrateOptimizely(req, res, next),
      ])
      status = _some(successResults, success => !success) ? 500 : 200
    } catch (e) {
      log.error(e, 'Hydrating Failed')
      status = 500
    }
    // The status comes from the reduction or it is already set by the hydrate calls)
    if (!res.statusCode || status !== 200) {
      res.status(status)
    }
    hydrateSeo(req)
    log.info('Hydrating Complete')
    next()
  }
}

function getXffHeader (req) {
  const { ip } = req
  const xff = req.header('x-forwarded-for')
  if (xff && _isString(xff)) {
    return ip && _isString(ip) ? `${xff}, ${ip}` : xff
  }
  return undefined
}

function getFilterSet (req) {
  const filterSet = _get(req, ['query', 'filter-set'])
  return (
    filterSet ||
    _get(req, [
      'hydrate',
      'jumbotron',
      STORE_KEY_SUBCATEGORY,
      'data',
      'filterSet',
    ]) ||
    _get(req, ['hydrate', 'resolver', 'data', 'filterSet'])
  )
}

function getJumbotronStoreKey (resolverType) {
  return resolverType === RESOLVER_TYPE_NODE
    ? STORE_KEY_DETAIL
    : STORE_KEY_SUBCATEGORY
}

function isLoggedIn (req) {
  return !!getReqAuthToken(req)
}

function getLocale (req) {
  const defaultLocale = _get(config, 'appLocale')
  const locale = _get(req, ['locale', 'code'], defaultLocale)
  return isLoggedIn(req) ? locale : defaultLocale
}

function getPathLanguageRegion (req) {
  const urlParts = req.path.replace(/\//, '').split('/')
  const languageRegion = `${_get(urlParts, 1, '').toLowerCase()}-${_get(
    urlParts,
    0,
    '',
  ).toLowerCase()}`
  switch (languageRegion) {
    case 'es-la':
      return languageConstants.ES_LA
    case 'en-us':
    default:
      return languageConstants.EN_US
  }
}

function getAcceptLanguage (req) {
  const acceptLanguageHeader = _split(req.headers['accept-language'], ';')
  const languages = _split(
    _filter(acceptLanguageHeader, language => _isString(language) && !_includes(language, 'q=')),
    ',',
  )
  return languages
}

async function hydrateJumbotron (req) {
  const resolver = getReqResolver(req)
  const { id, type, path } = _get(resolver, 'data', {})

  const validTypes = [
    RESOLVER_TYPE_SUBCATEGORY,
    RESOLVER_TYPE_CLASSIC_FACET,
    RESOLVER_TYPE_NODE,
  ]
  if (
    isLoggedIn(req) ||
    !_isNumber(id) ||
    id < 0 ||
    !_includes(validTypes, type)
  ) {
    return true
  }
  const storeKey = getJumbotronStoreKey(type)
  const language = getReqUserLanguage(req)
  log.info('Hydrating Jumbotron')
  try {
    const data = await getJumbotron({ id, type, language })
    log.info('Completed Hydrating Jumbotron')
    const jumbotron = {
      [storeKey]: { id, type, path, data },
    }
    hydrateReq(req, { jumbotron })
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Jumbotron')
    return false
  }
}

function hydrateSeo (req) {
  log.info('Hydrating SEO')
  const resolver = getReqResolver(req)
  const resolverType = _get(resolver, ['data', 'type'])
  let page = _get(req, ['hydrate', 'page'], {})
  const parsedUrl = parseUrl(req.url, true)
  let dataPath = ['jumbotron', getJumbotronStoreKey(resolverType)]

  if (resolverType === RESOLVER_TYPE_SHARE) {
    dataPath = ['share']
  } else if (resolverType === RESOLVER_TYPE_PORTAL) {
    dataPath = ['portal']
  } else if (resolverType === RESOLVER_TYPE_COMMUNITY_ACTIVITY) {
    dataPath = ['community', 'activity']
  }
  const storeSeo = _get(
    req,
    _concat(['hydrate'], dataPath, ['data', 'seo']),
  )
  const storeSocial = _get(
    req,
    _concat(['hydrate'], dataPath, ['data', 'social']),
  )
  const { facebook, siteName } = config
  const canonical = createCanonicalUrl(parsedUrl)
  const totalPages = _get(page, 'totalPages')
  const queryPage = _get(req, ['query', 'page'], 1)
  // If there is no record of this URL in the resolver we should not index the page
  // if there was also no SEO record.
  const defaultNoIndex = resolverType === RESOLVER_TYPE_NOT_FOUND
  // The Jumbotron has the SEO data for now other data is static.
  if (storeSeo) {
    page = _assign({}, page, {
      title: _get(storeSeo, ['title'], ''),
      description: _get(storeSeo, ['description'], ''),
      noFollow: _get(storeSeo, ['robots', 'noFollow'], false),
      noIndex: _get(storeSeo, ['robots', 'noIndex'], defaultNoIndex),
      ogTitle: _get(storeSocial, ['og', 'title']),
      ogImage: _get(storeSocial, ['og', 'image']),
      ogType: _get(storeSocial, ['og', 'type'], ''),
      ogUrl: _get(storeSocial, ['og', 'url'], canonical),
      ogDescription: _get(storeSocial, ['og', 'description']),
    })
  } else {
    page = _assign(
      {},
      page,
      getSeo({
        pathname: getPathname(req),
        loggedIn: isLoggedIn(req),
      }),
    )
  }
  page.prev = createPrevUrl({
    totalPages,
    pathname: parsedUrl.pathname,
    page: queryPage,
  })
  page.next = createNextUrl({
    totalPages,
    pathname: parsedUrl.pathname,
    page: queryPage,
  })
  page.canonical = canonical
  page.facebookAppId = facebook.appId
  page.ogSiteName = siteName
  page.path = parsedUrl.pathname + (parsedUrl.search || '')
  page.locale = getLocale(req)
  page.acceptLanguage = getAcceptLanguage(req)
  page.pathLanguageRegion = getPathLanguageRegion(req)
  log.info('Completed Hydrating SEO')
  hydrateReq(req, { page: createPageModel(page) })
  return true
}

async function hydratePageTiles (req, res) {
  const resolver = getReqResolver(req)
  const resolverData = _get(resolver, 'data', {})
  const { path } = resolver
  const resolverValid =
    isRecentlyAdded(path) ||
    isWatchHistory(path) ||
    resolverData.type === RESOLVER_TYPE_SUBCATEGORY ||
    resolverData.type === RESOLVER_TYPE_CLASSIC_FACET
  if (isLoggedIn(req) || !resolver || !resolverValid || isVideo(path)) {
    return true
  }
  log.info('Hydrating Page Tiles')
  const query = _get(req, 'query')
  const currentPage = _parseInt(_get(query, 'page'))
  const page = _parseInt(_get(req.query, 'page', 1)) - 1
  const id = _get(resolverData, 'id')
  const filter = _get(resolverData, 'filter')
  const filterSet = getFilterSet(req)
  const country = _get(req, ['hydrate', 'auth', 'country'])
  const xff = getXffHeader(req)
  let type = _get(resolverData, 'type')
  if (isRecentlyAdded(path)) {
    type = TYPE_RECENTLY_ADDED
  } else if (isWatchHistory(path)) {
    type = TYPE_WATCH_HISTORY
  }
  const locale = getLocale(req)
  let storeKey = STORE_KEY_SUBCATEGORY
  if (isRecentlyAdded(path)) {
    storeKey = STORE_KEY_RECENTLY_ADDED
  } else if (isWatchHistory(path)) {
    storeKey = STORE_KEY_WATCH_HISTORY
  }
  // TODO: add language
  const language = getReqUserLanguage(req)
  try {
    const data = await getPageTiles({
      id,
      country,
      type,
      filter,
      filterSet,
      language,
      query,
      page,
      locale,
      xff,
    })
    log.info('Completed Hydrating Page Tiles')
    const tiles = _get(req, ['hydrate', 'tiles'], {})
    const totalPages = _parseInt(_get(data, 'totalPages', 1))

    // If page 0 or 1 is requeted or if we are requesting a page that does not exist
    if (currentPage <= 1 || currentPage > totalPages) {
      res.status(404)
    }

    tiles[storeKey] = {
      id,
      query,
      path: getPathname(req),
      page: data.page,
      limit: data.limit,
      data,
    }

    hydrateReq(req, {
      tiles,
      page: _assign(_get(req, ['hydrate', 'page'], {}), {
        totalPages: data.totalPages,
      }),
    })
    return true
  } catch (e) {
    log.warn(e, 'Failed Hydrating Page Tiles')
    return false
  }
}

async function hydrateDetailFeaturedEpisode (req) {
  const resolver = getReqResolver(req)
  const { id, type: resolverType, path: resolverPath } = _get(
    resolver,
    'data',
    {},
  )
  if (
    isLoggedIn(req) ||
    !_isNumber(id) ||
    id < 0 ||
    !isSeries(req.url) ||
    resolverType === RESOLVER_TYPE_NOT_FOUND
  ) {
    return true
  }
  log.info('Hydrating Featured Episode')
  const xff = getXffHeader(req)
  const language = getReqUserLanguage(req)
  try {
    const data = await getPageTiles({ id, type: TYPE_FEATURED_EPISODE, language, xff })
    log.info('Completed Hydrating Featured Episode')
    const tiles = _get(req, ['hydrate', 'tiles'], {})
    const featuredTile = {
      id,
      type: resolverType,
      data,
      path: resolverPath,
    }
    hydrateReq(req, {
      tiles: _assign({}, tiles, {
        [STORE_KEY_DETAIL_FEATURED_EPISODE]: featuredTile,
      }),
    })
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Featured Episode')
    return false
  }
}

async function hydrateDetail (req, res, next) {
  const resolver = getReqResolver(req)
  const resolverType = _get(resolver, ['data', 'type'])
  const { id, type, path: resolverPath } = _get(resolver, 'data', {})
  if (
    isLoggedIn(req) ||
    !_isNumber(id) ||
    id < 0 ||
    !isVideoOrSeries(req.url) ||
    resolverType === RESOLVER_TYPE_NOT_FOUND
  ) {
    return true
  }
  log.info('Hydrating Detail')
  // @TODO: options - auth
  const language = getReqUserLanguage(req)
  try {
    const data = await getDetail({ id, language })
    log.info('Completed Hydrating Detail')
    hydrateReq(req, {
      detail: { id, type, data, path: resolverPath },
    })
    return await hydrateDetailFeaturedEpisode(req, res, next)
  } catch (e) {
    log.error(e, 'Failed Hydrating Detail')
    return false
  }
}

async function hydrateVideo (req, res) {
  const resolver = getReqResolver(req)
  const resolverType = _get(resolver, ['data', 'type'])
  const { path } = resolver
  const { id } = _get(resolver, 'data', {})
  const fullplayerQuery = _get(req, ['query', 'fullplayer'])
  const xff = getXffHeader(req)

  if (
    isLoggedIn(req) ||
    !_isNumber(id) ||
    id < 0 ||
    !isVideo(path) ||
    !fullplayerQuery ||
    resolverType === RESOLVER_TYPE_NOT_FOUND
  ) {
    return true
  }
  if (!_includes([VIDEO_TYPE_FEATURE, VIDEO_TYPE_PREVIEW], fullplayerQuery)) {
    res.status(404)
    return true
  }
  log.info('Hydrating Video')
  const language = getReqUserLanguage(req)
  try {
    const data = await getVideo({ id, xff, language })
    log.info('Completed Hydrating Video')
    hydrateReq(req, {
      video: { id, data },
    })
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Video')
    return false
  }
}

async function hydrateGetstream (req) {
  const auth = _get(req, ['hydrate', 'auth'])
  log.info('Hydrating Getstream')
  try {
    const session = await createSession(auth)
    log.info('Completed Hydrating Getstream')
    hydrateReq(req, {
      getstream: {
        auth: session,
      },
    })
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Getstream')
    return false
  }
}

async function hydrateHome (req) {
  if (isLoggedIn(req) || getPathname(req) !== '/') {
    return true
  }
  log.info('Hydrating Anonymous Home')
  const language = getReqUserLanguage(req)
  try {
    const home = await getHome({ language })
    log.info('Completed Hydrating Anonymous Home')
    hydrateReq(req, { home })
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Anonymous Home')
    return false
  }
}

async function hydrateRecentlyAdded (req) {
  const resolver = getReqResolver(req)
  const { path } = resolver
  if (isLoggedIn(req) || !resolver || !isRecentlyAdded(path)) {
    return true
  }
  log.info('Hydrating Recently Added')
  const language = getReqUserLanguage(req)
  try {
    const data = await getRecentlyAdded({ locale: getLocale(req), language })
    log.info('Completed Hydrating Recently Added')
    hydrateReq(req, {
      recentlyAdded: { data },
    })
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Recently Added')
    return false
  }
}

async function hydrateSharePage (req) {
  const language = getReqUserLanguage(req)
  const resolver = getReqResolver(req)
  const auth = getReqAuth(req)
  const { data } = resolver
  const resolverType = _get(data, 'type')
  const params = _get(data, 'params')
  const token = _get(params, 'token')
  const SHARE_TILE_STOREKEY = 'share'
  if (!resolver || resolverType !== RESOLVER_TYPE_SHARE) {
    return true
  }
  log.info('Hydrating Share Page')
  try {
    const shareViewData = await hydrateShare({ token, language, auth })
    const {
      shareData: share,
      tilesData: tiles,
      error = false,
      videosData,
      videoIds,
    } = shareViewData

    const shareData = { error }
    const parsedUrl = parseUrl(req.url, true)
    const { origin } = config
    const url = formatUrl(parsedUrl)

    if (share && share.get('data')) {
      shareData.data = share.get('data')
    }

    hydrateReq(req, {
      tiles: {
        [SHARE_TILE_STOREKEY]: {
          placeholderTitlesExist: false,
          processing: false,
          data: tiles,
        },
      },
      videos: {
        videoIds,
        videosData,
        language,
      },
      shareData,
      share: {
        data: {
          seo: {
            title: share && share.getIn(['data', 'content', 'title'], ''),
            description: share && share.getIn(['data', 'content', 'description'], ''),
          },
          social: {
            og: {
              title: share && share.getIn(['data', 'content', 'title'], ''),
              type: share && `video${share.getIn(['data', 'content', 'type'], '') === 'single' ? '.movie' : '.episode'}`,
              image: share && share.getIn(['data', 'content', 'imageWithText'], ''),
              description: share && share.getIn(['data', 'content', 'description'], ''),
              url: origin + url,
            },
          },
        },
      },
    })
    log.info('Completed Hydrating Share Video Page')
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Share Video Page')
    return false
  }
}

async function hydrateMemberPortal (req) {
  const resolver = getReqResolver(req)
  const viewerUuid = getReqAuthUuid(req)
  const language = getReqUserLanguage(req)
  const auth = getReqAuth(req)
  const { data = {} } = resolver
  const { type } = data
  if (type !== RESOLVER_TYPE_PORTAL) {
    return true
  }
  const { params = {} } = data
  const { portal: url } = params
  const isOwner = getReqUserPortal(req) === url
  log.info('Hydrating Member Portal Page')
  try {
    const portalData = await getUserPortalResources({
      language,
      viewerUuid,
      url,
      isOwner,
      auth,
    })
    // Or operator here because null technically evaluates to a value from a get
    // which then visually renders null in the browser tab meta data
    const title = _get(portalData, ['data', 'displayName']) || ''
    const image = _get(portalData, ['data', 'profilePicture']) || ''
    const isPrivate = _get(portalData, ['data', 'privacySetting'], 'private') === 'private'
    const description = isPrivate ? '' : _get(portalData, ['data', 'description']) || ''
    hydrateReq(req, {
      portalData,
      portal: {
        data: {
          seo: {
            id: _get(portalData, ['data', 'id'], -1),
            title,
            description,
            // noFollow: _get(portal, ['robots', 'noFollow'], false),
            // noIndex: _get(portal, ['robots', 'noIndex'], defaultNoIndex),
          },
          social: {
            og: {
              title,
              type: 'Portal',
              image,
              description,
              // url: _get(video, ['og', 'url'], canonical),
            },
          },
        },
      },
    })
    log.info('Completed Hydrating MemberPortal Page')
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating MemberPortal Page')
    return false
  }
}

async function hydrateLanguage (req) {
  if (!_get(config, ['features', 'languageSelect'])) {
    return true
  }
  log.info('Hydrating Languages')
  try {
    const data = await getLanguagesData(getLocale(req))
    log.info('Completed Hydrating Languages')
    hydrateReq(req, {
      languages: { data },
    })
    return true
  } catch (e) {
    log.error(e, 'Failed Hydrating Languages')
    return false
  }
}

async function hydrateOptimizely (req) {
  const query = _get(req, 'query')
  const optimizelyDisabled = _get(query, OPTIMIZELY_DISABLED)
  if (!optimizelyDisabled) {
    return true
  }
  log.info('Hydrating Optimizely')
  hydrateReq(req, {
    optimizely: {
      disabled: optimizelyDisabled,
    },
  })
  log.info('Completed Hydrating Optimizely')
  return true
}

async function hydrateApp (req) {
  const jwt = _get(req, 'hydrate.auth.jwt', null)
  // webview is when native device applications
  // integrate our web pages into the application.
  const webview = _get(req, 'query.webview') === 'true'
  const resolverType = _get(req, 'hydrate.resolver.data.type', '')
  // only endable reactApps for logged in users IF we are on a 404 page
  // enable reactApps for all anonymous traffic
  const enableReactApps = jwt
    ? resolverType === RESOLVER_TYPE_NOT_FOUND
    : true

  hydrateReq(req, {
    interstitial: {
      renderedAt: null,
      leaving: false,
      view: null,
    },
    app: {
      server: true,
      client: false,
      scrollable: true,
      isWebView: webview,
      enableHeader: enableReactApps,
      enableFooter: enableReactApps,
      enableRoutes: enableReactApps,
      viewport: {
        touchable: null,
        ready: true,
        height: 0,
        width: 0,
      },
    },
  })
  return true
}
