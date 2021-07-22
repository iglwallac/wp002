import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import ThumbsUp from 'components/ThumbsUp'
import {
  MAX_VOTE as RECOMMEND_MAX_VOTE,
  MIN_VOTE as RECOMMEND_MIN_VOTE,
} from 'services/recommend'

export const SIZE_SMALL = 'x-small'
export const SIZE_MEDIUM = 'small'
export const SIZE_LARGE = 'large'

function getThumbsClass (state, prop) {
  const className = ['vote__thumbs-up']
  if (state[prop]) {
    className.push('vote__thumbs-up--active')
  }

  return [className.join(' ')]
}

function getThumbsUpClass (state) {
  return getThumbsClass(state, 'vote')
}

function getThumbsDownClass (state) {
  return getThumbsClass(state, 'voteDown')
}

function getVoteClass (props) {
  const size = props.size
  return [`vote__value thumbs-up__value--${size} vote__value--${size}`]
}

function getIconClass (props, extra) {
  const size = props.size
  const className = [
    `icon--${size}`,
    'vote__icon',
    `thumbs-up__icon--${size}`,
    `vote__icon--${size}`,
  ]

  if (extra) {
    className.push(extra)
  }

  return [className.join(' ')]
}

function getTotalVote (props, state) {
  const { voteDown, vote } = props
  const { vote: voteState, voteDown: voteDownState } = state
  return voteDown + voteDownState + vote + voteState
}

function getPercent (num, total) {
  if (total === 0) {
    return total
  }

  const percent = num / total

  return Math.round(percent * 100)
}

function getCanVote (voteProp, auth) {
  return auth.has('jwt') && voteProp <= 0
}

class Vote extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      vote: 0,
      voteDown: 0,
    }
  }

  addVoteDown = () => {
    this.setState(() => ({
      voteDown: 1,
      vote: 0,
    }))
  }

  addVoteUp = () => {
    this.setState(() => ({
      vote: 1,
      voteDown: 0,
    }))
  }

  render () {
    const { props, state } = this
    const { vote = 0, voteDown = 0, auth, className, voteId } = props
    const { vote: voteState, voteDown: voteDownState } = state
    const totalVote = getTotalVote(props, state)
    const upPercent = getPercent(vote + voteState, totalVote)
    const downPercent = getPercent(voteDown + voteDownState, totalVote)
    const canVoteUp = getCanVote(voteState, auth)
    const canVoteDown = getCanVote(voteDownState, auth)

    return (
      <div className={`vote ${className}`}>
        <ThumbsUp
          onVote={this.addVoteUp}
          auth={auth}
          vote={upPercent}
          units="%"
          canVote={canVoteUp}
          voteId={voteId}
          thumbsUpClass={getThumbsUpClass(state)}
          iconClass={getIconClass(props)}
          score={RECOMMEND_MAX_VOTE}
          voteClass={getVoteClass(props)}
        />
        <ThumbsUp
          auth={auth}
          vote={downPercent}
          onVote={this.addVoteDown}
          canVote={canVoteDown}
          thumbsUpClass={getThumbsDownClass(state)}
          units="%"
          voteId={voteId}
          score={RECOMMEND_MIN_VOTE}
          iconClass={getIconClass(props, 'vote__icon--down')}
          voteClass={getVoteClass(props)}
        />
      </div>
    )
  }
}

Vote.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  size: PropTypes.string,
  className: PropTypes.string,
  vote: PropTypes.number,
  voteDown: PropTypes.number,
  voteId: PropTypes.number.isRequired,
}

Vote.defaultProps = {
  size: SIZE_MEDIUM,
  vote: 0,
  voteDown: 0,
}

export default Vote
