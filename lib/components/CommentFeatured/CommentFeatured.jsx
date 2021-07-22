import PropTypes from 'prop-types'
import React from 'react'
import _isArray from 'lodash/isArray'
import { truncate } from 'theme/web-app'

function CommentFeatured (props) {
  const { comment, author, commentLength, commentFeaturedClass } = props
  const itemClass = _isArray(commentFeaturedClass)
    ? commentFeaturedClass.join(' ')
    : commentFeaturedClass
  return (
    <div
      className={
        itemClass ? `comment-featured ${itemClass}` : 'comment-featured'
      }
    >
      <q className="comment-featured__comment">
        {truncate(comment, commentLength)}
      </q>
      <span className="comment-featured__author">{` - ${author}`}</span>
    </div>
  )
}

CommentFeatured.propTypes = {
  commentFeaturedClass: PropTypes.array,
  comment: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  commentLength: PropTypes.number.isRequired,
}

export default CommentFeatured
