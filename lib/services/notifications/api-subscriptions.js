import get from 'lodash/get'
import set from 'lodash/set'
import map from 'lodash/map'
import size from 'lodash/size'
import find from 'lodash/find'
import reduce from 'lodash/reduce'
import { getNodes } from 'services/node'
import { getUserPublic } from 'services/user'
import { getTerms as apiGetTerms } from 'services/term'
import { all as BluebirdAll } from 'bluebird'
import { REQUEST_ACCEPT_APPLICATION_JSON, TYPE_BROOKLYN, post as apiPost, get as apiGet, del as apiDel } from 'api-client'

const ERROR = { success: false }
const URL_JAVASCRIPT_VOID = 'javascript: void(0);' // eslint-disable-line

export const CONTENT_TYPES = {
  TEACHER: 'TEACHER',
  MEMBER: 'MEMBER',
  SERIES: 'SERIES',
  TOPIC: 'TOPIC',
  HOST: 'HOST',
}

export const TYPES = {
  ACCOUNT: 'ACCOUNT',
  MEMBER: 'MEMBER',
  SERIES: 'SERIES',
  TERM: 'TERM',
}

function transform (subscriptions) {
  return map(subscriptions, (item) => {
    //
    const { type } = item

    let url = URL_JAVASCRIPT_VOID
    let subscribers = 0
    let tagline = ''
    let image = ''
    let title = ''
    let tags = []
    let id = ''

    switch (type) {
      case TYPES.SERIES: {
        image = get(item, ['node', 'keyart_16x9_withtext', 'keyart_864x486'])
        title = get(item, ['node', 'title'], '')
        url = get(item, ['node', 'path'], '')
        id = get(item, 'id')
        break
      }
      case TYPES.TERM: {
        title = get(item, ['term', 'name'], '')
        image = get(item, ['term', 'termImages', 'tile', 'tile_532x400'], '')
        const termType = get(item, 'contentType')
        const pathName = title.split(' ').join('-').toLowerCase()
        url = (termType !== 'topic') ? `/person/${pathName}` : `/topic/${pathName}`
        id = get(item, 'id')
        break
      }
      case TYPES.MEMBER: {
        title = get(item, ['member', 'title'], '')
        image = get(item, ['member', 'image'], '')
        tagline = get(item, ['member', 'tagline'], '')
        tags = get(item, ['member', 'tags'], [])
        subscribers = get(item, ['member', 'subscribers'], 0)
        url = get(item, ['member', 'url'])
        id = get(item, ['member', 'id'])
        break
      }
      default:
        break
    }

    set(item, 'tile', {
      subscribers,
      tagline,
      image,
      title,
      tags,
      url,
      id,
    })
    return item
  })
}

async function getMembers (subscriptions) {
  const promiseArr = []
  subscriptions.map((sub) => {
    if (sub.type === TYPES.MEMBER) {
      const uuid = get(sub, 'contentId') || get(sub, 'uuid')
      promiseArr.push(getUserPublic(uuid))
    }
    return null
  })
  return BluebirdAll(promiseArr).then((members) => {
    const subscriptionsWithMembers = subscriptions.map((s) => {
      const uuid = get(s, 'contentId') || get(s, 'uuid')
      if (get(s, 'type') === TYPES.MEMBER) {
        const member = find(members, m => get(m, 'id') === uuid)
        set(s, 'member', member)
      }
      return s
    })
    return subscriptionsWithMembers
  })
}

async function getSeries (subscriptions, { language, auth }) {
  const ids = reduce(subscriptions, (a, s) => {
    if (get(s, 'type') === TYPES.SERIES) {
      a.push(get(s, 'contentId'))
    }
    return a
  }, [])

  if (!size(ids)) {
    return subscriptions
  }

  const nodes = await getNodes({ ids, language, auth })
  return map(subscriptions, (s) => {
    if (get(s, 'type') === TYPES.SERIES) {
      const node = find(nodes, n => (
        get(n, 'nid') === get(s, 'contentId')
      ))
      set(s, 'node', node)
    }
    return s
  })
}

async function getTerms (subscriptions, { language }) {
  const ids = reduce(subscriptions, (a, s) => {
    if (get(s, 'type') === TYPES.TERM) {
      a.push(get(s, 'contentId'))
    }
    return a
  }, [])

  if (!size(ids)) {
    return subscriptions
  }

  const terms = await apiGetTerms({ ids, language })
  return map(subscriptions, (sub) => {
    if (get(sub, 'type') === TYPES.TERM) {
      const term = find(terms, (
        t => get(t, 'tid') === get(sub, 'contentId')
      ))
      set(sub, 'term', term)
    }
    return sub
  })
}

