import map from 'lodash/map'
import get from 'lodash/get'
import omitBy from 'lodash/omitBy'
import assign from 'lodash/assign'
import parseInt from 'lodash/parseInt'
import { getNode } from 'services/node'
import { fromJS } from 'immutable'
import cloneDeep from 'lodash/cloneDeep'
import { get as getConfig } from 'config'
import isUndefined from 'lodash/isUndefined'
import { reduce as BluebirdReduce } from 'bluebird'
import { parse as parseUrl, format as formatUrl } from 'url'
import { stringify as stringifyQuery } from 'services/query-string'
import { get as apiGet, post as apiPost, TYPE_BROOKLYN_JSON } from 'api-client'

const config = getConfig()

export const REFERRAL_ITEMS_PER_PAGE = 25

const REFERRAL_DATA_SCHEMA = {
  referralId: null,
  success: null,
  referrals: {
    count: 0,
    referredUsers: [],
  },
}

const REFERRAL_ATTRIBUTION_DATA_SCHEMA = {
  success: null,
  id: 0,
}

export const REFERRAL_TYPE = {
  PORTAL: 'portal',
  UNKNOWN: 'referral',
  REFERRAL: 'referral',
  SHARE: 'share',
}

export function transform (user) {
  return {
    image: get(user, ['profile', 'picture', 'hdtv_190x266'], ''),
    url: get(user, 'url') ? `/portal/${get(user, 'url')}` : null,
    subscribers: get(user, 'subscriberCount', 0),
    createdAt: get(user, 'createdAt', ''),
    tagline: get(user, 'tagline', ''),
    title: get(user, 'username', ''),
    source: get(user, 'source', ''),
    tags: get(user, 'tags', []),
    id: get(user, 'uuid'),
  }
}

export async function getReferralData (options) {
  try {
    const { auth, p, pp, createdAt, referralType } = options
    const res = await apiGet('v1/user/referrals', { p, pp, createdAt, referralType }, { auth }, TYPE_BROOKLYN_JSON)
    return handleGetReferralDataResponse(res)
  } catch (e) {
    return handleGetReferralDataResponse({}, true)
  }
}

export async function postUserReferralAttributionData (options) {
  try {
    const { auth, referralId, sourceId, source = 'UNKNOWN' } = options
    const id = typeof sourceId === 'number' ? sourceId : undefined
    const body = omitBy({ referralId, sourceId: id, source }, isUndefined)
    const res = await apiPost('v1/user/referrals', body, { auth }, TYPE_BROOKLYN_JSON)
    return handlePostUserReferralAttributionDataResponse(res)
  } catch (e) {
    return handlePostUserReferralAttributionDataResponse({}, true)
  }
}

export function handleGetReferralDataResponse (res) {
  const data = get(res, 'body', {})
  const referredUsers = get(data, 'referrals.referredUsers', [])
  return assign(cloneDeep(REFERRAL_DATA_SCHEMA), {
    referralId: get(data, 'referralId', null),
    referrals: {
      count: parseInt(get(data, 'referrals.count', 0)),
      referredUsers: map(referredUsers, user => transform(user)),
    },
    success: get(data, 'success'),
  })
}

export function handlePostUserReferralAttributionDataResponse (res) {
  const data = get(res, 'body', {})
  return assign(cloneDeep(REFERRAL_ATTRIBUTION_DATA_SCHEMA), {
    success: get(data, 'success'),
    id: get(data, 'id', null),
  })
}

const INVITE_FRIEND_ADDITIONAL_MEDIA_ITEMS = [
  {
    type: 'lp',
    name: 'rewired',
    lang: ['en'],
    url: 'https://www.gaia.com/lp/rewired',
  },
  {
    type: 'lp',
    name: 'rewired',
    lang: ['es'],
    url: 'https://www.gaia.com/es/lp/rewired',
  },
  {
    type: 'lp',
    name: 'rewired',
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
    name: 'initiation',
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
    name: 'psychedelica',
    url: 'https://www.gaia.com/de/lp/psychedelica',
  },
  {
    type: 'lp',
    lang: ['es'],
    name: 'psychedelica',
    url: 'https://www.gaia.com/es/lp/psychedelica',
  },
  {
    type: 'lp',
    name: 'symbols',
    lang: ['en'],
    url: 'https://www.gaia.com/lp/symbols',
  },
  {
    img: null,
    nid: 104941,
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
    name: 'ancient-civilizations',
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
    name: 'missing-links',
    url: 'https://www.gaia.com/es/lp/eslabones-perdidos',
  },
  {
    type: 'lp',
    lang: ['de'],
    name: 'missing-links',
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
    name: 'transcendence',
    url: 'https://www.gaia.com/es/lp/transcendencia',
  },
  {
    type: 'lp',
    lang: ['de'],
    name: 'transcendence',
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

function getInviteFriendTileItems (language) {
  return INVITE_FRIEND_ADDITIONAL_MEDIA_ITEMS.filter(x => x.lang.includes(language))
}

export async function getInviteFriendTiles (auth, language, referralId) {
  const inviteFriendTileItems = getInviteFriendTileItems(language)
  const inviteFriendTileList = await BluebirdReduce(inviteFriendTileItems, async (acc, item) => {
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
      // Tack on node if it exists
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
  return fromJS(inviteFriendTileList)
}
