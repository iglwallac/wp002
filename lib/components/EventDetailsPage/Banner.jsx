import React from 'react'
import PropTypes from 'prop-types'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import {
  BASIC_CONTROLS,
  BASIC_CONTROL_OPTIONS_VOLUME,
} from 'components/DropInVideoPlayer/DropInVideoPlayer'
import { createPlayerSrc } from 'services/brightcove'

const Banner = ({ title, speaker, dateText,
  media, location, promoText, promoTextMobile }) =>
  (<div className="event-details-page-banner">
    {isNaN(media) ?
      (<div
        className="banner"
        style={{
          backgroundImage: `url(${media && media.split(',')[0]})`,
        }}
      >
        {promoText && (
          <div className="banner__promo hide-in-mobile">
            {promoText}
          </div>
        )}
        {promoTextMobile && (
          <div className="banner__promo hide-in-desktop">
            {promoTextMobile}
          </div>
        )}
        <div className="banner__overlay">
          <div className="banner__text-info">
            {speaker && (
              <div className="speaker">
                {speaker}
              </div>
            )}
            {title && (
              <div className="title">
                {title}
              </div>
            )}
            {dateText && (
              <div className="dates">
                {dateText} &bull; {location}
              </div>
            )}
          </div>
        </div>
      </div>) :
      (
        <DropInVideoPlayer
          autoplay
          loop
          playsinline
          controls={{
            type: BASIC_CONTROLS,
            visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME],
          }}
          mediaId={Number(media)}
          playerSrc={createPlayerSrc(1263232739001, media)}
        />
      )
    }
  </div>)

Banner.propTypes = {
  promoUrl: PropTypes.string.isRequired,
}

export default Banner
