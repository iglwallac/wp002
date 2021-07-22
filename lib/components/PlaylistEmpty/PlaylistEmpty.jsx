import React from 'react'
import { connect } from 'react-redux'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import Icon from 'components/Icon'
import ToolTip from 'components/ToolTip'
import Button from 'components/Button'

function PlaylistEmpty (props) {
  const { staticText } = props
  return (
    <div className="playlist-empty">
      <Sherpa type={TYPE_SMALL_BLUE} className={['playlist-empty__sherpa']} />
      <div className="playlist-empty__message">
        {staticText.getIn(['data', 'playlistEmpty'])}
      </div>
      <div className="playlist-empty__sep" />
      <div className="playlist-empty__add-playlist">
        <Icon
          iconClass={['icon--addtoplaylist', 'playlist-empty__playlist-icon']}
        />
        <span className="playlist-empty__add-playlist-text">
          {staticText.getIn(['data', 'addToPlaylist'])}
        </span>
      </div>
      <ToolTip
        visible
        className={['playlist-empty__tooltip']}
        containerClassName={['playlist-empty__tooltip-inner']}
        arrowClassName={[
          'tool-tip__arrow--left-top',
          'playlist-empty__tooltip-arrow',
        ]}
      >
        <div className="playlist-empty__tooltip-text">
          {staticText.getIn(['data', 'lookForThisIcon'])}
        </div>
        <Button
          buttonClass={['button--primary', 'button--stacked']}
          url={'/'}
          text={staticText.getIn(['data', 'startBrowsing'])}
        />
      </ToolTip>
    </div>
  )
}

export default connect(state => ({
  staticText: state.staticText.getIn(['data', 'playlistEmpty']),
}))(PlaylistEmpty)
