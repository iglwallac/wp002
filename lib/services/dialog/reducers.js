import { Map } from 'immutable'
import { getCurrentTime } from 'services/date-time'
import * as actions from './actions'

export const initialState = Map({
  componentName: null,
})

export default function (state = initialState, action) {
  switch (action.type) {
    // **********************
    // NEW MODAL CODE - USE THIS
    // **********************
    case actions.RENDER_MODAL:
      return state
        .set('componentName', action.payload.name)
        .set('asModal', true)
        /*
          TODO: This timestamp is set in order to trigger a re-render
          for any modals who rely on exogenous props to drive their state.
          We have discussed using a React Portal for the next iteration
        */
        .set(action.payload.name, getCurrentTime())
    case actions.REMOVE_MODAL:
    case actions.DISMISS_MODAL:
      return state
        .delete('componentName')
        .delete('closeOnClick')
        .delete('asModal')
        .delete(action.payload.name)
    // ********************
    // LEGACY CODE - DEPRICATED
    // ********************
    case actions.SET_DIALOG_OVERLAY_CLOSE:
      return state.set('closeOnClick', action.payload.closeOnClick)
    case actions.SET_DIALOG_COMPONENT_NAME:
      return state
        .set('componentName', action.payload.name)
        .set('asModal', false)
    case actions.SET_DIALOG_OPTIONS:
      return state.withMutations(mutateState => mutateState
        .setIn(['options', 'closeButtonColor'], action.payload.closeButtonColor)
        .setIn(['options', 'hideCloseButton'], action.payload.hideCloseButton))
        .setIn(['options', 'customClass'], action.payload.customClass)
    default:
      return state
  }
}
