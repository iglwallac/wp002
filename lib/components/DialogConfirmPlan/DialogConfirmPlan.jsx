import React, { Component } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { connect as connectStaticText } from 'components/StaticText/connect'
import compose from 'recompose/compose'
import { Map } from 'immutable'
import { connect as connectRedux } from 'react-redux'
import {
  PLAN_SKU_ANNUAL,
  PLAN_SKU_MONTHLY,
  PLAN_SKU_LIVE,
  PLAN_SKU_LIVE_DISCOUNTED,
  PLAN_SKU_DECLINE_303,
  getPlanData,
  PLAN_ID_MONTHLY,
  PLAN_ID_ANNUAL,
  PLAN_ID_LIVE,
  PLAN_ID_LIVE_DISCOUNTED,
  PLAN_ID_DECLINE_303,
  PLAN_SUBSCRIPTION_CANCELLED,
  PLAN_SUBSCRIPTION_ANNUAL,
  PLAN_SUBSCRIPTION_MONTHLY,
  PLAN_SUBSCRIPTION_LIVE,
  PLAN_TYPE_UPGRADE,
  PLAN_TYPE_DOWNGRADE,
  getPlanSubscriptionType,
  determinePlanUpgradeDowngrade,
} from 'services/plans'
import _get from 'lodash/get'
import _toString from 'lodash/toString'
import Button from 'components/Button'
import { getBoundActions } from 'actions'
import PropTypes from 'prop-types'
import Link from 'components/Link'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { getEmailCustomerServiceUrl } from 'services/url'
import { getPrimary } from 'services/languages'
import { TARGET_BLANK } from 'components/Link/constants'
import { format as formatDateTime, getDateTime } from 'services/date-time'
import { formatTracking, CHECKOUT_ORDER_ERROR_TYPE_PAYMENT } from 'services/checkout'
import { H2, HEADING_TYPES } from 'components/Heading'

class DialogConfirmPlan extends Component {
  constructor (props) {
    super(props)
    const { userAccount } = props
    // If we are downgrading from Live Access (to anything else), show the effective date message
    const currentPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
    this.state = { currentPlanId }
  }

  componentDidMount () {
    const { plans, doEmailSignupBrooklyn, user, page } = this.props
    const { currentPlanId } = this.state
    const selectedPlanSku = plans.getIn(['changePlanData', 'selectedPlan'])
    const email = user.getIn(['data', 'mail'])
    const dateFormatString = 'YYYY-MM-DD'
    const locale = page.get('locale')
    const selectedPlan = selectedPlanSku ? plans.getIn(['data', 'plans'], Map()).find((plan) => {
      return plan.get('sku') === selectedPlanSku
    }) : Map()
    const selectedPlanId = selectedPlan.get('id')

    // Set the upgrade or downgrade date when the member chooses their desired plan
    const planUpgradeDownGradeType = determinePlanUpgradeDowngrade(selectedPlanId, currentPlanId)
    if (planUpgradeDownGradeType === PLAN_TYPE_UPGRADE) {
      doEmailSignupBrooklyn(
        email,
        '',
        { cart_upgrade_date: formatDateTime(undefined, locale, dateFormatString) },
      )
    } else if (planUpgradeDownGradeType === PLAN_TYPE_DOWNGRADE) {
      doEmailSignupBrooklyn(
        email,
        '',
        { cart_downgrade_date: formatDateTime(undefined, locale, dateFormatString) },
      )
    }
  }

