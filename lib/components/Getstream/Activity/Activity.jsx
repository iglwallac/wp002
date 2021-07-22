import get from 'lodash/get'
import map from 'lodash/map'
import PropTypes from 'prop-types'
import { Map } from 'immutable'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'
import React, { useRef, useState, useCallback } from 'react'
import { StreamReactionForm, REACTION_KINDS } from 'components/Getstream/StreamForm'
import { Button, TYPES as BUTTON_TYPES } from 'components/Button.v2'
import ReactionButton from 'components/Getstream/ReactionButton'
import CommentsList from 'components/Getstream/CommentsList'
import PhotoGallery from 'components/Getstream/PhotoGallery'
import OpenGraph from 'components/Getstream/OpenGraph'
import Avatar from 'components/Getstream/Avatar'
import { ICON_TYPES } from 'components/Icon.v2'
import { TYPE_CONFIRM } from 'services/dialog'
import { fromNow } from 'services/date-time'
import { H4 } from 'components/Heading'

function Activity (props) {
  const {
    setEventUserInteraction,
    onToggleChildReaction,
    highlightReaction,
    onToggleReaction,
    expandComments,
    removeActivity,
    feedComments,
    dismissModal,
    renderModal,
    activity,
    userId,
  } = props

  const avatar = get(activity, ['actor', 'data', 'profileImage'])
  const images = get(activity, ['attachments', 'images'])
  const name = get(activity, ['actor', 'data', 'name'])
  const graphs = get(activity, ['attachments', 'og'])
  const actorsId = get(activity, ['actor', 'id'])
  const text = get(activity, ['text'])
  const activityId = get(activity, ['id'])
  const activityDate = get(activity, ['time'])
  const ownReactions = get(activity, ['own_reactions'])
  const reactionCounts = get(activity, ['reaction_counts'])
  const commentCount = feedComments.get(activityId, []).length
  const localDate = new Date(activityDate)
  const date = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000))
  const time = fromNow(date)

  const $activityTop = useRef(null)

  const [removed, removeActivityFromFeed] = useState(false)
  const [expanded, expand] = useState(expandComments)

  const toggleExpandComments = useCallback(() => {
    expand(!expanded)
  }, [expanded])

  const toggleLike = useCallback(() => {
    const options = { targetFeeds: [`notification:${activity.actor.id}`] }
    onToggleReaction('like', activity, {}, options)
    setEventUserInteraction({
      label: activityId,
      category: 'community',
      action: 'favorite',
    })
  }, [activityId, activity])

  const deleteActivity = useCallback(() => {
    removeActivityFromFeed(true)
    removeActivity({ activity, feedId: actorsId, feedGroup: 'user' })
  }, [activity, actorsId])

  const renderDeleteConfirmModal = useCallback(() => {
    renderModal(TYPE_CONFIRM, {
      confirmMessage: 'Are you sure you want to delete this post?',
      onConfirm: deleteActivity,
      onCancel: dismissModal,
      dismissModal,
    })
  }, [deleteActivity])

  if (removed) { // todo: add flag to state
    return null
  }

  return (
    <div className="activity" ref={$activityTop}>
      <div className="activity__header">
        <Avatar
          className="activity__avatar"
          image={avatar}
          circle
        />
        <div className="activity_title">
          <H4 className="activity__name">{name}</H4>
          <time className="activity__time">{`${time} ago`}</time>
        </div>
        {actorsId.match(userId) ? (
          <Button
            onClick={renderDeleteConfirmModal}
            className="activity__delete"
            type={BUTTON_TYPES.ICON}
            icon={ICON_TYPES.CLOSE}
          />
        ) : null}
      </div>
      <div className="activity__body">
        <div className="activity__text">
          {text}
        </div>
        {images && images.length > 0
          ? <PhotoGallery
            images={images}
          />
          : null}
        {graphs && graphs.length > 0
          ? (
            <ul className="activity__ogs">
              {map(graphs, graph => (
                graph.render ? (
                  <OpenGraph
                    image={get(graph, 'image.image') || get(graph, 'image.url')}
                    description={get(graph, 'description')}
                    title={get(graph, 'title')}
                    url={get(graph, 'url')}
                    key={get(graph, 'id')}
                    verified
                  />
                ) : null
              ))}
            </ul>
          ) : null}
      </div>
      <div className="flatfeed-footer">
        <div className="flatfeed-footer__row-1">
          <ReactionButton
            onToggleReaction={toggleLike}
            reaction_counts={reactionCounts}
            own_reactions={ownReactions}
            activity={activity}
            kind={'like'}
            showCount
          />
          <ReactionButton
            onPressOverride={toggleExpandComments}
            reaction_counts={reactionCounts}
            own_reactions={ownReactions}
            commentCount={commentCount}
            onToggleReaction={() => {}}
            activity={activity}
            kind={'comment'}
            showCount
          />
        </div>
        <div className="flatfeed-footer__row-2">
          <StreamReactionForm
            targetFeeds={[`notification:${actorsId}`]}
            kind={REACTION_KINDS.COMMENT}
            label="Share your thoughts..."
            activityId={activityId}
            feedGroup="user"
            feedId={userId}
            openGraph
          />
          <CommentsList
            onToggleChildReaction={onToggleChildReaction}
            toggleExpandComments={toggleExpandComments}
            highlightReaction={highlightReaction}
            onToggleReaction={onToggleReaction}
            activityRef={$activityTop}
            expanded={expanded}
            activity={activity}
          />
        </div>
      </div>
    </div>
  )
}

Activity.defaultProps = {
  expandComments: false,
  highlightReaction: '',
}

Activity.propTypes = {
  setEventUserInteraction: PropTypes.func.isRequired,
  removeActivity: PropTypes.func.isRequired,
  dismissModal: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  highlightReaction: PropTypes.string,
  profileImage: PropTypes.string,
  expandComments: PropTypes.bool,
}

export default connectRedux(({ getstream }) => ({
  feedComments: getstream.get('feedComments', Map()),
}), (dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    setEventUserInteraction: actions.eventTracking.setEventUserInteraction,
  }
},
)(Activity)
