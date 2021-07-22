import _get from 'lodash/get'
import * as actions from './actions'
import {
  compUserSubscription,
} from './index'

/* eslint-disable import/prefer-default-export */

// Watch for user account cancel
export function watchUserAccountCancel ({ after }) {
  return after([
    actions.SET_USER_COMP,
  ], async ({ dispatch, state }) => {
    const { auth } = state

    try {
      dispatch({
        type: actions.COMP_USER_SUBSCRIPTION_PROCESSING,
        processing: true,
      })
      const data = await compUserSubscription({ auth })

      // @TODO: fix the actions + reducers
      // they should always pass their data via "payload",
      // not custom properties such as "processing" and "errors"
      if (_get(data, 'success')) {
        dispatch({
          type: actions.COMP_USER_SUBSCRIPTION_DATA,
          payload: data,
        })
      } else {
        dispatch({
          type: actions.COMP_USER_SUBSCRIPTION_ERROR,
          errors: _get(data, 'errors', ['unknown error']),
        })
      }
    } catch (e) {
      dispatch({
        type: actions.COMP_USER_SUBSCRIPTION_PROCESSING,
        processing: false,
      })
      dispatch({
        type: actions.COMP_USER_SUBSCRIPTION_ERROR,
        errors: ['unknown error'],
      })
    }
  })
}
/* eslint-enable import/prefer-default-export */
