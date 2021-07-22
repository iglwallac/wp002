import React from 'react'
import PropTypes from 'prop-types'
import assign from 'lodash/assign'
import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import ImmutablePropTypes from 'react-immutable-proptypes'
import SubcategoryDescriptionFull from 'components/SubcategoryDescriptionFull'
import { ModalShare } from 'components/Share'
import ModalPortalShareV2 from 'components/Portal/ModalShare'
import ModalPortalFlag from 'components/ModalPortalFlag'
import ModalViewAll from 'components/ModalViewAll'
import ModalRemoveUser from 'components/ModalRemoveUser'
import DialogUpdateProfileImage from 'components/DialogUpdateProfileImage'
import DialogUpdatePaymentSuccess from 'components/DialogUpdatePaymentSuccess'
import DialogChangePassword from 'components/DialogChangePassword'
import DialogConfirmPlan from 'components/DialogConfirmPlan'
import ModalCartChangePlan from 'components/CartV2/ModalCartChangePlan'
import ForgotPassword from 'components/ForgotPassword'
import ModalFreeTrialExpired from 'components/ModalFreeTrialExpired'
import ModalGiftFlowLogin from 'components/ModalGiftFlowLogin'
import ModalLiveAccessEmailCapture from 'components/ModalLiveAccessEmailCapture'
import ModalUnsavedChanges from 'components/Portal/ModalUnsavedChanges'
import ModalConfigurableVideo from 'components/Daytona/Campaigns/WA-10/ModalConfigurableVideo'
import ModalPlaylistSelect from 'components/ModalPlaylistSelect'
import ModalHideContent from 'components/ModalHideContent'
import ModalPauseError from 'components/AccountPause/ModalPauseError'
import ModalPauseResume from 'components/AccountPause/ModalPauseResume'
import ModalConfirm from 'components/ModalConfirm'
import MyAccountChangePlanModal from 'components/MyAccount/MyAccountChangePlanModal'
import MultiplePlaylistsAddModal from 'components/MultiplePlaylists/MultiplePlaylistsAddModal'
import MultiplePlaylistsDeleteModal from 'components/MultiplePlaylists/MultiplePlaylistsDeleteModal'
import MultiplePlaylistsRenameModal from 'components/MultiplePlaylists/MultiplePlaylistsRenameModal'
import Modal from 'components/Modal'
import Login from 'components/Login'
import Icon from 'components/Icon'

import {
  DIALOG_CLOSE_BUTTON_COLOR_WHITE,
  TYPE_LIVE_ACCESS_EMAIL_CAPTURE,
  TYPE_MULTIPLE_PROFILES_RM_USER,
  TYPE_SUBCATEGORY_DESCRIPTION,
  TYPE_UPDATE_PAYMENT_SUCCESS,
  TYPE_UPDATE_PROFILE_IMAGE,
  TYPE_FREE_TRIAL_EXPIRED,
  TYPE_CART_CHANGE_PLAN,
  TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM,
  TYPE_FORGOT_PASSWORD,
  TYPE_CHANGE_PASSWORD,
  TYPE_GIFT_FLOW_LOGIN,
  TYPE_PLAYLIST_SELECT,
  TYPE_PORTAL_V2_SHARE,
  TYPE_SHARE_V2_SHARE,
  TYPE_DAYTONA_WA_10,
  TYPE_CONFIRM_PLAN,
  TYPE_ROW_VIEW_ALL,
  TYPE_HIDE_CONTENT,
  TYPE_PAUSE_RESUME,
  TYPE_PAUSE_ERROR,
  TYPE_PORTAL_EXIT,
  TYPE_PORTAL_FLAG,
  TYPE_CONFIRM,
  TYPE_LOGIN,
  TYPE_USER_PLAYLIST_ADD,
  TYPE_USER_PLAYLIST_DELETE,
  TYPE_USER_PLAYLIST_RENAME,
  getProps,
} from 'services/dialog'

function warnFocus () {
  if (process.env.BROWSER && window.console) {
    window.console.warn(`
      Modal dialog warning :: it is advised to provide an onReturnFocus handler to Modal for accessibility use.
      Provide a no-operation (noop) handler if you want no return functionality.
    `)
  }
}

function stopPropagation (e) {
  e.stopPropagation()
}

function getClassName (visible, customClass) {
  const className = ['dialog', 'dialog--visible']
  if (customClass) className.push(customClass)
  return className.join(' ')
}

function iconClass (color) {
  const cls = ['icon--close', 'icon--action', 'icon--overlay-close', 'dialog__close-icon']
  if (color === DIALOG_CLOSE_BUTTON_COLOR_WHITE) cls.push('icon--white')
  return cls
}

