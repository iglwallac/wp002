import PropTypes from 'prop-types'
import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Icon from 'components/Icon'
import { compose } from 'recompose'
import { Map, List } from 'immutable'
import _partial from 'lodash/partial'
import _isFunction from 'lodash/isFunction'
import { getBoundActions } from 'actions'
import { connect as connectRedux } from 'react-redux'

function onToggleClick (props) {
  const {
    comments,
    video,
    auth,
    onCommentsWillShow,
    refreshComments,
    clearUpstreamContext,
  } = props
  if (!comments.get('visible', false) && _isFunction(onCommentsWillShow)) {
    onCommentsWillShow()
  }
  clearUpstreamContext()
  refreshComments({
    contentId: video.getIn(['data', 'id']),
    commentsId: comments.getIn(['data', 'id']),
    metadata: video.get('data', Map()).toJS(),
    jwt: auth.get('jwt'),
  })
}

function getClassName (props) {
  const { visible, className } = props
  return ['video-comments-toggle']
    .concat(className || [])
    .concat(visible ? [] : ['video-comments-toggle--hidden'])
    .join(' ')
}

function VideoCommentsToggle (props) {
  const { commentsCount, children } = props
  return (
    <div className={getClassName(props)}>
      <div onClick={_partial(onToggleClick, props)}>
        <Icon iconClass={['video-comments-toggle__icon icon--comment']} />
        <span className="video-comments-toggle__count">{commentsCount}</span>
      </div>
      {children}
    </div>
  )
}

VideoCommentsToggle.defaultProps = {
  visible: true,
}

VideoCommentsToggle.propTypes = {
  video: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  comments: ImmutablePropTypes.map.isRequired,
  refreshComments: PropTypes.func.isRequired,
  commentsCount: PropTypes.number,
  visible: PropTypes.bool.isRequired,
  className: PropTypes.array,
  onCommentsWillShow: PropTypes.func,
  clearUpstreamContext: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      language: state.user.getIn(['data', 'language'], List()),
      page: state.page,
      app: state.app,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        clearUpstreamContext: actions.upstreamContext.clearUpstreamContext,
      }
    },
  ),
)(VideoCommentsToggle)
