import PropTypes from 'prop-types'
import React from 'react'
import SocialButton, { eventTypeTwitter, eventTypeFacbook, SOCIAL_BUTTON_TYPES, SOCIAL_BUTTON_SIZES } from 'components/SocialButton'

function SocialSharingButtons (props) {
  const { facebookUrl, twitterUrl, eventTracking } = props
  return (
    <div className="social-sharing-buttons">
      <SocialButton
        size={SOCIAL_BUTTON_SIZES.MEDIUM}
        url={facebookUrl}
        openShareWindow
        type={SOCIAL_BUTTON_TYPES.FACEBOOK}
        eventTrackingType={eventTracking ? eventTypeFacbook : undefined}
      />
      <SocialButton
        size={SOCIAL_BUTTON_SIZES.MEDIUM}
        url={twitterUrl}
        openShareWindow
        type={SOCIAL_BUTTON_TYPES.TWITTER}
        eventTrackingType={eventTracking ? eventTypeTwitter : undefined}
      />
    </div>
  )
}

SocialSharingButtons.propTypes = {
  facebookUrl: PropTypes.string.isRequired,
  twitterUrl: PropTypes.string.isRequired,
  eventTracking: PropTypes.bool,
}

export default SocialSharingButtons
