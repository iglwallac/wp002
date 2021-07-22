import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Loading, { LOADING_ICON_WHITE_BG_BLACK } from 'components/Loading'

function getClassName (props) {
  const { visible } = props
  const className = ['video-player-spinner']
  if (visible) {
    className.push('video-player-spinner--visible')
  }
  return className.join(' ')
}

function getStylePoster (props) {
  const { video } = props
  const style = {}
  const poster = video.getIn(['data', 'poster'])
  if (poster) {
    style.backgroundImage = `url(${poster})`
  }
  return style
}

function VideoPlayerSpinner (props) {
  return (
    <div className={getClassName(props)}>
      <div className="video-player-spinner__icon">
        <Loading visible icon={LOADING_ICON_WHITE_BG_BLACK} />
      </div>
      <div className="video-player-spinner__mask" />
      <div
        className="video-player-spinner__poster"
        style={getStylePoster(props)}
      />
    </div>
  )
}

VideoPlayerSpinner.propTypes = {
  visible: PropTypes.bool,
  video: ImmutablePropTypes.map.isRequired,
}

VideoPlayerSpinner.defaultProps = {
  visible: true,
}

export default VideoPlayerSpinner
