import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { recommend, MAX_VOTE as RECOMMEND_MAX_VOTE } from 'services/recommend'
import Icon from 'components/Icon'
import _partial from 'lodash/partial'
import _isArray from 'lodash/isArray'

function renderLabel (text, extraClass) {
  const baseClass = ['thumbs-up__label']

  if (extraClass && _isArray(extraClass)) {
    baseClass.push(extraClass)
  }

  if (!text) {
    return null
  }
  return <span className={baseClass.join(' ')}>{text}</span>
}

function renderCount (num, units, extraClass) {
  const baseClass = ['thumbs-up__value']

  if (extraClass && _isArray(extraClass)) {
    baseClass.push(extraClass)
  }

  if (typeof num !== 'number') {
    return null
  }

  const display = units ? `${num}${units}` : num
  return <span className={baseClass.join(' ')}>{display}</span>
}

function getIconClass (extraClass) {
  const iconClass = ['icon--recommend', 'icon--small', 'thumbs-up__icon']

  if (extraClass && _isArray(extraClass)) {
    iconClass.push(extraClass)
  }

  return iconClass
}

function getClassName (props) {
  const className = ['thumbs-up']
  if (props.thumbsUpClass && _isArray(props.thumbsUpClass)) {
    className.push(props.thumbsUpClass)
  }
  if (!props.auth.get('jwt')) {
    className.push('thumbs-up--anonymous')
  }
  return className.join(' ')
}

function incrementVote (props, score, onVote) {
  if (typeof onVote === 'function') {
    onVote()
  }

  recommend({ id: props.voteId, auth: props.auth.get('jwt'), vote: score })
}

function ThumbsUp (props) {
  const onClick = props.canVote
    ? _partial(incrementVote, props, props.score, props.onVote)
    : null
  const className = getClassName(props, props)

  return (
    <div className={className} onClick={onClick}>
      <Icon iconClass={getIconClass(props.iconClass)} />
      {renderCount(props.vote, props.units, props.voteClass)}
      {renderLabel(props.text, props.labelClass)}
    </div>
  )
}

ThumbsUp.propTypes = {
  renderOnly: PropTypes.bool,
  vote: PropTypes.number.isRequired,
  thumbsUpClass: PropTypes.array,
  text: PropTypes.string,
  iconClass: PropTypes.array,
  labelClass: PropTypes.array,
  voteClass: PropTypes.array,
  voteId: PropTypes.number.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  units: PropTypes.string,
  onVote: PropTypes.func,
  score: PropTypes.number,
  canVote: PropTypes.bool.isRequired,
}

ThumbsUp.defaultProps = {
  score: RECOMMEND_MAX_VOTE,
  canVote: true,
}

export default React.memo(ThumbsUp)
