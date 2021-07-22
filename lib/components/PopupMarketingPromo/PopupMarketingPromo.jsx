import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { URL_PLAN_SELECTION } from 'services/url/constants'
import Button from 'components/Button'
import _startsWith from 'lodash/startsWith'
import GaiaLogo, { TYPE_BLUE_DARK } from 'components/GaiaLogo/GaiaLogo'
import { connect as connectStaticText } from 'components/StaticText/connect'
import {
  PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS,
  PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY,
  getNextPriceFromPlan,
} from 'services/plans'
import { getPrimary } from 'services/languages'
import { EN } from 'services/languages/constants'
import {
  isLogout,
  isLogin,
  isAnonymousHome,
  isGetStarted,
  isCart,
  isPlans,
  isFullPlayer,
  isPasswordReset,
  isGo,
  isPolicy,
  isActivate,
  isSharePage,
  isPlanSelectionPlans,
  isMyAccountPage,
  isLivePage,
  isLiveEvents,
  isLiveAccessPage,
  isLiveChannelPage,
  isEmailSettings,
  isFreeTrial,
  isFreeTrialAccount,
  isFreeTrialConfirm,
  isGiftLandingPage,
  isGiftSelect,
  isGiftThemePage,
  isGiftRecipientInfoPage,
  isGiftPreviewPage,
  isGiftPaymentPage,
  isGiftConfirmationPage,
  isGiftRedeemPage,
  isGiftAccountCreatePage,
} from 'services/url'
import Icon from 'components/Icon'

function onClickCta (
  e,
  setPopupMarketingPromoCookiePersistent,
  setPopupMarketingPromoVisible,
  setPopupMarketingPromoSuccess,
  uid,
  authToken,
) {
  e.stopPropagation()
  setPopupMarketingPromoCookiePersistent(1, uid, authToken)
  setPopupMarketingPromoVisible(false)
  setPopupMarketingPromoSuccess(true)
}

function onClickClose (
  e,
  setPopupMarketingPromoCookiePersistent,
  setPopupMarketingPromoVisible,
  setPopupMarketingPromoSuccess,
  uid,
  authToken,
) {
  e.stopPropagation()
  setPopupMarketingPromoCookiePersistent(1, uid, authToken)
  setPopupMarketingPromoVisible(false)
  setPopupMarketingPromoSuccess(false)
}

function shouldRender (
  isAuthenticated,
  promoCookie,
  location,
  activeDialog,
) {
  if (
    isAuthenticated ||
    promoCookie ||
    isSharePage(location.pathname) ||
    isLogout(location.pathname) ||
    isLogin(location.pathname) ||
    isGetStarted(location.pathname) ||
    isCart(location.pathname) ||
    isPlans(location.pathname) ||
    isFullPlayer(location.query) ||
    isGo(location.pathname) ||
    isPasswordReset(location.pathname) ||
    isAnonymousHome(location.pathname, isAuthenticated) ||
    isPolicy(location.pathname) ||
    isActivate(location.pathname) ||
    isPlanSelectionPlans(location.pathname) ||
    isMyAccountPage(location.pathname) ||
    isLivePage(location.pathname) ||
    isLiveEvents(location.pathname) ||
    isLiveAccessPage(location.pathname) ||
    isLiveChannelPage(location.pathname) ||
    isEmailSettings(location.pathname) ||
    isFreeTrial(location.pathname) ||
    isFreeTrialAccount(location.pathname) ||
    isFreeTrialConfirm(location.pathname) ||
    isGiftLandingPage(location.pathname) ||
    isGiftSelect(location.pathname) ||
    isGiftThemePage(location.pathname) ||
    isGiftRecipientInfoPage(location.pathname) ||
    isGiftPreviewPage(location.pathname) ||
    isGiftPaymentPage(location.pathname) ||
    isGiftConfirmationPage(location.pathname) ||
    isGiftRedeemPage(location.pathname) ||
    isGiftAccountCreatePage(location.pathname) ||
    activeDialog ||
    _startsWith(location.pathname, '/invite/join')
  ) {
    return false
  }
  return true
}

function getIconClass (userLanguage) {
  const prefix = 'popup-marketing-promo__right-icon'
  const className = ['icon--check', `${prefix}--${userLanguage}`]
  return className
}

function getLeftPriceClass (userLanguage) {
  const prefix = 'popup-marketing-promo__left-price'
  const className = ['popup-marketing-promo__left-price', `${prefix}--${userLanguage}`]
  return className.join(' ')
}

function getRightMessageClass (userLanguage, type) {
  const prefix = 'popup-marketing-promo__right-message'
  const className = ['popup-marketing-promo__right-message', `${prefix}--${type}-${userLanguage}`]
  return className.join(' ')
}

