import { fromJS } from 'immutable'
import { SET_AUTH_DATA } from 'services/auth/actions'
import { BOOTSTRAP_PHASE_COMPLETE } from 'services/app'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import {
  getPaytrackDataLastTransaction,
} from './actions'

function getLastTransactionOnAuth (store, action) {
  const auth = fromJS(action.payload.data)
  if (auth.get('jwt')) {
    store.dispatch(getPaytrackDataLastTransaction({ auth }))
  }
}

function getLastTransactionOnAppBootComplete (store, action) {
  const { auth, paytrack } = store.getState()
  const { payload = {} } = action
  const { phase } = payload
  const authToken = auth.get('jwt')
  const paytrackProcessing = paytrack.get('processing')
  const lastTransaction = paytrack.get('lastTransaction')
  // get lastTransaction from paytrack if we are logged in
  // and paytrack is not processing and we have no paytrack data
  if (
    authToken &&
    phase === BOOTSTRAP_PHASE_COMPLETE &&
    !paytrackProcessing &&
    !lastTransaction
  ) {
    store.dispatch(getPaytrackDataLastTransaction({ auth }))
  }
}

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      switch (action.type) {
        case SET_AUTH_DATA:
          getLastTransactionOnAuth(store, action)
          break
        case SET_APP_BOOTSTRAP_PHASE:
          getLastTransactionOnAppBootComplete(store, action)
          break
        default:
          break
      }
    }
    next(action)
  }
}