function renderChild (componentName, props) {
  switch (componentName) {
    case TYPE_LOGIN:
      return <Login />
    case TYPE_SHARE_V2_SHARE:
      return <ModalShare {...props} />
    case TYPE_DAYTONA_WA_10:
      return <ModalConfigurableVideo {...props} />
    case TYPE_PORTAL_V2_SHARE:
      return <ModalPortalShareV2 {...props} />
    case TYPE_MULTIPLE_PROFILES_RM_USER:
      return <ModalRemoveUser {...props} />
    case TYPE_LIVE_ACCESS_EMAIL_CAPTURE:
      return <ModalLiveAccessEmailCapture {...props} />
    case TYPE_FREE_TRIAL_EXPIRED:
      return <ModalFreeTrialExpired />
    case TYPE_GIFT_FLOW_LOGIN:
      return <ModalGiftFlowLogin />
    case TYPE_PORTAL_FLAG:
      return <ModalPortalFlag {...props} />
    case TYPE_PORTAL_EXIT:
      return <ModalUnsavedChanges {...props} />
    case TYPE_ROW_VIEW_ALL:
      return <ModalViewAll {...props} />
    case TYPE_CONFIRM_PLAN:
      return <DialogConfirmPlan />
    case TYPE_CART_CHANGE_PLAN:
      return <ModalCartChangePlan {...props} />
    case TYPE_UPDATE_PROFILE_IMAGE:
      return <DialogUpdateProfileImage />
    case TYPE_CHANGE_PASSWORD:
      return <DialogChangePassword />
    case TYPE_UPDATE_PAYMENT_SUCCESS:
      return <DialogUpdatePaymentSuccess />
    case TYPE_SUBCATEGORY_DESCRIPTION:
      return <SubcategoryDescriptionFull />
    case TYPE_FORGOT_PASSWORD:
      return <ForgotPassword {...props} />
    case TYPE_PLAYLIST_SELECT:
      return <ModalPlaylistSelect {...props} />
    case TYPE_HIDE_CONTENT:
      return <ModalHideContent {...props} />
    case TYPE_PAUSE_ERROR:
      return <ModalPauseError {...props} />
    case TYPE_PAUSE_RESUME:
      return <ModalPauseResume {...props} />
    case TYPE_CONFIRM:
      return <ModalConfirm {...props} />
    case TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM:
      return <MyAccountChangePlanModal {...props} />
    case TYPE_USER_PLAYLIST_ADD:
      return <MultiplePlaylistsAddModal {...props} />
    case TYPE_USER_PLAYLIST_DELETE:
      return <MultiplePlaylistsDeleteModal {...props} />
    case TYPE_USER_PLAYLIST_RENAME:
      return <MultiplePlaylistsRenameModal {...props} />
    default:
      return null
  }
}

class Dialog extends React.PureComponent {
  onDismissOverlay = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const { props } = this
    const { dialog, dismissModal, modalFreeTrialExpiredDismissed } = props
    const name = dialog.get('componentName')
    const closeOnClick = dialog.get('closeOnClick')

    if (name === TYPE_FREE_TRIAL_EXPIRED) {
      modalFreeTrialExpiredDismissed(true)
    }

    if (closeOnClick !== false) {
      dismissModal(true)
    }
  }

  onDismiss = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const { props } = this
    const { dialog, dismissModal, modalFreeTrialExpiredDismissed } = props
    const name = dialog.get('componentName')
    const extProps = getProps(name)
    const { onDismiss } = extProps

    if (name === TYPE_FREE_TRIAL_EXPIRED) {
      modalFreeTrialExpiredDismissed(true)
    }

    if (onDismiss) onDismiss(e)
    dismissModal(name)
  }

  renderLegacyDialog (content) {
    const { props } = this
    const { dialog, location } = props
    const hideCloseButton = dialog.getIn(['options', 'hideCloseButton'], false)
    const customClass = dialog.getIn(['options', 'customClass'])
    const btnColor = dialog.getIn(['options', 'closeButtonColor'], null)
    const isFmtv = location.pathname === '/fmtv'

    const className = isFmtv ? 'dialog-overlay dialog-overlay--fmtv' : 'dialog-overlay'

    return (
      <div className={className} onClick={this.onDismissOverlay}>
        {/* eslint-disable-next-line */}
        <section
          className={getClassName(true, customClass)}
          onClick={stopPropagation}
          aria-modal="true"
          role="dialog"
        >
          <div className="dialog__content">{content}</div>
          {hideCloseButton ? null : (
            <Icon iconClass={iconClass(btnColor)} onClick={this.onDismiss} />
          )}
        </section>
      </div>
    )
  }

  renderModal (content, extProps) {
    const {
      onReturnFocus = warnFocus,
      hideDismiss = false,
      className = '',
      title = '',
      hideOverflow = false,
    } = extProps
    return (
      <Modal
        visible
        title={title}
        className={className}
        hideDismiss={hideDismiss}
        onDismiss={this.onDismiss}
        onReturnFocus={onReturnFocus}
        hideOverflow={hideOverflow}
      >
        {content}
      </Modal>
    )
  }

  render () {
    const { props } = this
    const { dialog, location, history, dismissModal } = props
    const name = dialog.get('componentName', '')
    const asModal = dialog.get('asModal', false)

    if (name) {
      let className

      if (name === TYPE_CART_CHANGE_PLAN) {
        className = 'modal--modal-cart-change-plan'
      }
      if (name === TYPE_MY_ACCOUNT_CHANGE_PLAN_CONFIRM) {
        className = 'modal--my-account-change-plan'
      }
      if (name === TYPE_USER_PLAYLIST_ADD
        || name === TYPE_USER_PLAYLIST_DELETE
        || name === TYPE_USER_PLAYLIST_RENAME) {
        className = 'modal--multiple-playlists'
      }

      const extProps = assign({}, getProps(name), { location, history, dismissModal, className })
      const content = renderChild(name, extProps)
      if (content) {
        return asModal
          ? this.renderModal(content, extProps) // NEW HOTNESS
          : this.renderLegacyDialog(content) // LEGACY DIALOG - DEPRICATED
      }
    }

    return null
  }
}

Dialog.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  dismissModal: PropTypes.func.isRequired,
  dialog: ImmutablePropTypes.map.isRequired,
}

Dialog.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default connect(
  state => ({
    dialog: state.dialog,
    optimizely: state.optimizely,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      dismissModal: actions.dialog.dismissModal,
      modalFreeTrialExpiredDismissed: actions.user.modalFreeTrialExpiredDismissed,
    }
  },
)(Dialog)
