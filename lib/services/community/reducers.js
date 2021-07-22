import { Map, fromJS } from 'immutable'
import get from 'lodash/get'

import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  const { type, payload } = action
  switch (type) {
    case actions.COMMUNITY_SET_FEED: {
      const { data, id } = payload
      const errors = get(data, 'errors')
      if (errors) {
        return state.set('errors', fromJS(errors))
      }
      return state.setIn(['feeds', id], fromJS(data))
    }
    case actions.COMMUNITY_SET_ACTIVITY: {
      const { data } = payload
      const errors = get(data, 'errors')
      if (errors) {
        return state.set('errors', fromJS(errors))
      }
      const activity = fromJS(data)
      const activityId = activity.getIn(['data', 'uuid'], '')
      return state.setIn(['activity', activityId], activity)
    }
    case actions.COMMUNITY_SET_ACTIVITIES: {
      const { data, feedId } = payload
      return state.setIn(['feeds', feedId], fromJS(data))
    }
    case actions.COMMUNITY_DELETE_DRAFT: {
      const { draftId } = payload
      const drafts = state.get('drafts', Map())
      return state.set('drafts', drafts.delete(draftId))
    }
    case actions.COMMUNITY_SET_DRAFT: {
      const { draftId, draft } = payload
      return state.setIn(['drafts', draftId], draft)
    }
    case actions.COMMUNITY_UNMOUNT_PAGE: {
      return Map()
    }
    default:
      return state
  }
}
