import ReactionButton, { TYPES as REACTION_BUTTON_TYPES } from 'components/Community/ReactionButton'
import { Button, TYPES as BUTTON_TYPES, SIZES } from 'components/Button.v2'
import React, { useCallback, useState, useRef } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import * as selectors from 'services/community/selectors'
import { getTextWithLinks } from 'services/community'
import { ICON_TYPES } from 'components/Icon.v2'
import { TYPE_CONFIRM } from 'services/dialog'
import { fromNow } from 'services/date-time'
import PropTypes from 'prop-types'
import { List } from 'immutable'

import CommunityForm from '../CommunityForm'
import PhotoGallery from '../PhotoGallery'
import CommentList from '../CommentList'
import OpenGraph from '../OpenGraph'
import Avatar from '../Avatar'

function getClass (highlightReaction, activityUuid, published) {
  const cls = ['comment']
  if (highlightReaction === activityUuid) cls.push('comment--highlight')
  if (!published) cls.push('comment--unpublished')
  return cls.join(' ')
}

function onReturnFocus () {
  // TO DO: Solve forward ref problem
  return null
}

export default function Comment (props) {
  const {
    highlightReaction,
    removeActivity,
    removeReaction,
    dismissModal,
    renderModal,
    addReaction,
    userUuid,
    canReply,
    included,
    data,
  } = props

  const comments = data.getIn(['relationships', 'children'], List())
  const graphs = selectors.selectActivityOpengraphs(data, included)
  const author = selectors.selectActivityAuthor(data, included)
  const images = selectors.selectActivityImages(data, included)
  const node = selectors.selectActivityNode(data, included)
  const feedId = selectors.selectActivityFeedId(included)

  const ownLike = node.getIn(['reactions', 'ownLike'], null)
  const authorUuid = author.getIn(['data', 'userUuid'], '')
  const avatar = author.getIn(['data', 'avatar'], '')
  const activityDate = node.get('createdAt', '')
  const published = node.get('published', false)
  const username = author.get('value', '')
  const activityUuid = node.get('uuid', '')
  const value = node.get('value', '')
  const type = node.get('type', '')
  const text = getTextWithLinks(value, graphs)
  const date = new Date(activityDate)
  const $commentTop = useRef(null)
  const time = fromNow(date)

  const highlightedPresent = !!comments.find(c => c.get('uuid') === highlightReaction)
  const [replyFormVisible, toggleForm] = useState(highlightedPresent)
  const [expanded, expand] = useState(highlightedPresent)

  const toggleExpandComments = useCallback(() => {
    expand(!expanded)
  }, [expanded])

  const toggleReplyFormVisible = useCallback(() => {
    toggleForm(!replyFormVisible)
  }, [replyFormVisible])

  const toggleReaction = useCallback(() => {
    if (ownLike) {
      removeReaction({ activityUuid: ownLike, feedId })
    } else {
      addReaction({ uuid: activityUuid, type: 'LIKED', feedId })
    }
  }, [ownLike, feedId, activityUuid])

  const deleteComment = useCallback(() => {
    removeActivity({ activityId: activityUuid, type, feedId })
    dismissModal()
  }, [activityUuid, type, feedId])

  const renderConfirmDeleteModal = useCallback(() => {
    renderModal(TYPE_CONFIRM, {
      confirmMessage: 'Are you sure you want to delete this comment?',
      onConfirm: deleteComment,
      onCancel: dismissModal,
      onReturnFocus,
      dismissModal,
    })
  }, [])

  return (
    <li className={getClass(highlightReaction, activityUuid, published)} ref={$commentTop}>
      <div className="comment__col-1">
        <Avatar
          className="comment__avatar"
          image={avatar}
        />
      </div>
      <div className="comment__col-2">
        <div className="comment__content">
          <div className="comment__top">
            <div
              className={'comment__author'}
            >
              {username}
            </div>
            <div className="comment__date">
              {`${time} ago`}
            </div>
            {authorUuid === userUuid ? (
              <Button
                onClick={published ? renderConfirmDeleteModal : null}
                className="comment__delete"
                type={BUTTON_TYPES.ICON}
                icon={ICON_TYPES.CLOSE}
                size={SIZES.XSMALL}
              />
            ) : null}
          </div>
          <div
            className="comment__text"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: text }}
          />
          {images && images.size > 0
            ? <PhotoGallery
              images={images}
            />
            : null}
          {graphs && graphs.size > 0
            ? (
              <ul className="comment__ogs">
                {graphs.map(graph => (
                  graph.getIn(['data', 'render']) ? (
                    <OpenGraph
                      description={graph.getIn(['data', 'description'])}
                      image={graph.getIn(['data', 'image', 'url'])}
                      title={graph.getIn(['data', 'title'])}
                      url={graph.getIn(['data', 'url'])}
                      key={graph.get('uuid')}
                      verified
                    />
                  ) : null
                ))}
              </ul>
            ) : null}
        </div>
        <div className="comment__footer">
          <ReactionButton
            kind={REACTION_BUTTON_TYPES.LIKE}
            toggleReaction={published ? toggleReaction : null}
            node={node}
          />
          {canReply && published
            ? (
              <Button
                onClick={toggleReplyFormVisible}
                className="comment__reply"
              >
                &nbsp;&#8226; Reply
              </Button>
            ) : null}
          {comments && comments.size > 0 ? <ReactionButton
            toggleExpandComments={toggleExpandComments}
            kind={REACTION_BUTTON_TYPES.COMMENT}
            addReaction={addReaction}
            node={node}
            data={data}
            right
          /> : null}
          {canReply && replyFormVisible && published ? (
            <CommunityForm
              toggleExpandComments={toggleExpandComments}
              expandedComments={expanded}
              parent={activityUuid}
              feedId={feedId}
              type="COMMENT"
              photoUpload
              openGraph
            />
          ) : null}
        </div>
        {expanded && comments && comments.size > 0 ? (
          <div className="comment__replies">
            <CommentList
              toggleExpandComments={toggleExpandComments}
              highlightReaction={highlightReaction}
              removeReaction={removeReaction}
              removeActivity={removeActivity}
              dismissModal={dismissModal}
              expandedComments={expanded}
              activityRef={$commentTop}
              addReaction={addReaction}
              renderModal={renderModal}
              startingCommentCount={0}
              included={included}
              comments={comments}
              userUuid={userUuid}
            />
          </div>
        ) : null}
      </div>
    </li>
  )
}

Comment.defaultProps = {
  highlightReaction: '',
}

Comment.propTypes = {
  included: ImmutablePropTypes.list.isRequired,
  removeActivity: PropTypes.func.isRequired,
  removeReaction: PropTypes.func.isRequired,
  dismissModal: PropTypes.func.isRequired,
  data: ImmutablePropTypes.map.isRequired,
  addReaction: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  highlightReaction: PropTypes.string,
  userUuid: PropTypes.string,
  canReply: PropTypes.bool,
}
