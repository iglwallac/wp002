import React from 'react'
import DropInVideoPlayer from 'components/DropInVideoPlayer'
import {
  BASIC_CONTROLS,
  BASIC_CONTROL_OPTIONS_VOLUME,
} from 'components/DropInVideoPlayer/DropInVideoPlayer'
import { createPlayerSrc } from 'services/brightcove'

const PromoVideoBanner = ({ title, speaker, dateText,
  media, promoUrl }) => {
  return isNaN(media) ?
    (<div
      className="event-details-page__promo-video-banner__background"
      style={{
        backgroundImage: `url(${media && media.split(',')[0]})`,
      }}
    >
      <div className="event-details-page__promo-video-banner">
        {speaker ?
          <div className="event-details-page__promo-video-banner__speaker-date">
            {speaker} &bull; {dateText}
          </div>
          :
          <div className="event-details-page__promo-video-banner__speaker-date">
            {dateText}
          </div>
        }
        {title &&
          <div className="event-details-page__promo-video-banner__event-title">
            {title}
          </div>
        }
        <DropInVideoPlayer
          autoplay
          loop
          playsinline
          controls={{
            type: BASIC_CONTROLS,
            visibleControls: [BASIC_CONTROL_OPTIONS_VOLUME],
          }}
          mediaId={Number(media)}
          playerSrc={promoUrl}
        />
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

export default PromoVideoBanner
