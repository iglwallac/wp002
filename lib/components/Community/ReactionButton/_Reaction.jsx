import ImmutablePropTypes from 'react-immutable-proptypes'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import { Button } from 'components/Button.v2'
import capitalize from 'lodash/capitalize'
import parseInt from 'lodash/parseInt'
import PropTypes from 'prop-types'
import React from 'react'

function getClass (className, published, right) {
  const cls = ['reaction-button']
  if (!published) cls.push('reaction-button--unpublished')
  if (right) cls.push('reaction-button--right')
  if (className) cls.push(className)
  return cls.join(' ')
}

export default function Reaction (props) {
  const {
    toggleReaction,
    className,
    right,
    node,
    kind,
  } = props

  const published = node.get('published', false)
  const number = parseInt(node.getIn(['reactions', 'likes'], 0))

  const label = `${capitalize(kind)}${number > 1 || number === 0 ? 's' : ''}`
  const ownLike = node.getIn(['reactions', 'ownLike'], null)

  return (
    <span className={getClass(className, published, right)}>
      <Button
        className="reaction-button__button"
        onClick={published ? toggleReaction : null}
      >
        <IconV2
          type={ownLike ? ICON_TYPES.HEART_FILL : ICON_TYPES.HEART_OUTLINE}
          className={ownLike
            ? 'reaction-button__icon reaction-button__icon--active'
            : 'reaction-button__icon'}
        />
      </Button>
      <Button
        className="reaction-button__button"
        onClick={toggleReaction}
      >
        {number} {label}
      </Button>
    </span>
  )
}

Reaction.propTypes = {
  node: ImmutablePropTypes.map.isRequired,
  toggleReaction: PropTypes.func,
  className: PropTypes.string,
  kind: PropTypes.string,
}
