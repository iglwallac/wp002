import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import _partial from 'lodash/partial'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'
import { truncate } from 'theme/web-app'
import UserAvatar from 'components/UserAvatar'
import CommentAdminMenu from 'components/CommentAdminMenu'
import CommentEdit from 'components/CommentEdit'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import { connect } from 'react-redux'

const MAX_COMMENT_LENGTH = 400

function shouldTruncate (comment) {
  return _size(comment.get('comment', '')) > MAX_COMMENT_LENGTH
}

export function injectBetweenItems (items, insert) {
  return _reduce(
    items,
    (reduction, item, index) => {
      const insertIndex = (index * 2) + 1
      if (insertIndex < _size(items)) {
        reduction.splice(insertIndex, 0, insert(insertIndex))
      }
      return reduction
    },
    items,
  )
}

function renderTextNewLine (comment, insertIndex) {
  return <br key={`comment-br-${comment.get('cid')}-${insertIndex}`} />
}

export function renderTextRead (props, state, setTruncated) {
  const { comment, commentStaticText } = props
  const { truncated } = state
  const commentText =
    shouldTruncate(comment) && truncated
      ? truncate(comment.get('comment'), MAX_COMMENT_LENGTH)
      : comment.get('comment')
  const text = commentText ? injectBetweenItems(
    commentText.split(/\n/),
    _partial(renderTextNewLine, comment),
  ) : ''
  return (
    <p className="comment__text">
      {text}
      {shouldTruncate(comment) ? (
        <Link
          to={URL_JAVASCRIPT_VOID}
          className="comment__truncate"
          onClick={_partial(setTruncated, !truncated)}
        >
          {truncated
            ? commentStaticText.getIn(['data', 'more'])
            : commentStaticText.getIn(['data', 'less'])}
        </Link>
      ) : null}
    </p>
  )
}

class Comment extends PureComponent {
  constructor (props) {
    super(props)
    const { comment } = props
    this.state = {
      truncated: shouldTruncate(comment),
      edit: false,
    }
  }

  setEdit = (edit) => {
    this.setState(() => ({ edit }))
  }

  setTruncated = (truncated) => {
    this.setState(() => ({ truncated }))
  }

  render () {
    const { props, state, setTruncated, setEdit } = this
    const { data, comment, auth, saveComment } = props
    const { edit } = state

    return (
      <article className="comment">
        <UserAvatar
          path={comment.get('picture', null)}
          className={['comment__avatar']}
        />
        <div className="comment__body">
          <header className="comment__header">
            <div className="comment__title">{comment.get('registered_name')}</div>
            <span className="comment__timestamp">
              {comment.get('createdDateTimeText')}
            </span>
            {auth.get('jwt') && auth.get('uid') === comment.get('uid') ? (
              <CommentAdminMenu
                auth={auth}
                comment={comment}
                onClickEdit={_partial(setEdit, !edit)}
              />
            ) : null}
          </header>
          {edit ? (
            <CommentEdit
              comment={comment}
              data={data}
              auth={auth}
              saveComment={saveComment}
              onSubmitComplete={_partial(setEdit, false)}
            />
          ) : (
            renderTextRead(props, state, setTruncated)
          )}
        </div>
      </article>
    )
  }
}

Comment.propTypes = {
  data: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  comment: ImmutablePropTypes.map.isRequired,
  saveComment: PropTypes.func.isRequired,
  commentStaticText: ImmutablePropTypes.map.isRequired,
}

Comment.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(state => ({
  commentStaticText: state.staticText.getIn(['data', 'comment'], Map()),
}))(Comment)
