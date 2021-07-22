import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { getPrimary } from 'services/languages'
import Icon from 'components/Icon'
import Button from 'components/Button'
import Link from 'components/Link'
import { TARGET_BLANK } from 'components/Link/constants'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import {
  getCurrentTime,
  addDays,
  format as formatDateTime,
  getDateTime,
} from 'services/date-time'
import { getEmailCustomerServiceUrl } from 'services/url'
import { SPECIAL_OFFER_DURATION } from 'services/user-account'
import { H4 } from 'components/Heading'

function getClassName (fixed, element = null, modifier = null, errors) {
  const classList = []
  const popupBase = ['account-cancel-offer-popup']
  const staticBase = ['account-cancel-offer-page']

  if (fixed && !element) {
    classList.push(staticBase)
  } else if (!fixed && !element) {
    classList.push(popupBase)
  }

  if (!fixed && modifier) {
    classList.push(`${popupBase}__${element}--${modifier}`)
  } else if (!fixed && element) {
    classList.push(`${popupBase}__${element}`)
  }

  if (fixed && modifier) {
    classList.push(`${staticBase}__${element}--${modifier}`)
  } else if (fixed && element) {
    classList.push(`${staticBase}__${element}`)
  }

  if (fixed && element === 'special-offer' && errors) {
    classList.push(`${staticBase}__${element}--hide`)
  }

  return classList.join(' ')
}

function renderErrorMessage (staticText, userLanguage, fixed) {
  return (
    <div className={getClassName(fixed, 'content')}>
      <H4 className={getClassName(fixed, 'title')}>
        {staticText.getIn(['data', 'somethingWentWrong'])}
      </H4>
      <p className={getClassName(fixed, 'description')}>
        {`${staticText.getIn(['data', 'problem'])} `}
        <Link
          className={getClassName(fixed, 'cs-link')}
          to={getEmailCustomerServiceUrl(userLanguage)}
          directLink
          target={TARGET_BLANK}
        >
          {staticText.getIn(['data', 'contactCustomerService'])}
        </Link> {staticText.getIn(['data', 'ifQuestions'])}
      </p>
    </div>
  )
}

function renderInitialOffer (paidThroughDate, offerEndDate, props, ctaClick) {
  const { subscription, staticText, user, fixed } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))

  if (subscription.get('errors')) {
    return renderErrorMessage(staticText, userLanguage, fixed)
  }

  const offerPeriod = String(staticText.getIn(['data', 'offerPeriod']))
    .replace(/\$\{ paidThroughDate \}/, paidThroughDate)
    .replace(/\$\{ offerEndDate \}/, offerEndDate)

  return (
    <div className={getClassName(fixed, 'content')}>
      <H4 className={getClassName(fixed, 'title')}>{staticText.getIn(['data', 'monthOnUs'])}</H4>
      <p className={getClassName(fixed, 'description')}>{staticText.getIn(['data', 'stayFree'])}</p>
      {
        subscription.get('processing') ?
          <div>
            <Sherpa className={['account-cancel-offer-popup__sherpa']} type={TYPE_SMALL_BLUE} />
            <p className={getClassName(fixed, 'processing-text')}>
              {`${staticText.getIn(['data', 'processing'])}...`}
            </p>
          </div> :
          <Button
            buttonClass={['button--primary', 'account-cancel-offer-popup__cta']}
            text={staticText.getIn(['data', 'redeemOffer'])}
            onClick={() => ctaClick()}
          />
      }
      <div className={getClassName(fixed, 'sep')} />
      <div className={getClassName(fixed, 'explain')}>
        {offerPeriod}
      </div>
    </div>
  )
}

function renderOfferThankyou (
  offerEndDate,
  staticText,
  getUserAccountDataBillingSubscriptionsWithDetails,
  fixed,
) {
  const subscriptionExtended = String(staticText.getIn(['data', 'subscriptionExtended']))
    .replace(/\$\{ offerEndDate \}/, offerEndDate)

  return (
    <div className={getClassName(fixed, 'content')}>
      <H4 className={getClassName(fixed, 'title')}>{staticText.getIn(['data', 'thankYou'])}</H4>
      <p className={getClassName(fixed, 'description')}>{staticText.getIn(['data', 'enjoyFreeMonth'])}</p>
      <Button
        buttonClass={['button--primary', 'account-cancel-offer-popup__cta']}
        text={staticText.getIn(['data', 'gaiaHome'])}
        url={'/'}
        onClick={() => getUserAccountDataBillingSubscriptionsWithDetails()}
      />
      <div className={getClassName(fixed, 'sep')} />
      <div className={getClassName(fixed, 'explain')}>
        {subscriptionExtended}
      </div>
    </div>
  )
}

