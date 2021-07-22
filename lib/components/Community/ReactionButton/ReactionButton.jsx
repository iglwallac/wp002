import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import React from 'react'

import Reaction from './_Reaction'
import Comment from './_Comment'

export const TYPES = {
  COMMENT: 'COMMENT',
  LIKE: 'LIKE',
}

export default function ReactionButton (props) {
  const {
    toggleExpandComments,
    toggleReaction,
    className,
    right,
    node,
    data,
    kind,
  } = props

  if (kind === TYPES.COMMENT) {
    return (
      <Comment
        toggleExpandComments={toggleExpandComments}
        className={className}
        right={right}
        node={node}
        data={data}
        kind={kind}
      />
    )
  }

  if (kind === TYPES.LIKE) {
    return (
      <Reaction
        toggleReaction={toggleReaction}
        className={className}
        right={right}
        node={node}
        data={data}
        kind={kind}

      />
    )
  }
}

ReactionButton.propTypes = {
  node: ImmutablePropTypes.map.isRequired,
  toggleExpandComments: PropTypes.func,
  toggleReaction: PropTypes.func,
  data: ImmutablePropTypes.map,
  className: PropTypes.string,
  kind: PropTypes.string,
}
