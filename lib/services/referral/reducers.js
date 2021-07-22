
import omit from 'lodash/omit'
import { Map, List, fromJS } from 'immutable'
import {
  SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING,
  SET_USER_REFERRAL_ATTRIBUTION_DATA,
  SET_USER_REFERRAL_DATA_PROCESSING,
  SET_VIEW_ALL_USER_REFERRAL_DATA, // remove this once new invite page is up
  SET_INVITE_FRIEND_TILES_DATA,
  REMOVE_USER_REFERRAL_DATA,
  SHOW_INVITE_FRIEND_POPUP,
  SET_USER_REFERRAL_DATA,
  REFERRAL_CLEAR_VIEWALL, // remove this once new invite page is up
  GET_USER_REFERRAL_DATA,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_USER_REFERRAL_DATA:
      return state.set('processing', true)
    case REMOVE_USER_REFERRAL_DATA:
      return state.delete('data')
    case SET_USER_REFERRAL_DATA: {
      const { payload } = action
      const { data } = payload
      const params = omit(payload, 'data')
      const referralData = fromJS(data).merge(fromJS(params))
      return state.set('data', referralData)
        .set('processing', false)
    }
    case SET_VIEW_ALL_USER_REFERRAL_DATA: { // remove this once new invite page is up
      const { payload } = action
      const { data, processing, p, pp } = payload
      const existingItems = state.getIn(['viewAll', 'items'], List())
      const allItems = existingItems.push(...fromJS(data.referrals.referredUsers))
      const viewAll = {
        items: fromJS(allItems),
        p,
        pp,
      }
      return state
        .set('viewAll', fromJS(viewAll))
        .set('processing', processing)
    }
    case SET_USER_REFERRAL_DATA_PROCESSING:
      return state
        .set('processing', action.payload)
    case SET_USER_REFERRAL_ATTRIBUTION_DATA:
      return state
        .set('attribution', fromJS(action.payload.data))
        .setIn(['attribution', 'processing'], action.payload.processing)
    case SET_USER_REFERRAL_ATTRIBUTION_DATA_PROCESSING:
      return state
        .setIn(['attribution', 'processing'], action.payload)
    case REFERRAL_CLEAR_VIEWALL: // remove this once new invite page is up
      return state
        .set('viewAll', Map())
    case SHOW_INVITE_FRIEND_POPUP:
      return state
        .set('showInviteFriendPopup', action.payload)
    case SET_INVITE_FRIEND_TILES_DATA:
      return state
        .set('inviteFriendTiles', fromJS(action.payload))
    default:
      return state
  }
}
