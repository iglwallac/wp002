import get from 'lodash/get'
import _first from 'lodash/first'
import _last from 'lodash/last'
import { get as apiGet, TYPE_BROOKLYN_JSON } from 'api-client'

export const EVENT_LIST_ENDPOINT = '/live-access-events-summaries'
export const ALL_EVENT_LIST_ENDPOINT = '/live-access-events-all'
export const EVENT_DETAILS_ENDPOINT = '/live-access-events'
export const NEXT_EVENT_ENDPOINT = '/live-access-events/next'
export const CHAT_LIST_ENDPOINT = '/live-access-chats'
export const CHAT_BLOCKED_USERS_ENDPOINT = '/live-access-chats/blocked-users'
export const SESSION_DETAILS_ENDPOINT = '/live-access-events/session'
export const SCHEDULE_ENDPOINT = '/live-access-events/schedule'
export const TRACK_ENDPOINT = 'live-access-events/track'

const PRE_EVENT_COUNTDOWN = 24 * 60 * 60 * 1000

export const EventStates = {
  preEvent: 'preEvent',
  countdown: 'countdown',
  live: 'live',
  betweenSession: 'betweenSession',
  postEvent: 'postEvent',
  unknown: 'unknown',
}

function handleResponse (res) {
  const data = get(res, 'body', {})
  const errors = get(data, 'errors')
  if (errors) return { success: false }
  return { data, success: true }
}

export function getSchedule (options = {}) {
  const { trackId, language, auth } = options
  return apiGet(`${SCHEDULE_ENDPOINT}/${trackId}`, { language }, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ trackId, success: false }))
}

export function getNextEvent (options = {}) {
  const { nowTs, isLiveOverride, language, auth } = options
  const timenow = nowTs ? new Date(nowTs).toISOString() : new Date().toISOString()
  return apiGet(`${NEXT_EVENT_ENDPOINT}`, { language, timenow, isLiveOverride }, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ success: false }))
}

export function getEvent (options = {}) {
  const { id, language, auth } = options
  return apiGet(`${EVENT_DETAILS_ENDPOINT}/${id}`, { language }, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ id, success: false }))
}

export function getTrack (options = {}) {
  const { id, language, auth } = options
  return apiGet(`${TRACK_ENDPOINT}/${id}`, { language }, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ id, success: false }))
}

export function getAllEvents (options = {}) {
  const { language, auth } = options
  return apiGet(`${ALL_EVENT_LIST_ENDPOINT}`, { language }, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ success: false }))
}

export function getEvents (options = {}) {
  const { language, auth } = options
  return apiGet(`${EVENT_LIST_ENDPOINT}`, { language }, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ success: false }))
}

export function getChats (options = {}) {
  const { id, auth } = options
  return apiGet(`${CHAT_LIST_ENDPOINT}/${id}`, {}, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ success: false }))
}

export function getChatBlockedUsers (options = {}) {
  const { channel, auth } = options
  return apiGet(`${CHAT_BLOCKED_USERS_ENDPOINT}/${channel}`, {}, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ success: false }))
}

export function getSession (options = {}) {
  const { id, language, auth } = options
  return apiGet(`${SESSION_DETAILS_ENDPOINT}/${id}`, { language }, { auth }, TYPE_BROOKLYN_JSON)
    .then(res => handleResponse(res))
    .catch(() => ({ id, success: false }))
}

function getActiveEvent (options = {}) {
  const { events, nowTs } = options
  return events && events.find((event) => {
    const startDate = get(event, 'startDate')
    const endDate = get(event, 'endDate')
    return startDate && endDate &&
      new Date(startDate).getTime() - PRE_EVENT_COUNTDOWN <= nowTs &&
      nowTs <= new Date(endDate).getTime() + PRE_EVENT_COUNTDOWN
  })
}

export function getActiveEventId (options = {}) {
  return get(getActiveEvent(options), 'id')
}

export function hasFreeSession (sessions) {
  return !!(sessions && sessions.find(session =>
    session.isFree === true,
  ))
}

export function getActiveSession (sessions, nowTs) {
  return sessions && sessions.find((session) => {
    const startDate = get(session, 'startDate')
    const endDate = get(session, 'endDate')
    return startDate && endDate &&
      nowTs >= Date.parse(startDate) &&
      nowTs < Date.parse(endDate)
  })
}

