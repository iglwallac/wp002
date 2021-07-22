/* eslint-disable consistent-return */
import get from 'lodash/get'
import map from 'lodash/map'
import size from 'lodash/size'
import assign from 'lodash/assign'
import isPlainObject from 'lodash/isPlainObject'
import { fromJS, Map } from 'immutable'
import { getNode } from 'services/node'
import { get as getConfig } from 'config'
import strictUriEncode from 'strict-uri-encode'
import { reduce as BluebirdReduce } from 'bluebird'
import { getMany as getVideos } from 'services/videos'
import { parse as parseUrl, format as formatUrl } from 'url'
import { get as getTilesData, TYPE_RELATED } from 'services/tiles'
import { stringify as stringifyQuery } from 'services/query-string'
import { get as apiGet, post as apiPost, del as apiDel, TYPE_BROOKLYN_JSON } from 'api-client'

// **************************
// NEW SHARE FUNCTIONALITY
// Including Friends Watch Free
// **************************

export const SHARE_LINKS = {
  FACEBOOK: 'https://www.facebook.com/sharer/sharer.php?u={url}',
  TWITTER: 'https://twitter.com/intent/tweet?url={url}&text={title}&via={user_id}',
  REDDIT: 'https://reddit.com/submit?url={url}&title={title}',
  // eslint-disable-next-line no-template-curly-in-string
  EMAIL: 'mailto:username@example.com?subject=Checkout {title} on Gaia&body={url}',
  GAIA_USER: 'JoinGaia',
}

export const UNAVAILABLE_REASON = {
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  VIEW_LIMIT_EXCEEDED: 'VIEW_LIMIT_EXCEEDED',
  NOT_SHARABLE: 'NOT_SHARABLE',
  GEO_NOT_AVAILABLE: 'GEO_NOT_AVAILABLE',
}

const config = getConfig()

const SHARE_ADDITIONAL_MEDIA_ITEMS = [
  {
    type: 'lp',
    name: 'rewired',
    lang: ['en'],
    url: 'https://www.gaia.com/lp/rewired',
  },
  {
    type: 'lp',
    name: 'rewired-es',
    lang: ['es'],
    url: 'https://www.gaia.com/es/lp/rewired',
  },
  {
    type: 'lp',
    name: 'rewired-de',
    lang: ['de'],
    url: 'https://www.gaia.com/de/lp/rewired',
  },
  {
    type: 'lp',
    name: 'initiation',
    lang: ['en'],
    url: 'https://www.gaia.com/lp/initiation',
  },
  {
    type: 'lp',
    name: 'initiation-es',
    lang: ['es'],
    url: 'https://www.gaia.com/es/lp/iniciacion-viaje-al-origen-del-universo',
  },
  {
    type: 'lp',
    lang: ['en'],
    name: 'psychedelica',
    url: 'https://www.gaia.com/lp/psychedelica',
  },
  {
    type: 'lp',
    lang: ['de'],
    name: 'psychedelica-de',
    url: 'https://www.gaia.com/de/lp/psychedelica',
  },
  {
    type: 'lp',
    lang: ['es'],
    name: 'psychedelica-es',
    url: 'https://www.gaia.com/es/lp/psychedelica',
  },
  {
    type: 'lp',
    name: 'symbols',
    lang: ['en'],
    url: 'https://www.gaia.com/lp/symbols',
  },
  {
    type: 'lp',
    lang: ['en'],
    name: 'cosmic-disclosure',
    url: 'https://www.gaia.com/lp/cosmic-disclosure',
  },
  {
    url: null,
    img: null,
    nid: 104941,
    lang: ['fr'],
    type: 'series',
    name: 'cosmic-disclosure',
  },
  {
    type: 'lp',
    lang: ['en'],
    name: 'ancient-civilizations',
    url: 'https://www.gaia.com/lp/ancient-civilizations',
  },
  {
    type: 'lp',
    lang: ['de'],
    name: 'ancient-civilizations-de',
    url: 'https://www.gaia.com/de/lp/antike-zivilisationen',
  },
  {
    img: null,
    url: null,
    lang: ['fr'],
    nid: get(config, ['contentIds', 'ancientCiv']),
    type: 'series',
    name: 'ancient-civilizations',
  },
  {
    type: 'lp',
    lang: ['es'],
    name: 'missing-links-es',
    url: 'https://www.gaia.com/es/lp/eslabones-perdidos',
  },
  {
    type: 'lp',
    lang: ['de'],
    name: 'missing-links-de',
    url: 'https://www.gaia.com/de/lp/fehlende-bindeglieder',
  },
  {
    img: null,
    url: null,
    nid: get(config, ['contentIds', 'missingLinks']),
    lang: ['fr'],
    type: 'series',
    name: 'missing links',
  },
  {
    img: null,
    url: null,
    nid: get(config, ['contentIds', 'nuevo']),
    lang: ['es'],
    name: 'nuevo',
    type: 'series',
  },
  {
    type: 'lp',
    lang: ['es'],
    name: 'transcendence-es',
    url: 'https://www.gaia.com/es/lp/transcendencia',
  },
  {
    type: 'lp',
    lang: ['de'],
    name: 'transcendence-de',
    url: 'https://www.gaia.com/de/lp/transzendenz',
  },
  {
    img: null,
    url: null,
    nid: get(config, ['contentIds', 'transcendence']),
    lang: ['fr'],
    type: 'series',
    name: 'transcendence',
  },
  {
    img: null,
    url: null,
    nid: get(config, ['contentIds', 'godsWereAstronauts']),
    lang: ['de'],
    type: 'series',
    name: 'The Gods were Astronauts Series',
  },
  {
    img: null,
    url: null,
    nid: get(config, ['contentIds', 'leclosionDuCoeur']),
    lang: ['fr'],
    type: 'series',
    name: "L'éclosion du coeur",
  },
  {
    name: 'e-motion',
    type: 'feature',
    lang: ['fr'],
    nid: get(config, ['contentIds', 'emotion']),
    img: null,
    url: null,
  },
]

