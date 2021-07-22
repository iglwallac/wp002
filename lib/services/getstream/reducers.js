import { Map, fromJS } from 'immutable'
import assign from 'lodash/assign'

import { selectActivity } from './selectors'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  const { type, payload } = action
  switch (type) {
    case actions.GETSTREAM_END_SESSION: {
      return initialState
    }
    case actions.GETSTREAM_SET_SESSION: {
      return state.set('auth', fromJS(payload))
    }
    case actions.GETSTREAM_CREATE_SESSION: {
      return state.set('auth', Map({
        processing: true,
      }))
    }
    case actions.GETSTREAM_GET_FEED: {
      const { key } = payload
      const feed = state.getIn(['feed', key], Map())
      return feed.get('id')
        ? state.setIn(['feed', key, 'processing'], true)
        : state
    }
    case actions.GETSTREAM_PUT_FEED: {
      const { key, data } = payload
      const feeds = state.get('feed', Map())
      const feed = fromJS(data).set('processing', false)
      const nextFeeds = feeds.set(key, feed)
      return state.set('feed', nextFeeds)
    }
    case actions.GETSTREAM_GET_ACTIVITY_REACTIONS_ERROR: {
      const { message, error } = payload
      return state.set('message', message)
        .set('error', error)
    }
    case actions.GETSTREAM_GET_ACTIVITY_REACTIONS_SUCCESS: {
      const { results, activity } = payload
      return state.setIn(['feedComments', `${activity.id}`], results)
    }
    case actions.GETSTREAM_DELETE_DRAFT: {
      const { draftId } = payload
      const drafts = state.get('drafts', Map())
      return state.set('drafts', drafts.delete(draftId))
    }
    case actions.GETSTREAM_PUT_DRAFT: {
      const { draftId, draft } = payload
      return state.setIn(['drafts', draftId], draft)
    }
    case actions.GETSTREAM_GET_NOTIFICATIONS_REQUEST: {
      return state.setIn(['notifications', 'processing'], true)
    }
    // this data should be immutable
    case actions.GETSTREAM_GET_NOTIFICATIONS_SUCCESS: {
      const { results, unseen, unread } = payload
      return state.setIn(['notifications', 'activityGroups'], results)
        .setIn(['notifications', 'processing'], false)
        .setIn(['notifications', 'unseen'], unseen)
        .setIn(['notifications', 'unread'], unread)
    }
    case actions.GETSTREAM_PUT_NOTIFICATIONS_SEEN: {
      const { unseen, unread } = payload
      return state.setIn(['notifications', 'unseen'], unseen)
        .setIn(['notifications', 'unread'], unread)
    }
    // TODO: activityGroups data is not immutable currently.
    case actions.GETSTREAM_PUT_NOTIFICATION_READ: {
      const { notificationId, unread } = payload
      const activityGroups = state.getIn(['notifications', 'activityGroups'], [])
      const activityGroup = activityGroups.find(ac => ac.id === notificationId)
      const activityGroupIndex = activityGroups.findIndex(ac => ac.id === notificationId)
      const updatedActivityGroup = assign({}, activityGroup, {
        is_read: true,
      })
      const updatedActivityGroups = [...activityGroups]
      updatedActivityGroups[activityGroupIndex] = updatedActivityGroup

      return state.setIn(['notifications', 'unread'], unread)
        .setIn(['notifications', 'activityGroups'], updatedActivityGroups)
    }
    // TODO: activity is not immutable currently.
    // we are doing this right now because Getstream uses the activity objects
    // and require raw JS objects.
    case actions.GETSTREAM_GET_ACTIVITY: {
      const { id } = payload
      const data = { processing: true }
      const activity = selectActivity(state, id)
      return activity.id
        ? state : state.setIn(['activities', id], data)
    }
    case actions.GETSTREAM_PUT_ACTIVITY: {
      const { activityId, activity: a } = payload
      const activity = { ...a, processing: false }
      return state.setIn(['activities', activityId], activity)
    }
    case actions.GETSTREAM_UNMOUNT_PAGE: {
      const auth = state.get('auth')
      const notifications = state.get('notifications')
      return initialState.set('auth', auth).set('notifications', notifications)
    }
    default:
      return state
  }
}