export function isInSession (sessions, nowTs) {
  if (sessions) {
    const firstSession = _first(sessions)
    const lastSession = _last(sessions)
    const startDate = get(firstSession, 'startDate')
    const endDate = get(lastSession, 'endDate')
    return startDate && endDate &&
      nowTs >= Date.parse(startDate) &&
      nowTs < Date.parse(endDate)
  }
  return false
}

export function getSessionsMatchingDay (sessions, nowTs) {
  const d1 = new Date(nowTs)
  return sessions && sessions.filter((session) => {
    const d2 = new Date(get(session, 'startDate'))
    return d2 && d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
  })
}

export const isPastSession = (session, nowTs) => (Date.parse(get(session, 'endDate')) < nowTs)

export function getCurrentSessions (sessions, nowTs) {
  return sessions && sessions.filter((session) => {
    const startDate = get(session, 'startDate')
    const endDate = get(session, 'endDate')
    return startDate && endDate &&
      nowTs >= Date.parse(startDate) &&
      nowTs < Date.parse(endDate)
  })
}

function getNextSession (sessions, nowTs) {
  return sessions && sessions.find((session) => {
    const startDate = get(session, 'startDate')
    return startDate && nowTs <= Date.parse(startDate)
  })
}

export function getNextThreeSessions (sessions, nowTs) {
  const nextThreeSessions = []
  const sessionItemsCount = sessions.length
  const nextSessionIndex = sessions && sessions.findIndex((session) => {
    const startDate = get(session, 'startDate')
    return startDate && nowTs <= Date.parse(startDate)
  })
  if (nextSessionIndex > -1) {
    nextThreeSessions.push(sessions[nextSessionIndex])
    if (nextSessionIndex < sessionItemsCount - 1) {
      nextThreeSessions.push(sessions[nextSessionIndex + 1])
      if (nextSessionIndex < sessionItemsCount - 2) {
        nextThreeSessions.push(sessions[nextSessionIndex + 2])
      }
    }
  }
  return nextThreeSessions
}

export function getPreviousSession (sessions, nowTs) {
  return sessions && sessions.slice().reverse().find((session) => {
    const endDate = get(session, 'endDate')
    return endDate && nowTs > Date.parse(endDate)
  })
}

function getFirstLiveStreamSession (sessions) {
  return sessions && sessions.find(session =>
    get(session, 'isLiveStream'),
  )
}
function getFirstLiveStreamSessionTS (sessions, nowTs) {
  const session = getFirstLiveStreamSession(sessions, nowTs)
  return session && Date.parse(get(session, 'startDate'))
}


function nextLiveStreamSession (sessions, nowTs) {
  return sessions && sessions.find((session) => {
    const startDate = get(session, 'startDate')
    const isStream = get(session, 'isLiveStream')
    return isStream && startDate && nowTs <= Date.parse(startDate)
  })
}

export function nextLiveStreamTS (sessions, nowTs) {
  const session = nextLiveStreamSession(sessions, nowTs)
  return session && Date.parse(get(session, 'startDate'))
}

function isPreEvent (event, nowTs) {
  const sessions = get(event, ['tracks', 0, 'schedule'])
  if (sessions) {
    const startTs = getFirstLiveStreamSessionTS(sessions, nowTs)
    const countdownTs = startTs - PRE_EVENT_COUNTDOWN
    return (nowTs < countdownTs)
  }
  return true
}

function isPostEvent (event, nowTs) {
  const sessions = get(event, ['tracks', 0, 'schedule'])
  return !(getActiveSession(sessions, nowTs) || getNextSession(sessions, nowTs))
}

export function getSessionTimeout (sessions, nowTs) {
  const activeSession = getActiveSession(sessions, nowTs)
  if (activeSession) {
    return Date.parse(get(activeSession, 'endDate')) - nowTs
  }
  const nextSession = getNextSession(sessions, nowTs)
  if (nextSession) {
    return Date.parse(get(nextSession, 'startDate')) - nowTs
  }
  return 60 * 60 * 1000
}

export function getEventState (eventDetails, nowTs) {
  const sessions = get(eventDetails, ['tracks', 0, 'schedule'])
  const isPostE = isPostEvent(eventDetails, nowTs)
  if (isPostE || isPreEvent(eventDetails, nowTs)) {
    return (isPostE && EventStates.postEvent) || EventStates.preEvent
  }
  const firstLiveStreamSession = getFirstLiveStreamSession(sessions)
  const firstLiveStreamSessionTs = Date.parse(get(firstLiveStreamSession, 'startDate'))

  return (firstLiveStreamSessionTs > nowTs) ?
    EventStates.countdown :
    EventStates.betweenSession
}
