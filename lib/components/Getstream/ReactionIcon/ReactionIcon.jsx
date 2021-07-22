import React, { PureComponent } from 'react'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { Button } from 'components/Button.v2'

export default class ReactionIcon extends PureComponent {
  render () {
    const {
      counts,
      kind,
      height,
      width,
      labelActive,
      labelInactive,
      onPress,
      active,
      showCount,
      commentCount,
    } = this.props
    let count = null
    if (counts && kind) {
      count = kind === 'comment' ? commentCount : counts[kind] || 0
    }

    const dimensions = {}
    if (height !== undefined) {
      dimensions.height = height
    }
    if (width !== undefined) {
      dimensions.width = width
    }

    if (!count) count = 0
    let label

    if (labelActive && labelInactive && showCount) {
      label = active ? `1 ${labelActive}` : `${count} ${labelInactive}`
    } else if (labelActive && labelInactive) {
      label = active ? `${labelActive}` : `${labelInactive}`
    }

    if ((!labelActive || !labelInactive) && showCount) {
      switch (kind) {
        case 'like':
          label =
            count === 1
              ? '1 Like'
              : `${count} Likes`
          break
        case 'repost':
          label =
            count === 1
              ? '1 Repost'
              : `${count} Reposts`
          break
        case 'comment':
          label =
            count === 1
              ? '1 Comment'
              : `${count} Comments`
          break
        default:
          break
      }
    } else if (!labelActive || !labelInactive) {
      switch (kind) {
        case 'like':
          label =
            count === 1
              ? 'Like'
              : 'Likes'
          break
        case 'repost':
          label =
            count === 1
              ? 'Repost'
              : 'Reposts'
          break
        case 'comment':
          label =
            count === 1
              ? 'Comment'
              : 'Comments'
          break
        default:
          break
      }
    }

    return (
      <div className="reaction-icon">
        <Button
          className="reaction-icon__button"
          onClick={onPress}
        >
          {kind === 'like' ? <IconV2
            className={active ? 'reaction-icon__icon reaction-icon__icon--active' : 'reaction-icon__icon'}
            type={active ? ICON_TYPES.HEART_FILL : ICON_TYPES.HEART_OUTLINE}
          /> : null}
          {count != null ? <span className="reaction-icon__label">{label}</span> : null}
        </Button>
      </div>
    )
  }
}
