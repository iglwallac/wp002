import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { Map, List, fromJS } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import {
  connect as connectPage,
  PAGE_SEO_TYPE_LOCATION,
} from 'components/Page/connect'
import { getBoundActions } from 'actions'
import { setContentImpression } from 'services/content-impressions'
import _get from 'lodash/get'
import { historyRedirect } from 'services/navigation'
import CartBillingProcessing from 'components/CartBillingProcessing'
import Button from 'components/Button'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { URL_PLAN_SELECTION } from 'services/url/constants'
import { getEmailCustomerServiceUrl } from 'services/url'
import { PLAN_SKU_LIVE } from 'services/plans'
import { getPrimary } from 'services/languages'
import { EUR, GBP } from 'services/currency'
import OptimizelyTest from 'components/OptimizelyTest'
import CartConfirmationPage from 'components/CartV2/CartConfirmationPage'
import { H2 } from 'components/Heading'
import {
  getDateTime,
  ordinalDateFormatingi18n,
  getDateLocale,
  formatWithLocale,
} from 'services/date-time'

async function finializeCheckout (props) {
  const {
    auth,
    user = Map(),
    inboundTracking,
    checkout,
    doAuthRenew,
    doAuthLogin,
    setFeatureTrackingDataPersistent,
    setMessageBoxVisible,
  } = props
  const userInfo = checkout.get('account', Map())

  // if the user is already logged in
  if (auth.get('jwt')) {
    const authResult = await doAuthRenew(auth)
    setMessageBoxVisible(false)
    return onAuthSuccess(props, {
      auth: authResult,
      redirectUrl: '/',
    })
  }

  const authResult = await doAuthLogin({
    username: checkout.getIn(['orderData', 'newUsername']),
    password: userInfo.get('password'),
  })
  // Setup anything related to feature tracking now that we have auth
  // Chain authResult which come back
  await onAuthLoginFeatureTracking({
    auth: authResult,
    user,
    setFeatureTrackingDataPersistent,
  })

  // set the content impression
  if (
    inboundTracking.getIn(['data', 'ci_id']) ||
    inboundTracking.getIn(['data', 'ci_type'])
  ) {
    setContentImpression({
      auth: authResult,
      timestamp: new Date(),
      contentId: inboundTracking.getIn(['data', 'ci_id']),
      contentType: inboundTracking.getIn(['data', 'ci_type']),
    })
  }
  return authResult
}

/**
 * Handle the auth login response and set any additional user data
 */
async function onAuthLoginFeatureTracking (options = {}) {
  const { auth, user, setFeatureTrackingDataPersistent } = options
  const userLanguages = user.getIn(['data', 'language'], List())
  if (userLanguages.size > 0) {
    // No matter what happens with Feature tracking resolve with auth
    try {
      await setFeatureTrackingDataPersistent({
        auth: fromJS(auth),
        data: Map({ userLanguages }),
      })
    } catch (e) {
      // Do nothing
    }
  }
  return auth
}

function onAuthSuccess (props, options) {
  const {
    auth,
  } = options
  const {
    setCheckoutOrderComplete,
    resetOnboarding,
    inboundTracking,
    setCheckoutOrderProcessing,
  } = props
  if (
    inboundTracking.getIn(['data', 'ci_id']) ||
    inboundTracking.getIn(['data', 'ci_type'])
  ) {
    setContentImpression({
      auth: _get(auth, 'jwt'),
      timestamp: new Date(),
      contentId: inboundTracking.getIn(['data', 'ci_id']),
      contentType: inboundTracking.getIn(['data', 'ci_type']),
    })
  }
  resetOnboarding()
  setCheckoutOrderProcessing(false)
  setCheckoutOrderComplete(true)
}

