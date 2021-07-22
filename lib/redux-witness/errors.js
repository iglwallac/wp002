import set from 'lodash/set'

export function invalidEffectWhen (fn) {
  return new Error(`
    Redux-Witness :: invalid Effect when(fn) fn.
    Fn must be a Function or Promise.
    Found: ${fn}.
  `)
}

export function invalidEffectType (type) {
  return new Error(`
    Redux-Witness :: invalid Effect type.
    Found: ${type}.
  `)
}

export function invalidEffectHandler (worker) {
  return new Error(`
    Redux-Witness :: invalid Effect handler.
    Worker must be a Function or Promise.
    Found: ${worker}.
  `)
}

export function invalidEffectCancelled (fn) {
  return new Error(`
    Redux-Witness :: invalid Effect cancelled(fn) fn.
    Fn must be a Function or Promise.
    Found: ${fn}.
  `)
}

export function invalidEffectAction (action) {
  return new Error(`
    Redux-Witness :: invalid Redux action type.
    Action must be a string.
    Found: ${action}.
  `)
}

export function invalidEffectDelay (ms) {
  return new Error(`
    Redux-Witness :: invalid Effect retry(times, delay) delay.
    Retry delay must be a number.
    Found: ${ms}.
  `)
}

export function invalidEffectDebounce (ms) {
  return new Error(`
    Redux-Witness :: invalid Effect debounce(milliseconds).
    Debounce must be a number.
    Found: ${ms}.
  `)
}

export function invalidEffectRetry (times) {
  return new Error(`
    Redux-Witness :: invalid Effect retry(times, delay) times.
    Retry times must be a number.
    Found: ${times}.
  `)
}

export function invalidWatcher (creator) {
  return new Error(`
    Redux-Witness :: witness creator must be a function.
    Found: ${creator}.
  `)
}

export function invalidWatcherResult (result) {
  return new Error(`
    Redux-Witness :: witness creator must return a valid Effect.
    Found: ${result}.
  `)
}

export function invalidTakeMaybeHandler (handler) {
  return new Error(`
    Redux-Witness :: TAKE_MAYBE creator must be of type function.
    Found: ${handler}.
  `)
}

export function invalidWorkerResultType (type, nextType) {
  return new Error(`
    Redux-Witness :: Effects must return a different action "type" than the original side effect.
    Received: ${nextType} for action ${type}.
  `)
}

export function invalidWorkerResult (type, action) {
  return new Error(`
    Redux-Witness :: Effects must return a valid Redux action.
    Received: ${action} for action ${type}.
  `)
}

export function workerCatchThrown (effect, err) {
  const { message } = err
  const newMessage = `
    Redux-Witness :: an error occured in Effect ${effect}.
    This is likely not a problem with Witness but a problem with your watcher code.
    Error: ${message}.
  `
  set(err, message, newMessage)
  return err
}
