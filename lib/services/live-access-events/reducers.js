import {
  Map,
  fromJS,
} from 'immutable'
import {
  GET_LIVE_ACCESS_EVENT_LIST,
  GET_LIVE_ACCESS_EVENT_DETAILS,
  GET_LIVE_ACCESS_CHAT_LIST,
  GET_LIVE_ACCESS_CHAT_BLOCKED_USERS,
  GET_LIVE_ACCESS_SESSION_DETAILS,
  GET_LIVE_ACCESS_EVENT_STATE,
  SET_LIVE_ACCESS_EVENT_LIST,
  SET_LIVE_ACCESS_EVENT_DETAILS,
  SET_LIVE_ACCESS_EVENT_STATE,
  SET_LIVE_ACCESS_CHAT_LIST,
  SET_LIVE_ACCESS_CHAT_BLOCKED_USERS,
  SET_LIVE_ACCESS_SESSION_DETAILS,
  SET_LIVE_ACCESS_EVENT_LIST_ERROR,
  SET_LIVE_ACCESS_EVENT_DETAILS_ERROR,
  SET_LIVE_ACCESS_CHAT_LIST_ERROR,
  SET_LIVE_ACCESS_CHAT_BLOCKED_USERS_ERROR,
  SET_LIVE_ACCESS_SESSION_DETAILS_ERROR,
  SET_LIVE_ACCESS_EVENT_STATE_ERROR,
  GET_LIVE_ACCESS_SCHEDULE,
  SET_LIVE_ACCESS_SCHEDULE_VISIBLE,
  SET_CHAT_VISIBLE,
  SET_LIVE_ACCESS_SCHEDULE,
  SET_LIVE_ACCESS_SCHEDULE_ERROR,
  GET_LIVE_ACCESS_NEXT_EVENT,
  SET_LIVE_ACCESS_NEXT_EVENT,
  SET_LIVE_ACCESS_NEXT_EVENT_ERROR,
  GET_LIVE_ACCESS_TRACK,
  SET_LIVE_ACCESS_TRACK,
  SET_LIVE_ACCESS_TRACK_ERROR,
} from './actions'

