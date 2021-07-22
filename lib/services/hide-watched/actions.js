
export const HIDE_WATCHED_QUEUE = 'HIDE_WATCHED_QUEUE'
export const ADD_REMOVE_HIDE_WATCHED = 'ADD_REMOVE_HIDE_WATCHED'
export const EDIT_HIDE_WATCHED = 'EDIT_HIDE_WATCHED'
export const CANCEL_EDIT_HIDE_WATCHED = 'CANCEL_EDIT_HIDE_WATCHED'
export const SAVE_HIDE_WATCHED = 'SAVE_HIDE_WATCHED'
export const DONE_SAVE_HIDE_WATCHED = 'DONE_SAVE_HIDE_WATCHED'

export function addOrRemoveHideWatched ({ id, title }) {
  return { type: ADD_REMOVE_HIDE_WATCHED, payload: { id, title } }
}

export function editHideWatched () {
  return { type: EDIT_HIDE_WATCHED }
}

export function cancelEditHideWatched () {
  return { type: CANCEL_EDIT_HIDE_WATCHED }
}

export function saveHideWatched () {
  return { type: SAVE_HIDE_WATCHED }
}

