import React from 'react'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import Link from 'components/Link'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { H2 } from 'components/Heading'

function onClickClose (setOverlayDialogVisible) {
  setOverlayDialogVisible(null, false)
}

const DialogUpdatePaymentSuccess = (props) => {
  const { staticText, setOverlayDialogVisible } = props
  return (
    <div className="dialog-update-payment-success">
      <div className="dialog-update-payment-success__content">
        <H2 className="dialog-update-payment-success__title" fixed>{staticText.getIn(['data', 'success'])}</H2>
        <p className="dialog-update-payment-success__text">{staticText.getIn(['data', 'sucessBody'])}{'\u00A0'}
        </p>
        <Link
          className="button button--primary dialog-update-payment-success__go-to-account-button"
          onClick={function _onClickClose () {
            onClickClose(setOverlayDialogVisible)
          }}
          to="/account"
        >
          {staticText.getIn(['data', 'goToAccount'])}
        </Link>
      </div>
    </div>
  )
}

DialogUpdatePaymentSuccess.propTypes = {
  setOverlayDialogVisible: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      plans: state.plans,
      userAccount: state.userAccount,
      auth: state.auth,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return { setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible }
    },
  ),
  connectStaticText({ storeKey: 'dialogUpdatePaymentSuccess' }),
)(DialogUpdatePaymentSuccess)
