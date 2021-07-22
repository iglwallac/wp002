import React from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { format as formatDateTime, getDateTime } from 'services/date-time'
import { connect as connectRedux } from 'react-redux'
import compose from 'recompose/compose'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getBoundActions } from 'actions'
import Button from 'components/Button'
import { URL_PLAN_SELECTION } from 'services/url/constants'

export function shouldRenderFreeTrialExpiredModal (props) {
  const {
    auth,
    user,
    page,
  } = props
  const isLoggedIn = !!auth.get('jwt')
  const modalFreeTrialExpiredDismissed = !!user.getIn(['data', 'modalFreeTrialExpiredDismissed'])
  const freeTrialId = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
  const gaiaAccount = user.getIn(['data', 'billing_account_id'])
  const dateFormatString = 'MM/DD/YY'
  const locale = page.get('locale')
  const endDateString = user.getIn(['data', 'userEntitlements', 'end'])
  const endDateInMilliseconds = parseInt(endDateString, 10) * 1000
  const formattedEndDate = new Date(endDateInMilliseconds)
  const getEndDate = getDateTime(formattedEndDate)
  const reformattedEndDate = formatDateTime(getEndDate, locale, dateFormatString)
  const remainingTime = Date.parse(reformattedEndDate) - Date.now()
  const freeTrialExpired = remainingTime < 0

  if (
    isLoggedIn &&
    freeTrialId &&
    !gaiaAccount &&
    freeTrialExpired &&
    !modalFreeTrialExpiredDismissed
  ) {
    return true
  }
  return false
}

class ModalFreeTrialExpired extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      modalOpen: true,
    }
  }

  openModal = () => {
    this.setState(() => ({ modalOpen: true }))
  }

  closeModal = () => {
    const { modalFreeTrialExpiredDismissed, removeModal } = this.props
    this.setState(() => ({ modalOpen: false }))
    modalFreeTrialExpiredDismissed(true)
    removeModal()
  }

  modal = () => {
    const props = this.props
    const state = this.state
    const { staticText } = props

    if (!state.modalOpen) {
      return null
    }

    if (shouldRenderFreeTrialExpiredModal(props)) {
      return (
        <div className="modal-free-trial__content">
          <div className="modal-free-trial__body">
            {staticText.getIn(['data', 'body'])}
          </div>
          <div className="modal-free-trial__button-container">
            <Button
              url={URL_PLAN_SELECTION}
              text={staticText.getIn(['data', 'becomeAMember'])}
              buttonClass={['modal-free-trial__button']}
              onClick={() => this.closeModal()}
            />
          </div>
        </div>
      )
    }
    return null
  }

  render () {
    return (
      <div className="modal-free-trial">
        {this.modal()}
      </div>
    )
  }
}

ModalFreeTrialExpired.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'modalFreeTrialExpired' }),
  connectRedux(
    state => ({
      user: state.user,
      userAccount: state.userAccount,
      auth: state.auth,
      page: state.page,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        modalFreeTrialExpiredDismissed: actions.user.modalFreeTrialExpiredDismissed,
        removeModal: actions.dialog.removeModal,
      }
    },
  ),
)(ModalFreeTrialExpired)
