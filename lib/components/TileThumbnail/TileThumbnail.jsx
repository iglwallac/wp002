import PropTypes from 'prop-types'
import React from 'react'
import compose from 'recompose/compose'
import pure from 'recompose/pure'
import Link from 'components/Link'
import _isArray from 'lodash/isArray'

function getBackgroundImage (image) {
  const style = {
    backgroundImage: `url('${image}')`,
  }
  return style
}

function getClassName (props) {
  const { className, galleryEven, galleryOdd } = props
  const baseClassName = 'tile-thumbnail'
  const classes = [baseClassName]
  if (galleryEven) {
    classes.push(`${baseClassName}--gallery-even`)
  }
  if (galleryOdd) {
    classes.push(`${baseClassName}--gallery-odd`)
  }
  return classes.concat(_isArray(className) ? className : []).join(' ')
}

function TileThumbnail (props) {
  const { image, url } = props

  if (!image && !url) {
    return (
      <div className={getClassName(props)}>
        <div className="tile-thumbnail__placeholder-wrapper">
          <div className="tile-thumbnail__placeholder" />
        </div>
      </div>
    )
  }

  return (
    <div className={getClassName(props)}>
      <div className="tile-thumbnail__link-wrapper">
        <Link
          className="tile-thumbnail__link"
          to={url}
          style={getBackgroundImage(image)}
        />
      </div>
    </div>
  )
}

TileThumbnail.propTypes = {
  className: PropTypes.array,
  image: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  galleryEven: PropTypes.bool,
  galleryOdd: PropTypes.bool,
}

export default compose(pure)(TileThumbnail)