class PopupMarketingPromo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      processing: false,
    }
  }

  componentDidMount () {
    const props = this.props
    const {
      popupMarketingPromo,
      getPopupMarketingPromoCookiePersistent,
    } = props
    if (!popupMarketingPromo.get('cookie')) {
      // initialize the cookie value in the store
      getPopupMarketingPromoCookiePersistent()
    }
  }

  componentWillReceiveProps (nextProps) {
    if (process.env.BROWSER) {
      const props = this.props
      const { auth, timer } = nextProps
      const promoCookie = nextProps.popupMarketingPromo.get('cookie')
      const activeDialog = nextProps.dialog.get('componentName')
      const popupVisible = nextProps.popupMarketingPromo.get('visible')
      const isAuthenticated = auth.get('jwt') ? true : false  // eslint-disable-line
      const popupShouldRender = shouldRender(
        isAuthenticated,
        promoCookie,
        nextProps.location,
        activeDialog,
      )
      // If we are changing urls and shouldn't render the popup
      // mainly for the browser back/forward button
      if (
        props.location.pathname !== nextProps.location.pathname &&
        !popupShouldRender
      ) {
        clearTimeout(this._setPopupTimeout)
        this.setState(() => ({ processing: false }))
        if (popupVisible) {
          props.setPopupMarketingPromoVisible(false)
        }
      } else if (nextProps.dialog.get('componentName') !== null) {
        // If we are transitioning from not having a dialog to having one
        clearTimeout(this._setPopupTimeout)
        this.setState(() => ({ processing: false }))
        if (popupVisible) {
          props.setPopupMarketingPromoVisible(false)
        }
      } else if (this.state.processing !== true && popupShouldRender) {
        // if we haven't alread set processing state and the popup should render
        this.setState(() => ({ processing: true }))
        this._setPopupTimeout = setTimeout(() => {
          props.setPopupMarketingPromoVisible(true)
          props.setPopupMarketingPromo(
            {
              event: 'customEvent',
              eventCategory: 'pop-up',
              eventAction: 'displayed',
              eventLabel: 'sign-up-popup',
            },
          )
        }, timer)
      }
    }
  }

  componentWillUnmount () {
    if (process.env.BROWSER) {
      const props = this.props
      const { setPopupMarketingPromoVisible } = props
      setPopupMarketingPromoVisible(false)
      clearTimeout(this._setPopupTimeout)
    }
  }

  render () {
    const props = this.props
    const {
      location,
      popupMarketingPromo,
      dialog,
      setPopupMarketingPromoCookiePersistent,
      setPopupMarketingPromoVisible,
      setPopupMarketingPromoSuccess,
      setPopupMarketingPromo,
      auth,
      staticText,
      plans,
      userLanguage,
    } = props
    const promoCookie = popupMarketingPromo.get('cookie')
    const popupVisible = popupMarketingPromo.get('visible')
    const activeDialog = dialog.get('componentName', null)
    const authToken = auth.get('jwt')
    const uid = auth.get('uid')
    const isAuthenticated = authToken ? true : false  // eslint-disable-line
    const popupShouldRender = shouldRender(
      isAuthenticated,
      promoCookie,
      location,
      activeDialog,
    )
    const subscriptionPlans = plans.getIn(['data', 'plans'], List())
    const twoWeekTrial = subscriptionPlans.size > 0 ? subscriptionPlans.find(plan => plan.get('sku') === PLAN_SKU_NINETY_NINE_CENT_TWO_WEEKS) : null
    const oneWeekTrialToMonthly = subscriptionPlans.size > 0 ? subscriptionPlans.find(plan => plan.get('sku') === PLAN_SKU_ONE_WEEK_FREE_TRIAL_TO_MONTHLY) : null
    const costAfterTrialText = staticText.getIn(['data', 'costAfterTrial'])
    const userPrimaryLanguage = getPrimary(userLanguage)
    const userLanguageIsEn = userPrimaryLanguage === EN

    if (popupShouldRender && popupVisible && twoWeekTrial) {
      return (
        <div className="popup-marketing-promo">
          <div className="popup-marketing-promo__content">
            <span
              className="popup-marketing-promo__close"
              onClick={function closeClick (e) {
                setPopupMarketingPromo(
                  {
                    event: 'customEvent',
                    eventCategory: 'pop-up',
                    eventAction: 'exit-click',
                    eventLabel: 'sign-up-popup',
                  },
                )
                onClickClose(
                  e,
                  setPopupMarketingPromoCookiePersistent,
                  setPopupMarketingPromoVisible,
                  setPopupMarketingPromoSuccess,
                  uid,
                  authToken,
                )
              }}
            >
              <Icon
                iconClass={['icon--close', 'popup-marketing-promo__close-icon']}
              />
            </span>
            <div className="popup-marketing-promo__left">
              <GaiaLogo
                type={TYPE_BLUE_DARK}
                className={['popup-marketing-promo__left-logo']}
              />
              <div className="popup-marketing-promo__left-message">{staticText.getIn(['data', 'description'])}</div>
              <div className={getLeftPriceClass(userPrimaryLanguage)}>
                {staticText.getIn(['data', 'free'])}
              </div>
              <div className={!userLanguageIsEn ? 'popup-marketing-promo__left-qualifier popup-marketing-promo__left-qualifier--non-en' : 'popup-marketing-promo__left-qualifier'}>
                {staticText.getIn(['data', 'promoPeriodOneWeek'])}
              </div>
              <Button
                url={URL_PLAN_SELECTION}
                text={staticText.getIn(['data', 'startTrial'])}
                buttonClass={['button--primary', !userLanguageIsEn ? 'popup-marketing-promo__cta-link popup-marketing-promo__cta-link--non-en' : 'popup-marketing-promo__cta-link']}
                onClick={function ctaClick (e) {
                  setPopupMarketingPromo(
                    {
                      event: 'customEvent',
                      eventCategory: 'pop-up',
                      eventAction: 'CTA-click',
                      eventLabel: 'sign-up-popup',
                    },
                  )
                  onClickCta(
                    e,
                    setPopupMarketingPromoCookiePersistent,
                    setPopupMarketingPromoVisible,
                    setPopupMarketingPromoSuccess,
                    uid,
                    authToken,
                  )
                }}
              />
            </div>
            <div className="popup-marketing-promo__right">
              <ul className="popup-marketing-promo__message-list">
                <li className="popup-marketing-promo__message-item">
                  <Icon iconClass={getIconClass(userPrimaryLanguage)} />
                  <div className="popup-marketing-promo__right-message">
                    {`${getNextPriceFromPlan(oneWeekTrialToMonthly)} ${costAfterTrialText}`}
                  </div>
                </li>
                <li className="popup-marketing-promo__message-item">
                  <Icon iconClass={getIconClass(userPrimaryLanguage)} />
                  <div className={getRightMessageClass(userPrimaryLanguage, 'cancel')}>{staticText.getIn(['data', 'cancelAnytime'])}</div>
                </li>
                <li className="popup-marketing-promo__message-item">
                  <Icon iconClass={getIconClass(userPrimaryLanguage)} />
                  <div className={getRightMessageClass(userPrimaryLanguage, 'stream')}>{staticText.getIn(['data', 'stream'])}</div>
                </li>
                <li className="popup-marketing-promo__message-item">
                  <Icon iconClass={getIconClass(userPrimaryLanguage)} />
                  <div className={getRightMessageClass(userPrimaryLanguage, 'unlimited')}>{staticText.getIn(['data', 'unlimitedStreaming'])}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
}

PopupMarketingPromo.propTypes = {
  location: PropTypes.object.isRequired,
  popupMarketingPromo: ImmutablePropTypes.map.isRequired,
  dialog: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  setPopupMarketingPromoVisible: PropTypes.func.isRequired,
  setPopupMarketingPromoCookiePersistent: PropTypes.func.isRequired,
  getPopupMarketingPromoCookiePersistent: PropTypes.func.isRequired,
  setPopupMarketingPromoSuccess: PropTypes.func.isRequired,
  setPopupMarketingPromo: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  userLanguage: ImmutablePropTypes.list.isRequired,
}

PopupMarketingPromo.contextTypes = {
  store: PropTypes.object.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'popupMarketingPromo' }),
  connectRedux(
    state => ({
      popupMarketingPromo: state.popupMarketingPromo,
      dialog: state.dialog,
      auth: state.auth,
      plans: state.plans,
      userLanguage: state.user.getIn(['data', 'language']),
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setPopupMarketingPromoVisible:
          actions.popupMarketingPromo.setPopupMarketingPromoVisible,
        setPopupMarketingPromoCookiePersistent:
          actions.popupMarketingPromo.setPopupMarketingPromoCookiePersistent,
        getPopupMarketingPromoCookiePersistent:
          actions.popupMarketingPromo.getPopupMarketingPromoCookiePersistent,
        setPopupMarketingPromoSuccess:
          actions.popupMarketingPromo.setPopupMarketingPromoSuccess,
        setPopupMarketingPromo: actions.eventTracking.setPopupMarketingPromo,
      }
    },
  ),
)(PopupMarketingPromo)

