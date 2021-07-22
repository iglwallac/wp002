export const NOTIFICATIONS_CREATE_SUBSCRIBABLE = 'NOTIFICATIONS_CREATE_SUBSCRIBABLE'
export const NOTIFICATIONS_REMOVE_SUBSCRIBABLE = 'NOTIFICATIONS_REMOVE_SUBSCRIBABLE'
export const NOTIFICATIONS_CLEAR_SUBSCRIBABLE = 'NOTIFICATIONS_CLEAR_SUBSCRIBABLE'
export const NOTIFICATIONS_GET_SUBSCRIBABLE = 'NOTIFICATIONS_GET_SUBSCRIBABLE'
export const NOTIFICATIONS_SET_SUBSCRIBABLE = 'NOTIFICATIONS_SET_SUBSCRIBABLE'

export const NOTIFICATIONS_GET_SUBSCRIPTIONS = 'NOTIFICATIONS_GET_SUBSCRIPTIONS'
export const NOTIFICATIONS_SET_SUBSCRIPTIONS = 'NOTIFICATIONS_SET_SUBSCRIPTIONS'

export const NOTIFICATIONS_GET_RECENT = 'NOTIFICATIONS_GET_RECENT'
export const NOTIFICATIONS_SET_RECENT = 'NOTIFICATIONS_SET_RECENT'

export const NOTIFICATIONS_CREATE_SUBSCRIBER = 'NOTIFICATIONS_CREATE_SUBSCRIBER'
export const NOTIFICATIONS_REMOVE_SUBSCRIBER = 'NOTIFICATIONS_REMOVE_SUBSCRIBER'
export const NOTIFICATIONS_SET_SUBSCRIBER = 'NOTIFICATIONS_SET_SUBSCRIBER'

export const NOTIFICATIONS_REMOVE_SUBSCRIBER_LIST = 'NOTIFICATIONS_REMOVE_SUBSCRIBER_LIST'

export const NOTIFICATIONS_GET_ALL = 'NOTIFICATIONS_GET_ALL'
export const NOTIFICATIONS_SET_ALL = 'NOTIFICATIONS_SET_ALL'
export const NOTIFICATIONS_CLEAR_ALL = 'NOTIFICATIONS_CLEAR_ALL'

export const NOTIFICATIONS_UPDATE_RECEIVED = 'NOTIFICATIONS_UPDATE_RECEIVED'
export const NOTIFICATIONS_SET_RECEIVED = 'NOTIFICATIONS_SET_RECEIVED'


export function getSubscribableEntity (payload) {
  return { type: NOTIFICATIONS_GET_SUBSCRIBABLE, payload }
}

export function createSubscribableEntity (payload) {
  return { type: NOTIFICATIONS_CREATE_SUBSCRIBABLE, payload }
}

export function removeSubscribableEntity (payload) {
  return { type: NOTIFICATIONS_REMOVE_SUBSCRIBABLE, payload }
}

export function clearSubscribableEntity (payload) {
  return { type: NOTIFICATIONS_CLEAR_SUBSCRIBABLE, payload }
}

export function createSubscriber (payload) {
  return { type: NOTIFICATIONS_CREATE_SUBSCRIBER, payload }
}

export function removeSubscriber (payload) {
  return { type: NOTIFICATIONS_REMOVE_SUBSCRIBER, payload }
}

export function removeSubscriberList (payload) {
  return { type: NOTIFICATIONS_REMOVE_SUBSCRIBER_LIST, payload }
}

export function setNotificationsReceived (payload) {
  return { type: NOTIFICATIONS_UPDATE_RECEIVED, payload }
}

export function getSubscriptions (payload) {
  return { type: NOTIFICATIONS_GET_SUBSCRIPTIONS, payload }
}

export function getRecentNotifications () {
  return { type: NOTIFICATIONS_GET_RECENT }
}

export function clearNotifications () {
  return { type: NOTIFICATIONS_CLEAR_ALL }
}

export function getNotifications () {
  return { type: NOTIFICATIONS_GET_ALL }
}
