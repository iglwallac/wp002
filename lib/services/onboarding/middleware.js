import { fromJS } from 'immutable'
import _get from 'lodash/get'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { BOOTSTRAP_PHASE_PRE_RENDER } from 'services/app'
import { SET_AUTH_DATA } from 'services/auth/actions'
import { getOnboardingStatus } from './actions'

export default function middleware (store) {
  return next => async (action) => {
    let result
    switch (action.type) {
      case SET_APP_BOOTSTRAP_PHASE: {
        const { payload = {} } = action
        const { phase } = payload
        const { auth } = store.getState()
        const jwt = auth.get('jwt')
        const authNotExpired = auth.get('idExpires') >= Math.floor(Date.now() / 1000)
        if (jwt && authNotExpired && phase === BOOTSTRAP_PHASE_PRE_RENDER) {
          store.dispatch(getOnboardingStatus({ auth }))
        }
        break
      }
      case SET_AUTH_DATA: {
        store.dispatch(getOnboardingStatus({ auth: fromJS(_get(action, 'payload.data')) }))
        break
      }
      default:
        break
    }
    next(action)
    return result
  }
}
