import React from 'react'

function DetailPlaceholder () {
  return (
    <div className="detail-placeholder">
      <div className="detail-placeholder__top" />
      <div className="detail-placeholder__left">
        <div className="detail-placeholder__content" />
        <div className="detail-placeholder__content" />
        <div className="detail-placeholder__content" />
        <div className="detail-placeholder__content detail-placeholder__content--short" />
      </div>
      <div className="detail-placeholder__right" />
    </div>
  )
}

DetailPlaceholder.propTypes = {}

export default DetailPlaceholder