class AccountCancelOfferPopup extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      offerRedeemed: false,
    }
  }

  componentDidMount () {
    this.initialize()
  }

  componentWillReceiveProps (nextProps) {
    const { subscription } = nextProps
    const nextCompId = subscription.get('compId')
    const previousCompId = this.props.subscription.get('compId')

    if (nextCompId !== previousCompId) {
      this.setState(() => ({ offerRedeemed: true }))
    }
  }

  onPopupClose = () => {
    const { setEventAccountCancelOfferPopup } = this.props
    this.setState(() => ({ show: false }))
    setEventAccountCancelOfferPopup(
      {
        event: 'customEvent',
        eventCategory: 'pop-up',
        eventAction: 'exit-click',
        eventLabel: 'cancel-flow-message',
      },
    )
  }

  onGetUserAccountDataBillingSubscriptionsWithDetails = () => {
    const {
      auth,
      getUserAccountDataBillingSubscriptionsWithDetails,
    } = this.props
    getUserAccountDataBillingSubscriptionsWithDetails({ auth })
  }

  onCtaClick = () => {
    const {
      auth,
      processCompUserSubscription,
      setEventAccountCancelOfferPopup,
    } = this.props
    processCompUserSubscription({ auth })
    setEventAccountCancelOfferPopup(
      {
        event: 'customEvent',
        eventCategory: 'user engagement',
        eventAction: 'Call to Action',
        eventLabel: 'accept offer',
      },
    )
  }

  initialize = () => {
    this.setState(
      () => ({ show: true }))
  }

  render () {
    const { show, offerRedeemed } = this.state
    const { page, userAccount, staticText, fixed, subscription } = this.props
    const errors = subscription.get('errors')
    const dateFormatString = 'MM/DD/YY'
    const paidThroughDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'], getCurrentTime())
    const offerEndDate = addDays(paidThroughDate, SPECIAL_OFFER_DURATION)
    const reformattedPaidThroughDate = getDateTime(paidThroughDate)
    const reformattedOfferEndDate = getDateTime(offerEndDate)
    const locale = page.get('locale')
    const formattedPaidThroughDate =
      formatDateTime(reformattedPaidThroughDate, locale, dateFormatString)
    const formattedOfferEndDate = formatDateTime(reformattedOfferEndDate, locale, dateFormatString)

    if (show) {
      return (
        <div className={getClassName(fixed)}>
          <div className={getClassName(fixed, 'wrapper')}>
            <div className={getClassName(fixed, 'special-offer', null, errors)}>
              {staticText.getIn(['data', 'specialOffer'])}
            </div>
            {
              !offerRedeemed ?
                <Icon
                  iconClass={['icon--close', 'icon--action', 'account-cancel-offer-popup__close-icon']}
                  onClick={() => this.onPopupClose()}
                /> : null
            }
            {
              !offerRedeemed ?
                renderInitialOffer(
                  formattedPaidThroughDate,
                  formattedOfferEndDate,
                  this.props,
                  this.onCtaClick,
                ) : null
            }
            {
              offerRedeemed ?
                renderOfferThankyou(
                  formattedOfferEndDate,
                  staticText,
                  this.onGetUserAccountDataBillingSubscriptionsWithDetails,
                  fixed,
                ) : null
            }
          </div>
        </div>
      )
    }

    return null
  }
}

AccountCancelOfferPopup.propTypes = {
  history: PropTypes.object,
  fixed: PropTypes.bool,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  subscription: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  processCompUserSubscription: PropTypes.func.isRequired,
  setEventAccountCancelOfferPopup: PropTypes.func.isRequired,
  getUserAccountDataBillingSubscriptionsWithDetails: PropTypes.func.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'accountCancelOfferPopup' }),
  connectRedux(
    state => ({
      user: state.user,
      userAccount: state.userAccount,
      auth: state.auth,
      page: state.page,
      subscription: state.subscription,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        processCompUserSubscription: actions.subscription.processCompUserSubscription,
        setEventAccountCancelOfferPopup:
          actions.eventTracking.setEventAccountCancelOfferPopup,
        getUserAccountDataBillingSubscriptionsWithDetails:
          actions.userAccount.getUserAccountDataBillingSubscriptionsWithDetails,
      }
    },
  ),
)(AccountCancelOfferPopup)
