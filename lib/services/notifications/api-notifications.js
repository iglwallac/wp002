import get from 'lodash/get'
import set from 'lodash/set'
import map from 'lodash/map'
import find from 'lodash/find'
import uniq from 'lodash/uniq'
import filter from 'lodash/filter'
import isNumber from 'lodash/isNumber'
import { getNodes } from 'services/node'
import { getUserPublic } from 'services/user'
import { REQUEST_ACCEPT_APPLICATION_JSON, TYPE_BROOKLYN, post as apiPost, get as apiGet } from 'api-client'
import { TYPES as SUBSCRIPTION_TYPES } from './api-subscriptions'

const ERROR = { success: false }

export const TYPES = {
  SUBSCRIPTION_RECOMMENDATION: 'SUBSCRIPTION_RECOMMENDATION',
  SUBSCRIPTION_NEW_EPISODE: 'SUBSCRIPTION_NEW_EPISODE',
  SUBSCRIPTION_NEW_SEASON: 'SUBSCRIPTION_NEW_SEASON',
  SUBSCRIPTION_FREE_FORM: 'SUBSCRIPTION_FREE_FORM',
  GENERAL_RECOMMENDATION: 'GENERAL_RECOMMENDATION',
  GENERAL_NEW_FEATURE: 'GENERAL_NEW_FEATURE',
  GENERAL_FREE_FORM: 'GENERAL_FREE_FORM',
  MEMBER_RECOMMENDATION: 'MEMBER_RECOMMENDATION',
  MEMBER_PLAYLIST_ADD: 'MEMBER_PLAYLIST_ADD',
  MEMBER_FREE_FORM: 'MEMBER_FREE_FORM',
  MEMBER_FOLLOWING: 'MEMBER_FOLLOWING',
  ACCOUNT_FOLLOWED: 'ACCOUNT_FOLLOWED',
}

export const CONTENT_TYPES = {
  SUBSCRIPTION: 'subscription',
  MEMBER: 'member',
  SERIES: 'series',
  VIDEO: 'video',
}

function getNodeContentId (notification) {
  const type = get(notification, 'type')
  if (type === TYPES.SUBSCRIPTION_FREE_FORM) {
    const subscriptionType = get(notification, ['subscriptions', 0, 'type'])
    if (subscriptionType === SUBSCRIPTION_TYPES.SERIES) {
      return get(notification, ['subscriptions', 0, 'contentId'])
    }
  }
  return get(notification, 'contentId')
}

function getMemberContentId (notification) {
  const subType = get(notification, ['subscriptions', 0, 'type'])
  if (subType === SUBSCRIPTION_TYPES.MEMBER) {
    return get(notification, ['subscriptions', 0, 'contentId'], null)
  }
  if (subType === SUBSCRIPTION_TYPES.ACCOUNT) {
    return get(notification, 'contentId', null)
  }
  return null
}

async function getNodeContent (notifications, language, auth) {
  const ids = uniq(map(notifications, getNodeContentId))
  const validIds = filter(ids, isNumber)
  const contents = await getNodes({ ids: validIds, language, auth })
  return map(notifications, (n) => {
    const contentId = getNodeContentId(n)
    const content = find(contents, c => (
      get(c, 'nid') === contentId
    ))
    if (content) {
      set(n, 'node', content)
    }
    return n
  })
}

async function getMemberContent (notifications) {
  const ids = uniq(map(notifications, getMemberContentId))
  const validIds = filter(ids, id => !!id)
  const requests = map(validIds, id => (
    getUserPublic(id)
  ))
  const contents = await Promise.all(requests)
  return map(notifications, (n) => {
    const contentId = getMemberContentId(n)
    const content = find(contents, c => (
      get(c, 'id') === contentId
    ))
    if (content) {
      set(n, 'member', content)
    }
    return n
  })
}

export async function getNotifications ({ auth, language }) {
  try {
    const query = { p: 1, pp: 50, language }
    const params = { auth }
    const response = await apiGet('/v2/notifications/user', query, params, TYPE_BROOKLYN)
    const body = get(response, 'body', {})

    const notifications = get(body, 'notifications', {})
    const contentWithNodes = await getNodeContent(notifications, language, auth)
    const contentWithMembers = await getMemberContent(contentWithNodes)

    return {
      rows: contentWithMembers,
      total: get(body, 'total'),
      pp: get(body, 'pp'),
      p: get(body, 'p'),
    }
  } catch (e) {
    return ERROR
  }
}

export async function getRecentNotifications ({ auth, language }) {
  try {
    const query = { p: 1, pp: 10, language }
    const params = { auth }
    const response = await apiGet('/v2/notifications/user', query, params, TYPE_BROOKLYN)
    const notifications = get(response, ['body', 'notifications'], {})
    const contentWithNodes = await getNodeContent(notifications, language, auth)
    const contentWithMembers = await getMemberContent(contentWithNodes)
    return { data: contentWithMembers }
  } catch (e) {
    return ERROR
  }
}

export async function setNotificationsReceived ({ ids, auth }) {
  try {
    const data = { notifications: ids }
    const params = { reqType: REQUEST_ACCEPT_APPLICATION_JSON, auth }
    await apiPost('/notifications/user/received', data, params, TYPE_BROOKLYN)
    return { success: true }
  } catch (e) {
    return ERROR
  }
}
