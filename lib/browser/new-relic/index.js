import get from 'lodash/get'
import { get as getConfig } from 'config'
import { setRoute as setRouteNewRelic, setNewRelicLibrary, addRelease } from 'new-relic-transaction'
import VendorInterface from '../vendor-interface'

const config = getConfig()
const enabled = get(config, ['newRelic', 'enabled'])

let newRelicInterface = null

/**
 * Get a vendor interface interface for NewRelic
 * @returns {VendorInterface} The vendor interface
 */
function getInterface () {
  newRelicInterface = newRelicInterface || new VendorInterface({
    getVendor: () => global.newrelic,
    enabled,
  })
  return newRelicInterface
}

/**
 * Initialize NewRelic agent
 * @param {Object} options The options
 * @param {Object} options.appData The application data
 */
export function init (options = {}) {
  const { appData } = options
  if (!appData) {
    throw new Error('The appData option is required')
  }
  getInterface().push((newrelic) => {
    setNewRelicLibrary(newrelic)
    addRelease({
      name: get(appData, ['hydrate', 'app', 'name']),
      version: get(appData, ['hydrate', 'app', 'version']),
      newrelic,
    })
    setRouteNewRelic({
      username: get(appData, ['hydrate', 'auth', 'username']),
      pathname: get(global, ['location', 'pathname'], ''),
      uid: get(appData, ['hydrate', 'auth', 'uid']),
      query: get(global, ['location', 'query'], {}),
      newrelic,
    })
  })
}

/**
 * Push an event onto the NewRelic library
 * @param {Function} func The function to call when the NewRelic library is
 * ready
 */
export function push (func) {
  getInterface().push(func)
}

export default { init, push }
