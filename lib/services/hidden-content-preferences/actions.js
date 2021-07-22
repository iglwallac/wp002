export const GET_HIDDEN_CONTENT = 'GET_HIDDEN_CONTENT'
export const SET_HIDDEN_CONTENT = 'SET_HIDDEN_CONTENT'
export const HIDE_CONTENT = 'HIDE_CONTENT'
export const UNHIDE_CONTENT = 'UNHIDE_CONTENT'
export const SET_HIDDEN_CONTENT_ADD = 'SET_HIDDEN_CONTENT_ADD'
export const SET_HIDDEN_CONTENT_REMOVE = 'SET_HIDDEN_CONTENT_REMOVE'
export const SET_HIDDEN_CONTENT_PROCESSING = 'SET_HIDDEN_CONTENT_PROCESSING'

export function getHiddenContent (options) {
  return {
    type: GET_HIDDEN_CONTENT,
    payload: options,
  }
}

export function hideContent (content) {
  return {
    type: HIDE_CONTENT,
    payload: content,
  }
}

export function unhideContent ({ id, contentId }) {
  return {
    type: UNHIDE_CONTENT,
    payload: { id, contentId },
  }
}
