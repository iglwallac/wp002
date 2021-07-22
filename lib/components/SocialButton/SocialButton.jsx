import PropTypes from 'prop-types'
import React from 'react'
import Link, { URL_JAVASCRIPT_VOID, TARGET_BLANK, TARGET_SELF } from 'components/Link'
import { isYoga, isFitness, isVideo, isSeries } from 'services/url'
import IconV2 from 'components/Icon.v2'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { partial as _partial } from 'lodash'
import { openWindow } from 'services/share'
import {
  TYPE_CONTENT_VIDEO_YOGA,
  TYPE_CONTENT_VIDEO_FITNESS,
  TYPE_CONTENT_VIDEO_MEDITATION,
  TYPE_CONTENT_EPISODE_YOGA,
  TYPE_CONTENT_EPISODE_FITNESS,
  TYPE_CONTENT_EPISODE_MEDITATION,
  TYPE_CONTENT_SEGMENT_YOGA,
  TYPE_CONTENT_SEGMENT_FITNESS,
  TYPE_CONTENT_SEGMENT_MEDITATION,
  TYPE_CONTENT_SERIES_YOGA,
  TYPE_CONTENT_SERIES_FITNESS,
  TYPE_CONTENT_SERIES_MEDITATION,
  TYPE_CONTENT_SEGMENTED_YOGA,
  TYPE_CONTENT_SEGMENTED_FITNESS,
  TYPE_CONTENT_SEGMENTED_MEDITATION,
} from 'services/content-type'

export const SOCIAL_BUTTON_SIZES = {
  XSMALL: 'xsmall',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
}

function isYogaContent (contentType, pathname) {
  let yogaContent = false

  if (isYoga(pathname) || isFitness(pathname)) {
    yogaContent = true
  } else if (isVideo(pathname) || isSeries(pathname)) {
    switch (contentType) {
      case TYPE_CONTENT_VIDEO_YOGA:
      case TYPE_CONTENT_VIDEO_FITNESS:
      case TYPE_CONTENT_VIDEO_MEDITATION:
      case TYPE_CONTENT_EPISODE_YOGA:
      case TYPE_CONTENT_EPISODE_FITNESS:
      case TYPE_CONTENT_EPISODE_MEDITATION:
      case TYPE_CONTENT_SEGMENT_YOGA:
      case TYPE_CONTENT_SEGMENT_FITNESS:
      case TYPE_CONTENT_SEGMENT_MEDITATION:
      case TYPE_CONTENT_SERIES_YOGA:
      case TYPE_CONTENT_SERIES_FITNESS:
      case TYPE_CONTENT_SERIES_MEDITATION:
      case TYPE_CONTENT_SEGMENTED_YOGA:
      case TYPE_CONTENT_SEGMENTED_FITNESS:
      case TYPE_CONTENT_SEGMENTED_MEDITATION:
        yogaContent = true
        break
      default:
        yogaContent = false
    }
  } else {
    yogaContent = false
  }

  return yogaContent
}

function getFacebookUrl (contentType, pathName) {
  return isYogaContent(
    contentType,
    pathName,
    isYoga,
    isFitness,
  )
    ? 'https://www.facebook.com/yogaongaia'
    : 'https://www.facebook.com/gaia'
}

function getTwitterUrl (contentType, pathName) {
  return isYogaContent(
    contentType,
    pathName,
    isYoga,
    isFitness,
  )
    ? 'https://www.twitter.com/yogaongaia'
    : 'https://www.twitter.com/yourmothergaia'
}

function getInstagramUrl (contentType, pathName) {
  return isYogaContent(
    contentType,
    pathName,
    isYoga,
    isFitness,
  )
    ? 'https://www.instagram.com/yogaongaia'
    : 'https://www.instagram.com/wearegaia'
}

function getPinterestUrl (contentType, pathName) {
  return isYogaContent(
    contentType,
    pathName,
    isYoga,
    isFitness,
  )
    ? 'https://www.pinterest.com/yogaongaia'
    : 'https://www.pinterest.com/wearegaia/'
}

function getUrlWithType (type, contentType, pathName) {
  switch (type) {
    case SOCIAL_BUTTON_TYPES.FACEBOOK:
      return getFacebookUrl(contentType, pathName)
    case SOCIAL_BUTTON_TYPES.TWITTER:
      return getTwitterUrl(contentType, pathName)
    case SOCIAL_BUTTON_TYPES.INSTAGRAM:
      return getInstagramUrl(contentType, pathName)
    case SOCIAL_BUTTON_TYPES.YOUTUBE:
      return 'https://www.youtube.com/user/gaiamtv'
    case SOCIAL_BUTTON_TYPES.PINTEREST:
      return getPinterestUrl(contentType, pathName)
    default:
      return null
  }
}

function getClass (size, type) {
  return size === 'large' // || size === 'small'
    ? `social-button--${size} social-button__${type}`
    : `social-button--${size}`
}

export const eventTypeTwitter = 'Twitter'
export const eventTypeFacbook = 'Facebook'

export const SOCIAL_BUTTON_TYPES = {
  EMBED: 'embed',
  EMAIL: 'email',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  REDDIT: 'reddit',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  PINTEREST: 'pinterest',
  WEBSITE: 'website',
}

function socialButtonOnClick (e, props) {
  const {
    openShareWindow,
    onClick,
    url,
  } = props


  if (onClick) {
    e.preventDefault()
    onClick(e)
  }

  if (url) {
    openWindow(e, openShareWindow, url)
  }
}

function SocialButton (props) {
  const { size, type, target, onClick, contentType, pathName, to } = props
  const url = onClick ? null : to || getUrlWithType(type, contentType, pathName)
  return (
    <Link
      role={url ? 'link' : 'button'}
      to={url || URL_JAVASCRIPT_VOID}
      target={target === TARGET_SELF ? null : target}
      onClick={!onClick ? _partial(socialButtonOnClick, _partial.placeholder, props) : onClick}
      className="social-button"
    >
      <div className={getClass(size, type)}>
        <IconV2 type={type} />
      </div>
      <span className="assistive">{type}</span>
    </Link>
  )
}

SocialButton.defaultProps = {
  target: TARGET_BLANK,
}

SocialButton.propTypes = {
  eventTrackingType: PropTypes.string,
  auth: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  size: PropTypes.oneOf([
    SOCIAL_BUTTON_SIZES.XSMALL,
    SOCIAL_BUTTON_SIZES.SMALL,
    SOCIAL_BUTTON_SIZES.MEDIUM,
    SOCIAL_BUTTON_SIZES.LARGE,
  ]),
  contentType: PropTypes.string,
  pathName: PropTypes.string,
  to: PropTypes.string,
  target: PropTypes.oneOf([
    TARGET_BLANK,
    TARGET_SELF,
  ]),
}

const memoizedButton = React.memo(SocialButton)

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
    }),
  ),
)(memoizedButton)
