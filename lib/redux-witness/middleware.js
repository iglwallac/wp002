import Witness from './witness'
import { TYPES } from './effect'

// exporting this instead of just the 'middleware'
// so that you could create multiple stores with multiple witness'
export default function createMiddleware () {
  // this is our global effects store.
  // we create one for each middleware instance
  let witness = new Witness()
  // this is our main redux middleware function
  const middleware = function middleware (store) {
    // old school garbage collection trigger:
    // wipe our our store when  page unloads to
    // make sure garbage collection occurs quickly
    if (global && global.addEventListener) {
      global.addEventListener('unload', () => {
        witness.clear()
        witness = null
      })
    }

    return next => (action) => {
      // get the current action type
      const { type } = action
      // only do this if we have an action type.
      // redux-thunk (for instance) returns no action type,
      // and we don't want to mess with stuff like that.
      if (type) {
        // make state and dispatch available
        const { dispatch, getState } = store
        const state = getState()
        // This only occurs if we are using watchers that explicitly
        // declare restrictions with side-effects and actions (ie: TAKE_FIRST)
        // if we HAD effects but they were all filtered out,
        // we should not continue. This means we set only TAKE_FIRST effect(s)
        // and it is currently in progress.
        if (witness.isProcessing(type)) {
          return
        }
        // dispatch any 'before' effects we might have
        witness.dispatchEffects(type, TYPES.BEFORE, {
          dispatch, action, state, getState,
        })
        // dispatch any primary effects we may have.
        // primary workers are wokers created by takeEvery, takeMaybe, takeFirst, and takeLatest
        // because we are not specifying a 'type' here,
        // Witness will dispatch all types except side-effect types (BEFORE/AFTER)
        witness.dispatchEffects(type, null, {
          dispatch, action, state, getState,
        })
        // redux's next()
        next(action)
        // finally, dispatch any 'after' effects we might have
        witness.dispatchEffects(type, TYPES.AFTER, {
          state: getState(), prevState: state, getState, dispatch, action,
        })
        return
      }
      // we didn't recieve an action type.
      // could be a Thunk pattern...
      next(action)
    }
  }
  // standard hook for adding watchers.
  // most redux libraries name this function 'run'
  // and we're going to do the same to keep similarity
  middleware.run = (...watchers) => {
    witness.createWatchers(watchers)
  }
  // add hook for retrieving the witness instance
  middleware.getWitness = () => {
    return witness
  }
  // add hook to wipe out store if needed
  middleware.clear = () => {
    witness.clear()
  }
  // return the middleware to be used with redux.
  // it should be passed into the applyMiddleware() function
  return middleware
}
