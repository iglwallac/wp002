import { Map, fromJS } from 'immutable'
import _first from 'lodash/first'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import {
  SET_AUTH_LOGIN_FAILED,
  RESET_AUTH_DATA,
  SET_AUTH_DATA,
  SET_ATOMIC_AUTH_DATA,
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_CHANGE_PROFILE,
  AUTH_ERROR,
  SET_AUTH_LOGIN_SUCCESS,
  INCREMENT_AUTH_RENEWAL_COUNT,
  RESET_AUTH_RENEWAL_COUNT,
} from './actions'

export const initialState = Map()

export default function authReducer (state = initialState, action) {
  switch (action.type) {
    case SET_AUTH_LOGIN_FAILED:
      return state.withMutations((previousState) => {
        previousState
          .set('failed', true)
          .set('errorCodes', fromJS(action.payload.codes))
          .set('statusCode', action.payload.statusCode)
      })
    case RESET_AUTH_DATA:
      return initialState
    case SET_AUTH_DATA:
      // Add on the data that will be missing from auth data so it is not removed.
      return fromJS(action.payload.data).withMutations((mutateState) => {
        mutateState.set('processing', action.payload.processing)
        if (state.get('renewTimes')) {
          mutateState.set('renewTimes', state.get('renewTimes'))
        }
        if (state.get('renewalCount')) {
          mutateState.set('renewalCount', state.get('renewalCount'))
        }
        return mutateState
      })
    case SET_ATOMIC_AUTH_DATA: {
      const { payload } = action
      const key = _first(_keys(payload))
      return state.set(key, _get(payload, key))
    }
    case AUTH_LOGIN:
    case AUTH_LOGOUT:
    case AUTH_CHANGE_PROFILE:
      return state.set('processing', true)
    case AUTH_ERROR:
      return state.withMutations(mutateState =>
        mutateState
          .delete('processing')
          .delete('processingRenew'),
      )
    case SET_AUTH_LOGIN_SUCCESS:
      return state.withMutations(mutateState =>
        mutateState
          .set('loginSuccess', action.payload)
          .set('renewalCount', 0),
      )
    case INCREMENT_AUTH_RENEWAL_COUNT:
      return state.withMutations(mutateState =>
        mutateState
          .set('processing', action.payload.processing)
          .set('processingRenew', action.payload.processingRenew)
          .update('renewalCount', 0, renewalCount => renewalCount + 1),
      )
    case RESET_AUTH_RENEWAL_COUNT:
      return state.withMutations(mutateState =>
        mutateState
          .set('processing', action.payload.processing)
          .set('processingRenew', action.payload.processingRenew)
          .set('renewalCount', 0),
      )
    default:
      return state
  }
}
