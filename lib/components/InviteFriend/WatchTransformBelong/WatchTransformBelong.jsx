import React from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import _map from 'lodash/map'
import _split from 'lodash/split'
import { H5, H2, HEADING_TYPES } from 'components/Heading'

function WatchTransformBelong (props) {
  const { staticText } = props
  const inviteFriendBcUrl = 'https://players.brightcove.net/1263232739001/vyQ2gupfk_default/index.html?videoId=6162003692001'

  const formatMessage = (titleString) => {
    const titleWords = _split(titleString, '.', 3)
    return _map(titleWords, titleItem => (
      <span key={titleItem}>{titleItem.concat('.')}</span>
    ))
  }

  const renderSubTitle = () => {
    return (
      <H5 as={HEADING_TYPES.H6}>
        {staticText.getIn(['data', 'subTitleWatchTransformBelong'])}
      </H5>
    )
  }

  const renderTitle = () => {
    return (
      <H2 className="watch-transform-belong__title">
        {formatMessage(staticText.getIn(['data', 'titleWatchTransformBelong']))}
      </H2>
    )
  }

  const renderVideo = () => {
    return (
      <div className="watch-transform-belong__iframe" >
        <iframe
          title="Watch Transform Belong Video"
          src={inviteFriendBcUrl}
          frameBorder="0"
          allowFullScreen
          className="watch-transform-belong__iframe--video"
        />
      </div>
    )
  }

  return (
    <div className="watch-transform-belong">
      <div className="watch-transform-belong__section-video">
        {renderVideo()}
      </div>
      <div className="watch-transform-belong__section-text">
        {renderTitle()}
        {renderSubTitle()}
      </div>
    </div>
  )
}

WatchTransformBelong.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
}

export default connect(
  state => ({
    staticText: state.staticText.getIn(['data', 'watchTransformBelong']),
  }),
)(WatchTransformBelong)
