import React from 'react'
import PropTypes from 'prop-types'

export const ICON_STYLES = {
  OUTLINE: 'outline',
  FILL: 'fill',
  TEAL_CIRCLE: 'teal-circle',
}

export const ICON_TYPES = {
  AIRPLAY: 'airplay',
  ALERT: 'alert',
  ALERT_OUTLINE: 'alert-outline',
  ARROW_DOWN: 'arrow-down',
  ARROW_DOWN_OUTLINE: 'arrow-down-outline',
  ARROW_UP: 'arrow-up',
  ARROW_UP_OUTLINE: 'arrow-up-outline',
  ARTICLE: 'article',
  BELL: 'bell',
  BELL_OFF: 'bell-off',
  ORIGINS: 'origins',
  BODY: 'body',
  BROWSE: 'browse',
  CAMERA: 'camera',
  CHECK: 'check',
  CHECK_ACTIVE: 'check-active',
  CHECKBOX_CHECKED: 'checkbox-checked',
  CHEVRON_DOWN: 'chevron-down',
  CHEVRON_LEFT: 'chevron-left',
  CHEVRON_RIGHT: 'chevron-right',
  CHEVRON_UP: 'chevron-up',
  CLOCK: 'clock',
  CLOCK_FILL: 'clock-fill',
  CLOSE: 'close',
  CLOSE_2: 'close-2',
  COLLAPSE: 'collapse',
  COMMENT: 'comment',
  COMMENT_OUTLINE: 'comment-outline',
  CONSCIOUSNESS: 'consciousness',
  COPY: 'copy',
  DELETE: 'delete',
  DOWNLOAD: 'download',
  ELLIPSIS: 'ellipsis',
  EMBED: 'embed',
  EMAIL: 'email',
  EPISODES: 'episodes',
  EXPAND: 'expand',
  EYE: 'eye',
  FLAG: 'flag',
  FRIENDS: 'friends',
  GROWTH: 'growth',
  GUIDE: 'guide',
  HEADPHONES: 'headphones',
  HEALING: 'healing',
  HEART: 'heart',
  HEART_OFF: 'heart-off',
  HEART_FILL: 'heart-fill',
  HEART_OUTLINE: 'heart-outline',
  HIDE: 'hide',
  HIDE_2: 'hide-2',
  HOME: 'home',
  HOURGLASS: 'hourglass',
  INFO: 'info',
  LIBRARY: 'library',
  LINK: 'link',
  LOGIN: 'login',
  LOGOUT: 'logout',
  MEDICINE: 'medicine',
  MENU: 'menu',
  METAPHYSICS: 'metaphysics',
  MIC: 'mic',
  MIND: 'mind',
  MINUS: 'minus',
  PENCIL: 'pencil',
  PHONE: 'phone',
  PLAY: 'play',
  PLAY_CIRCLE: 'play-circle',
  PLUS: 'plus',
  PREVIEW: 'preview',
  RECOMMEND: 'recommend',
  RENAME: 'rename',
  SACRED: 'sacred',
  SCHEDULE: 'schedule',
  SEARCH: 'search',
  SECRETS: 'secrets',
  SHARE: 'share',
  STAR_FILL: 'star-fill',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  PINTEREST: 'pinterest',
  REDDIT: 'reddit',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  SPIRIT: 'spirit',
  TV: 'tv',
  UNEXPLAINED: 'unexplained',
  YOGA: 'yoga',
  WEBSITE: 'link',
  PRINTER: 'printer',
  PDF: 'pdf',
  CIRCULAR_ADD: 'circular-add',
  CIRCULAR_BELL_OFF: 'circular-bell-off',
  CIRCULAR_CHECK: 'circular-check',
  CIRCULAR_CHEVRON_LEFT: 'circular-chevron-left',
  CIRCULAR_CHEVRON_RIGHT: 'circular-chevron-right',
  CIRCULAR_COMMENTS: 'circular-comments',
  CIRCULAR_DETAILS: 'circular-details',
  CIRCULAR_ERROR: 'circular-error',
  CIRCULAR_EXPAND: 'circular-expand',
  CIRCULAR_MINIMIZE: 'circular-minimize',
  CIRCULAR_REMOVE: 'circular-remove',
  CIRCULAR_FOLLOW_BELL: 'circular-follow_bell',
  CIRCULAR_PLAY: 'circular-play',
  CIRCULAR_PREVIEW: 'circular-preview',
  CIRCULAR_SERIES: 'circular-series',
  CIRCULAR_SHARE: 'circular-share',
}

function getClass (props) {
  const { type, style, className } = props
  const cls = ['icon-v2']
  if (type) cls.push(`icon-v2--${type}`)
  if (style) cls.push(`icon-v2--${style}`)
  if (className) cls.push(className)
  return cls.join(' ')
}

function IconV2 (props) {
  const { onClick, iconStyle = {} } = props
  return (
    <span
      className={getClass(props)}
      role="presentation"
      onClick={onClick}
      style={iconStyle}
    />
  )
}

IconV2.propTypes = {
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
  style: PropTypes.oneOf([
    ICON_STYLES.OUTLINE,
    ICON_STYLES.FILL,
    ICON_STYLES.TEAL_CIRCLE,
  ]),
  onClick: PropTypes.func,
}

export default React.memo(IconV2)
