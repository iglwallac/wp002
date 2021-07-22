import has from 'lodash/has'
import map from 'lodash/map'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import isFunction from 'lodash/isFunction'

import {
  invalidEffectCancelled,
  invalidEffectDebounce,
  invalidEffectHandler,
  invalidEffectAction,
  invalidEffectDelay,
  invalidEffectRetry,
  invalidEffectType,
  invalidEffectWhen,
} from './errors'

export const TYPES = {
  TAKE_LATEST: 'TAKE_LATEST',
  TAKE_EVERY: 'TAKE_EVERY',
  TAKE_MAYBE: 'TAKE_MAYBE',
  TAKE_FIRST: 'TAKE_FIRST',
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
}

function validateActions (actions) {
  return map([].concat(actions), (action) => {
    if (!isString(action)) {
      throw invalidEffectAction(action)
    }
    return action
  })
}

export class Effect {
  //
  constructor (props = {}) {
    //
    const {
      actions,
      handler,
      async,
      type,
    } = props
    // type must be pre-defined TYPES
    if (!has(TYPES, type)) {
      throw invalidEffectType(type)
    }
    // worker must be a function
    if (!isFunction(handler)) {
      throw invalidEffectHandler(handler)
    }
    this._type = type
    this._handler = handler
    this._async = async || false
    this._actions = validateActions(actions)
  }

  debounce (ms) {
    if (!isNumber(ms)) {
      throw invalidEffectDebounce(ms)
    }
    this._debounce = ms
    return this
  }

  retry (times, delay) {
    if (!isNumber(times)) {
      throw invalidEffectRetry(times)
    }
    if (!isNumber(delay)) {
      throw invalidEffectDelay(delay)
    }
    this._retry = { times, delay }
    return this
  }

  catch (action, payload) {
    if (isFunction(action)) {
      this._catch = action
    } else if (isString(action)) {
      this._catch = () => ({
        type: action,
        payload,
      })
    }
    return this
  }

  cancelWhen (action) {
    this._cancel = isFunction(action)
      ? action
      : validateActions(action)
    return this
  }

  cancelled (fn) {
    if (!isFunction(fn)) {
      throw invalidEffectCancelled(fn)
    }
    this._cancelled = fn
    return this
  }

  when (fn) {
    if (!isFunction(fn)) {
      throw invalidEffectWhen(fn)
    }
    this._when = fn
    return this
  }

  toJS () {
    return {
      cancelled: this._cancelled,
      debounce: this._debounce,
      handler: this._handler,
      actions: this._actions,
      onCatch: this._catch,
      cancel: this._cancel,
      retry: this._retry,
      async: this._async,
      when: this._when,
      type: this._type,
    }
  }
}
