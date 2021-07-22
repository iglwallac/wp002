import PropTypes from 'prop-types'
import React from 'react'
import { compose } from 'recompose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import VideoRow from 'components/DetailPageV2/VideoRow'
import { H6, HEADING_TYPES } from 'components/Heading'

function DetailRelatedVideos (props) {
  const {
    location,
    storeKey,
    clearOpenShelfRowId,
    setShelfOpen,
    openShelfRowId,
    staticText,
  } = props

  return (
    <div className="detail-related-videos">
      <H6 as={HEADING_TYPES.H3} className="detail-related-videos__title">
        {staticText.getIn(['data', 'othersYouMightLike'])}
      </H6>
      <VideoRow
        storeKey={storeKey}
        location={location}
        clearOpenShelfRowId={clearOpenShelfRowId}
        setShelfOpen={setShelfOpen}
        openShelfRowId={openShelfRowId}
      />
      <div className="detail-related-videos__background" />
    </div>
  )
}

DetailRelatedVideos.propTypes = {
  location: PropTypes.object.isRequired,
  storeKey: PropTypes.string.isRequired,
  openShelfRowId: PropTypes.string,
  setShelfOpen: PropTypes.func.isRequired,
  clearOpenShelfRowId: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'detailRelatedVideos' }),
)(DetailRelatedVideos)
