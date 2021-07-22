import PropTypes from 'prop-types'
import React from 'react'
import Icon from 'components/Icon'

function getClassName (props) {
  const className = ['video-player-meta-more']

  if (props.visible) className.push('video-player-meta-more--visible')

  return className.join(' ')
}

function getWrapperClassName (visible) {
  const className = ['video-player-meta-more__wrapper']
  if (visible) {
    className.push('video-player-meta-more__wrapper--visible')
  }
  return className.join(' ')
}

function onClick (e, props) {
  e.stopPropagation()
  if (props.onClick) props.onClick(e)
}

function VideoPlayerMetaMore (props) {
  const { visible, description } = props
  return (
    <div className={getClassName(props)} onClick={e => e.stopPropagation()}>
      <Icon
        iconClass={['video-player-meta-more__icon', 'icon--dots']}
        onClick={e => onClick(e, props)}
      />
      <div className={getWrapperClassName(visible)}>
        <p className="video-player-meta-more__content">{description}</p>
      </div>
    </div>
  )
}

VideoPlayerMetaMore.propTypes = {
  description: PropTypes.string,
  visible: PropTypes.bool,
  onClick: PropTypes.func,
}

export default VideoPlayerMetaMore