function handleSuccess (res) {
  const data = get(res, 'body', {})
  const errors = get(data, 'errors', [])
  return fromJS({ data, success: size(errors) < 1 })
}

function handleError (data) {
  return fromJS({
    data: isPlainObject(data) ? data : {},
    success: false,
  })
}

function getAdditionalMediaItems (language) {
  return SHARE_ADDITIONAL_MEDIA_ITEMS.filter(x => x.lang.includes(language))
}

async function getAdditionalMedia (auth, language, referralId) {
  const additionalMediaItems = getAdditionalMediaItems(language)
  const additionalMediaList = await BluebirdReduce(additionalMediaItems, async (acc, item) => {
    const type = get(item, 'type')
    const itemId = get(item, 'nid')
    let itemUrl = get(item, 'url')
    if (type === 'lp') {
      const parsedUrl = parseUrl(itemUrl)
      const query = { rfd: referralId }
      itemUrl = formatUrl({
        ...parsedUrl,
        search: stringifyQuery(query),
      })
      acc.push(assign({}, item, {
        url: itemUrl,
      }))
    } else {
      const data = await getNode({ id: itemId, auth, language })
      const id = get(data, 'nid')
      // Tack on node if it exist
      if (id) {
        const image = get(data, 'keyart_16x9_withtext.keyart_304x171', null)
        const path = get(data, 'path', '')
        acc.push(assign({}, item, {
          img: image,
          url: path,
        }))
      }
    }
    return acc
  }, [])
  return fromJS(additionalMediaList)
}

export function copyToClipboard (what) {
  //
  const textProvided = typeof what === 'string'
  const isValidInput = what && /input|textarea/i.test(what.tagName)

  if (!textProvided && !isValidInput) {
    throw new Error(`copyToClipboard() :: Cannot copy ${what}.`)
  }

  let input
  let value
  let success
  // if text was provided,
  // we need to create a temporary element
  // to put our text in
  if (textProvided) {
    // creating an element to allow a clipboard copy without triggering a react render
    input = document.createElement('input')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    input.value = what
    input.type = 'text'
    value = what
  } else {
    input = what
    value = what.value
  }
  // iOS will not let you copy
  // text from readOnly inputs SO,
  // we have to do this nonsense
  const readOnly = input.readOnly

  if (readOnly) {
    input.readOnly = false
  }

  if (textProvided) {
    document.body.appendChild(input)
  }
  // wrapped in try/catch for browsers that do not
  // support createRange, Selection API, or execCommand
  try {
    const range = document.createRange()
    const selection = window.getSelection()

    range.selectNodeContents(input)
    selection.removeAllRanges()
    selection.addRange(range)

    input.focus()
    input.setSelectionRange(0, value.length)
    document.execCommand('copy')
    success = true
  } catch (err) {
    success = false
  }

  if (textProvided) {
    document.body.removeChild(input)
  }

  if (readOnly) {
    input.readOnly = true
  }
  return success
}

export async function getShare (options = {}) {
  const { token, language, auth } = options
  try {
    const result = await apiGet(`/v2/shares/${strictUriEncode(token)}`, { language }, { auth }, TYPE_BROOKLYN_JSON)
    return handleSuccess(result)
  } catch (e) {
    return handleError()
  }
}

