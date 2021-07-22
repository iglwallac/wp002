/*
 * action types
 */

export const GET_LIVE_ACCESS_EVENT_COMPLETE = 'GET_LIVE_ACCESS_EVENT_COMPLETE'
export const GET_LIVE_ACCESS_EVENT_LIST = 'GET_LIVE_ACCESS_EVENT_LIST'
export const GET_LIVE_ACCESS_EVENT_DETAILS = 'GET_LIVE_ACCESS_EVENT_DETAILS'
export const GET_LIVE_ACCESS_CHAT_LIST = 'GET_LIVE_ACCESS_CHAT_LIST'
export const GET_LIVE_ACCESS_CHAT_BLOCKED_USERS = 'GET_LIVE_ACCESS_CHAT_BLOCKED_USERS'
export const GET_LIVE_ACCESS_SESSION_DETAILS = 'GET_LIVE_ACCESS_SESSION_DETAILS'
export const GET_LIVE_ACCESS_EVENT_STATE = 'GET_LIVE_ACCESS_EVENT_STATE'
export const SET_LIVE_ACCESS_CHAT_LIST = 'SET_LIVE_ACCESS_CHAT_LIST'
export const SET_LIVE_ACCESS_CHAT_BLOCKED_USERS = 'SET_LIVE_ACCESS_CHAT_BLOCKED_USERS'
export const SET_LIVE_ACCESS_EVENT_LIST = 'SET_LIVE_ACCESS_EVENT_LIST'
export const SET_LIVE_ACCESS_EVENT_DETAILS = 'SET_LIVE_ACCESS_EVENT_DETAILS'
export const SET_LIVE_ACCESS_SESSION_DETAILS = 'SET_LIVE_ACCESS_SESSION_DETAILS'
export const SET_LIVE_ACCESS_EVENT_STATE = 'SET_LIVE_ACCESS_EVENT_STATE'
export const SET_LIVE_ACCESS_EVENT_DETAILS_ERROR = 'SET_LIVE_ACCESS_EVENT_DETAILS_ERROR'
export const SET_LIVE_ACCESS_EVENT_LIST_ERROR = 'SET_LIVE_ACCESS_EVENT_LIST_ERROR'
export const SET_LIVE_ACCESS_CHAT_LIST_ERROR = 'SET_LIVE_ACCESS_CHAT_LIST_ERROR'
export const SET_LIVE_ACCESS_CHAT_BLOCKED_USERS_ERROR = 'SET_LIVE_ACCESS_CHAT_BLOCKED_USERS_ERROR'
export const SET_LIVE_ACCESS_SESSION_DETAILS_ERROR = 'SET_LIVE_ACCESS_SESSION_DETAILS_ERROR'
export const SET_LIVE_ACCESS_EVENT_STATE_ERROR = 'SET_LIVE_ACCESS_EVENT_STATE_ERROR'
export const GET_LIVE_ACCESS_SCHEDULE = 'GET_LIVE_ACCESS_SCHEDULE'
export const SET_LIVE_ACCESS_SCHEDULE = 'SET_LIVE_ACCESS_SCHEDULE'
export const SET_LIVE_ACCESS_SCHEDULE_ERROR = 'SET_LIVE_ACCESS_SCHEDULE_ERROR'
export const GET_LIVE_ACCESS_NEXT_EVENT = 'GET_LIVE_ACCESS_NEXT_EVENT'
export const SET_LIVE_ACCESS_NEXT_EVENT = 'SET_LIVE_ACCESS_NEXT_EVENT'
export const SET_LIVE_ACCESS_NEXT_EVENT_ERROR = 'SET_LIVE_ACCESS_NEXT_EVENT_ERROR'
export const SET_LIVE_ACCESS_SCHEDULE_VISIBLE = 'SET_LIVE_ACCESS_SCHEDULE_VISIBLE'
export const SET_CHAT_VISIBLE = 'SET_CHAT_VISIBLE'
export const GET_LIVE_ACCESS_TRACK = 'GET_LIVE_ACCESS_TRACK'
export const SET_LIVE_ACCESS_TRACK = 'SET_LIVE_ACCESS_TRACK'
export const SET_LIVE_ACCESS_TRACK_ERROR = 'SET_LIVE_ACCESS_TRACK_ERROR'

/*
 * action creators
 */

export function setChatVisible (visible) {
  return {
    type: SET_CHAT_VISIBLE,
    payload: { visible },
  }
}

export function setLiveAccessScheduleVisible (visible) {
  return {
    type: SET_LIVE_ACCESS_SCHEDULE_VISIBLE,
    payload: { visible },
  }
}

export function getLiveAccessEventComplete (language, timenow, activeOverride) {
  return {
    type: GET_LIVE_ACCESS_EVENT_COMPLETE,
    payload: { language, timenow, activeOverride },
  }
}

export function getLiveAccessEventList (language, all) {
  return {
    type: GET_LIVE_ACCESS_EVENT_LIST,
    payload: { language, all },
  }
}

