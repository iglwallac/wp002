// import indexOf from 'lodash/indexOf'
import isNumber from 'lodash/isNumber'
import { Map, List, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  //
  const {
    type: actionType,
    payload,
  } = action

  switch (actionType) {
    //
    case actions.NOTIFICATIONS_CLEAR_ALL:
      return state.delete('user')

    case actions.NOTIFICATIONS_GET_ALL:
      return state.setIn(['user', 'processing'], true)

    case actions.NOTIFICATIONS_GET_RECENT:
      return state.setIn(['recent', 'processing'], true)

    case actions.NOTIFICATIONS_SET_ALL:
      return state.updateIn(['user'], Map(), recent => (
        recent.set('processing', false).set('data', fromJS(payload))
      ))

    case actions.NOTIFICATIONS_GET_SUBSCRIPTIONS: {
      return state.setIn(['subscriptions', 'processing'], true)
    }

    case actions.NOTIFICATIONS_CLEAR_SUBSCRIBABLE: {
      const { contentId, type } = payload
      return state.deleteIn(['subscribables', type, contentId])
    }

    case actions.NOTIFICATIONS_SET_SUBSCRIPTIONS: {
      const { data, total } = payload
      return state.updateIn(['subscriptions'], Map(), recent => (
        recent.set('processing', false).set('data', fromJS(data)).set('total', total)
      ))
    }

    case actions.NOTIFICATIONS_SET_RECENT:
      return state.updateIn(['recent'], Map(), recent => (
        recent.set('processing', false).set('data', fromJS(payload))
      ))

    case actions.NOTIFICATIONS_SET_RECEIVED: {
      return state.updateIn(['recent', 'data'], List(), recent => (
        recent.map(r => r.set('received', true))
      ))
    }

    case actions.NOTIFICATIONS_SET_SUBSCRIBER: {
      const { type, contentId, subscriber } = payload
      const key = ['subscribables', type, contentId]
      return state.updateIn(key, Map(), s => (
        s.set('subscriber', subscriber)
      ))
    }

    case actions.NOTIFICATIONS_SET_SUBSCRIBABLE: {
      const { entity, contentId, type } = payload
      const subscription = fromJS(entity || {})
      const path = ['subscribables', type, contentId]
      const isSubscribable = isNumber(subscription.get('id'))
      const updatedSub = subscription.set('type', type).set('isSubscribable', isSubscribable)
      return state.setIn(path, updatedSub)
    }

    default:
      return state
  }
}
