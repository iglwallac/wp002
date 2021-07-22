import { List } from 'immutable'
import { getUserAccountDataBillingSubscriptions } from 'services/user-account/actions'

/**
 * Fetch billing subscriptions for this user
 */
export async function init (options) {
  const {
    auth,
    store,
  } = options
  if (auth.get('jwt')) {
    return store.dispatch(getUserAccountDataBillingSubscriptions({ auth }))
  }
  return List()
}

export default { init }
