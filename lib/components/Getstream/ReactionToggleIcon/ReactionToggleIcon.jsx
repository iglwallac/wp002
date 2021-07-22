import React from 'react'
import omit from 'lodash/omit'
import { ReactionToggleIcon as GetstreamReactionToggleIcon } from 'react-activity-feed'
import ReactionIcon from '../ReactionIcon/ReactionIcon'

/* eslint-disable */
export default class ReactionToggleIcon extends GetstreamReactionToggleIcon {
  render () {
    const {
      ownReactions, // Here until we move main activity reaction toggling in-house
      ownReaction,
      showCount,
      className,
      kind,
    } = this.props

    const restProps = omit(this.props,
      ['ownReactions', 'ownReaction', 'kind', 'showCount', 'className'])
    
    let active = false
    let cls = 'raf-reaction-toggle-icon'

    if (className) {
      cls += ` ${className}`
    }

    if (ownReactions && ownReactions[kind] && ownReactions[kind].length) {
      active = true
    } else if (ownReaction) {
      active = true
    }
    return (
      <div className={cls}>
        <ReactionIcon active={active} showCount={showCount} kind={kind} {...restProps} />
      </div>
    )
  }
}
 /* eslint-enable */
