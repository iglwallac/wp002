import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Lightbox from 'react-images'
// Using import of getstream's implementation of Gallery
// Part 2 of this work will phase out using react-images and create a new gallery

function PhotoGallery ({ images }) {
  const [lightboxIsOpen, toggleLightboxIsOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  let multiImage = ''
  if (images.length > 1) {
    multiImage = 'multi-image'
  }

  const getImages = pics =>
    pics.map(pic => ({
      src: pic,
    }))

  const gotoPrevious = () => {
    setCurrentImage(currentImage - 1)
  }

  const gotoNext = () => {
    setCurrentImage(currentImage + 1)
  }

  const openLightbox = (imageNumber) => {
    toggleLightboxIsOpen(true)
    setCurrentImage(imageNumber)
  }

  const closeLightbox = () => {
    toggleLightboxIsOpen(false)
    setCurrentImage(0)
  }

  const renderGallery = () => {
    return (
      images.slice(0, 5).map((image, i) => (
        <div
          className={`img ${
            i === 4 && images.length > 5 ? 'img--last' : ''
          }`}
          onClick={() => openLightbox(i)}
          key={`image-${image}`}
        >
          <img src={image} className={'raf-gallery__image'} alt={`${i}`} />
          <React.Fragment>
            {i === 4 && images.length > 5 ? (
              <p>{images.length - 4} more</p>
            ) : null}
          </React.Fragment>
        </div>
      ))
    )
  }

  return (
    <React.Fragment>
      <div className={`raf-gallery ${multiImage}`}>
        {renderGallery()}
        <Lightbox
          backdropClosesModal
          images={getImages(images)}
          isOpen={lightboxIsOpen}
          onClickPrev={gotoPrevious}
          onClickNext={gotoNext}
          onClose={closeLightbox}
          currentImage={currentImage}
        />
      </div>
    </React.Fragment>
  )
}

PhotoGallery.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
}

export default PhotoGallery
