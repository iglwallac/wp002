import React from 'react'

import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'

const RemovedContentOverlay = ({ staticText, undoHideContentHandler }) => {
  return (
    <div className="removed-content-overlay">
      <IconV2
        type={ICON_TYPES.HIDE_2}
      />
      {staticText.getIn(['data', 'removed'])}
      <a onClick={() => undoHideContentHandler()}>Undo</a>
    </div>
  )
}

export default compose(
  connectStaticText({ storeKey: 'tileHoverVideo' }),
)(RemovedContentOverlay)
