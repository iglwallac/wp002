import _get from 'lodash/get'
import _replace from 'lodash/replace'
import { connect as connectRedux } from 'react-redux'
import { get as getConfig } from 'config'
import { getBoundActions } from 'actions'
import compose from 'recompose/compose'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import React, { useEffect, useCallback } from 'react'

import { Button, TYPES } from 'components/Button.v2'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { H1 } from 'components/Heading'
import { HEADING_TYPES } from 'components/Heading/_Heading'
import IconV2, { ICON_TYPES } from 'components/Icon.v2'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import Support from 'components/Support'

import { formatPrice } from 'services/plans'
import { TYPE_PAUSE_RESUME } from 'services/dialog'
import { getAuthIsLoggedIn } from 'services/auth'
import { getPrimary } from 'services/languages'
import {
  ordinalDateFormatingi18n,
  formatWithLocale,
  getDateLocale,
  getDateTime,
} from 'services/date-time'
import {
  URL_ACCOUNT,
} from 'services/url/constants'
import {
  USER_ACCOUNT_ACTIVE,
} from 'services/user-account'

function onReturnFocus () {
  return null
}
function AccountPauseConfirmPage ({
  resetUserAccountManageSubscriptionData,
  isProcessingAccountResume,
  updateUserAccountResume,
  dialogComponent,
  renderModal,
  userAccount,
  staticText,
  history,
  user,
  auth,
}) {
//
  useEffect(() => {
    return () => {
      resetUserAccountManageSubscriptionData()
    }
  }, [])

  useEffect(() => {
    if (dialogComponent === TYPE_PAUSE_RESUME || isProcessingAccountResume) {
      renderResumeModal()
    }
  }, [isProcessingAccountResume])


  const config = getConfig()
  const { features } = config
  const featureToggleOn = _get(features, ['userAccount', 'accountPause'])
  const status = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const pauseLength = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseMonths'])
  const pauseDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseDate'])
  const resumeDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'resumeDate'])
  const ready = userAccount.size && featureToggleOn && pauseLength && pauseDate
  const nextBillAmount = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextBillAmount'])
  const paidThrough = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  const currencyIso = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'currencyIso'])
  const price = formatPrice(currencyIso, nextBillAmount)
  const endDateTimestamp = resumeDate
  const startDateTimestamp = pauseDate
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const formattedEndDate = getDateTime(endDateTimestamp)
  const formattedStartDate = getDateTime(startDateTimestamp)
  const formattedPaidThroughDate = getDateTime(paidThrough)
  const endDate = formatWithLocale(formattedEndDate, dateFormatString, { locale: dateLocale })
  const startDate = formatWithLocale(formattedStartDate, dateFormatString, { locale: dateLocale })
  const paidThroughDate = formatWithLocale(
    formattedPaidThroughDate,
    dateFormatString,
    { locale: dateLocale },
  )
  const renderResumeModal = useCallback(() => {
    renderModal(TYPE_PAUSE_RESUME, {
      price,
      status,
      userAccount,
      userLanguage,
      onReturnFocus,
      resumeDate: status === USER_ACCOUNT_ACTIVE ? paidThroughDate : endDate,
      resumeAccount: updateUserAccountResume,
      hideDismiss: isProcessingAccountResume,
    })
  }, [
    price,
    status,
    userAccount,
    isProcessingAccountResume,
    paidThroughDate,
    endDate,
  ])

  // eslint-disable-next-line no-template-curly-in-string
  const desc1 = _replace(staticText.get('description1'), '${ lengthOfPause }', pauseLength)
  const desc2 = staticText.get('description2')

  // If the user is not logged in or the feature toggle is not on,
  // or if there is no cancel type, redirect them to the account page
  if (!featureToggleOn || !getAuthIsLoggedIn(auth)) {
    history.push(URL_ACCOUNT)
  }

  return (
    <div className="account-pause-confirm">
      {!ready ? (
        <div className="account-pause-confirm__placeholder">
          <Sherpa type={TYPE_SMALL_BLUE} />
        </div>
      ) : (
        <React.Fragment>
          <div className="account-pause-confirm__content">
            <H1
              className="account-pause-confirm__title"
              as={[HEADING_TYPES.H3_MOBILE, HEADING_TYPES.H3_DESKTOP]}
            >
              {staticText.get('title')}
            </H1>
            <div className="account-pause-confirm__description">
              <span>
                {desc1}
              </span>
              <span className="account-pause-confirm__date">
                {startDate}.
              </span>
              <span>
                {` ${desc2}`}
              </span>
              <span className="account-pause-confirm__date">
                {endDate}.
              </span>
            </div>
            <Button
              url={URL_ACCOUNT}
              className="account-pause-confirm__cta"
              type={TYPES.GHOST}
            >
              {staticText.get('return')}
              <IconV2
                className="account-pause-confirm__icon"
                type={ICON_TYPES.CHEVRON_RIGHT}
              />
            </Button>
            <Button
              onClick={renderResumeModal}
              className="account-pause-confirm__cta"
              type={TYPES.GHOST}
            >
              {staticText.get('resume')}
              <IconV2
                className="account-pause-confirm__icon"
                type={ICON_TYPES.CHEVRON_RIGHT}
              />
            </Button>
          </div>
          <Support />
        </React.Fragment>
      )}
    </div>
  )
}

AccountPauseConfirmPage.propTypes = {
  resetUserAccountManageSubscriptionData: PropTypes.func.isRequired,
  setUserAccountPauseSubscriptionConfirm: PropTypes.func.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  history: PropTypes.object.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      isProcessingAccountResume:
        state.userAccount.getIn(['manageSubscription', 'data', 'accountResumeProcessing'], false)
        || state.userAccount.getIn(['manageSubscription', 'data', 'success'], false),
      staticText: state.staticText.getIn(['data', 'accountPauseConfirmPage', 'data']),
      userAccount: state.userAccount,
      dialogComponent: state.dialog.get('componentName'),
      user: state.user,
      auth: state.auth,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        updateUserAccountResume: actions.userAccount.updateUserAccountResume,
        resetUserAccountManageSubscriptionData:
          actions.userAccount.resetUserAccountManageSubscriptionData,
        setUserAccountPauseSubscriptionConfirm:
          actions.userAccount.setUserAccountPauseSubscriptionConfirm,
        renderModal: actions.dialog.renderModal,
      }
    },
  ),
)(AccountPauseConfirmPage)
