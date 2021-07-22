import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { List } from 'immutable'
import { MESSAGE_BOX_WARN } from 'components/MessageBox/constants'
import Dialog from 'components/Dialog'
import MessageBox from 'components/MessageBox'
import SubscriptionErrorMessage from 'components/SubscriptionErrorMessage'
import { shouldRenderFreeTrialExpiredModal } from 'components/ModalFreeTrialExpired'
import { TYPE_FREE_TRIAL_EXPIRED } from 'services/dialog'
import { isEntitled } from 'services/subscription'
import { isCart, isPlans, isLogout, isAccount } from 'services/url'
import {
  USER_ACCOUNT_TRANSACTION_STATUS_DECLINED,
  USER_ACCOUNT_ACTIVE,
  USER_ACCOUNT_CANCELLED,
} from 'services/user-account'


const { BROWSER } = process.env

function updateDataSubscription ({
  auth,
  messageBox,
  setMessageBoxVisible,
  setMessageBoxType,
  userAccount,
}) {
  const subscription = userAccount.getIn(['details', 'data', 'billing', 'subscriptions'])
  const status = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const authToken = auth.get('jwt')
  const messageBoxVisible = messageBox.get('visible')
  const messageBoxViewed = messageBox.get('viewed')
  const userIsEntitled = isEntitled(auth.get('subscriptions', List()))
  const lastPaymentTransactionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paymentSource', 'lastTransactionStatus'])

  // import isPlans and isCart from url service, and then function to return if they are true
  if (subscription) {
    if (!shouldRenderMessageBox(location) ||
      (status === USER_ACCOUNT_ACTIVE &&
        lastPaymentTransactionStatus === USER_ACCOUNT_TRANSACTION_STATUS_DECLINED)
    ) {
      setMessageBoxVisible(false)
    } else if (
      (
        authToken &&
        !userIsEntitled &&
        !messageBoxVisible &&
        !messageBoxViewed &&
        shouldRenderMessageBox(location)
      ) || (
        status === USER_ACCOUNT_CANCELLED &&
        !userIsEntitled &&
        messageBoxVisible
      )) {
      setMessageBoxVisible(true)
      setMessageBoxType(MESSAGE_BOX_WARN, 'noSubscription', true, false)
    }
  }
}

function shouldRenderMessageBox (location) {
  if (
    isCart(location.pathname) ||
    isPlans(location.pathname) ||
    isAccount(location.pathname) ||
    isLogout(location.pathname)
  ) {
    return false
  }
  return true
}

class MainLoader extends Component {
  componentDidMount () {
    updateDataSubscription(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (BROWSER) {
      updateDataSubscription(nextProps)
    }
  }

  render () {
    const { dialog, messageBox, location, history, renderModal } = this.props
    if (dialog.get('componentName')) {
      return <Dialog location={location} history={history} />
    } else if (shouldRenderFreeTrialExpiredModal(this.props)) {
      renderModal(TYPE_FREE_TRIAL_EXPIRED)
    } else if (messageBox.get('visible', false) === true) {
      return (
        <MessageBox>
          {messageBox.get('messageType') === 'noSubscription' ? (
            <SubscriptionErrorMessage />
          ) : null}
        </MessageBox>
      )
    }
    return null
  }
}

MainLoader.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dialog: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  messageBox: ImmutablePropTypes.map.isRequired,
  setMessageBoxType: PropTypes.func.isRequired,
  setMessageBoxVisible: PropTypes.func.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
}

export default connectRedux(
  state => ({
    dialog: state.dialog,
    auth: state.auth,
    messageBox: state.messageBox,
    userAccount: state.userAccount,
    user: state.user,
    page: state.page,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setMessageBoxVisible: actions.messageBox.setMessageBoxVisible,
      setMessageBoxType: actions.messageBox.setMessageBoxType,
      renderModal: actions.dialog.renderModal,
    }
  },
)(MainLoader)
