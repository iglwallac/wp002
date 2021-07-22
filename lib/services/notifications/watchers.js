import size from 'lodash/size'
import { List, Map } from 'immutable'
import { getAuthIsLoggedIn } from 'services/auth'
import { SET_AUTH_LOGIN_SUCCESS } from 'services/auth/actions'
import { SET_DEFAULT_GA_EVENT } from 'services/event-tracking/actions'
import {
  NOTIFICATIONS_UNFOLLOW_CLICKED,
  NOTIFICATIONS_FOLLOW_CLICKED,
  NOTIFICATIONS_IMPRESSED,
  CUSTOM_EVENT,
  NOTIFICATIONS,
} from 'services/event-tracking'
import * as api from './'
import {
  NOTIFICATIONS_CREATE_SUBSCRIBABLE,
  NOTIFICATIONS_REMOVE_SUBSCRIBABLE,
  NOTIFICATIONS_GET_SUBSCRIPTIONS,
  NOTIFICATIONS_SET_SUBSCRIPTIONS,
  NOTIFICATIONS_CREATE_SUBSCRIBER,
  NOTIFICATIONS_REMOVE_SUBSCRIBER,
  NOTIFICATIONS_REMOVE_SUBSCRIBER_LIST,
  NOTIFICATIONS_GET_SUBSCRIBABLE,
  NOTIFICATIONS_SET_SUBSCRIBABLE,
  NOTIFICATIONS_UPDATE_RECEIVED,
  NOTIFICATIONS_SET_SUBSCRIBER,
  NOTIFICATIONS_SET_RECEIVED,
  NOTIFICATIONS_SET_RECENT,
  NOTIFICATIONS_GET_RECENT,
  NOTIFICATIONS_GET_ALL,
  NOTIFICATIONS_SET_ALL,
  getNotifications as getNotificationsAction,
} from './actions'

export function getNotifications ({ takeLatest }) {
  return takeLatest(
    NOTIFICATIONS_GET_ALL,
    async ({ state }) => {
      const { auth, user } = state
      const language = user.getIn(['data', 'language'], ['en'])
      const payload = await api.getNotifications({ auth, language })
      return {
        type: NOTIFICATIONS_SET_ALL,
        payload,
      }
    })
}

export function getRecentNotifications ({ takeEvery }) {
  return takeEvery(
    NOTIFICATIONS_GET_RECENT,
    async ({ state }) => {
      const { auth, user } = state
      const language = user.getIn(['data', 'language'], ['en'])
      const result = await api.getRecentNotifications({ auth, language })
      const { data = [] } = result
      return {
        type: NOTIFICATIONS_SET_RECENT,
        payload: data,
      }
    })
}

export function setNotificationsReceived ({ takeMaybe }) {
  return takeMaybe(
    NOTIFICATIONS_UPDATE_RECEIVED,
    ({ state, action }) => {
      const { payload } = action
      const { ids, impressed } = payload
      if (ids && size(ids)) {
        return async () => {
          const { auth } = state
          await api.setNotificationsReceived({ ids, auth })
          return {
            type: NOTIFICATIONS_SET_RECEIVED,
            payload: impressed,
          }
        }
      }
      return null
    })
}

export function setImpressedEvent ({ takeEvery }) {
  return takeEvery(
    NOTIFICATIONS_SET_RECEIVED,
    async ({ state, action }) => {
      const { auth } = state
      const { payload: impressed = Map() } = action
      const userId = auth.get('uid')

      const eventData = Map({
        event: CUSTOM_EVENT,
        eventName: NOTIFICATIONS_IMPRESSED,
        eventCategory: NOTIFICATIONS,
        userId,
        impressed,
      })

      return {
        type: SET_DEFAULT_GA_EVENT,
        payload: { eventData },
      }
    })
}

export function createSubscriber ({ takeFirst }) {
  return takeFirst(
    NOTIFICATIONS_CREATE_SUBSCRIBER,
    async ({ state, action }) => {
      const { auth } = state
      const { payload: subscription } = action
      const id = subscription.get('id')
      const type = subscription.get('type')
      const contentId = subscription.get('contentId')
      const subscriber = await api.createSubscriber({ id, auth })
      return {
        type: NOTIFICATIONS_SET_SUBSCRIBER,
        payload: {
          subscriber,
          contentId,
          type,
        },
      }
    })
}

export function removeSubscriber ({ takeFirst }) {
  return takeFirst(
    NOTIFICATIONS_REMOVE_SUBSCRIBER,
    async ({ state, action }) => {
      const { auth } = state
      const { payload: subscription } = action
      const id = subscription.get('id')
      const type = subscription.get('type')
      const contentId = subscription.get('contentId')
      await api.removeSubscriber({ id, auth })
      return {
        type: NOTIFICATIONS_SET_SUBSCRIBER,
        payload: {
          subscriber: null,
          contentId,
          type,
        },
      }
    })
}

export function removeSubscriberList ({ takeEvery }) {
  return takeEvery(
    NOTIFICATIONS_REMOVE_SUBSCRIBER_LIST,
    async ({ state, action }) => {
      const { auth } = state
      const { payload: subscriptions = List() } = action
      subscriptions.forEach(async (subscription) => {
        const id = subscription.get('id')
        const type = subscription.get('type')
        const contentId = subscription.get('contentId')
        await api.removeSubscriber({ id, auth })
        return {
          type: NOTIFICATIONS_SET_SUBSCRIBER,
          payload: {
            subscriber: null,
            contentId,
            type,
          },
        }
      })
    })
}

