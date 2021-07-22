import { INTERSTITIAL_LOADING } from './'

export const INTERSTITIAL_PREFLIGHT = 'INTERSTITIAL_PREFLIGHT'
export const INTERSTITIAL_REMOVE = 'INTERSTITIAL_REMOVE'
export const INTERSTITIAL_SET = 'INTERSTITIAL_SET'

export function setInterstitial (view = INTERSTITIAL_LOADING) {
  return {
    type: INTERSTITIAL_PREFLIGHT,
    payload: {
      remove: false,
      view,
    },
  }
}

export function removeInterstitial (view = null) {
  return {
    type: INTERSTITIAL_PREFLIGHT,
    payload: {
      remove: true,
      view,
    },
  }
}
