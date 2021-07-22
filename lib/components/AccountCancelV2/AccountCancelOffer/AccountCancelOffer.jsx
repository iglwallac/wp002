import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import GaiaLogo, { TYPE_WHITE } from 'components/GaiaLogo'
import Link from 'components/Link'
import Icon from 'components/Icon'
import { getPrimary } from 'services/languages'
import { Button, TYPES } from 'components/Button.v2'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { URL_JAVASCRIPT_VOID, TARGET_BLANK } from 'components/Link/constants'
import { SPECIAL_OFFER_DURATION } from 'services/user-account'
import {
  getCurrentTime,
  addDays,
  getDateTime,
  ordinalDateFormatingi18n,
  getDateLocale,
  formatWithLocale,
} from 'services/date-time'
import { URL_ACCOUNT } from 'services/url/constants'
import { H4, H2, H1, HEADING_TYPES } from 'components/Heading'

const dataLayer = global.dataLayer

function AccountCancelOffer (props) {
  const { fullPage, staticText, userAccount, user, subscription } = props
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatStringOrdinal = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const paidThroughDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'], getCurrentTime())
  const offerEndDate = addDays(paidThroughDate, SPECIAL_OFFER_DURATION)
  const reformattedPaidThroughDate = getDateTime(paidThroughDate)
  const reformattedOfferEndDate = getDateTime(offerEndDate)
  const formattedPaidThroughDate = formatWithLocale(
    reformattedPaidThroughDate,
    dateFormatStringOrdinal,
    { locale: dateLocale })
  const formattedOfferEndDate = formatWithLocale(
    reformattedOfferEndDate,
    dateFormatStringOrdinal,
    { locale: dateLocale })
  const subscriptionError = subscription.get('errors')
  const subscriptionProcessing = subscription.get('processing')
  const subscriptionSuccess = subscription.get('success')
  const description = String(staticText.get('description'))
    .replace(/\$\{ beginDate \}/, formattedPaidThroughDate)
    .replace(/\$\{ endDate \}/, formattedOfferEndDate)
  const expireDate = formatWithLocale(
    reformattedPaidThroughDate,
    dateFormatStringOrdinal,
    { locale: dateLocale },
  )
  const confirmDescriptionBefore = staticText.get('subscriptionExtendedBefore')
  const confirmDescriptionAfter = staticText.get('subscriptionExtendedAfter')
  const userAccountProcessing = userAccount.get('billingSubscriptionsProcessing')

  const onClickRedeemOffer = useCallback(() => {
    const { setUserComp } = props
    const eventAction = fullPage ? 'final step free month offer' : 'too expensive free month offer'

    setUserComp()

    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'User Engagement',
        eventAction,
        eventLabel: 'redeem offer CTA',
      })
    }
  }, [])

  const renderErrorState = () => {
    return (
      <React.Fragment>
        <p className="account-cancel-offer__error">{staticText.get('errorMessage')}</p>
        <p className="account-cancel-offer__error-text">{staticText.get('errorMessageSubText1')}
          <Link
            to={'https://gaiasupportcenter.zendesk.com/hc/en-us'}
            directLink
            target={TARGET_BLANK}
            className="account-cancel__list-link"
          > {staticText.get('customerService')} </Link>
          {staticText.get('errorMessageSubText2')}</p>
        <Button
          url={URL_JAVASCRIPT_VOID}
          onClick={onClickRedeemOffer}
          type={TYPES.PRIMARY}
          className="account-cancel-buttons__previous"
        >
          {staticText.get('retry')}
        </Button>
      </React.Fragment>
    )
  }

  const renderProcessingState = () => {
    return (
      <div className="account-cancel-offer__processing-container">
        <Sherpa className={['account-cancel-offer__sherpa']} type={TYPE_LARGE} />
        <p className="account-cancel-offer__processing">{staticText.get('processing')}</p>
      </div>
    )
  }

  const renderSubscriptionSuccessState = () => {
    return (
      <React.Fragment>
        <div className="account-cancel-offer__success-container">
          <H2 className="account-cancel-offer__success">{staticText.get('enjoyYourFreeMonth')}</H2>
          <p className="account-cancel-offer__success-text">{confirmDescriptionBefore} <strong>{expireDate}</strong>, {confirmDescriptionAfter}</p>
          <div className="account-cancel-confirm-page__links">
            <Link
              className="account-cancel-confirm-page__link"
              to={URL_ACCOUNT}
            >
              {staticText.get('myAccount')}
              <Icon
                iconClass={[
                  'account-cancel-confirm-page__arrow-right',
                  'icon--right',
                  'icon--action',
                ]}
              />
            </Link>
          </div>
        </div>
      </React.Fragment>
    )
  }

  const handelErrorProccessingState = () => {
    if (subscriptionProcessing || userAccountProcessing) {
      return renderProcessingState()
    } else if (subscriptionError && !subscriptionProcessing) {
      return renderErrorState()
    }

    return (
      <Button
        url={URL_JAVASCRIPT_VOID}
        type={TYPES.SECONDARY}
        className="account-cancel-offer__button"
        onClick={onClickRedeemOffer}
      >
        {staticText.get('redeemOffer2')}
      </Button>
    )
  }


  return (
    !subscriptionSuccess || (subscriptionSuccess && userAccountProcessing) ?
      <div className={`account-cancel-offer${fullPage ? ' account-cancel-offer--full-page' : ''}`}>
        {
          fullPage ?
            <H1 as={HEADING_TYPES.H3} className="account-cancel-offer__title">
              {staticText.get('title2')}
            </H1>
            :
            <H4 as={HEADING_TYPES.H6} className="account-cancel-offer__title">
              {staticText.get('title')}
            </H4>
        }
        {
          <p className="account-cancel-offer__description">
            {description}
          </p>
        }
        <div className="account-cancel-offer__cta">
          <div className="account-cancel-offer__cta-label">
            {staticText.get('specialOffer')}
          </div>
          <div className="account-cancel-offer__cta-logo">
            <GaiaLogo
              type={TYPE_WHITE}
              className={['account-cancel-offer__gaia-logo']}
              isHref={false}
            />
            <div className="account-cancel-offer__cta-blurb">
              {staticText.get('oneMonthFree')}
            </div>
          </div>
        </div>
        {handelErrorProccessingState()}
      </div>
      : renderSubscriptionSuccessState()
  )
}

AccountCancelOffer.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  subscription: ImmutablePropTypes.map.isRequired,
  fullPage: PropTypes.bool,
  setUserComp: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      auth: state.auth,
      user: state.user,
      userAccount: state.userAccount,
      page: state.page,
      subscription: state.subscription,
      staticText: state.staticText.getIn(['data', 'accountCancelOffer', 'data']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUserComp: actions.subscription.setUserComp,
      }
    },
  ),
)(AccountCancelOffer)
