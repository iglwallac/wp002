import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class Avatar extends PureComponent {
  render () {
    const { size, image, alt, rounded, circle, className } = this.props
    const cls = className ? `${className} raf-avatar` : 'raf-avatar'
    const style = size ? { width: `${size}px`, height: `${size}px` } : {}
    return (
      <React.Fragment>
        {image ?
          <img
            className={`${cls}${rounded ? ' raf-avatar--rounded' : ''}${circle ? ' raf-avatar--circle' : ''}`}
            alt={alt || ''}
            style={style}
            src={image}
          /> :
          <div style={style} className={`${cls} raf-avatar--default-image`} />
        }
      </React.Fragment>
    )
  }
}

Avatar.propTypes = {
  size: PropTypes.number,
  image: PropTypes.string,
  alt: PropTypes.string,
  rounded: PropTypes.bool,
  circle: PropTypes.bool,
}