export function setUnfollowEvent ({ takeEvery }) {
  return takeEvery(
    NOTIFICATIONS_REMOVE_SUBSCRIBER,
    async ({ state, action }) => {
      const { auth } = state
      const { payload: subscription = Map() } = action
      const userId = auth.get('uid')
      const contentId = subscription.get('contentId')
      const contentTitle = subscription.get('contentTitle')

      const eventData = Map({
        eventName: NOTIFICATIONS_UNFOLLOW_CLICKED,
        contentId,
        contentTitle,
        userId,
      })

      return {
        type: SET_DEFAULT_GA_EVENT,
        payload: { eventData },
      }
    })
}

export function setFollowEvent ({ takeEvery }) {
  return takeEvery(
    NOTIFICATIONS_CREATE_SUBSCRIBER,
    async ({ state, action }) => {
      const { auth } = state
      const { payload: subscription } = action

      const userId = auth.get('uid')
      const contentId = subscription.get('contentId')
      const contentTtile = subscription.get('contentTitle')

      const eventData = Map({
        eventName: NOTIFICATIONS_FOLLOW_CLICKED,
        contentId,
        contentTtile,
        userId,
      })

      return {
        type: SET_DEFAULT_GA_EVENT,
        payload: { eventData },
      }
    })
}


export function getSubscriptions ({ takeEvery }) {
  return takeEvery(
    NOTIFICATIONS_GET_SUBSCRIPTIONS,
    async ({ state, action }) => {
      const { auth, user } = state
      const { payload: inputs = {} } = action
      const { p = 1, pp = 50, version = 'v2' } = inputs
      const language = user.getIn(['data', 'language', 0], 'en')
      const result = await api.getSubscriptions({ auth, language, p, pp, version })
      const { data = [], total } = result
      return {
        type: NOTIFICATIONS_SET_SUBSCRIPTIONS,
        payload: { data, total },
      }
    })
}

export function getSubscribableEntity ({ takeMaybe }) {
  return takeMaybe(
    NOTIFICATIONS_GET_SUBSCRIBABLE,
    ({ state, action }) => {
      const { payload: inputs } = action
      const { contentId, type } = inputs
      const { notifications, auth } = state
      const isLoggedIn = getAuthIsLoggedIn(auth)
      const key = ['subscribables', type, contentId]

      if (!isLoggedIn || notifications.getIn(key)) {
        return null
      }

      return async () => {
        const entity = await api.getSubscribableEntity({ contentId, type, auth })
        return {
          type: NOTIFICATIONS_SET_SUBSCRIBABLE,
          payload: {
            contentId,
            entity,
            type,
          },
        }
      }
    })
}

export function createSubscribableEntity ({ takeFirst }) {
  return takeFirst(
    NOTIFICATIONS_CREATE_SUBSCRIBABLE,
    async ({ state, action }) => {
      const { auth, user } = state
      const { payload: inputs } = action
      const { contentId, name, type } = inputs
      const payload = await api.createSubscribableEntity({
        contentId, name, type, auth, user })
      return {
        type: NOTIFICATIONS_SET_SUBSCRIBABLE,
        payload,
      }
    })
}

export function removeSubscribableEntity ({ takeFirst }) {
  return takeFirst(
    NOTIFICATIONS_REMOVE_SUBSCRIBABLE,
    async ({ state, action }) => {
      const { auth, user } = state
      const { payload: inputs } = action
      const { contentId, name, type } = inputs
      const payload = await api.removeSubscribableEntity({
        contentId, name, type, auth, user })
      return {
        type: NOTIFICATIONS_SET_SUBSCRIBABLE,
        payload,
      }
    })
}


export function refetchSubscribableEntities ({ after }) {
  return after(SET_AUTH_LOGIN_SUCCESS, async ({ dispatch, state }) => {
    const { auth, notifications } = state
    const subscribables = notifications.get('subscribables', List())
    if (subscribables) {
      let type
      const promiseArr = subscribables.reduce((acc, term) => {
        const keys = term.keySeq().toJS()
        const requests = keys.reduce((reqs, id) => {
          type = term.getIn([id, 'type'])
          const contentId = term.getIn([id, 'contentId'])
          if (contentId) {
            return reqs.concat(api.getSubscribableEntity({
              contentId,
              type,
              auth,
            }))
          }
          return reqs
        }, [])
        return acc.concat(requests)
      }, [])

      return Promise.all(promiseArr).then((entities) => {
        dispatch(getNotificationsAction())
        return entities.map((entity) => {
          const { contentId: entityId } = entity
          const { type: entityType } = entity
          const contentId = entityId
          type = entityType || type
          dispatch({
            type: NOTIFICATIONS_SET_SUBSCRIBABLE,
            payload: {
              contentId,
              entity,
              type,
            },
          })
          return null
        })
      })
    }
    return null
  })
}

export function refetchSubscriptions ({ after }) {
  return after(SET_AUTH_LOGIN_SUCCESS, async ({ dispatch, state }) => {
    const { auth, user } = state
    const language = user.getIn(['data', 'language', 0], 'en')
    const result = await api.getSubscriptions({ auth, language })
    const { data = [] } = result
    dispatch({
      type: NOTIFICATIONS_SET_SUBSCRIPTIONS,
      payload: data,
    })
  })
    .when(({ state }) => {
      const { resolver } = state
      return resolver.getIn(['data', 'path']) === '/notifications/manage'
    })
}

