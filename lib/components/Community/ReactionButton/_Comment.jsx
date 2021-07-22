import ImmutablePropTypes from 'react-immutable-proptypes'
import { Button } from 'components/Button.v2'
import capitalize from 'lodash/capitalize'
import PropTypes from 'prop-types'
import { List } from 'immutable'
import React from 'react'

function getClass (className, published, right) {
  const cls = ['comment-button']
  if (!published) cls.push('comment-button--unpublished')
  if (right) cls.push('comment-button--right')
  if (className) cls.push(className)
  return cls.join(' ')
}

export default function Comment (props) {
  const {
    toggleExpandComments,
    className,
    right,
    kind,
    node,
    data,
  } = props

  const published = node.get('published', false)
  const number = data.getIn(['relationships', 'children'], List()).size
  const label = `${capitalize(kind)}${number > 1 || number === 0 ? 's' : ''}`

  return (
    <span className={getClass(className, published, right)}>
      {number < 1
        ? null
        : <Button
          className="comment-button__button"
          onClick={toggleExpandComments}
        >
          {number} {label}
        </Button>}
    </span>
  )
}

Comment.propTypes = {
  node: ImmutablePropTypes.map.isRequired,
  data: ImmutablePropTypes.map.isRequired,
  toggleExpandComments: PropTypes.func,
  className: PropTypes.string,
}