export async function hydrateShare (options = {}) {
  const { token, language, auth } = options
  try {
    let shareData = await getShare({ token, language, auth })

    if (!shareData.get('success')) {
      throw new Error('Share not found')
    }

    const seriesId = shareData.getIn(['data', 'content', 'seriesId'], null)
    const referralId = shareData.getIn(['data', 'userReferralId'])
    // Tack on series data if the shared video is an episode
    if (seriesId) {
      const series = await getNode({ id: seriesId, language, asTile: false, auth })
      const seriesPoster = get(series, 'coverart_image.hdtv_385x539', null)
      const seriesDescription = get(series, 'fields.body[0].value', null)
      const seriesTeaser = get(series, 'fields.teaser[0].value', null)
      const seriesTrailerId = get(series, 'previw.nid', null)
      const seriesHost = get(series, 'fields.instructor[0].value')
      const seriesTotalSeasons = get(series, 'total_seasons', null)
      const seriesTotalEpisodes = get(series, 'total_episodes', null)

      shareData = shareData.withMutations((mutatableShareData) => {
        mutatableShareData.setIn(['data', 'content', 'seriesPoster'], seriesPoster)
        mutatableShareData.setIn(['data', 'content', 'seriesDescription'], seriesDescription)
        mutatableShareData.setIn(['data', 'content', 'seriesTeaser'], seriesTeaser)
        mutatableShareData.setIn(['data', 'content', 'seriesTrailerId'], seriesTrailerId)
        mutatableShareData.setIn(['data', 'content', 'seriesHost'], seriesHost)
        mutatableShareData.setIn(['data', 'content', 'seriesTotalSeasons'], seriesTotalSeasons)
        mutatableShareData.setIn(['data', 'content', 'seriesTotalEpisodes'], seriesTotalEpisodes)
        return mutatableShareData
      })
    }

    const authMap = fromJS(auth) || Map()
    const isAnonymous = !authMap.get('jwt')
    const country = authMap.get('country', 'US')
    const uid = authMap.get('uid', 1)

    if (isAnonymous) {
      const additionalMedia = await getAdditionalMedia(authMap, language, referralId)
      shareData = shareData.withMutations((mutatableShareData) => {
        mutatableShareData.setIn(['data', 'additionalMedia'], additionalMedia)
      })
    }

    const tilesData = await getTilesData(
      shareData.getIn(['data', 'contentId']),
      { type: TYPE_RELATED, language, country },
      0,
      10,
      false,
      uid,
      authMap,
    )
    const videoIds = tilesData.titles.map(t => t.id)
    const videosData = await getVideos(videoIds, { auth, language })
    return { videosData, shareData, tilesData, videoIds }
  } catch (e) {
    return { error: true }
  }
}

export function getUserShares (options = {}) {
  const { auth } = options
  return apiGet('shares/user', null, { auth }, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export function getHasShared (options = {}) {
  const { auth } = options
  return apiGet('shares/user-has-shared', null, { auth }, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export function getAccountShares (options = {}) {
  const { auth } = options
  return apiGet('shares/account', null, { auth }, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export function createShare (options = {}) {
  const { auth, type, contentId, source, personalization } = options
  return apiPost('/shares', { type, contentId, source, personalization }, { auth }, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export async function duplicateShareEmailCapture (options = {}) {
  const { token, email, language } = options
  try {
    const result = await apiPost('/shares/email-capture', { token, email, language }, null, TYPE_BROOKLYN_JSON)
    return handleSuccess(result)
  } catch (e) {
    return handleError(e)
  }
}

export function setShareSource (options = {}) {
  const { auth, token, source } = options
  return apiPost('/shares/source', { token, source }, { auth }, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export function setConversion (options = {}) {
  const { token } = options
  return apiPost(`/shares/${strictUriEncode(token)}/conversion`, null, null, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export function setQualifiedView (options = {}) {
  const { token } = options
  return apiPost(`/shares/${strictUriEncode(token)}/qualified-view`, null, null, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export function addPersonalization (options = {}) {
  const { token, personalization } = options
  return apiPost(`/shares/${strictUriEncode(token)}/personalize`, { personalization }, null, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

export function removePersonalization (options = {}) {
  const { token } = options
  return apiDel(`/shares/${strictUriEncode(token)}/personalize`, null, null, TYPE_BROOKLYN_JSON)
    .then(handleSuccess)
    .catch(handleError)
}

// **************************
// OLD SHARE FUNCTIONALITY
// DO NOT USE
// **************************

export const BASE_FACEBOOK_SHARE = 'https://www.facebook.com/sharer/sharer.php'
export const BASE_TWITTER_SHARE = 'https://twitter.com/home'

const WINDOW_NAME = 'share-window'

export function getFacebookHref (path, absolute = false) {
  const url = getShareUrl(path, absolute)

  return `${BASE_FACEBOOK_SHARE}?u=${encodeURIComponent(url)}`
}

export function getTwitterHref (path, title, prefix, suffix, absolute = false) {
  const url = getShareUrl(path, absolute)
  const message = `${prefix} ${title} ${suffix} ${url}`

  return `${BASE_TWITTER_SHARE}?status=${encodeURIComponent(message)}`
}

function getShareUrl (path, absolute = false) {
  if (absolute) {
    return path
  }
  return `${config.origin}/${path}`
}

export function openWindow (e, openShareWindow, url, width = 540, height = 250) {
  if (!openShareWindow) {
    return
  }

  if (e !== null) {
    e.preventDefault()
  }

  const windowParams = {
    height,
    width,
    top: window.screenTop + 50,
    left: window.screenLeft + 50,
  }

  const paramsString = map(windowParams, (
    value,
    param,
  ) => `${param}=${value}`).join(',')

  window.open(url, WINDOW_NAME, paramsString)
}
