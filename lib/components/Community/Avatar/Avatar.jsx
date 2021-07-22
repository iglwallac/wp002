import React from 'react'
import PropTypes from 'prop-types'

export default function Avatar (props) {
  const {
    className,
    image,
    alt,
  } = props
  const cls = className ? `${className} avatar` : 'avatar'
  return (
    <React.Fragment>
      {image ?
        <img
          className={cls}
          alt={alt || ''}
          src={image}
        /> :
        <div className={`${cls} avatar__default-image`} />
      }
    </React.Fragment>
  )
}

Avatar.propTypes = {
  image: PropTypes.string,
  alt: PropTypes.string,
}
