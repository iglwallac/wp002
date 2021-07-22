import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map } from 'immutable'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { getBoundActions } from 'actions'
import { connect as connectStaticText } from 'components/StaticText/connect'
import { H4, H6 } from 'components/Heading'
import { Button } from 'components/Button.v2'
import {
  formatPrice,
  PLAN_SUBSCRIPTION_CANCELLED,
  PLAN_TYPE_UPGRADE,
  PLAN_TYPE_DOWNGRADE,
  PLAN_ID_COMPLIMENTARY,
  determinePlanUpgradeDowngrade,
} from 'services/plans'
import {
  format as formatDateTime,
  getDateTime,
  getDateLocale,
  ordinalDateFormatingi18n,
  formatWithLocale,
} from 'services/date-time'
import {
  URL_ACCOUNT,
} from 'services/url/constants'
import { formatTracking, CHECKOUT_ORDER_ERROR_TYPE_PAYMENT } from 'services/checkout'
import { getPrimary } from 'services/languages'


const MyAccountChangePlanModal = (props) => {
  const {
    staticText,
    dismissModal,
    updateUserAccountPlan,
    resetAccountChangePlanData,
    userAccount,
    plans,
    user,
    auth,
  } = props

  const selectedPlanSku = plans.getIn(['changePlanData', 'selectedPlan'])
  const selectedPlan = selectedPlanSku ? plans.getIn(['data', 'plans'], Map()).find((plan) => {
    return plan.get('sku') === selectedPlanSku
  }) : Map()
  const planType = selectedPlan.get('heading')
  const currency = selectedPlan.get('currencyIso')
  const billingSchedule = selectedPlan.get('billingSchedule')
  const cost = selectedPlan.get('costs').first()
  const price = formatPrice(currency, cost)
  const selectedPlanId = selectedPlan.get('id')
  const currentPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const nextPlanId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextPlan', 'productRatePlanId'])
  const isInComp = currentPlanId === PLAN_ID_COMPLIMENTARY
  const planId = isInComp ? nextPlanId : currentPlanId
  const planUpgradeDownGradeType = determinePlanUpgradeDowngrade(selectedPlanId, planId)

  const subscriptionStatus = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  let nextBillDate = null

  if (subscriptionStatus === PLAN_SUBSCRIPTION_CANCELLED) {
    nextBillDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'paidThroughDate'])
  } else {
    nextBillDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'nextReviewDate'])
  }

  const reformattedDate = getDateTime(nextBillDate)
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const dateFormatString = ordinalDateFormatingi18n(userLanguage)
  const dateLocale = getDateLocale(userLanguage)
  const formattedDate =
  formatWithLocale(
    formatDateTime(reformattedDate),
    dateFormatString,
    { locale: dateLocale },
  )
  const isProcessing = userAccount.getIn(['billingSubscriptionsProcessing']) || auth.get('processing')
  const showChangeError =
  userAccount.getIn(['data', 'billing', 'planChange', '_dataError']) ||
  userAccount.getIn(['data', 'billing', 'planChange', 'success']) === false
  const errorCode = userAccount.getIn(['data', 'billing', 'planChange', 'errorCode'])
  const showPlanChanged = userAccount.getIn(['data', 'billing', 'planChange']) && !showChangeError


  useEffect(() => {
    return (
      resetAccountChangePlanData()
    )
  }, [])

  const renderErrorState = () => {
    if (errorCode === CHECKOUT_ORDER_ERROR_TYPE_PAYMENT) {
      return (
        <React.Fragment>
          <H4 className="my-account-change-plan-modal__title my-account-change-plan-modal__title--error">{staticText.getIn(['data', 'paymentError'])}</H4>
          <div className="my-account-change-plan-modal__container">
            <p className="my-account-change-plan-modal__desciption">{staticText.getIn(['data', 'updateErrorPaymentMethodBody'])} </p>
          </div>
          <Button
            className="button button--primary my-account-change-plan-modal__button"
            url={`${URL_ACCOUNT}#payment-info`}
          >
            {staticText.getIn(['data', 'updatePaymentMethod'])}
          </Button>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <H4 className="my-account-change-plan-modal__title my-account-change-plan-modal__title--error">{staticText.getIn(['data', 'error'])}</H4>
        <div className="my-account-change-plan-modal__container">
          <p className="my-account-change-plan-modal__desciption">{staticText.getIn(['data', 'updateErrorGeneralBody'])}</p>
        </div>
        <Button
          className="button button--primary my-account-change-plan-modal__button"
          disabled={isProcessing}
          onClick={() => {
            onClickChangePlanConfirm()
          }}
        >
          {isProcessing ? staticText.getIn(['data', 'changePlanButtonProcessing']) : staticText.getIn(['data', 'retry'])}
        </Button>
      </React.Fragment>
    )
  }

  const renderSuccessState = () => {
    return (
      <React.Fragment>
        <H4 className="my-account-change-plan-modal__title">{staticText.getIn(['data', 'success'])}</H4>
        <p className="my-account-change-plan-modal__desciption">{staticText.getIn(['data', 'successDescriptionBefore'])} {planType} {staticText.getIn(['data', 'plan'])} </p>
        <Button
          className="button button--primary my-account-change-plan-modal__button"
          url={URL_ACCOUNT}
          scrollToTop
        >
          {staticText.getIn(['data', 'goToMyAccount'])}
        </Button>
      </React.Fragment>
    )
  }

  const renderDescription = () => {
    if (
      planUpgradeDownGradeType === PLAN_TYPE_UPGRADE
    ) {
      return (
        <p className="my-account-change-plan-modal__desciption">{staticText.getIn(['data', 'changeDescriptionProratedBefore'])} <strong>{staticText.getIn(['data', 'today'])} </strong> {staticText.getIn(['data', 'changeDescriptionProratedAfter'])}
        </p>
      )
    }
    return (
      <p className="my-account-change-plan-modal__desciption">{staticText.getIn(['data', 'changeDescription'])}</p>
    )
  }

  const renderPlanContent = () => {
    return (
      <React.Fragment>
        <H4 className="my-account-change-plan-modal__title">{staticText.getIn(['data', 'confirmPlanChangeTitle'])}</H4>
        <div className="my-account-change-plan-modal__container">
          <H6 className="my-account-change-plan-modal__text">{staticText.getIn(['data', 'newPlan'])} {planType}</H6>
          <H6 className="my-account-change-plan-modal__text">{staticText.getIn(['data', 'price'])} {price} {currency}, {billingSchedule}</H6>
          <div className="my-account-change-plan-modal__container">
            {renderDescription()}
          </div>
          {planUpgradeDownGradeType === PLAN_TYPE_DOWNGRADE ?
            <div className="my-account-change-plan-modal__container">
              <p className="my-account-change-plan-modal__desciption"> {staticText.getIn(['data', 'nextBillDate'])} <strong>{formattedDate}</strong></p>
            </div>
            :
            null
          }
        </div>
      </React.Fragment>
    )
  }

  const onClickChangePlanConfirm = () => {
    const { inboundTracking } = props
    const tracking = formatTracking(inboundTracking)
    return updateUserAccountPlan({
      nextRatePlanId: selectedPlanId,
      auth,
      tracking,
    })
  }

  const renderModalDefault = () => {
    return (
      <React.Fragment>
        {renderPlanContent()}
        <Button
          className="button--primary my-account-change-plan-modal__button"
          disabled={isProcessing}
          onClick={() => {
            onClickChangePlanConfirm()
          }}
        >
          {isProcessing ? staticText.getIn(['data', 'changePlanButtonProcessing']) : staticText.getIn(['data', 'confirmChanges'])}
        </Button>
        { !isProcessing ?
          <Button
            className="button--secondary my-account-change-plan-modal__button "
            onClick={() => dismissModal()}
          >
            {staticText.getIn(['data', 'cancel'])}
          </Button>
          :
          null
        }
      </React.Fragment>
    )
  }

  const renderChangePlanModal = () => {
    if (showPlanChanged) {
      return renderSuccessState()
    } else if (showChangeError) {
      return renderErrorState()
    }
    return renderModalDefault()
  }

  return (
    <div className="my-account-change-plan-modal">
      {renderChangePlanModal()}
    </div>
  )
}

MyAccountChangePlanModal.propTypes = {
  staticText: ImmutablePropTypes.map.isRequired,
  plans: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  updateUserAccountPlan: PropTypes.func.isRequired,
  setDialogOptions: PropTypes.func.isRequired,
  setOverlayCloseOnClick: PropTypes.func.isRequired,
}

export default compose(
  connectStaticText({ storeKey: 'myAccountChangePlanModal' }),
  connectRedux(
    state => ({
      plans: state.plans,
      userAccount: state.userAccount,
      inboundTracking: state.inboundTracking,
      auth: state.auth,
      user: state.user,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        dismissModal: actions.dialog.dismissModal,
        updateUserAccountPlan: actions.userAccount.updateUserAccountPlan,
        setDialogOptions: actions.dialog.setDialogOptions,
        setOverlayCloseOnClick: actions.dialog.setOverlayCloseOnClick,
        resetAccountChangePlanData: actions.userAccount.resetAccountChangePlanData,
      }
    },
  ),
)(MyAccountChangePlanModal)
