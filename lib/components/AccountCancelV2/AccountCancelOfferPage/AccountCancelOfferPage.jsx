import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import {
  URL_ACCOUNT_CANCEL_CONFIRM,
  URL_ACCOUNT_CANCEL,
} from 'services/url/constants'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import AccountCancelButtons from 'components/AccountCancelV2/AccountCancelButtons'
import AccountCancelOffer from 'components/AccountCancelV2/AccountCancelOffer'
import Support from 'components/Support'
import { getAuthIsLoggedIn } from 'services/auth'
import { requestAnimationFrame } from 'services/animate'

function AccountCancelOfferPage (props) {
  const {
    auth,
    staticText,
    setUserAccountCancel,
    subscription,
    userAccount,
  } = props
  const cancelOfferSuccess = subscription.get('success')
  const subscriptionProcessing = subscription.get('processing')
  const subscriptionError = subscription.get('errors')
  const accountCancelReason = userAccount.getIn(['manageSubscription', 'data', 'cancelReason'])
  const userAccountProcessing = userAccount.get('billingSubscriptionsProcessing')

  const onClickCancel = () => {
    setUserAccountCancel()

    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }

  if (!getAuthIsLoggedIn(auth) || !accountCancelReason) {
    return null
  }

  return (
    <div className="account-cancel-offer-page">
      <div className="account-cancel-offer-page__content">
        <AccountCancelOffer fullPage />
        <div className="account-cancel-offer-page__sep" />
        {
          !cancelOfferSuccess &&
          !subscriptionProcessing &&
          !subscriptionError &&
          !userAccountProcessing ?
            <AccountCancelButtons
              nextText={staticText.getIn(['data', 'cancelMembership'])}
              nextUrl={URL_ACCOUNT_CANCEL_CONFIRM}
              previousUrl={URL_ACCOUNT_CANCEL}
              previousText={staticText.getIn(['data', 'goBack'])}
              nextOnClick={onClickCancel}
              nextDisabled={false}
            />
            :
            null
        }
      </div>
      <Support />
    </div>
  )
}

AccountCancelOfferPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  subscription: ImmutablePropTypes.map.isRequired,
  setUserAccountCancel: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(state => ({
    auth: state.auth,
    userAccount: state.userAccount,
    subscription: state.subscription,
    staticText: state.staticText.getIn(['data', 'accountCancelOfferPage']),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setUserAccountCancel: actions.userAccount.setUserAccountCancel,
    }
  },
  ),
)(AccountCancelOfferPage)
