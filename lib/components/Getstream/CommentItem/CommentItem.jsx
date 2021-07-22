import { Button, TYPES as BUTTON_TYPES, SIZES } from 'components/Button.v2'
import ReactionButton from 'components/Getstream/ReactionButton'
import Avatar from 'components/Getstream/Avatar'
import { ICON_TYPES } from 'components/Icon.v2'
import { TYPE_CONFIRM } from 'services/dialog'
import React, { PureComponent } from 'react'
import { fromNow } from 'services/date-time'

export default class CommentItem extends PureComponent {
  onClickUser = () => {
    const { onClickUser } = this.props
    if (onClickUser) {
      return onClickUser(this._user())
    }
    return null
  };

  _user = () => {
    const { user } = this.props.comment
    return user
  };

  _getOnClickUser () {
    return this.props.onClickUser ? this.onClickUser : undefined
  }

  deleteComment = () => {
    const { props } = this
    const { removeReaction, activity, comment, dismissModal } = props
    removeReaction({ activity, userReaction: comment })
    dismissModal()
  }

  renderConfirmDeleteModal = () => {
    const { props, deleteComment } = this
    const { renderModal, dismissModal } = props
    renderModal(TYPE_CONFIRM, {
      confirmMessage: 'Are you sure you want to delete this comment?',
      onConfirm: deleteComment,
      onCancel: dismissModal,
      dismissModal,
    })
  }

  render () {
    const {
      onToggleChildReaction,
      onToggleReaction,
      highlight,
      activity,
      comment,
      userId,
    } = this.props

    const createdAt = comment.created_at
    const date = new Date(createdAt)
    const time = fromNow(date)

    let className = 'comment-item raf-comment-item'

    if (highlight) {
      className += ' comment-item--highlight'
    }

    return (
      <div className={className}>
        <div className="raf-comment-item__col-1">
          <Avatar
            image={comment.user.data.profileImage}
            size={40}
            circle
          />
        </div>
        <div className="raf-comment-item__col-2">
          <div className="raf-comment-item__content">
            <div className="comment-item__top">
              <div
                onClick={this._getOnClickUser()}
                className={'comment-item__author raf-comment-item__author'}
              >
                {comment.user.data.name}
              </div>
              <div className="comment-item__date">
                {`${time} ago`}
              </div>
              {comment.user_id === userId ? (
                <Button
                  onClick={this.renderConfirmDeleteModal}
                  className="comment-item__delete"
                  type={BUTTON_TYPES.ICON}
                  icon={ICON_TYPES.CLOSE}
                  size={SIZES.XSMALL}
                />
              ) : null}
            </div>
            <div className="comment-item__text raf-comment-item__text">
              {comment.data.text}
            </div>
          </div>
          <div className="raf-comment-item__footer">
            <ReactionButton
              showCount
              activity={activity}
              onToggleChildReaction={onToggleChildReaction}
              onToggleReaction={onToggleReaction}
              kind={'like'}
              reaction={comment}
              userId={userId}
            />
          </div>
        </div>
      </div>
    )
  }
}
