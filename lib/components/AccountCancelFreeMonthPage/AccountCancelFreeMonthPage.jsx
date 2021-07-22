import React, { useEffect } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import AccountCancelOfferPopup from 'components/AccountCancelOfferPopup'
import { shouldRenderCancelOffer, USER_ACCOUNT_ACTIVE } from 'services/user-account'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import { TYPE_LOGIN } from 'services/dialog'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import { URL_HELP_CENTER_ES, URL_HELP_CENTER, URL_ACCOUNT } from 'services/url/constants'
import { getPrimary } from 'services/languages'
import { ES } from 'services/languages/constants'
import { List, Map } from 'immutable'

function AccountCancelFreeMonth (props) {
  const {
    auth,
    setOverlayDialogVisible,
    staticText,
    user,
    setOverlayCloseOnClick,
    setDialogOptions,
    userAccount,
  } = props
  const isLoggedIn = !!auth.get('jwt')
  const primaryLang = getPrimary(user.getIn(['data', 'language'], List()))
  const langIsEs = primaryLang === ES
  const dataReady = userAccount.getIn(['details', 'data', 'billing', 'subscriptions'], Map()).size > 0 &&
    userAccount.getIn(['details', 'data', 'billing', 'payments', 'data'], List()).size > 0
  const cancelOfferAccepted = userAccount.getIn([
    'details',
    'data',
    'billing',
    'subscriptions',
    'acceptedCancellationOffer',
  ])
  const accountStatusNotActive = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status']) === USER_ACCOUNT_ACTIVE

  const notEligibleMessage = () => {
    let contactUrl = URL_HELP_CENTER
    if (langIsEs) {
      contactUrl = URL_HELP_CENTER_ES
    }
    const myAccountLink =
      (<Link
        to={URL_ACCOUNT}
        className="account-cancel-free-month__link"
        target={TARGET_BLANK}
      >
        {staticText.getIn(['data', 'myAccount'])}
      </Link>)
    const customerRelationsLink =
      (<Link
        to={contactUrl}
        className="account-cancel-free-month__link"
        target={TARGET_BLANK}
      >
        {staticText.getIn(['data', 'customerRelations'])}
      </Link>)
    const showReviewMessage = cancelOfferAccepted || accountStatusNotActive
    const reactivate = showReviewMessage ? staticText.getIn(['data', 'review']) : staticText.getIn(['data', 'reactivate'])
    const pageOrContact = staticText.getIn(['data', 'pageOrContact'])
    const teamForAssistance = staticText.getIn(['data', 'teamForAssistance'])
    return (
      <React.Fragment>
        {`${reactivate} `}
        { myAccountLink }
        {` ${pageOrContact} `}
        { customerRelationsLink }
        { ` ${teamForAssistance}` }
      </React.Fragment>
    )
  }

  const notEligible = () => {
    return (
      <div className="account-cancel-free-month">
        <div className="account-cancel-free-month__wrapper account-cancel-free-month__wrapper--ineligible">
          <div className="account-cancel-free-month__content">
            <div className="account-cancel-free-month__title">
              {
                cancelOfferAccepted ?
                  staticText.getIn(['data', 'alreadyRedeemed']) :
                  staticText.getIn(['data', 'notEligible'])
              }
            </div>
            <div className="account-cancel-free-month__description account-cancel-free-month__description--ineligible">
              { notEligibleMessage(staticText) }
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setOverlayDialogVisible(TYPE_LOGIN)
      setDialogOptions(null, true)
      setOverlayCloseOnClick(false)
    }
  }, [isLoggedIn])

  // show processing state
  if (!dataReady) {
    return (
      <div className="account-cancel-free-month">
        <div className="account-cancel-free-month__content">
          <Sherpa type={TYPE_SMALL_WHITE} />
        </div>
      </div>
    )
  }

  if (isLoggedIn && dataReady) {
    return (
      <React.Fragment>
        { shouldRenderCancelOffer(props, true) ?
          <div className="account-cancel-free-month">
            <AccountCancelOfferPopup fixed />
          </div> :
          notEligible()
        }
      </React.Fragment>
    )
  }
  return null
}

AccountCancelFreeMonth.propTypes = {
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  setOverlayCloseOnClick: PropTypes.func.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  setDialogOptions: PropTypes.func.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'accountFreeMonthPage' }),
  connectRedux(
    state => ({
      user: state.user,
      userAccount: state.userAccount,
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setOverlayCloseOnClick: actions.dialog.setOverlayCloseOnClick,
        setDialogOptions: actions.dialog.setDialogOptions,
      }
    },
  ),
)(AccountCancelFreeMonth)

