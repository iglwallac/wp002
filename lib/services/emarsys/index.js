import { Map } from 'immutable'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _size from 'lodash/size'
import _isEmpty from 'lodash/isEmpty'

// Grab and set the user email address. This gets hashed by the script before being sent.
export function emarsysCustomerLogin (store, options = {}) {
  const { send = true } = options
  const { auth = Map() } = store.getState()
  const email = auth.get('email', '')
  if (!_isEmpty(email)) {
    emarsysCmd('setEmail', email)
    if (send) emarsysSend()
  }
}

// Get the user email so we don't rely on login for this, then trigger a view
export function emarsysView (store, item, options = {}) {
  const { send = true } = options
  emarsysCustomerLogin(store, { send: false })
  emarsysCmd('view', item.toString())
  if (send) emarsysSend()
}

// Trigger the emarsys tag command to enrich something the user did (e.g. qualified view of a video)
export function emarsysTag (item) {
  emarsysCmd('tag', item.toString())
  emarsysSend()
}

/**
 * Trigger the emarsys category command to track the admin category, site segment, and/or
 * facets of what the user is viewing. Accepts a list of items (optional).
 * @param {Object} store Redux store instance
 * @param {(string|string[])} items One or more categories to send
 */
export function emarsysCategory (store, items) {
  emarsysCustomerLogin(store, { send: false })
  if (Array.isArray(items)) {
    const distinctItems = items.filter((val, index, arr) => arr.indexOf(val) === index)
    distinctItems.forEach(item => emarsysCmd('category', item.toString()))
  } else {
    emarsysCmd('category', items.toString())
  }
  emarsysSend()
}

/**
 * Trigger the emarsys setEmail command for email signups and cart actions
 *
 * @param {(string)} email Email address of the user
 */
export function emarsysSendEmail (email, options = {}) {
  const { send = true } = options
  if (!_isEmpty(email)) {
    emarsysCmd('setEmail', email)
    if (send) emarsysSend()
  }
}

/**
 * Trigger the emarsys cart command
 *
 * @param {Array} cartItems Array of objects that represents items in the cart
 * @param {(string)} email Email address of the user that is in the checkout process
 */
export function emarsysSendCartStart (cartItems, email) {
  if (_isArray(cartItems) && _size(cartItems) > 0) {
    emarsysSendEmail(email, { send: false })
    emarsysCmd('cart', cartItems)
    emarsysSend()
  }
}

/**
 * Trigger the emarsys purchase command
 *
 * @param {Array} purchase An objects that represents the purchase
 * @param {(string)} email Email address of the user that is in the checkout process
 */
export function emarsysSendCartPurchase (purchase, email) {
  emarsysSendEmail(email, { send: false })

  // Fake an empty cart
  emarsysCmd('cart', [])

  if (_isObject(purchase) && _size(purchase) > 0) {
    emarsysCmd('purchase', purchase)
  }

  emarsysSend()
}

// cmd is the emarsys web extend command to queue
// data is the data we want to send to emarsys
// Documentation https://help.emarsys.com/hc/en-us/articles/214245625-Data-collection-JavaScript-API-reference
export function emarsysCmd (cmd, data) {
  global.ScarabQueue.push([cmd, data])
}

// trigger the emarsys go command to send all the data over, and empty the queue
export function emarsysSend () {
  global.ScarabQueue.push(['go'])
}

export function emarsysReload () {
  const instance = _get(global, 'ScarabUtil.loadedModules.emarsys_webpersonalization.instance')
  if (instance && instance.reload) {
    instance.reload()
  }
}