class CartReceiptPage extends PureComponent {
  componentDidMount () {
    const { props } = this
    const { history, checkout, auth, user = Map() } = props
    const language = user.getIn(['data', 'language'])

    if (!checkout.get('orderData') && !auth.get('jwt')) {
      historyRedirect({ history, url: URL_PLAN_SELECTION, auth, language })
    } else if (auth.get('jwt') && !checkout.get('orderData')) {
      historyRedirect({ history, url: '/', auth, language })
    } else {
      finializeCheckout(props)
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const {
      auth,
      inboundTracking,
      saveUserReferralAttributionData,
    } = nextProps
    const referralId = inboundTracking.getIn(['data', 'rfd'])
    const source = inboundTracking.getIn(['data', 'source'])
    const sourceId = inboundTracking.getIn(['data', 'sourceId'])
    const jwt = auth.get('jwt')
    const previousJwt = this.props.auth.getIn(['jwt'])
    if (referralId && jwt !== previousJwt) {
      saveUserReferralAttributionData({ auth, referralId, source, sourceId })
    }
  }

  getContent = (props) => {
    const { checkout, plans, auth, user, userAccount, staticText } = props
    const orderData = checkout.get('orderData', Map())
    const userIsNew = orderData.get('userIsNew', false)
    const userLanguage = getPrimary(user.getIn(['data', 'language']))
    const subscription = userAccount.getIn(['details', 'data', 'billing', 'subscriptions'], Map())
    const subscriptionPaidThroughDate = subscription.get('paidThroughDate')
    const dateFormatStringOrdinal = ordinalDateFormatingi18n(userLanguage)
    const dateLocale = getDateLocale(userLanguage)
    const reformattedPaidThroughDate = subscriptionPaidThroughDate ?
      getDateTime(subscriptionPaidThroughDate) : undefined
    const formattedPaidThroughDate = reformattedPaidThroughDate ? formatWithLocale(
      reformattedPaidThroughDate,
      dateFormatStringOrdinal,
      { locale: dateLocale },
    ) : null
    const newUsername = orderData.get('newUsername')
    const email = orderData.getIn(['gcsi', 'user', 'email']) ||
      checkout.getIn(['account', 'email']) ||
      user.getIn(['data', 'mail'])
    const selectionSku = plans.getIn(['selection', 'sku'])
    const currencyIso = plans.getIn(['selection', 'currencyIso'])
    const dollarIso = (
      currencyIso === EUR ||
      currencyIso === GBP ||
      selectionSku !== PLAN_SKU_LIVE
    ) ? null : plans.getIn(['selection', 'currencyIso'])


    return (
      <div className="cart-receipt">
        <div className="cart-receipt__wrapper">
          {
            !auth.get('jwt') && orderData ?
              <CartBillingProcessing />
              : <div>
                <H2 className="cart-receipt__title">
                  {staticText.getIn(['data', 'confirmation'])}
                </H2>
                <div className="cart-receipt__receipt">
                  <div className="cart-receipt__receipt-header">
                    {staticText.getIn(['data', 'yourGaiaInfo'])}
                  </div>
                  <div className="cart-receipt__receipt-details">
                    {
                      plans.getIn(['selection', 'shortDetails']) ?
                        <div className="cart-receipt__receipt-detail">
                          {plans.getIn(['selection', 'shortDetails'])} {dollarIso}
                        </div>
                        : null
                    }
                    {
                      subscriptionPaidThroughDate ?
                        <div className="cart-receipt__receipt-detail">
                          {`${staticText.getIn(['data', 'nextBillingDate'])}: ${formattedPaidThroughDate}`}
                        </div>
                        : null
                    }
                    {
                      newUsername ?
                        <div className="cart-receipt__receipt-detail">
                          {`${staticText.getIn(['data', 'userName'])}: ${newUsername}`}
                        </div>
                        : null
                    }
                    {
                      email ?
                        <div className="cart-receipt__receipt-detail">
                          {`${staticText.getIn(['data', 'email'])}: ${email}`}
                        </div>
                        : null
                    }
                  </div>
                  <div className="cart-receipt__contact-info">
                    <p>{`${staticText.getIn(['data', 'changeInfo'])}`}</p>
                    {`${staticText.getIn(['data', 'contactInfo'])} `}
                    <Link
                      directLink
                      to={getEmailCustomerServiceUrl(userLanguage)}
                      target={TARGET_BLANK}
                      className="account-cancel-confirm__cs-link"
                    >
                      {`${staticText.getIn(['data', 'contactLink'])}.`}
                    </Link>
                  </div>
                </div>
                <Button
                  url={userIsNew ? '/get-started' : '/'}
                  text={staticText.getIn(['data', 'getStarted'])}
                  buttonClass={['button--primary', 'cart-receipt__personalize-btn']}
                />
              </div>
          }
        </div>
      </div>
    )
  }

  render () {
    const { props } = this

    return (
      <React.Fragment>
        <OptimizelyTest
          original
          experimentId={'19422180075'}
          variantId={'19419760057'}
        >
          {this.getContent(props)}
        </OptimizelyTest>
        <OptimizelyTest
          original={false}
          experimentId={'19422180075'}
          variantId={'19431530074'}
        >
          <CartConfirmationPage />
        </OptimizelyTest>
      </React.Fragment>
    )
  }
}

CartReceiptPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  checkout: ImmutablePropTypes.map.isRequired,
  inboundTracking: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  setCheckoutOrderComplete: PropTypes.func.isRequired,
  resetOnboarding: PropTypes.func.isRequired,
  setCheckoutOrderProcessing: PropTypes.func.isRequired,
  doAuthLogin: PropTypes.func.isRequired,
  doAuthRenew: PropTypes.func.isRequired,
  setFeatureTrackingDataPersistent: PropTypes.func.isRequired,
  setMessageBoxViewed: PropTypes.func,
  setMessageBoxVisible: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      checkout: state.checkout,
      auth: state.auth,
      plans: state.plans,
      user: state.user,
      userAccount: state.userAccount,
      inboundTracking: state.inboundTracking,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setCheckoutOrderComplete: actions.checkout.setCheckoutOrderComplete,
        resetOnboarding: actions.onboarding.resetOnboarding,
        setCheckoutOrderProcessing: actions.checkout.setCheckoutOrderProcessing,
        doAuthLogin: actions.auth.doAuthLogin,
        doAuthRenew: actions.auth.doAuthRenew,
        setFeatureTrackingDataPersistent:
          actions.featureTracking.setFeatureTrackingDataPersistent,
        setMessageBoxVisible: actions.messageBox.setMessageBoxVisible,
        saveUserReferralAttributionData: actions.userReferrals.saveUserReferralAttributionData,
      }
    },
  ),
  connectStaticText({ storeKey: 'cartReceiptPage' }),
)(CartReceiptPage)
