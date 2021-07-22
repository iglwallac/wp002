import get from 'lodash/get'
import set from 'lodash/set'
import size from 'lodash/size'
import omit from 'lodash/omit'
import find from 'lodash/find'
import filter from 'lodash/filter'
import reduce from 'lodash/reduce'
import forEach from 'lodash/forEach'
import isFunction from 'lodash/isFunction'
import { getExponentialDelay } from 'exponential-backoff'
import { Effect, TYPES } from './effect'
import {
  invalidTakeMaybeHandler,
  invalidWorkerResultType,
  invalidWatcherResult,
  invalidWorkerResult,
  invalidWatcher,
} from './errors'

const WITNESS_EFFECT_CANCELLED = '__WITNESS_EFFECT_CANCELLED__'
const KEY_RETRY_ATTEMPT = '__RETRY_ATTEMPT__'
const KEY_CANCELLED = '__CANCELLED__'
const KEY_EFFECT = '__EFFECT__'

let _id = 0

function createId () {
  _id += 1
  return _id
}

function takeLatest (actions, handler) {
  return new Effect({
    type: TYPES.TAKE_LATEST,
    async: false,
    actions,
    handler,
  })
}

function takeFirst (actions, handler) {
  return new Effect({
    type: TYPES.TAKE_FIRST,
    async: false,
    actions,
    handler,
  })
}

function takeEvery (actions, handler) {
  return new Effect({
    type: TYPES.TAKE_EVERY,
    async: true,
    actions,
    handler,
  })
}

function takeMaybe (actions, handler) {
  return new Effect({
    type: TYPES.TAKE_MAYBE,
    async: true,
    actions,
    handler,
  })
}

function before (actions, handler) {
  return new Effect({
    type: TYPES.BEFORE,
    async: true,
    actions,
    handler,
  })
}

function after (actions, handler) {
  return new Effect({
    type: TYPES.AFTER,
    async: true,
    actions,
    handler,
  })
}

function isSideEffect (type) {
  return type === TYPES.BEFORE
    || type === TYPES.AFTER
}

function cancelWorker (worker) {
  set(worker, KEY_CANCELLED, true)
}

function setProcessing (effect, flag) {
  set(effect, 'processing', flag)
}

function clearDebounce (effect, id) {
  const debounceIds = get(effect, 'debounceIds', [])
  const updatedIds = filter(debounceIds, (i) => {
    if (!id || id === i) {
      clearTimeout(i)
      return false
    }
    return true
  }, [])
  set(effect, 'debounceIds', updatedIds)
}

function addDebounce (effect, id) {
  const debounceIds = get(effect, 'debounceIds', [])
  debounceIds.push(id)
  set(effect, 'debounceIds', debounceIds)
}

function workerWasCancelled (worker) {
  const cancelled = get(worker, KEY_CANCELLED)
  return cancelled === true
}

function getEligibleEffects (effects, options) {
  return filter(effects, (fx) => {
    //
    const type = get(fx, 'type')
    const when = get(fx, 'when')

    let isEligable

    switch (type) {
      case TYPES.TAKE_FIRST:
        isEligable = get(fx, 'processing') !== true
          && !get(fx, 'debounceId')
        break
      case TYPES.TAKE_LATEST:
      case TYPES.TAKE_EVERY:
      case TYPES.TAKE_MAYBE:
      case TYPES.BEFORE:
      case TYPES.AFTER:
        isEligable = true
        break
      default:
        isEligable = false
        break
    }
    if (options && isEligable && when) {
      return when(options)
    }
    return isEligable
  })
}

function getEffectHandler (effect, options) {
  const handler = get(effect, 'handler')
  const type = get(effect, 'type')
  // the TAKE_MAYBE effect is a function that can return
  // a handler OR nothing. All other effects are handlers themselves.
  if (type === TYPES.TAKE_MAYBE) {
    if (!isFunction(handler)) {
      throw invalidTakeMaybeHandler(handler)
    }
    return handler(options)
  }
  return handler
}

function createCatchHandler (effect, err) {
  return async function workerCatchThrown (params) {
    const handler = get(effect, 'onCatch')
    if (handler) {
      return handler(params, err)
    }
    throw err
  }
}

async function handleCancel (effect, params) {
  // get the effect handler 'cancelled'
  const handler = get(effect, 'cancelled')
  if (handler) {
    const result = await handler(params)
    // if something was returned, we want to continue
    // sending that down to redux. It SHOULD be an action.
    // if it isn't, we'll end up throwing an error later
    if (result) {
      return result
    }
  }
  return { type: WITNESS_EFFECT_CANCELLED }
}

export default class Witness {
  //
  constructor () {
    this.$effects = {}
    this.$queue = []
  }

  clear () {
    const { $effects } = this
    forEach($effects, (fx, action) => {
      $effects[action] = []
    })
  }

  createWatcher (create) {
    //
    if (!isFunction(create)) {
      throw invalidWatcher(create)
    }

    const effect = create({
      takeLatest,
      takeMaybe,
      takeEvery,
      takeFirst,
      before,
      after,
    })

    if (!(effect instanceof Effect)) {
      throw invalidWatcherResult(effect)
    }

    const id = createId()
    const output = effect.toJS()
    const {
      cancelled,
      debounce,
      actions,
      onCatch,
      handler,
      cancel,
      retry,
      async,
      when,
      type,
    } = output

    forEach(actions, (action) => {
      this.$effects[action] = this.$effects[action] || []
      this.$effects[action].push({
        processing: false,
        cancelled,
        debounce,
        onCatch,
        handler,
        cancel,
        action,
        retry,
        async,
        type,
        when,
        id,
      })
    })
  }

