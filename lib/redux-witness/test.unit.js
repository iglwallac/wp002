import chai from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import { Promise as BluebirdPromise } from 'bluebird'
import createMiddleware from './middleware'
import { TYPES } from './effect'

const { assert } = chai

let middleware = null
let store = null

describe('redux-witness', () => {
  //
  beforeEach(() => {
    middleware = createMiddleware()
    store = {
      getState: () => ({}),
      dispatch: (action) => {
        if (middleware) {
          middleware(store)(() => {})(action)
        }
      },
    }
  })

  afterEach(() => {
    middleware.clear()
    middleware = null
    store = null
  })

  it('should create a valid BEFORE watcher for FAKE_ACTION_TYPE', () => {
    const type = 'FAKE_ACTION_TYPE'
    const fn = () => {}
    const watcher = function createWatcher ({ before }) {
      return before(type, fn)
    }

    middleware.run(watcher)

    const witness = middleware.getWitness()
    const effects = witness.getEffects(type, TYPES.BEFORE)
    assert.isArray(effects)
    assert.lengthOf(effects, 1)
    assert.hasAllKeys(effects[0], [
      'processing',
      'cancelled',
      'debounce',
      'onCatch',
      'handler',
      'action',
      'cancel',
      'async',
      'retry',
      'type',
      'when',
      'id',
    ])
    assert.isString(effects[0].type)
    assert.isFunction(effects[0].handler)
    assert(effects[0].type === TYPES.BEFORE)
    assert(effects[0].handler === fn)
  })

  it('should create a valid AFTER watcher for FAKE_ACTION_TYPE', () => {
    const type = 'FAKE_ACTION_TYPE'
    const fn = async () => {}
    const watcher = function watcher ({ after }) {
      return after(type, fn)
    }

    middleware.run(watcher)

    const witness = middleware.getWitness()
    const effects = witness.getEffects(type, TYPES.AFTER)
    assert.isArray(effects)
    assert.lengthOf(effects, 1)
    assert.hasAllKeys(effects[0], [
      'processing',
      'cancelled',
      'debounce',
      'onCatch',
      'handler',
      'action',
      'cancel',
      'async',
      'retry',
      'type',
      'when',
      'id',
    ])
    assert.isString(effects[0].type)
    assert.isFunction(effects[0].handler)
    assert(effects[0].type === TYPES.AFTER)
    assert(effects[0].handler === fn)
  })

  it('middleware should pass correct parameters to watchers', (done) => {
    const type = 'FAKE_ACTION_TYPE'
    const watcher = function watcher ({ after }) {
      return after(type, ({ action, dispatch, state, prevState }) => {
        assert.isFunction(dispatch)
        assert.isObject(prevState)
        assert.isObject(state)
        assert(action.type === type)
        done()
      })
    }
    middleware.run(watcher)
    middleware(store)(() => {})({ type })
  })

  it('should only fire one watcher for takeFirst', (done) => {
    let timesFired = 0
    const type = 'FAKE_ACTION_TYPE'
    const doStuff = () => new BluebirdPromise((resolve) => {
      setTimeout(() => {
        timesFired += 1
        resolve(timesFired)
      }, 100)
    })
    const watcher = function watcher ({ takeFirst }) {
      return takeFirst(type, async () => {
        const fired = await doStuff()
        assert(fired === 1)
        done()
        return { type: 'OTHER_ACTION' }
      })
    }
    middleware.run(watcher)
    const middlewareDispatch = middleware(store)(() => {})
    middlewareDispatch({ type })
    middlewareDispatch({ type })
    middlewareDispatch({ type })
    middlewareDispatch({ type })
  })

  it('should only fire one watcher for takeLatest', (done) => {
    const TYPE_WATCHER = 'FAKE_INPUT_ACTION'
    const TYPE_LISTENER = 'FAKE_OUTPUT_ACTION'

    let timesFired = 0

    const doStuff = () => new BluebirdPromise((resolve) => {
      setTimeout(() => { resolve() }, 100)
    })

    const watcher = function watcher ({ takeLatest }) {
      return takeLatest(TYPE_WATCHER, async () => {
        await doStuff()
        return { type: TYPE_LISTENER }
      })
    }

    const listener = function listener ({ after }) {
      return after(TYPE_LISTENER, () => {
        timesFired += 1
        assert(timesFired === 1)
        done()
      })
    }

    middleware.run(watcher, listener)

    const middlewareDispatch = middleware(store)(() => {})
    middlewareDispatch({ type: TYPE_WATCHER })
    middlewareDispatch({ type: TYPE_WATCHER })
    middlewareDispatch({ type: TYPE_WATCHER })
    middlewareDispatch({ type: TYPE_WATCHER })
  })

  it('should only fire one watcher for takeMaybe', (done) => {
    let timesFired = 0
    const type = 'FAKE_ACTION_TYPE'
    const watcher = function watcher ({ takeMaybe }) {
      return takeMaybe(type, () => {
        timesFired += 1
        if (timesFired > 3) {
          return () => {
            done()
            return { type: 'OTHER_TYPE' }
          }
        }
        return false
      })
    }

    middleware.run(watcher)

    const middlewareDispatch = middleware(store)(() => {})
    middlewareDispatch({ type })
    middlewareDispatch({ type })
    middlewareDispatch({ type })
    middlewareDispatch({ type })
  })
})
