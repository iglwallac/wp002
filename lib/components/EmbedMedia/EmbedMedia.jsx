import PropTypes from 'prop-types'
import React from 'react'

function getClassName (className) {
  return ['embed-media'].concat(className || []).join(' ')
}

function getIframeClassName (iframeClass) {
  return ['embed-media__iframe']
    .concat(iframeClass || [])
    .join(' ')
}

function EmbedMedia (props) {
  const {
    embedType,
    src,
    width,
    height,
    className,
    iframeClass,
    frameBorder,
  } = props

  switch (embedType) {
    case 'soundcloud':
      return (
        <div className={getClassName(className)}>
          <iframe
            className={getIframeClassName(iframeClass)}
            src={src}
            width={width}
            height={height}
            frameBorder={frameBorder}
            scrolling="no"
            title="soundcloud"
          />
        </div>
      )
    case 'vimeo':
    case 'youtube':
    case 'facebook':
      return (
        <div className={getClassName(className)}>
          <iframe
            className={getIframeClassName(iframeClass)}
            src={src}
            width={width}
            height={height}
            frameBorder={frameBorder}
            title="other"
            allowFullScreen
          />
        </div>
      )
    default:
      return null
  }
}

EmbedMedia.propTypes = {
  embedType: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.array,
  iframeClass: PropTypes.array,
  frameBorder: PropTypes.string,
}

export default EmbedMedia
