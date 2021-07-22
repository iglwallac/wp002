import React from 'react'
import { H3, HEADING_TYPES } from 'components/Heading'

const SettingHeader = ({ title, children }) => {
  return (
    <div className="setting-header">
      <H3 as={HEADING_TYPES.H4} className="setting-header__title">
        {title}
      </H3>
      {/* eslint-disable-next-line react/no-danger */}
      <p className="setting-header__description" dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  )
}

export default SettingHeader
