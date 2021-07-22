export const SET_MESSAGE_BOX_VISIBLE = 'SET_MESSAGE_BOX_VISIBLE'
export const SET_MESSAGE_BOX_TYPE = 'SET_MESSAGE_BOX_TYPE'
export const SET_MESSAGE_BOX_VIEWED = 'SET_MESSAGE_BOX_VIEWED'

export function setMessageBoxVisible (visible) {
  return {
    type: SET_MESSAGE_BOX_VISIBLE,
    payload: visible,
  }
}

export function setMessageBoxViewed (viewed = true) {
  return {
    type: SET_MESSAGE_BOX_VIEWED,
    payload: viewed,
  }
}

export function setMessageBoxType (
  type,
  messageType,
  visible = true,
  persistent = false,
) {
  return {
    type: SET_MESSAGE_BOX_TYPE,
    payload: {
      type,
      messageType,
      visible,
      persistent,
    },
  }
}
