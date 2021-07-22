import React from 'react'
import PropTypes from 'prop-types'
import isFunction from 'lodash/isFunction'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import Icon from 'components/Icon'

class AlertBar extends React.Component {
  componentDidMount () {
    const { setAlertBarVisible } = this.props
    setAlertBarVisible(true)
  }

  onDismiss = (e) => {
    const { props } = this
    const { onDismiss, setAlertBarVisible, setAlertBarDismissed } = props
    setAlertBarVisible(false)
    setAlertBarDismissed(true)
    if (isFunction(onDismiss)) {
      onDismiss(e)
    }
  }

  render () {
    const { props, onDismiss } = this
    const { error, dismissable, children } = props
    let classes = error ? 'alert-bar alert-bar-error' : 'alert-bar'
    classes += dismissable ? ' alert-bar-dismissable' : ''

    return (
      <div className={classes} aria-live="assertive" role="alert">
        {dismissable ? (
          <Icon
            onClick={onDismiss}
            iconClass={[
              'icon--close',
              'icon--action',
              'alert-bar__close-icon',
            ]}
          />
        ) : null}
        { children }
      </div>
    )
  }
}

AlertBar.propTypes = {
  setAlertBarDismissed: PropTypes.func.isRequired,
  setAlertBarVisible: PropTypes.func.isRequired,
  dismissable: PropTypes.bool,
  onDismiss: PropTypes.func,
  children: PropTypes.node,
}

export default connect(null,
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setAlertBarVisible: actions.alertBar.setAlertBarVisible,
      setAlertBarDismissed: actions.alertBar.setAlertBarDismissed,
    }
  },
)(AlertBar)
