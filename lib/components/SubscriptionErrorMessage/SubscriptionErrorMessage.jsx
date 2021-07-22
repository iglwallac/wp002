import ButtonSignUp, { BUTTON_SIGN_UP_TYPE_LINK } from 'components/ButtonSignUp'
import Sherpa, { TYPE_STATIC_GRAY_DARK } from 'components/Sherpa'
import { USER_ACCOUNT_PAUSED } from 'services/user-account'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectRedux } from 'react-redux'
import { URL_ACCOUNT } from 'services/url/constants'
import { get as getConfig } from 'config'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import _get from 'lodash/get'
import React from 'react'

const config = getConfig()

function SubscriptionErrorMessage (props) {
  const { staticText, status } = props
  const accountPauseConfigured = !!_get(config, ['features', 'userAccount', 'accountPause'])
  const paused = (status === USER_ACCOUNT_PAUSED) && accountPauseConfigured

  return (
    <div className={'subscription-error-message'}>
      <Sherpa
        className={['subscription-error-message__sherpa']}
        type={TYPE_STATIC_GRAY_DARK}
      />
      <div className="subscription-error-message__content">
        {paused
          ? `${staticText.get('paused')} `
          : `${staticText.get('expired')} `}
        {paused
          ? <Link
            to={URL_ACCOUNT}
            scrollToTop
          >
            {staticText.get('resume')}
          </Link>
          : <ButtonSignUp
            type={BUTTON_SIGN_UP_TYPE_LINK}
            text={staticText.get('renew')}
            scrollToTop
          />}
      </div>
    </div>
  )
}

SubscriptionErrorMessage.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  status: PropTypes.string,

}

export default connectRedux(
  state => ({
    status: state.userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status']),
    staticText: state.staticText.getIn(['data', 'subscriptionErrorMessage', 'data']),
  }),
)(SubscriptionErrorMessage)
