import PropTypes from 'prop-types'
import React from 'react'
import Link from 'components/Link'

function getBackgroundImage (image) {
  const style = {
    backgroundImage: `url(${image})`,
  }
  return style
}

function TileSubcategory (props) {
  const {
    title,
    image,
    url,
  } = props

  return (
    <div className="tile-subcategory">
      <Link
        style={getBackgroundImage(image)}
        className="tile-subcategory__link"
        to={url}
      >
        <span className="tile-subcategory__title">
          { title }
        </span>
      </Link>
    </div>
  )
}

TileSubcategory.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
}

export default TileSubcategory
