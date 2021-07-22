import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import Button from 'components/Button'

function getButtonText (props) {
  const { comment } = props
  const count = comment.get('children', List()).size
  const repliesTruncated = comment.get('repliesTruncated', true)
  if (repliesTruncated) {
    return `View all replies (${count})`
  }
  return `Hide all replies (${count})`
}

function handleOnClick (props) {
  const { comment, setCommentRepliesTruncated } = props
  if (_isFunction(setCommentRepliesTruncated)) {
    setCommentRepliesTruncated(comment, !comment.get('repliesTruncated', true))
  }
}

function CommentThreadViewActions (props) {
  const { comment, buttonClass } = props
  const repliesTruncated = comment.get('repliesTruncated', true)
  const count = comment.get('children', List()).size
  if (count <= 2) {
    return null
  }
  return (
    <Button
      buttonClass={['comment-thread-view-actions'].concat(buttonClass)}
      onClick={_partial(handleOnClick, props)}
      text={getButtonText(repliesTruncated, count)}
    />
  )
}

CommentThreadViewActions.propTypes = {
  comment: ImmutablePropTypes.map.isRequired,
  setCommentRepliesTruncated: PropTypes.func,
}

export default CommentThreadViewActions
