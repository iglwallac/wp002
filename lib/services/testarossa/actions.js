
export const TESTAROSSA_SET_INITIAL_STATE = 'TESTAROSSA_SET_INITIAL_STATE'
export const TESTAROSSA_SET_INITIALIZED = 'TESTAROSSA_SET_INITIALIZED'
export const TESTAROSSA_SET_PROCESSING = 'TESTAROSSA_SET_PROCESSING'
export const TESTAROSSA_SET_CONTEXT = 'TESTAROSSA_SET_CONTEXT'
export const TESTAROSSA_SET_RECORDS = 'TESTAROSSA_SET_RECORDS'
export const TESTAROSSA_SET_FAILURE = 'TESTAROSSA_SET_FAILURE'
export const TESTAROSSA_SET_SHUTDOWN = 'TESTAROSSA_SET_SHUTDOWN'

export function setInitialState (state) {
  return {
    type: TESTAROSSA_SET_INITIAL_STATE,
    payload: { state },
  }
}

export function setInitialized (initialized) {
  return {
    type: TESTAROSSA_SET_INITIALIZED,
    payload: { initialized },
  }
}

export function setRecords (records) {
  return {
    type: TESTAROSSA_SET_RECORDS,
    payload: { records },
  }
}

export function setContext (context) {
  return {
    type: TESTAROSSA_SET_CONTEXT,
    payload: { context },
  }
}
