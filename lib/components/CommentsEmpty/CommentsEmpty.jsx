import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { connect } from 'react-redux'

function CommentsEmpty (props) {
  const { commentsEmptyStaticText } = props
  return (
    <div className="comments-empty">
      <Sherpa className={['comments-empty__sherpa']} type={TYPE_SMALL_BLUE} />
      <p className="comments-empty__copy">
        {commentsEmptyStaticText.getIn(['data', 'noCommentPlaceholder'])}
      </p>
    </div>
  )
}

CommentsEmpty.propTypes = {
  commentsEmptyStaticText: ImmutablePropTypes.map.isRequired,
}

CommentsEmpty.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(state => ({
  commentsEmptyStaticText: state.staticText.getIn(
    ['data', 'commentsEmpty'],
    Map(),
  ),
}))(CommentsEmpty)
