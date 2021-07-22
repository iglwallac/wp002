import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useState } from 'react'
import Lightbox from 'react-images'

/**
 * @type {React.ReactElement}
 * @param {Object} props The props
 * @param {import('immutable').List} props.images A list of images
 * @param {Function} props.openLightbox A function to open lightbox
 */

function PhotoGalleryGallery (props) {
  const { images, openLightbox } = props
  return (
    images.slice(0, 5).map((image, i) => (
      <div
        className={`photo-gallery__img ${
          i === 4 && images.size > 5 ? 'photo-gallery__img--last' : ''
        }`}
        onClick={() => openLightbox(i)}
        key={`image-${image}`}
      >
        <img
          className={'photo-gallery__image'}
          src={image.get('value')}
          alt={`${i}`}
        />
        {i === 4 && images.size > 5 ? (
          <p>{images.size - 4} more</p>
        ) : null}
      </div>
    ))
  )
}
export default function PhotoGallery (props) {
  const { images } = props
  const [lightboxIsOpen, toggleLightboxIsOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  let multiImage = ''
  if (images.size > 1) {
    multiImage = 'photo-gallery__multi-image'
  }

  const getImages = pics =>
    pics.map(pic => ({
      src: pic.get('value'),
    })).toJS()

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

  return (
    <div className={`photo-gallery ${multiImage}`}>
      <PhotoGalleryGallery images={images} openLightbox={openLightbox} />
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
  )
}

PhotoGallery.propTypes = {
  images: ImmutablePropTypes.list.isRequired,
}
