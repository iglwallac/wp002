import React, { useEffect } from 'react'
import { Map } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import { getBoundActions } from 'actions'
import { getPrimary } from 'services/languages'
import {
  URL_ACCOUNT_CHANGE_PLAN,
  URL_ACCOUNT,
} from 'services/url/constants'
import {
  getEmailCustomerServiceUrl,
} from 'services/url'
import { TARGET_BLANK, URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import {
  getDateLocale,
  getDateTime,
  ordinalDateFormatingi18n,
  formatWithLocale,
  getDifferenceInDays,
} from 'services/date-time'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import Link from 'components/Link'
import Icon from 'components/Icon'
import Support from 'components/Support'
import { Button, TYPES } from 'components/Button.v2'
import { H1, HEADING_TYPES } from 'components/Heading'
import { getAuthIsLoggedIn } from 'services/auth'

function AccountCancelConfirmPage (props) {
  const {
    staticText,
    userAccount,
    user,
    auth,
    setUserAccountCancel,
    resetUserAccountManageSubscriptionData,
    resetFormSubmissionsData,
  } = props
  const cancelDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'cancelDate'])
  const formattedCancelDate = getDateTime(cancelDate)
  const subscriptionExpireDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  const formattedExpireDate = getDateTime(subscriptionExpireDate)
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const processing = userAccount.get('billingSubscriptionsProcessing') ||
    userAccount.getIn(['manageSubscription', 'data', 'cancelConfirmProcessing']) ||
    userAccount.getIn(['details', 'data', 'billing', 'subscriptions'], Map()).size === 0
  const expireDate = formatWithLocale(formattedExpireDate, dateFormatString, { locale: dateLocale })
  const success = userAccount.getIn(['manageSubscription', 'data', 'cancelConfirmData', 'success'])
  const accountCancelReason = userAccount.getIn(['manageSubscription', 'data', 'cancelReason'])
  const showContinuedAccess = getDifferenceInDays(formattedExpireDate, formattedCancelDate) > 0

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetUserAccountManageSubscriptionData()
      resetFormSubmissionsData()
    }
  }, [])

  if (!getAuthIsLoggedIn(auth) || !accountCancelReason) {
    return null
  }

  return (
    <div className="account-cancel-confirm-page">
      <div className="account-cancel-confirm-page__content">
        {
          processing ?
            <Sherpa type={TYPE_SMALL_WHITE} />
            : null
        }
        {
          !processing && success === false ?
            <React.Fragment>
              <H1 as={HEADING_TYPES.H3} className="account-cancel-confirm-page__title">
                {staticText.getIn(['data', 'accountCancelConfirmError'])}
              </H1>
              <p className="account-cancel-confirm-page__body-text">
                {`${staticText.getIn(['data', 'errorDetails'])} `}
                <Link
                  to={getEmailCustomerServiceUrl(userLanguage)}
                  directLink
                  target={TARGET_BLANK}
                >
                  {staticText.getIn(['data', 'errorLink'])}
                </Link>
                .
              </p>
              <div className="account-cancel-confirm-page__buttons">
                <Button
                  url={URL_JAVASCRIPT_VOID}
                  type={TYPES.PRIMARY}
                  className="account-cancel-confirm-page__button"
                  onClick={setUserAccountCancel}
                >
                  {staticText.getIn(['data', 'retry'])}
                </Button>
              </div>
              <div className="account-cancel-confirm-page__links">
                <Link
                  className="account-cancel-confirm-page__link"
                  to={URL_ACCOUNT}
                >
                  {staticText.getIn(['data', 'goToAccount'])}
                  <Icon
                    iconClass={[
                      'account-cancel-confirm-page__arrow-right',
                      'icon--right',
                      'icon--action',
                    ]}
                  />
                </Link>
              </div>
            </React.Fragment>
            : null
        }
        {
          !processing && success !== false ?
            <React.Fragment>
              <H1 as={HEADING_TYPES.H3} className="account-cancel-confirm-page__title">
                {staticText.getIn(['data', 'accountCancelConfirmTitle'])}
              </H1>
              <p className="account-cancel-confirm-page__body-text">
                {`${staticText.getIn(['data', 'accountCancelConfirmParagraphLeft'])}`}
                {showContinuedAccess ?
                  <React.Fragment>
                    &nbsp;{staticText.getIn(['data', 'accountCancelConfirmParagraphContinuedAccess'])} <strong>{expireDate}</strong>.
                  </React.Fragment>
                  : null
                } {`${staticText.getIn(['data', 'accountCancelConfirmParagraphRight'])}`}
              </p>
              <div className="account-cancel-confirm-page__links">
                <Link
                  className="account-cancel-confirm-page__link"
                  to={URL_ACCOUNT_CHANGE_PLAN}
                >
                  {staticText.getIn(['data', 'accountCancelConfirmLink'])}
                  <Icon
                    iconClass={[
                      'account-cancel-confirm-page__arrow-right',
                      'icon--right',
                      'icon--action',
                    ]}
                  />
                </Link>
              </div>
            </React.Fragment>
            : null
        }
      </div>
      <Support />
    </div>
  )
}

AccountCancelConfirmPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setUserAccountCancel: PropTypes.func.isRequired,
  resetUserAccountManageSubscriptionData: PropTypes.func.isRequired,
  resetFormSubmissionsData: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(state => ({
    staticText: state.staticText.getIn(['data', 'accountCancelConfirm']),
    user: state.user,
    userAccount: state.userAccount,
    auth: state.auth,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setUserAccountCancel: actions.userAccount.setUserAccountCancel,
      resetUserAccountManageSubscriptionData:
        actions.userAccount.resetUserAccountManageSubscriptionData,
      resetFormSubmissionsData: actions.formSubmissions.resetFormSubmissionsData,
    }
  },
  ),
)(AccountCancelConfirmPage)
