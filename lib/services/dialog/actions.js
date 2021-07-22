export const SET_DIALOG_COMPONENT_NAME = 'SET_DIALOG_COMPONENT_NAME'
export const SET_DIALOG_OPTIONS = 'SET_DIALOG_OPTIONS'
export const SET_DIALOG_OVERLAY_CLOSE = 'SET_DIALOG_OVERLAY_CLOSE'
export const RENDER_MODAL = 'RENDER_MODAL'
export const REMOVE_MODAL = 'REMOVE_MODAL'
export const DISMISS_MODAL = 'DISMISS_MODAL'

export function renderModal (name, props) {
  return {
    type: RENDER_MODAL,
    payload: { name, props },
  }
}

export function removeModal (name) {
  return {
    type: REMOVE_MODAL,
    payload: { name },
  }
}

export function dismissModal (clickedOverlay) {
  return {
    type: DISMISS_MODAL,
    payload: { clickedOverlay },
  }
}

export function setOverlayCloseOnClick (closeOnClick) {
  return {
    type: SET_DIALOG_OVERLAY_CLOSE,
    payload: { closeOnClick },
  }
}

export function setDailogComponentName (name) {
  return {
    type: SET_DIALOG_COMPONENT_NAME,
    payload: { name },
  }
}

export function setOverlayDialogVisible (name) {
  return {
    type: SET_DIALOG_COMPONENT_NAME,
    payload: { name },
  }
}

export function setDialogOptions (closeButtonColor, hideCloseButton = false, customClass) {
  return {
    type: SET_DIALOG_OPTIONS,
    payload: {
      closeButtonColor,
      hideCloseButton,
      customClass,
    },
  }
}
