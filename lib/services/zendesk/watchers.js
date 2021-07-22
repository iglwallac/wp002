import { SET_RESOLVER_LOCATION } from 'services/resolver/actions'
import { get as getConfig } from 'config'

const { origin } = getConfig()

// ***********************************************************
// NOTE: as of 11/20/20 this watcher is not being called from
// configureStore -> witnessMiddleware.run()
// Which means this watcher is not running. But keep this code
// for future (soon) improvments.
export default function updateZendeskUrl ({ after }) {
  return after(SET_RESOLVER_LOCATION, ({ action }) => {
    const zE = global.zE
    if (zE) {
      const { payload = {} } = action
      const { location = {} } = payload
      const { pathname = {} } = location
      zE('webWidget', 'updatePath', { title: pathname, url: origin + pathname })
    }
  })
}

