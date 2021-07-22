import React from 'react'
import PropTypes from 'prop-types'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import {
  BASIC_CONTROLS,
  BASIC_CONTROL_OPTIONS_VOLUME,
} from 'components/DropInVideoPlayer/DropInVideoPlayer'

const Banner = ({ title, description, button,
  playerSrc, mediaId }) => {
  return (
    <div className="live-access-page__banner">
      <DropInVideoPlayer
        autoplay
        loop
        playsinline
        controls={{
          type: BASIC_CONTROLS,
          visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME],
        }}
        mediaId={mediaId}
        playerSrc={playerSrc}
      />
      <div className="live-access-page__banner__overlay">
        <div className="live-access-page__banner__text-container">
          <div className="live-access-page__banner__title">
            {title}
          </div>
          <div className="live-access-page__banner__description">
            {description}
          </div>
        </div>
        <div className="live-access-page__banner__cta-container">
          {button}
        </div>
      </div>
    </div>
  )
}

Banner.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  playerSrc: PropTypes.string.isRequired,
}

export default Banner
