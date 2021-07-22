import PropTypes from 'prop-types'
import React from 'react'
import { Map } from 'immutable'
import _partial from 'lodash/partial'
import _isEmpty from 'lodash/isEmpty'
import _startsWith from 'lodash/startsWith'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { historyRedirect } from 'services/navigation'
import Icon from 'components/Icon'

function onClick (props) {
  const { history, location, auth, user = Map() } = props
  const { pathname } = location
  const { referrer, location: documentLocation } = document
  const { hostname, protocol } = documentLocation
  // If the referrer is from the current site just go back.
  if (_isEmpty(referrer) || _startsWith(referrer, `${protocol}//${hostname}`)) {
    history.goBack()
    return
  }
  // We came from another domain goto the detail page.
  const language = user.getIn(['data', 'language'])
  historyRedirect({ history, url: pathname, auth, language })
}

function getClassName (props) {
  const { className, visible } = props
  return ['video-player-back']
    .concat(className || [])
    .concat(visible ? 'video-player-back--visible' : [])
    .join(' ')
}

function VideoPlayerBack (props) {
  const { staticText } = props
  return (
    <div className={getClassName(props)} onClick={_partial(onClick, props)}>
      <Icon
        iconClass={['video-player-back__icon', 'icon--left']}
      />
      {staticText.getIn(['data', 'back'])}
      {/* ME-3043 add back when Ric figures out CTA and aligns with apps team */}
      {/* <span className={`video-player-back__return-to-home ${getClassName(props)}`}>
        {staticText.getIn(['data', 'returnToHome'])}
      </span> */}
    </div>
  )
}

VideoPlayerBack.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  className: PropTypes.array,
  user: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

const connectedVideoPlayerBack = connectRedux(state => ({
  staticText: state.staticText.getIn(['data', 'videoPlayerBack']),
  user: state.user,
  auth: state.auth,
}))(VideoPlayerBack)

export default connectedVideoPlayerBack