export function getLiveAccessNextEvent ({ language, nowTs, isLiveOverride }) {
  return {
    type: GET_LIVE_ACCESS_NEXT_EVENT,
    payload: { language, nowTs, isLiveOverride },
  }
}

export function getLiveAccessChatBlockedUsers (channel) {
  return {
    type: GET_LIVE_ACCESS_CHAT_BLOCKED_USERS,
    payload: { channel },
  }
}

export function getLiveAccessChatList (id) {
  return {
    type: GET_LIVE_ACCESS_CHAT_LIST,
    payload: { id },
  }
}

export function getLiveAccessEventDetails ({ id, language }) {
  return {
    type: GET_LIVE_ACCESS_EVENT_DETAILS,
    payload: { id, language },
  }
}

export function getLiveAccessSessionDetails ({ id, language }) {
  return {
    type: GET_LIVE_ACCESS_SESSION_DETAILS,
    payload: { id, language },
  }
}

export function getLiveAccessEventState ({ eventDetails, timenow }) {
  return {
    type: GET_LIVE_ACCESS_EVENT_STATE,
    payload: { eventDetails, timenow },
  }
}

export function setLiveAccessEventDetails ({ id, language, data }) {
  return {
    type: SET_LIVE_ACCESS_EVENT_DETAILS,
    payload: {
      id,
      language,
      data,
    },
  }
}

export function setLiveAccessSessionDetails ({ id, language, data }) {
  return {
    type: SET_LIVE_ACCESS_SESSION_DETAILS,
    payload: {
      id,
      language,
      data,
    },
  }
}

export function setLiveAccessEventState ({ data }) {
  return {
    type: SET_LIVE_ACCESS_EVENT_STATE,
    payload: {
      data,
    },
  }
}

export function setLiveAccessEventList (language, data) {
  return {
    type: SET_LIVE_ACCESS_EVENT_LIST,
    payload: {
      language,
      data,
    },
  }
}

export function setLiveAccessNextEvent (language, data) {
  return {
    type: SET_LIVE_ACCESS_NEXT_EVENT,
    payload: {
      language,
      data,
    },
  }
}

export function setLiveAccessChatList (id, data) {
  return {
    type: SET_LIVE_ACCESS_CHAT_LIST,
    payload: {
      id,
      data,
    },
  }
}

export function setLiveAccessChatBlockedUsers (channel, data) {
  return {
    type: SET_LIVE_ACCESS_CHAT_BLOCKED_USERS,
    payload: {
      channel,
      data,
    },
  }
}

export function setLiveAccessEventDetailsError (id, language, error) {
  return {
    type: SET_LIVE_ACCESS_EVENT_DETAILS_ERROR,
    payload: {
      id,
      language,
      error,
    },
  }
}

export function setLiveAccessEventListError (language, error) {
  return {
    type: SET_LIVE_ACCESS_EVENT_LIST_ERROR,
    payload: {
      language,
      error,
    },
  }
}

export function setLiveAccessNextEventError (language, error) {
  return {
    type: SET_LIVE_ACCESS_NEXT_EVENT_ERROR,
    payload: {
      language,
      error,
    },
  }
}

export function setLiveAccessChatListError (id, error) {
  return {
    type: SET_LIVE_ACCESS_CHAT_LIST_ERROR,
    payload: {
      id,
      error,
    },
  }
}

export function setLiveAccessChatBlockedUsersError (channel, error) {
  return {
    type: SET_LIVE_ACCESS_CHAT_BLOCKED_USERS_ERROR,
    payload: {
      channel,
      error,
    },
  }
}

export function setLiveAccessSessionDetailsError ({ id, language, error }) {
  return {
    type: SET_LIVE_ACCESS_SESSION_DETAILS_ERROR,
    payload: {
      id,
      language,
      error,
    },
  }
}

export function setLiveAccessEventStateError ({ error }) {
  return {
    type: SET_LIVE_ACCESS_EVENT_STATE_ERROR,
    payload: {
      error,
    },
  }
}

export function getLiveAccessSchedule ({ trackId, language }) {
  return {
    type: GET_LIVE_ACCESS_SCHEDULE,
    payload: { trackId, language },
  }
}

export function setLiveAccessSchedule ({ trackId, language, data }) {
  return {
    type: SET_LIVE_ACCESS_SCHEDULE,
    payload: {
      trackId,
      language,
      data,
    },
  }
}

export function setLiveAccessScheduleError ({ trackId, language, error }) {
  return {
    type: SET_LIVE_ACCESS_SCHEDULE_ERROR,
    payload: {
      trackId,
      language,
      error,
    },
  }
}

export function getLiveAccessTrack ({ id, language = 'en' }) {
  return {
    type: GET_LIVE_ACCESS_TRACK,
    payload: { id, language },
  }
}

export function setLiveAccessTrack ({ id, language, data }) {
  return {
    type: SET_LIVE_ACCESS_TRACK,
    payload: { id, language, data },
  }
}

export function setLiveAccessTrackError ({ id, language, error }) {
  return {
    type: SET_LIVE_ACCESS_TRACK_ERROR,
    payload: { id, language, error },
  }
}
