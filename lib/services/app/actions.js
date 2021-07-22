import { BOOTSTRAP_PHASE_POST_RENDER, BOOTSTRAP_PHASE_COMPLETE } from './'

export const SET_APP_BOOTSTRAP_PHASE = 'SET_APP_BOOTSTRAP_PHASE'
export const SET_APP_SCROLLABLE = 'SET_APP_SCROLLABLE'
export const SET_APP_VIEWPORT = 'SET_APP_VIEWPORT'
export const SET_APP_HEADER = 'SET_APP_HEADER'
export const SET_APP_FOOTER = 'SET_APP_FOOTER'
export const SET_APP_ROUTES = 'SET_APP_ROUTES'

export function setAppBootstrapPhase (phase) {
  return {
    type: SET_APP_BOOTSTRAP_PHASE,
    payload: {
      isComplete: phase === BOOTSTRAP_PHASE_POST_RENDER
        || phase === BOOTSTRAP_PHASE_COMPLETE,
      phase,
    },
  }
}

export function setAppViewport (payload) {
  return {
    type: SET_APP_VIEWPORT,
    payload,
  }
}

export function setAppScrollable (bool = true) {
  return {
    type: SET_APP_SCROLLABLE,
    payload: !!bool,
  }
}

export function enableHeader (bool = true) {
  return {
    type: SET_APP_HEADER,
    payload: !!bool,
  }
}

export function enableFooter (bool = true) {
  return {
    type: SET_APP_FOOTER,
    payload: !!bool,
  }
}

export function enableRoutes (bool = true) {
  return {
    type: SET_APP_ROUTES,
    payload: !!bool,
  }
}
