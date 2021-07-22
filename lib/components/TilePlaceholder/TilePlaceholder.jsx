import React from 'react'

function TilePlaceholder () {
  return (
    <div className="tile-placeholder">
      <div className="tile-placeholder__hero" />
      <div className="tile-placeholder__text" />
      <div className="tile-placeholder__text" />
    </div>
  )
}

export default React.memo(TilePlaceholder)