  componentDidUpdate (prevProps) {
    const { userAccount } = prevProps
    const { auth, doAuthRenew, plans, doEmailSignupBrooklyn, user, page } = this.props
    const { currentPlanId } = this.state
    const email = user.getIn(['data', 'mail'])
    const locale = page.get('locale')
    const dateFormatString = 'YYYY-MM-DD'
    const prevChangePlanSucces = userAccount.getIn(['data', 'billing', 'planChange', 'success'])
    const currentChangePlanSuccess = this.props.userAccount.getIn(['data', 'billing', 'planChange', 'success'])

    if (currentChangePlanSuccess && currentChangePlanSuccess !== prevChangePlanSucces) {
      const changePlanOrderNumber = this.props.userAccount.getIn(['data', 'billing', 'planChange', 'orderNumber'])
      const selectedPlanSku = plans.getIn(['changePlanData', 'selectedPlan'])
      const selectedPlan = selectedPlanSku ? plans.getIn(['data', 'plans'], Map()).find((plan) => {
        return plan.get('sku') === selectedPlanSku
      }) : Map()
      const planName = selectedPlan.get('heading', '')
      const planCost = selectedPlan.getIn(['costs', 0], 0)
      const planCategory = getPlanSubscriptionType(selectedPlan.get('id'))
      const selectedPlanId = selectedPlan.get('id')
      const planUpgradeDownGradeType = determinePlanUpgradeDowngrade(selectedPlanId, currentPlanId)

      // Determine upgrade or downgrade once the plan change is COMPLETED for Emarsys endpoint
      if (planUpgradeDownGradeType === PLAN_TYPE_UPGRADE) {
        doEmailSignupBrooklyn(
          email,
          '',
          { cart_upgrade_complete_date: formatDateTime(undefined, locale, dateFormatString) },
        )
      } else if (planUpgradeDownGradeType === PLAN_TYPE_DOWNGRADE) {
        doEmailSignupBrooklyn(
          email,
          '',
          { cart_downgrade_complete_date: formatDateTime(undefined, locale, dateFormatString) },
        )
      }
      if (global && global.dataLayer && selectedPlan.size > 0) {
        global.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            purchase: {
              actionField: {
                id: changePlanOrderNumber,
                revenue: _toString(planCost),
                tax: '',
                shipping: '',
                coupon: '',
              },
              products: [
                {
                  name: `${planName} - Upgrade`,
                  id: selectedPlanSku,
                  quantity: 1,
                  price: _toString(planCost),
                  category: planCategory,
                  coupon: '',
                },
              ],
            },
          },
        })
      }

      // renew auth to get entitlements
      doAuthRenew(auth)
    }
  }

  componentWillUnmount () {
    const { resetAccountChangePlanData } = this.props
    resetAccountChangePlanData()
  }

  onClickClose = () => {
    const { setOverlayDialogVisible } = this.props
    setOverlayDialogVisible(null, false)
  }

  getPlanDetails = () => {
    const { plans, page, userAccount, staticText } = this.props
    const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
    const planData = getPlanData(plans)

    let nextBillDate = null
    if (subscriptionStatus === PLAN_SUBSCRIPTION_CANCELLED) {
      nextBillDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
    } else {
      nextBillDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextReviewDate'])
    }

    const effectiveDate =
      subscriptionStatus === PLAN_SUBSCRIPTION_CANCELLED ?
        staticText.getIn(['data', 'sucessBodyThree']) :
        staticText.getIn(['data', 'effective'])

    const reformattedDate = getDateTime(nextBillDate)
    const dateFormatString = 'MM/DD/YY'
    const locale = page.get('locale')
    const formattedDate = formatDateTime(reformattedDate, locale, dateFormatString)

    const monthlyData = {
      type: PLAN_SUBSCRIPTION_MONTHLY,
      confirm: staticText.getIn(['data', 'confirm']),
      plan: staticText.getIn(['data', 'monthly']),
      price: _get(planData, 'monthlyPlanPrice'),
      perMonth: staticText.getIn(['data', 'perMonth']),
      body: staticText.getIn(['data', 'renews']),
      change: `${effectiveDate} ${formattedDate}.`,
    }

    const annualData = {
      type: PLAN_SUBSCRIPTION_ANNUAL,
      confirm: staticText.getIn(['data', 'confirm']),
      plan: staticText.getIn(['data', 'annual']),
      price: _get(planData, 'annualPlanPrice'),
      perMonth: staticText.getIn(['data', 'perMonth']),
      body: `${staticText.getIn(['data', 'upfrontOne'])} ${_get(planData, 'annualPlanFull')}`,
      prorated: staticText.getIn(['data', 'prorated']),
      change: `${effectiveDate} ${formattedDate}.`,
      annualPromoText: staticText.getIn(['data', 'annualPromoBlurb']),
    }

    const liveData = {
      type: PLAN_SUBSCRIPTION_LIVE,
      confirm: staticText.getIn(['data', 'confirm']),
      plan: staticText.getIn(['data', 'live']),
      price: '',
      perMonth: '',
      body: `${staticText.getIn(['data', 'upfrontOne'])} ${_get(planData, 'livePlanFull')}.`,
      prorated: staticText.getIn(['data', 'prorated']),
      change: `${effectiveDate} ${formattedDate}.`,
    }

    const liveDiscountedData = {
      type: PLAN_SUBSCRIPTION_LIVE,
      confirm: staticText.getIn(['data', 'confirm']),
      plan: staticText.getIn(['data', 'live']),
      price: '',
      perMonth: '',
      body: `${staticText.getIn(['data', 'upfrontOne'])} ${_get(planData, 'liveDiscountedPlanFull')}.`,
      prorated: staticText.getIn(['data', 'prorated']),
      change: `${effectiveDate} ${formattedDate}.`,
    }

    return {
      monthlyData,
      annualData,
      liveData,
      liveDiscountedData,
    }
  }

  setPlanInfo = (selectedPlan) => {
    const { changeUserAccountPlanType, auth, inboundTracking } = this.props
    const tracking = formatTracking(inboundTracking)
    let nextRatePlanId = null

    if (selectedPlan === PLAN_SKU_MONTHLY) {
      nextRatePlanId = PLAN_ID_MONTHLY
    } else if (selectedPlan === PLAN_SKU_ANNUAL) {
      nextRatePlanId = PLAN_ID_ANNUAL
    } else if (selectedPlan === PLAN_SKU_LIVE) {
      nextRatePlanId = PLAN_ID_LIVE
    } else if (selectedPlan === PLAN_SKU_LIVE_DISCOUNTED) {
      nextRatePlanId = PLAN_ID_LIVE_DISCOUNTED
    } else if (selectedPlan === PLAN_SKU_DECLINE_303) {
      nextRatePlanId = PLAN_ID_DECLINE_303
    }

    return changeUserAccountPlanType({
      nextRatePlanId,
      auth,
      tracking,
    })
  }

  getSuccessPlanTypeText = () => {
    const { plans, staticText } = this.props
    const selectedPlan = plans.getIn(['changePlanData', 'selectedPlan'])
    switch (selectedPlan) {
      case PLAN_SKU_ANNUAL:
      case PLAN_ID_ANNUAL:
        return staticText.getIn(['data', 'annual'])
      case PLAN_SKU_LIVE:
      case PLAN_ID_LIVE:
      case PLAN_SKU_LIVE_DISCOUNTED:
      case PLAN_ID_LIVE_DISCOUNTED:
        return staticText.getIn(['data', 'live'])
      default:
        return staticText.getIn(['data', 'monthly'])
    }
  }

  DialogError = () => {
    const { staticText, user, userAccount } = this.props
    const userLanguage = getPrimary(user.getIn(['data', 'language']))
    const errorCode = userAccount.getIn(['data', 'billing', 'planChange', 'errorCode'])

    if (errorCode === CHECKOUT_ORDER_ERROR_TYPE_PAYMENT) {
      return (
        <div className="dialog-confirm-plan__content">
          <H2 as={HEADING_TYPES.H4} className="dialog-confirm-plan__title dialog-confirm-plan__title--error">{staticText.getIn(['data', 'paymentError'])}</H2>
          <p className="dialog-confirm-plan__text">{staticText.getIn(['data', 'paymentErrorBody'])}</p>
          <Link
            className="button button--secondary dialog-confirm-plan__go-to-account-button"
            to="/account"
            onClick={this.onClickClose}
          >
            {staticText.getIn(['data', 'updatePaymentMethod'])}
          </Link>
        </div>
      )
    }

    return (
      <div className="dialog-confirm-plan__content">
        <H2 as={HEADING_TYPES.H4} className="dialog-confirm-plan__title dialog-confirm-plan__title--error">{staticText.getIn(['data', 'error'])}</H2>
        <p className="dialog-confirm-plan__text">{staticText.getIn(['data', 'errorBody'])}<br />
          <Link
            directLink
            to={getEmailCustomerServiceUrl(userLanguage)}
            target={TARGET_BLANK}
            className="account-cancel-confirm__cs-link"
          >
            {staticText.getIn(['data', 'customerService'])}
          </Link>
        </p>
        <Link
          className="button button--secondary dialog-confirm-plan__go-to-account-button"
          to="/account/change-plan"
          onClick={this.onClickClose}
        >
          {staticText.getIn(['data', 'tryAgain'])}
        </Link>
      </div>
    )
  }

  DialogDefault = () => {
    const {
      staticText,
      plans,
      setDialogOptions,
      setOverlayCloseOnClick,
      userAccount,
    } = this.props
    const selectedPlan = plans.getIn(['changePlanData', 'selectedPlan'])
    const planDetails = this.getPlanDetails()
    const currentProductRatePlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
    const fullSelectedPlan = plans.getIn(['data', 'plans']).find((plan) => {
      return plan.get('sku') === selectedPlan
    })
    const newRatePlanId = Map.isMap(fullSelectedPlan) ? fullSelectedPlan.get('id') : null

    return (
      <div className="dialog-confirm-plan__default">
        {selectedPlan === PLAN_SKU_ANNUAL || selectedPlan === PLAN_ID_ANNUAL
          ? this.renderPlanContent(_get(planDetails, 'annualData'), currentProductRatePlanId, newRatePlanId)
          : null
        }
        {selectedPlan === PLAN_SKU_LIVE || selectedPlan === PLAN_ID_LIVE
          ? this.renderPlanContent(_get(planDetails, 'liveData'), currentProductRatePlanId, newRatePlanId)
          : null
        }
        {selectedPlan === PLAN_SKU_LIVE_DISCOUNTED || selectedPlan === PLAN_ID_LIVE_DISCOUNTED
          ? this.renderPlanContent(_get(planDetails, 'liveDiscountedData'), currentProductRatePlanId, newRatePlanId)
          : null
        }
        {selectedPlan === PLAN_SKU_MONTHLY ||
          selectedPlan === PLAN_ID_MONTHLY ||
          selectedPlan === PLAN_SKU_DECLINE_303 ||
          selectedPlan === PLAN_ID_DECLINE_303 ?
          this.renderPlanContent(_get(planDetails, 'monthlyData'), currentProductRatePlanId, newRatePlanId)
          : null
        }
        <div className="dialog-confirm-plan__button-container">
          <Button
            onClick={this.onClickClose}
            buttonClass={['button button button--tertiary button--stacked dialog-confirm-plan__cancel-button']}
            text={staticText.getIn(['data', 'cancel'])}
          />
          <Button
            buttonClass={['button button--secondary button--stacked dialog-confirm-plan__confirm-button']}
            text={staticText.getIn(['data', 'confirm'])}
            onClick={() => {
              this.setPlanInfo(selectedPlan)
              setDialogOptions(null, true)
              setOverlayCloseOnClick(false)
            }}
          />
        </div>
      </div>
    )
  }

  DialogSuccess = () => {
    const {
      staticText,
      plans,
    } = this.props

    const previousPlanId = this.state.currentPlanId

    const planDetails = this.getPlanDetails()
    const selectedPlan = plans.getIn(['changePlanData', 'selectedPlan'])
    let selectedPlanDetails
    switch (selectedPlan) {
      case PLAN_SKU_ANNUAL:
      case PLAN_ID_ANNUAL:
        selectedPlanDetails = _get(planDetails, ['annualData'])
        break
      case PLAN_SKU_LIVE:
      case PLAN_ID_LIVE:
        selectedPlanDetails = _get(planDetails, ['liveData'])
        break
      case PLAN_SKU_LIVE_DISCOUNTED:
      case PLAN_ID_LIVE_DISCOUNTED:
        selectedPlanDetails = _get(planDetails, ['liveDiscountedData'])
        break
      default:
        selectedPlanDetails = _get(planDetails, ['monthlyData'])
    }
    const nextBillDate = _get(selectedPlanDetails, ['change'])
    const planType = _get(selectedPlanDetails, ['type'])

    return (
      <div className="dialog-confirm-plan__content">
        <H2 as={HEADING_TYPES.H4} className="dialog-confirm-plan__title">{staticText.getIn(['data', 'success'])}</H2>
        <p className="dialog-confirm-plan__text">{staticText.getIn(['data', 'sucessBodyOne'])}{'\u00A0'}
          {this.getSuccessPlanTypeText()}
        </p>
        {
          planType === PLAN_SUBSCRIPTION_MONTHLY || previousPlanId === PLAN_ID_LIVE
            ? <p className="dialog-confirm-plan__text">{nextBillDate}</p>
            : null
        }
        <Link
          className="button button--secondary dialog-confirm-plan__go-to-account-button"
          onClick={this.onClickClose}
          to="/account"
        >
          {staticText.getIn(['data', 'goToAccount'])}
        </Link>
      </div>
    )
  }

  renderPlanContent = (planInfo, currentRatePlanId, newRatePlanId) => {
    const {
      type,
      confirm,
      plan,
      price,
      perMonth,
      body,
      prorated,
      change,
    } = planInfo
    const { currentPlanId } = this.state
    const currentPlanType = getPlanSubscriptionType(currentRatePlanId)
    const newPlanType = getPlanSubscriptionType(newRatePlanId)
    let disableBodyDescription = false

    /* eslint-disable max-len */
    if (currentPlanType === PLAN_SUBSCRIPTION_ANNUAL && newPlanType === PLAN_SUBSCRIPTION_ANNUAL) {
      disableBodyDescription = true
    } else if (currentPlanType === PLAN_SUBSCRIPTION_LIVE && newPlanType === PLAN_SUBSCRIPTION_LIVE) {
      disableBodyDescription = true
    } else if (currentPlanType === PLAN_SUBSCRIPTION_LIVE && newPlanType === PLAN_SUBSCRIPTION_ANNUAL) {
      disableBodyDescription = true
    }
    /* eslint-enable max-len */

    return (
      <div className="dialog-confirm-plan__content">
        <H2 as={HEADING_TYPES.H4} className="dialog-confirm-plan__title">{confirm}<span className="dialog-confirm-plan__title-light"> {plan}</span></H2>
        <p className="dialog-confirm-plan__text">{price} {perMonth}</p>
        {
          !disableBodyDescription ?
            <p className="dialog-confirm-plan__text">{body}</p>
            : null
        }
        {
          (type === PLAN_SUBSCRIPTION_MONTHLY || currentPlanId === PLAN_ID_LIVE) ||
            (currentPlanType === PLAN_SUBSCRIPTION_ANNUAL
             && newPlanType === PLAN_SUBSCRIPTION_ANNUAL)
            ? <p className="dialog-confirm-plan__text dialog-confirm-plan__change">{change}</p>
            : <p className="dialog-confirm-plan__text">{prorated}</p>
        }
      </div>
    )
  }

  render () {
    const { userAccount, auth } = this.props
    const isProcessing = userAccount.getIn(['billingSubscriptionsProcessing']) || auth.get('processing')
    const showChangeError =
      userAccount.getIn(['data', 'billing', 'planChange', '_dataError']) ||
      userAccount.getIn(['data', 'billing', 'planChange', 'success']) === false
    const showPlanChanged = userAccount.getIn(['data', 'billing', 'planChange']) && !showChangeError

    const renderDialog = () => {
      if (isProcessing) {
        return <Sherpa className={['account-cancel-confirm__sherpa']} type={TYPE_SMALL_BLUE} />
      } else if (showPlanChanged) {
        return this.DialogSuccess()
      } else if (showChangeError) {
        return this.DialogError()
      }
      return this.DialogDefault()
    }

    return (
      <div className="dialog-confirm-plan">
        {renderDialog()}
      </div>
    )
  }
}

