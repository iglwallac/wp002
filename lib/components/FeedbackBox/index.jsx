import React from 'react'

import IconV2, { ICON_TYPES } from 'components/Icon.v2'

export const FEEDBACK_BOX_TYPES = {
  ERROR: 'error',
  INFO: 'info',
  SUCESS: 'success',
  WARNING: 'warning',
}

export default function FeedbackBox ({ type = 'info', children }) {
  return (
    <div className={`feedback-box ${type}`}>
      <IconType type={type} />
      <span className="feedback-box__text">
        {children}
      </span>
    </div>
  )
}

function IconType ({ type }) {
  let iconType = ''
  switch (type) {
    case FEEDBACK_BOX_TYPES.SUCESS:
      iconType = ICON_TYPES.CIRCULAR_CHECK
      break
    case FEEDBACK_BOX_TYPES.ERROR:
      iconType = ICON_TYPES.CIRCULAR_ERROR
      break
    case FEEDBACK_BOX_TYPES.WARNING:
      iconType = ICON_TYPES.HIDE_2
      break
    case FEEDBACK_BOX_TYPES.INFO:
      iconType = ICON_TYPES.INFO
      break
    default:
      break
  }
  return (
    <IconV2 type={iconType} />
  )
}
