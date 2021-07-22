import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.RESET_HEADER_NAV:
      return state.withMutations(mutateState => mutateState
        .delete('navigationOverlayVisible')
        .delete('userMenuVisible'))
    case actions.TOGGLE_NAVIGATION_OVERLAY_VISIBLE:
      return state.withMutations(mutateState => mutateState
        .update(
          'navigationOverlayVisible',
          false,
          navigationOverlayVisible => !navigationOverlayVisible,
        ).delete('userMenuVisible'))
    case actions.SET_NAVIGATION_OVERLAY_VISIBLE:
      return state.withMutations(mutateState => mutateState
        .set('navigationOverlayVisible', action.payload))
    case actions.SET_USER_MENU_VISIBLE:
      return state.set('userMenuVisible', action.payload)
    case actions.TOGGLE_USER_MENU_VISIBLE:
      return state.update(
        'userMenuVisible',
        false,
        userMenuVisible => !userMenuVisible,
      )
    case actions.SET_NOTIFICATIONS_MENU_VISIBLE:
      return state.set('notificationsMenuVisible', action.payload)
    case actions.TOGGLE_NOTIFICATIONS_MENU_VISIBLE:
      return state.update(
        'notificationsMenuVisible',
        false,
        notificationsMenuVisible => !notificationsMenuVisible,
      )
    case actions.SET_NOTIFICATIONS_MENU_SECTION:
      return state.set('notificationsMenuSection', action.payload)
    default:
      return state
  }
}
