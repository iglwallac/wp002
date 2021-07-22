import React from 'react'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { H3, H2 } from 'components/Heading'

function componentFromHTML (html) {
  // eslint-disable-next-line react/no-danger
  return <p dangerouslySetInnerHTML={{ __html: html }} />
}

const EmptyWatchHistory = ({ staticText }) => (
  <div className="watch-history__empty-screen">
    <div className="watch-history__title-container">
      <H2 className="watch-history__title">{staticText.getIn(['data', 'title'])}</H2>
    </div>
    <div className="watch-history__empty-text-container">
      <div className="watch-history__empty-icon">
        <IconV2 type={ICON_TYPES.UNEXPLAINED} />
      </div>
      <div className="watch-history__empty-text">
        <H3>{staticText.getIn(['data', 'emptyTitle'])}</H3>
        {componentFromHTML(staticText.getIn(['data', 'emptyText']))}
      </div>
    </div>
  </div>
)

export default EmptyWatchHistory
