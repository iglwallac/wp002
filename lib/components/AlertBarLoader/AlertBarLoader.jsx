import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import { getBoundActions } from 'actions'
import { deactivateSubject } from 'services/testarossa'
import { showPaymentErrorMessage } from 'services/user-account'
import toNumber from 'lodash/toNumber'
import AlertBar from 'components/AlertBar'
import AlertBarAnonymousLanguage from 'components/AlertBarAnonymousLanguage'
import AlertBarPaymentError from 'components/AlertBarPaymentError'
import AlertBarFreeTrialExpired from 'components/AlertBarFreeTrialExpired'
import { TestarossaSwitch, TestarossaCase, TestarossaDefault } from 'components/Testarossa'
import { format as formatDateTime, getDateTime } from 'services/date-time'
import { headerAlertBarShouldRender } from 'components/AlertBar/connect'

class AlertBarLoader extends React.PureComponent {
  // made two functions because it is more React performance efficient
  onDismissAnonRibbon = () => {
    deactivateSubject({ campaign: 'RI-98' })
  }
  // made two functions because it is more React performance efficient
  onDismissMemberRibbon = () => {
    deactivateSubject({ campaign: 'RI-97' })
  }

  showFreeTrial = () => {
    const { props } = this
    const { auth, user, userAccount, page } = props
    const zuoraSubscription = userAccount.getIn(['details', 'data', 'billing', 'subscriptions'], Map())
    const zuoraAccountId = zuoraSubscription.get('billingAccountId')
    const noZuoraAccount = zuoraSubscription.size > 0 && !zuoraAccountId
    const isFreeTrial = user.getIn(['data', 'freeTrialNoBillingInfo', 'ratePlanId'])
    const isLoggedIn = !!auth.get('jwt')
    const dateFormatString = 'MM/DD/YY'
    const locale = page.get('locale')
    const endDateString = user.getIn(['data', 'userEntitlements', 'end'])
    const endDateInMilliseconds = parseInt(endDateString, 10) * 1000
    const formattedEndDate = new Date(endDateInMilliseconds)
    const getEndDate = getDateTime(formattedEndDate)
    const reformattedEndDate = formatDateTime(getEndDate, locale, dateFormatString)
    const remainingTime = Date.parse(reformattedEndDate) - Date.now()
    return isLoggedIn && isFreeTrial && noZuoraAccount && remainingTime < 0
  }

  renderAnonAlerts = () => {
    const { props } = this
    const { alertBar, auth } = props
    const isAuthorized = auth.get('jwt')
    const anonLang = alertBar.getIn(['data', 'anonymousLanguage'])
    const visible = alertBar.get('visible')

    if (visible && anonLang && !isAuthorized) {
      const { setUserDataLanguageAlertBarDeclined } = props
      const onClick = alertBar.getIn(['data', 'anonymousLanguage'])
        ? setUserDataLanguageAlertBarDeclined
        : undefined
      return (
        <AlertBar dismissable onClose={onClick}>
          <AlertBarAnonymousLanguage history={props.history} />
        </AlertBar>
      )
    }
    return null
  }

  renderMemberAlerts = () => {
    const { props } = this
    const { auth, user, alertBar, userAccount, userProfiles, location } = props
    const isPrimaryUser = toNumber(userProfiles.getIn(['data', 0, 'uid'])) === user.getIn(['data', 'uid'])
    const paymentError = showPaymentErrorMessage({ userAccount })
    const dismissed = alertBar.get('dismissed')

    if (location && !headerAlertBarShouldRender(location)) {
      return null
    }

    if (this.showFreeTrial()) {
      return (
        <AlertBar error>
          <AlertBarFreeTrialExpired />
        </AlertBar>
      )
    }

    if (auth.get('jwt') && paymentError && isPrimaryUser && !dismissed) {
      return (
        <AlertBar error dismissable>
          <AlertBarPaymentError />
        </AlertBar>
      )
    }

    return null
  }

  renderNotification = (campaign, variation, onDismiss) => {
    const { data = {} } = variation
    const { html = '' } = data
    const innerHtml = { __html: html }
    /* eslint-disable react/no-danger */
    return html ? (
      <AlertBar dismissable onDismiss={onDismiss}>
        <span dangerouslySetInnerHTML={innerHtml} />
      </AlertBar>
    ) : null
    /* eslint-enable */
  }

  renderAlert = () => {
    const { props } = this
    const { auth } = props
    const isAuthorized = auth.get('jwt')

    if (!isAuthorized) {
      return this.renderAnonAlerts()
    }
    return this.renderMemberAlerts()
  }

  render () {
    const { onDismissAnonRibbon, onDismissMemberRibbon } = this
    return this.renderAlert() || (
      <TestarossaSwitch>
        <TestarossaCase campaign="RI-97">
          {(campaign, variation) => (
            this.renderNotification(
              campaign, variation, onDismissMemberRibbon)
          )}
        </TestarossaCase>
        <TestarossaCase campaign="RI-98">
          {(campaign, variation) => (
            this.renderNotification(
              campaign, variation, onDismissAnonRibbon)
          )}
        </TestarossaCase>
        <TestarossaDefault unwrap>
          {null}
        </TestarossaDefault>
      </TestarossaSwitch>
    )
  }
}

AlertBarLoader.propTypes = {
  alertBar: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  location: PropTypes.object,
  history: PropTypes.object,
}

export default connectRedux(
  state => ({
    userProfiles: state.userProfiles,
    userAccount: state.userAccount,
    alertBar: state.alertBar,
    user: state.user,
    auth: state.auth,
    page: state.page,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setUserDataLanguageAlertBarDeclined:
        actions.user.setUserDataLanguageAlertBarDeclined,
    }
  },
)(AlertBarLoader)
