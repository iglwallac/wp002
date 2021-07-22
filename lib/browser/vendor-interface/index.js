import forEach from 'lodash/forEach'
import isFunction from 'lodash/isFunction'

const MAX_ATTEMPTS = 10
const SLEEP_TIME = 500

export default class VendorInterface {
  /**
   * The VendorInterface constructor
   * @param {Object} options The constructor options
   * @param {Boolean} options.enabled When true the interfanceis enabled
   * @param {Function} options.getVendor The function to call when the vendor
   * is initialized
   */
  constructor (options = {}) {
    const { enabled, getVendor } = options
    if (!isFunction(getVendor)) {
      throw new Error('The getVendor option is required to be a function')
    }
    this.enabled = enabled !== false
    this.disabled = !this.enabled
    this.attempts = 0
    this.timer = null
    this.queue = []

    if (this.disabled) {
      this.available = false
      this.shutdown = true
    }
    this._fetchVendor(getVendor)
  }

  /**
   * Fetch the vendor interface
   * @param {Function} get The function to call when the vendor
   * is initialized
   */
  _fetchVendor (get) {
    if (!isFunction(get)) {
      throw new Error('The get option is argument is required to be a function')
    }
    clearTimeout(this.timer)
    this.timer = null
    // if this vendor is disabled or we have shutdown
    // due to too many attempts at finding the vendor, bail out
    if (this.disabled || this.shutdown) {
      return
    }
    // fetch the vendor and set necessary properties
    this.vendor = get()
    this.available = !!this.vendor
    this.shutdown = !this.available && this.attempts > MAX_ATTEMPTS

    if (this.available) {
      this._unload()
      return
    }

    if (this.shutdown) {
      this.queue.splice(0, this.queue.length)
      return
    }

    this.timer = setTimeout(() => {
      this.attempts += 1
      this._fetchVendor(get)
    }, SLEEP_TIME)
  }

  /**
   * Unload the event query i.e. run all queued events
   */
  _unload () {
    forEach(this.queue, f => f(this.vendor))
    this.queue.splice(0, this.queue.length)
  }

  /**
   * Push an event onto the vendor interface
   * @param {Function} func The function to call when the vendor
   * is initialized
   */
  push (func) {
    if (!isFunction(func)) {
      throw new Error('The func argument is required to be a function')
    }
    if (this.disabled || this.shutdown) {
      return
    }
    this.queue.push(func)
    // if the vendor is available,
    // unload the queue
    if (this.available) {
      this._unload()
    }
  }
}
