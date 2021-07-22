import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'

function getSources (sources) {
  return sources.map(item => (
    <source src={item.get('src')} type={item.get('type')} key={item.get('src')} />),
  )
}

function getTracks (tracks) {
  return tracks.map(item => (
    <track
      kind={item.get('kind')}
      src={item.get('src')}
      srcLang={item.get('srclang')}
      label={item.get('label')}
      key={item.get('src')}
    />
  ))
}

class VideoBasic extends React.Component {
  componentWillUnmount () {
    const props = this.props
    if (props.onComponentWillUnmount) props.onComponentWillUnmount()
  }

  /* eslint-disable jsx-a11y/media-has-caption */
  render () {
    const props = this.props
    const style = { display: props.videoVisible === false ? 'none' : null }
    return (
      <video
        ref={c => props.onVideoComponentReady && props.onVideoComponentReady(c)}
        id={props.id}
        style={style}
        className={
          props.classNameVideo ? props.classNameVideo.toArray().join(' ') : null
        }
        poster={props.poster}
        preload="none"
        controls
      >
        {getSources(props.sources)}
        {props.tracks ? getTracks(props.tracks) : null}
      </video>
    )
  }
  /* eslint-enable jsx-a11y/media-has-caption */
}

VideoBasic.propTypes = {
  id: PropTypes.string,
  classNameVideo: ImmutablePropTypes.list,
  sources: ImmutablePropTypes.list.isRequired,
  tracks: ImmutablePropTypes.list,
  onVideoComponentReady: PropTypes.func,
  onComponentWillUnmount: PropTypes.func,
  videoVisible: PropTypes.bool,
}

export default VideoBasic
