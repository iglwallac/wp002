import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { partial as _partial } from 'lodash'
import { connect as reduxConnect } from 'react-redux'
import { getBoundActions } from 'actions'
import Icon from 'components/Icon'
import {
  MESSAGE_BOX_ERROR,
  MESSAGE_BOX_SUCCESS,
  MESSAGE_BOX_WARN,
} from './constants'

function getClassName (visible, type) {
  const classes = ['message-box']
  if (visible) {
    classes.push('message-box--visible')
  }
  if (type === MESSAGE_BOX_ERROR) {
    classes.push('message-box--error')
  } else if (type === MESSAGE_BOX_WARN) {
    classes.push('message-box--warn')
  } else if (type === MESSAGE_BOX_SUCCESS) {
    classes.push('message-box--success')
  }
  return classes.join(' ')
}

function toggleMessageBoxVisible (setMessageBoxVisible, display) {
  setMessageBoxVisible(display)
}

class MessageBox extends PureComponent {
  componentDidMount () {
    const { setMessageBoxViewed } = this.props
    setMessageBoxViewed()
  }

  render () {
    const { setMessageBoxVisible, messageBox, children } = this.props
    const visible = messageBox.get('visible')
    const type = messageBox.get('type')
    const persistent = messageBox.get('persistent')
    return (
      <div className={getClassName(visible, type)}>
        {persistent ? null : (
          <Icon
            iconClass={['icon--close', 'icon--small', 'message-box__icon-close']}
            onClick={_partial(
              toggleMessageBoxVisible,
              setMessageBoxVisible,
              false,
            )}
          />
        )}
        {children}
      </div>
    )
  }
}

MessageBox.propTypes = {
  messageBox: ImmutablePropTypes.map.isRequired,
  setMessageBoxVisible: PropTypes.func.isRequired,
  setMessageBoxViewed: PropTypes.func.isRequired,
}

export default reduxConnect(
  state => ({
    messageBox: state.messageBox,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setMessageBoxVisible: actions.messageBox.setMessageBoxVisible,
      setMessageBoxViewed: actions.messageBox.setMessageBoxViewed,
    }
  },
)(MessageBox)