  createWatchers (watchers) {
    forEach(watchers, (watcher) => {
      if (isFunction(watcher)) {
        this.createWatcher(watcher)
        return
      }
      forEach(watcher, w => (
        this.createWatcher(w)
      ))
    })
  }

  createWorker (effect, options) {
    //
    const handler = getEffectHandler(effect, options)
    const retry = get(effect, 'retry')

    if (!handler) {
      return null
    }

    const witness = this
    const worker = async function work (params, done) {
      //
      let result = null
      let handleCatch = null
      // if it was cancelled, bail out now
      if (workerWasCancelled(worker)) {
        result = await handleCancel(effect, params)
      } else {
        // go ahead and invoke our worker
        setProcessing(effect, true)
        // the final action result from out worker
        try {
          result = await handler(params)
        } catch (err) {
          //
          if (retry) {
            const { times, delay } = retry
            const attempt = get(worker, KEY_RETRY_ATTEMPT, 1)

            if (attempt < times) {
              set(worker, KEY_RETRY_ATTEMPT, attempt + 1)
              setTimeout(async () => {
                await worker(params, done)
              }, getExponentialDelay(times, delay))
              return
            }
          }
          handleCatch = createCatchHandler(effect, err)
        }
        // reset the 'processing' flag and remove the worker from
        // reference no matter if the effect was cancelled or not
        setProcessing(effect, false)
        // if a catch was thrown
        if (handleCatch) {
          result = await handleCatch(params)
        } else if (workerWasCancelled(worker)) {
          result = await handleCancel(effect, params)
        }
      }
      // filter out this worker fron the queue, we're done
      witness.removeWorker(worker)
      done(result)
    }
    set(worker, KEY_EFFECT, effect)
    return worker
  }

  createWorkers (effects, options = {}) {
    return reduce(effects, (acc, effect) => {
      const worker = this.createWorker(effect, options)
      if (worker) {
        acc.push(worker)
      }
      return acc
    }, [])
  }

  cancelWorkersWhen (action, data) {
    //
    this.$queue = filter(this.$queue, (worker) => {
      const effect = get(worker, KEY_EFFECT)
      const cancel = get(effect, 'cancel')

      if (cancel) {
        const shouldCancel = isFunction(cancel)
          ? !!cancel(data)
          : !!find(cancel, a => a === action)

        if (shouldCancel) {
          clearDebounce(effect)
          cancelWorker(worker)
          return false
        }
      }
      return true
    })
    return this
  }

  cancelSyncWorkers (effect) {
    const type = get(effect, 'type')
    if (type === TYPES.TAKE_LATEST) {
      setProcessing(effect, false)
      this.$queue = filter(this.$queue, (worker) => {
        const reference = get(worker, KEY_EFFECT)
        if (effect === reference) {
          cancelWorker(worker)
          return false
        }
        return true
      })
    }
    return this
  }

  removeWorker (worker) {
    this.$queue = filter(this.$queue, w => (
      w !== worker
    ))
    return this
  }

  isProcessing (action) {
    const effects = this.getEffects(action)
    const validEffects = getEligibleEffects(effects)
    return size(effects) > 0 && size(validEffects) < 1
  }

  getEffects (action, type) {
    const { $effects } = this
    const effects = $effects[action] || []
    const sideEffect = isSideEffect(type)
    return filter(effects, (fx) => {
      const fxType = get(fx, 'type')
      if ((sideEffect && type === fxType)
        || (!type && !isSideEffect(fxType))) {
        return true
      }
      return type === fxType
    })
  }

  dispatchEffects (action, type, options) {
    // cancel any workers that have custom 'cancel'
    // attributes specified via Effect.prototype.cancelWhen()
    if (type === TYPES.BEFORE) {
      this.cancelWorkersWhen(action, options)
    }

    const effects = this.getEffects(action, type)
    const validEffects = getEligibleEffects(effects, {
      prevState: get(options, 'prevState'),
      action: get(options, 'action'),
      state: get(options, 'state'),
    })

    if (size(validEffects)) {
      const sideEffect = isSideEffect(type)
      const dispatch = get(options, 'dispatch')
      const data = sideEffect ? options : omit(options, ['dispatch'])
      const workers = this.createWorkers(validEffects, data)

      forEach(workers, async (worker) => {
        //
        const effect = get(worker, KEY_EFFECT)
        const isSync = get(effect, 'async') === false
        const debounce = get(effect, 'debounce')
        // only clear all debounce times if the effect
        // is a sync (not async) effect, meaning only one can be
        // running at a time
        if (isSync) {
          clearDebounce(effect)
        }

        this.cancelSyncWorkers(effect)
        this.$queue.push(worker)

        const doWork = async () => {
          await worker(data, (nextAction) => {
            const nextType = get(nextAction, 'type')
            // Side-effects do not allow for result actions.
            // Also, allow the ability to NOT return an action
            // this provides the ability to leverage the 'take' effects
            // without having to return an action, kicking of a new reducer.
            if (sideEffect
              || nextAction === undefined) {
              return
            }
            // if we end up here,
            // the end-developer forgot to return a valid redux action.
            if (!nextType) {
              throw invalidWorkerResult(action, nextAction)
            }
            // if we end up here,
            // the end-developer return an action with the same type.
            if (action === nextType) {
              throw invalidWorkerResultType(action, nextType)
            }
            // if we end up here, everything went fine.
            // we're now going to dispatch our new action, sending it through this flow.
            if (nextType !== WITNESS_EFFECT_CANCELLED) {
              dispatch(nextAction)
            }
          })
        }

        if (debounce) {
          const id = setTimeout(async () => {
            clearDebounce(effect, id)
            await doWork()
          }, debounce)
          addDebounce(effect, id)
          return
        }
        await doWork()
      })
    }
  }
}
