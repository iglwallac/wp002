import React from 'react'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'

const componentFromHTML = (html) => {
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
const OnDemandRibbon = ({ ribbonText, onClick }) => {
  return (
    <div className="live-page-ondemand-ribbon">
      <div className="live-page-ondemand-ribbon__text">
        {componentFromHTML(ribbonText)}
      </div>
      <div
        className="live-page-ondemand-ribbon__close"
        onClick={onClick}
      >
        <IconV2 type={ICON_TYPES.CLOSE} />
      </div>
    </div>
  )
}

export default OnDemandRibbon
