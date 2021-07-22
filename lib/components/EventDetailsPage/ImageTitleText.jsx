import React, { useMemo } from 'react'

const ImageTitleText = ({ media, title, children }) => {
  const styles = useMemo(() => {
    return {
      backgroundImage: `url(${media})`,
      backgroundPosition: 'right',
      backgroundSize: 'cover',
    }
  }, [media])
  return (
    <div className="image-title-text">
      { media ? (
        <div
          className="image-title-text__media"
          style={styles}
        />
      ) : null}
      {title ? (
        <div className="image-title-text__title">
          {title}
        </div>
      ) : null}
      {children ? (
        <div className="image-title-text__text">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default ImageTitleText