export async function createSubscriber ({ id, auth }) {
  try {
    const response = await apiPost(
      `/notifications/user/subscriptions/${id}`, {}, { auth }, TYPE_BROOKLYN)
    return get(response, 'body', {})
  } catch (e) {
    return ERROR
  }
}

export async function removeSubscriber ({ id, auth }) {
  try {
    const response = await apiDel(
      `/notifications/user/subscriptions/${id}`, {}, { auth }, TYPE_BROOKLYN)
    return get(response, 'body', {})
  } catch (e) {
    return ERROR
  }
}

export async function getSubscriptions ({ language, auth, pp = 50, p = 1, version = 'v2' }) {
  try {
    const query = { pp, p }
    const response = await apiGet(`/${version}/notifications/user/subscriptions`, query, { auth }, TYPE_BROOKLYN)
    const total = get(response, ['body', 'total'], 0)
    const subscriptions = get(response, ['body', 'subscriptions'], [])
    const subscriptionsWithTerms = await getTerms(subscriptions, { language, auth })
    const subscriptionsWithMembers = await getMembers(subscriptionsWithTerms, { language, auth })
    const subscriptionsWithSeries = await getSeries(subscriptionsWithMembers, { language, auth })
    const transformedSubscriptions = transform(subscriptionsWithSeries)
    return { data: transformedSubscriptions, total }
  } catch (e) {
    return ERROR
  }
}

export async function getUserSubscriptions ({
  returnOriginalShape = false,
  viewerUuid,
  language,
  uuid,
  pp = 50,
  p = 1,
}) {
  try {
    const query = { type: TYPES.MEMBER, pp, p }
    const bustCache = uuid === viewerUuid
    const response = await apiGet(`v2/notifications/public/user/${uuid}/subscriptions${bustCache ? `?cacheBust=${Date.now()}` : ''}`, query, null, TYPE_BROOKLYN)
    const count = get(response, ['body', 'total'], [])
    const subscriptions = get(response, ['body', 'subscriptions'], [])
    const subscriptionsWithTerms = await getTerms(subscriptions, { language })
    const subscriptionsWithMembers = await getMembers(subscriptionsWithTerms)
    const subscriptionsWithSeries = await getSeries(subscriptionsWithMembers, { language })
    const transformedSubscriptions = transform(subscriptionsWithSeries)

    if (returnOriginalShape) {
      const result = {
        ...response.body,
        subscriptions: transformedSubscriptions,
      }
      return result
    }

    const data = { subscriptions: transformedSubscriptions, count }
    return { data }
  } catch (e) {
    return ERROR
  }
}

export async function getSubscriptionSubscribers ({
  returnOriginalShape = false,
  viewerUuid,
  contentId,
  pp = 50,
  p = 1,
  type,
}) {
  try {
    const query = { pp, p }
    const bustCache = contentId === viewerUuid
    const response = await apiGet(`v2/notifications/public/user/${type}/${contentId}/subscribers${bustCache ? `?cacheBust=${Date.now()}` : ''}`, query, null, TYPE_BROOKLYN)
    const count = get(response, ['body', 'total'], [])
    const subscribers = get(response, ['body', 'subscribers'], [])
    const subscribersWithMembers = await getMembers(subscribers)
    const transformedSubscriptions = transform(subscribersWithMembers)

    if (returnOriginalShape) {
      const result = {
        ...response.body,
        subscribers: transformedSubscriptions,
      }
      return result
    }

    const data = { subscribers: transformedSubscriptions, count }
    return { data }
  } catch (e) {
    return ERROR
  }
}

export async function getSubscribableEntity ({ type, auth, contentId }) {
  try {
    const response = await apiGet(
      `/notifications/user/subscriptions/${type}/${contentId}`, {}, { auth }, TYPE_BROOKLYN)
    return get(response, 'body', {})
  } catch (e) {
    return ERROR
  }
}

export async function createSubscribableEntity ({ auth, name }) {
  try {
    const data = { name }
    const params = { reqType: REQUEST_ACCEPT_APPLICATION_JSON, auth }
    const result = await apiPost(
      '/notifications/subscriptions/member', data, params, TYPE_BROOKLYN)
    return get(result, 'body', {})
  } catch (e) {
    return ERROR
  }
}

export async function removeSubscribableEntity ({ auth }) {
  try {
    const params = { reqType: REQUEST_ACCEPT_APPLICATION_JSON, auth }
    const result = await apiDel(
      '/notifications/subscriptions/member', {}, params, TYPE_BROOKLYN)
    return get(result, 'body', {})
  } catch (e) {
    return ERROR
  }
}
