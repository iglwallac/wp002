import {
  setLiveAccessEventList,
  setLiveAccessEventDetails,
  setLiveAccessEventListError,
  setLiveAccessChatList,
  setLiveAccessChatListError,
  setLiveAccessChatBlockedUsers,
  setLiveAccessChatBlockedUsersError,
  setLiveAccessEventDetailsError,
  setLiveAccessSessionDetails,
  setLiveAccessSessionDetailsError,
  setLiveAccessSchedule,
  setLiveAccessScheduleError,
  setLiveAccessNextEvent,
  setLiveAccessNextEventError,
  setLiveAccessTrack,
  setLiveAccessTrackError,
  GET_LIVE_ACCESS_EVENT_LIST,
  GET_LIVE_ACCESS_EVENT_DETAILS,
  GET_LIVE_ACCESS_CHAT_LIST,
  GET_LIVE_ACCESS_CHAT_BLOCKED_USERS,
  GET_LIVE_ACCESS_SESSION_DETAILS,
  GET_LIVE_ACCESS_EVENT_COMPLETE,
  GET_LIVE_ACCESS_SCHEDULE,
  GET_LIVE_ACCESS_NEXT_EVENT,
  GET_LIVE_ACCESS_TRACK,
} from './actions'
import {
  getEvent,
  getEvents,
  getAllEvents,
  getChats,
  getChatBlockedUsers,
  getSession,
  getActiveEventId,
  getSchedule,
  getNextEvent,
  getTrack,
} from '.'

async function getEventDetails (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { id, language } = actionPayload
  const response = await getEvent({ id, language, auth })
  if (response.success) {
    dispatch(setLiveAccessEventDetails({ id, language, data: response.data }))
  } else {
    dispatch(setLiveAccessEventDetailsError({ id, language, error: response.errors }))
  }
}

async function getEventList (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { language, all } = actionPayload
  const response = all ? await getAllEvents({ language, auth }) :
    await getEvents({ language, auth })
  if (response.success) {
    dispatch(setLiveAccessEventList(language, response.data))
  } else {
    dispatch(setLiveAccessEventListError(language, response.errors))
  }
  return response
}

async function getNextEventHandler (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { language, nowTs, isLiveOverride } = actionPayload
  const response = await getNextEvent({ nowTs, isLiveOverride, language, auth })
  if (response.success) {
    dispatch(setLiveAccessNextEvent(language, response.data))
  } else {
    dispatch(setLiveAccessNextEventError(language, response.errors))
  }
  return response
}

async function getEventComplete (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { language, timenow } = actionPayload
  const nowTs = !timenow ? new Date().getTime() : timenow
  let response = await getEvents({ language, auth })
  if (response.success) {
    dispatch(setLiveAccessEventList(language, response.data))
  } else {
    dispatch(setLiveAccessEventListError(language, response.errors))
    return
  }
  const id = getActiveEventId({ events: response.data.events, nowTs })
  if (!id) {
    return
  }
  response = await getEvent({ id, language, auth })
  if (response.success) {
    dispatch(setLiveAccessEventDetails({ language, data: response.data }))
  } else {
    dispatch(setLiveAccessEventDetailsError({ language, error: response.errors }))
    return
  }
  response = await getChats({ id, auth })
  if (response.success) {
    dispatch(setLiveAccessChatList(id, response.data))
  } else {
    dispatch(setLiveAccessChatListError(id, response.errors))
  }
}

async function getChatList (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { id } = actionPayload
  const response = await getChats({ id, auth })
  if (response.success) {
    dispatch(setLiveAccessChatList(id, response.data))
  } else {
    dispatch(setLiveAccessChatListError(id, response.errors))
  }
  return response
}

async function getChatBlockedUsersMiddleWare (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { channel } = actionPayload
  const response = await getChatBlockedUsers({ channel, auth })
  if (response.success) {
    dispatch(setLiveAccessChatBlockedUsers(channel, response.data))
  } else {
    dispatch(setLiveAccessChatBlockedUsersError(channel, response.errors))
  }
  return response
}

async function getSessionDetails (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { id, language } = actionPayload
  const response = await getSession({ id, language, auth })
  if (response.success) {
    dispatch(setLiveAccessSessionDetails({ id, language, data: response.data }))
  } else {
    dispatch(setLiveAccessSessionDetailsError({ id, language, error: response.errors }))
  }
  return response
}

async function getScheduleMiddleWare (dispatch, actionPayload, options = {}) {
  const {
    auth,
  } = options
  const { trackId, language } = actionPayload
  const response = await getSchedule({ trackId, language, auth })
  if (response.success) {
    dispatch(setLiveAccessSchedule({ trackId, language, data: response.data }))
  } else {
    dispatch(setLiveAccessScheduleError({ trackId, language, error: response.errors }))
  }
  return response
}

async function getTrackHandler (dispatch, actionPayload, options = {}) {
  const { auth } = options
  const { id, language } = actionPayload
  const response = await getTrack({ id, language, auth })
  if (response.success) {
    dispatch(setLiveAccessTrack({ id, language, data: response.data }))
  } else {
    dispatch(setLiveAccessTrackError({ id, language, error: response.errors }))
  }
  return response
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { dispatch } = store
      const state = store.getState()
      const auth = state.auth
      switch (action.type) {
        case GET_LIVE_ACCESS_EVENT_COMPLETE:
          getEventComplete(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_EVENT_LIST:
          getEventList(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_CHAT_LIST:
          getChatList(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_CHAT_BLOCKED_USERS:
          getChatBlockedUsersMiddleWare(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_EVENT_DETAILS:
          getEventDetails(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_SESSION_DETAILS:
          getSessionDetails(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_SCHEDULE:
          getScheduleMiddleWare(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_NEXT_EVENT:
          getNextEventHandler(dispatch, action.payload, { auth })
          break

        case GET_LIVE_ACCESS_TRACK:
          getTrackHandler(dispatch, action.payload, { auth })
          break

        default:
          break
      }
    }
    next(action)
  }
}
