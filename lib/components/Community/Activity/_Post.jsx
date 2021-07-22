import { Button, TYPES as BUTTON_TYPES } from 'components/Button.v2'
import React, { useRef, useCallback, useState } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import * as selectors from 'services/community/selectors'
import { getTextWithLinks } from 'services/community'
import { ICON_TYPES } from 'components/Icon.v2'
import { TYPE_CONFIRM } from 'services/dialog'
import { fromNow } from 'services/date-time'
import { H4 } from 'components/Heading'
import PropTypes from 'prop-types'
import { List } from 'immutable'

import ReactionButton, { TYPES as REACTION_BUTTON_TYPES } from '../ReactionButton'
import CommunityForm, { TYPES as COMMUNITY_FORM_TYPES } from '../CommunityForm'
import PhotoGallery from '../PhotoGallery'
import CommentList from '../CommentList'
import OpenGraph from '../OpenGraph'
import Avatar from '../Avatar'


function onReturnFocus () {
  // TO DO: Solve forward ref problem
  return null
}

export default function Post (props) {
  const {
    highlightReaction,
    expandedComments,
    removeReaction,
    removeActivity,
    dismissModal,
    renderModal,
    addReaction,
    included,
    userUuid,
    data,
  } = props

  const comments = data.getIn(['relationships', 'children'], List())
  const graphs = selectors.selectActivityOpengraphs(data, included)
  const author = selectors.selectActivityAuthor(data, included)
  const images = selectors.selectActivityImages(data, included)
  const node = selectors.selectActivityNode(data, included)
  const feedId = selectors.selectActivityFeedId(included)
  const authorUuid = author.getIn(['data', 'userUuid'], '')
  const avatar = author.getIn(['data', 'avatar'], '')
  const activityDate = node.get('createdAt', '')
  const username = author.get('value', '')
  const activityUuid = node.get('uuid', '')
  const value = node.get('value', '')
  const type = node.get('type', '')
  const text = getTextWithLinks(value, graphs)
  const time = fromNow(activityDate)
  const $activityTop = useRef(null)

  const [expanded, expand] = useState(expandedComments)
  const [contracted, contract] = useState(false)

  const toggleExpandComments = useCallback(() => {
    if (expanded) contract(true)
    expand(!expanded)
  }, [expanded])

  const toggleReaction = useCallback(() => {
    const ownLike = node.getIn(['reactions', 'ownLike'], null)
    if (ownLike) {
      removeReaction({ activityUuid: ownLike, feedId })
    } else {
      addReaction({ uuid: activityUuid, type: 'LIKED', feedId })
    }
  }, [activityUuid, feedId, node])

  const deleteActivity = useCallback(() => {
    removeActivity({ activityId: activityUuid, type, feedId })
  }, [activityUuid, feedId, type])

  const renderDeleteConfirmModal = () => {
    renderModal(TYPE_CONFIRM, {
      confirmMessage: 'Are you sure you want to delete this post?',
      onConfirm: deleteActivity,
      onCancel: dismissModal,
      onReturnFocus,
      dismissModal,
    })
  }

  return (
    <li className="post" ref={$activityTop}>
      <div className="post__header">
        <Avatar
          className="post__avatar"
          image={avatar}
        />
        <div className="post__title">
          <H4 className="post__name">{username}</H4>
          <time className="post__time">{`${time} ago`}</time>
        </div>
        {authorUuid.match(userUuid) ? (
          <Button
            onClick={renderDeleteConfirmModal}
            className="post__delete"
            type={BUTTON_TYPES.ICON}
            icon={ICON_TYPES.CLOSE}
          />
        ) : null}
      </div>
      <div className="post__body">
        <div
          className="post__text"
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
            <ul className="post__ogs">
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
      <div className="post__footer">
        <div className="post__reactions">
          <ReactionButton
            kind={REACTION_BUTTON_TYPES.LIKE}
            toggleReaction={toggleReaction}
            node={node}
          />
          <ReactionButton
            toggleExpandComments={toggleExpandComments}
            kind={REACTION_BUTTON_TYPES.COMMENT}
            addReaction={addReaction}
            node={node}
            data={data}
            right
          />
        </div>
        <div className="post__footer__row-2">
          <CommunityForm
            toggleExpandComments={toggleExpandComments}
            type={COMMUNITY_FORM_TYPES.COMMENT}
            expandedComments={expanded}
            parent={activityUuid}
            feedId={feedId}
            photoUpload
            openGraph
          />
          <CommentList
            toggleExpandComments={toggleExpandComments}
            // starting with showcased comment for now
            startingCommentCount={contracted ? 0 : 1}
            highlightReaction={highlightReaction}
            removeReaction={removeReaction}
            removeActivity={removeActivity}
            dismissModal={dismissModal}
            expandedComments={expanded}
            activityRef={$activityTop}
            addReaction={addReaction}
            renderModal={renderModal}
            included={included}
            comments={comments}
            userUuid={userUuid}
            canReply
            viewMore
          />
        </div>
      </div>
    </li>
  )
}

Post.defaultProps = {
  expandedComments: false,
  highlightReaction: '',
}

Post.propTypes = {
  included: ImmutablePropTypes.list.isRequired,
  removeActivity: PropTypes.func.isRequired,
  removeReaction: PropTypes.func.isRequired,
  data: ImmutablePropTypes.map.isRequired,
  dismissModal: PropTypes.func.isRequired,
  addReaction: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  highlightReaction: PropTypes.string,
  expandedComments: PropTypes.bool,
  userUuid: PropTypes.string,
}

