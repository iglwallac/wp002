import { Map, List } from 'immutable'
import * as actions from './actions'

function getHideWatchedList (state) {
  return state.get('data', List())
}

function isInHideWatchedList (state, id) {
  return getHideWatchedList(state).some(e => e.id === id)
}

function addToHideWatchedList (state, id, title) {
  return getHideWatchedList(state).push({ id, title })
}

function removeFromHideWatchedList (state, id) {
  return getHideWatchedList(state).filter(x => x.id !== id)
}

function updateHideWatchedList (state, payload) {
  const { id, title } = payload
  const updatedHideWatched = isInHideWatchedList(state, id) ?
    removeFromHideWatchedList(state, id) :
    addToHideWatchedList(state, id, title)
  return state.set('data', updatedHideWatched)
}

function editHideWatched (state) {
  return state.withMutations((mutableState) => {
    mutableState
      .set('editMode', true)
      .set('saveDone', false)
  })
}

function cancelEditHideWatched (state) {
  return state.withMutations((mutableState) => {
    mutableState
      .delete('data')
      .delete('editMode')
  })
}

function doneSaveHideWatched (state) {
  return state.withMutations((mutableState) => {
    mutableState
      .delete('data')
      .delete('editMode')
      .set('saveDone', true)
  })
}

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.ADD_REMOVE_HIDE_WATCHED:
      return updateHideWatchedList(state, action.payload)
    case actions.EDIT_HIDE_WATCHED:
      return editHideWatched(state)
    case actions.CANCEL_EDIT_HIDE_WATCHED:
      return cancelEditHideWatched(state)
    case actions.DONE_SAVE_HIDE_WATCHED:
      return doneSaveHideWatched(state)
    default:
      return state
  }
}
