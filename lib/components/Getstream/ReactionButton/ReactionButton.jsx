import React from 'react'
import { LikeButton as GetstreamLikeButton } from 'react-activity-feed'
import _findIndex from 'lodash/findIndex'
import ReactionToggleIcon from '../ReactionToggleIcon/ReactionToggleIcon'

export default class ReactionButton extends GetstreamLikeButton {
  _onPress = () => {
    const {
      activity,
      reaction,
      onToggleReaction,
      onToggleChildReaction,
      kind,
    } = this.props

    if (reaction) {
      return onToggleChildReaction({ kind, reaction })
    }

    const options = { targetFeeds: [`notification:${activity.actor.id}`] }
    return onToggleReaction(kind, activity, {}, options)
  };

  render () {
    const {
      reaction_counts, // eslint-disable-line camelcase
      own_reactions, // eslint-disable-line camelcase
      reaction,
      commentCount,
      showCount,
      labelActive,
      labelInactive,
      kind,
      onPressOverride,
      userId,
      className,
    } = this.props
    let ownReactions = {}
    let ownReaction = false
    let counts
    const onPress = onPressOverride || this._onPress
    // TODO: This needs to no longer merge getstream and gaia toggle logic
    // Having to handle two completely different ways of handling reactions
    // makes this messy
    if (reaction && userId) {
      counts = reaction.children_counts // eslint-disable-line camelcase
      const latestChildren = reaction.latest_children // eslint-disable-line camelcase
      const userReactionIndex = _findIndex(latestChildren[kind], (child) => {
        return child.user_id === userId
      })
      ownReaction = userReactionIndex > -1
    } else {
      counts = reaction_counts // eslint-disable-line camelcase
      ownReactions = own_reactions // eslint-disable-line camelcase
    }
    return (
      <ReactionToggleIcon
        className={className}
        counts={counts}
        commentCount={commentCount}
        ownReactions={ownReactions} // eslint-disable-line camelcase
        ownReaction={ownReaction} // eslint-disable-line camelcase
        kind={kind}
        showCount={showCount}
        onPress={onPress}
        labelActive={labelActive}
        labelInactive={labelInactive}
      />
    )
  }
}