DialogConfirmPlan.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  page: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  setOverlayDialogVisible: PropTypes.func.isRequired,
  changeUserAccountPlanType: PropTypes.func.isRequired,
  setDialogOptions: PropTypes.func.isRequired,
  setOverlayCloseOnClick: PropTypes.func.isRequired,
  resetAccountChangePlanData: PropTypes.func.isRequired,
  doAuthRenew: PropTypes.func.isRequired,
  doEmailSignupBrooklyn: PropTypes.func.isRequired,
}

export default compose(
  connectRedux(
    state => ({
      plans: state.plans,
      userAccount: state.userAccount,
      inboundTracking: state.inboundTracking,
      auth: state.auth,
      user: state.user,
      page: state.page,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setOverlayDialogVisible: actions.dialog.setOverlayDialogVisible,
        setPlanChangeSelected: actions.plans.setPlanChangeSelected,
        resetAccountChangePlanData: actions.userAccount.resetAccountChangePlanData,
        changeUserAccountPlanType: actions.userAccount.changeUserAccountPlanType,
        setDialogOptions: actions.dialog.setDialogOptions,
        setOverlayCloseOnClick: actions.dialog.setOverlayCloseOnClick,
        doAuthRenew: actions.auth.doAuthRenew,
        doEmailSignupBrooklyn: actions.emailSignup.doEmailSignupBrooklyn,
      }
    },
  ),
  connectStaticText({ storeKey: 'dialogConfirmPlan' }),
)(DialogConfirmPlan)