const eventDetailsKey = 'eventDetails'
const eventsListKey = 'eventsList'
const eventStateKey = 'eventState'
export const chatListStoreKey = 'chatList'
export const blockedChatUsersKey = 'blockedChatUsers'
export const scheduleKey = 'schedule'
const sessionDetailsKey = 'sessionDetails'
export const trackKey = 'track'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_LIVE_ACCESS_EVENT_DETAILS:
    case GET_LIVE_ACCESS_NEXT_EVENT:
    {
      const { language } = action.payload
      return state.setIn([eventDetailsKey, language, 'processing'], true)
    }
    case SET_LIVE_ACCESS_EVENT_DETAILS:
    case SET_LIVE_ACCESS_NEXT_EVENT:
    {
      const { language, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([eventDetailsKey, language, 'processing'], false)
          .setIn([eventDetailsKey, language, 'data'], fromJS(data))
          .deleteIn([eventDetailsKey, language, 'error'])
      })
    }
    case SET_LIVE_ACCESS_EVENT_DETAILS_ERROR:
    case SET_LIVE_ACCESS_NEXT_EVENT_ERROR:
    {
      const { language, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([eventDetailsKey, language, 'processing'], false)
          .deleteIn([eventDetailsKey, language, 'data'])
          .setIn([eventDetailsKey, language, 'error'], error)
      })
    }

    case GET_LIVE_ACCESS_EVENT_STATE: {
      return state.setIn([eventStateKey, 'processing'], true)
    }
    case SET_LIVE_ACCESS_EVENT_STATE: {
      const { data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([eventStateKey, 'processing'], false)
          .setIn([eventStateKey, 'data'], fromJS(data))
          .deleteIn([eventStateKey, 'error'])
      })
    }
    case SET_LIVE_ACCESS_EVENT_STATE_ERROR: {
      const { error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([eventStateKey, 'processing'], false)
          .deleteIn([eventStateKey, 'data'])
          .setIn([eventStateKey, 'error'], error)
      })
    }

    case GET_LIVE_ACCESS_EVENT_LIST: {
      const { language } = action.payload
      return state.setIn([eventsListKey, language, 'processing'], true)
    }
    case SET_LIVE_ACCESS_EVENT_LIST: {
      const { language, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([eventsListKey, language, 'processing'], false)
          .setIn([eventsListKey, language, 'data'], fromJS(data))
          .deleteIn([eventsListKey, language, 'error'])
      })
    }
    case SET_LIVE_ACCESS_EVENT_LIST_ERROR: {
      const { language, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([eventsListKey, language, 'processing'], false)
          .deleteIn([eventsListKey, language, 'data'])
          .setIn([eventsListKey, language, 'error'], error)
      })
    }

    case GET_LIVE_ACCESS_CHAT_LIST: {
      const { id } = action.payload
      return state.setIn([chatListStoreKey, id, 'processing'], true)
    }
    case SET_LIVE_ACCESS_CHAT_LIST: {
      const { id, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([chatListStoreKey, id, 'processing'], false)
          .setIn([chatListStoreKey, id, 'data'], fromJS(data))
          .deleteIn([chatListStoreKey, id, 'error'])
      })
    }
    case SET_LIVE_ACCESS_CHAT_LIST_ERROR: {
      const { id, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([chatListStoreKey, id, 'processing'], false)
          .deleteIn([chatListStoreKey, id, 'data'])
          .setIn([chatListStoreKey, id, 'error'], error)
      })
    }

    case GET_LIVE_ACCESS_CHAT_BLOCKED_USERS: {
      const { channel } = action.payload
      return state.setIn([blockedChatUsersKey, channel, 'processing'], true)
    }
    case SET_LIVE_ACCESS_CHAT_BLOCKED_USERS: {
      const { channel, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([blockedChatUsersKey, channel, 'processing'], false)
          .setIn([blockedChatUsersKey, channel, 'data'], fromJS(data))
          .deleteIn([blockedChatUsersKey, channel, 'error'])
      })
    }
    case SET_LIVE_ACCESS_CHAT_BLOCKED_USERS_ERROR: {
      const { channel, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([blockedChatUsersKey, channel, 'processing'], false)
          .deleteIn([blockedChatUsersKey, channel, 'data'])
          .setIn([blockedChatUsersKey, channel, 'error'], error)
      })
    }

    case SET_CHAT_VISIBLE: {
      const { visible } = action.payload
      return state.setIn([chatListStoreKey, 'visible'], visible)
    }

    case SET_LIVE_ACCESS_SCHEDULE_VISIBLE: {
      const { visible } = action.payload
      return state.setIn([scheduleKey, 'visible'], visible)
    }

    case GET_LIVE_ACCESS_SCHEDULE: {
      const { trackId } = action.payload
      return state.setIn([scheduleKey, trackId, 'processing'], true)
    }
    case SET_LIVE_ACCESS_SCHEDULE: {
      const { trackId, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([scheduleKey, trackId, 'processing'], false)
          .setIn([scheduleKey, trackId, 'data'], fromJS(data))
          .deleteIn([scheduleKey, trackId, 'error'])
      })
    }
    case SET_LIVE_ACCESS_SCHEDULE_ERROR: {
      const { trackId, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([scheduleKey, trackId, 'processing'], false)
          .deleteIn([scheduleKey, trackId, 'data'])
          .setIn([scheduleKey, trackId, 'error'], error)
      })
    }

    case GET_LIVE_ACCESS_SESSION_DETAILS: {
      const { language, id } = action.payload
      return state.setIn([sessionDetailsKey, id, language, 'processing'], true)
    }
    case SET_LIVE_ACCESS_SESSION_DETAILS: {
      const { id, language, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([sessionDetailsKey, id, language, 'processing'], false)
          .setIn([sessionDetailsKey, id, language, 'data'], fromJS(data))
          .deleteIn([sessionDetailsKey, id, language, 'error'])
      })
    }
    case SET_LIVE_ACCESS_SESSION_DETAILS_ERROR: {
      const { id, language, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([sessionDetailsKey, id, language, 'processing'], false)
          .deleteIn([sessionDetailsKey, id, language, 'data'])
          .setIn([sessionDetailsKey, id, language, 'error'], error)
      })
    }
    case GET_LIVE_ACCESS_TRACK:
    {
      const { language, id } = action.payload
      return state.setIn([trackKey, id, language, 'processing'], true)
    }
    case SET_LIVE_ACCESS_TRACK:
    {
      const { language, id, data } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([trackKey, id, language, 'processing'], false)
          .setIn([trackKey, id, language, 'data'], fromJS(data.track))
          .deleteIn([trackKey, id, language, 'error'])
      })
    }
    case SET_LIVE_ACCESS_TRACK_ERROR:
    {
      const { language, id, error } = action.payload
      return state.withMutations((mutableState) => {
        mutableState
          .setIn([trackKey, id, language, 'processing'], false)
          .deleteIn([trackKey, id, language, 'data'])
          .setIn([trackKey, id, language, 'error'], error)
      })
    }
    default:
      return state
  }
}
