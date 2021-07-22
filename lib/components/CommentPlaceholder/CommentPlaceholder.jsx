import React from 'react'

function CommentPlaceholder () {
  return (
    <div className="comment-placeholder">
      <div className="comment-placeholder__left-col">
        <div className="comment-placeholder__row comment-placeholder__row--mask comment-placeholder__row--mask-frame" />
        <div className="comment-placeholder__avatar" />
        <div className="comment-placeholder__row comment-placeholder__row--mask comment-placeholder__row--mask-frame comment-placeholder__row--mask-frame-avatar" />
      </div>
      <div className="comment-placeholder__col-sep" />
      <div className="comment-placeholder__right-col">
        <div className="comment-placeholder__row comment-placeholder__row--mask comment-placeholder__row--mask-frame" />
        <div className="comment-placeholder__row comment-placeholder__row--mask" />
        <div className="comment-placeholder__row comment-placeholder__row--top" />
        <div className="comment-placeholder__row comment-placeholder__row--mask-top comment-placeholder__row--mask" />
        <div className="comment-placeholder__row comment-placeholder__row--mask comment-placeholder__row--mask-top-margin" />
        <div className="comment-placeholder__row" />
        <div className="comment-placeholder__row comment-placeholder__row--mask" />
        <div className="comment-placeholder__row" />
        <div className="comment-placeholder__row comment-placeholder__row--mask comment-placeholder__row--mask-frame" />
      </div>
    </div>
  )
}

export default CommentPlaceholder
