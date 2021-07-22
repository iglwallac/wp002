import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { List, Map } from 'immutable'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import compose from 'recompose/compose'
import { connect as connectRedux } from 'react-redux'
import { connect as connectPage, PAGE_SEO_TYPE_LOCATION } from 'components/Page/connect'
import { getBoundActions } from 'actions'
import {
  getHelpCenterUrl,
  getEmailCustomerServiceUrl,
  getTechnicalPlaybackIssuesUrl,
  getTechnicalOfflineDownloadUrl,
  getTechnicalSetupUrl,
  getTechnicalTroubleFindingContentUrl,
  getTechnicalHelpUrl,
} from 'services/url'
import Link from 'components/Link'
import { FR, DE } from 'services/languages/constants'
import { TARGET_BLANK, URL_JAVASCRIPT_VOID } from 'components/Link/constants'
import { getPrimary } from 'services/languages'
import FormsyForm from 'formsy-react'
import { RadioGroup, Radio, Select, Textarea, RADIO_STYLES } from 'components/FormInput.v2'
import Sherpa, { TYPE_SMALL_WHITE } from 'components/Sherpa'
import { Card } from 'components/Card'
import { historyRedirect } from 'services/navigation'
import { requestAnimationFrame } from 'services/animate'
import {
  SCHEMA_USER_ACCOUNT_CANCEL_V2,
  TEXTBOX_CANCEL_REASON_OTHER_ANSWER,
  shouldRenderCancelOffer,
  hasScheduledOrActivePause,
} from 'services/user-account'
import Support from 'components/Support'
import AccountCancelButtons from 'components/AccountCancelV2/AccountCancelButtons'
import AccountCancelOffer from 'components/AccountCancelV2/AccountCancelOffer'
import AccountCancelDissatisfied from 'components/AccountCancelV2/AccountCancelDissatisfied'
import { URL_ACCOUNT,
  URL_ACCOUNT_CANCEL_OFFER,
  URL_ACCOUNT_CANCEL_CONFIRM,
} from 'services/url/constants'
import {
  getPlanSubscriptionType,
  PLAN_SUBSCRIPTION_MONTHLY,
} from 'services/plans'
import AccountCancelPlans from 'components/AccountCancelV2/AccountCancelPlans'
import { getAuthIsLoggedIn } from 'services/auth'
import { H2, H1, HEADING_TYPES } from 'components/Heading'

const CANCEL_REASON_SELECT = 'cancelReasonSelect'
const CANCEL_REASON_RADIOS = 'cancelReasonRadios'
const TOO_EXPENSIVE = 'too expensive'
const UNSATISFIED_CONTENT = 'unsatisfied with content'
const TECHNICAL_ISSUES = 'technical issues'
const OTHER = 'other'
const dataLayer = global.dataLayer

function AccountCancelPage (props) {
  const {
    auth,
    staticText,
    userLanguage,
    cancelReason,
    userAccount,
    subscription,
    setUserAccountCancelReason,
    setUserAccountCancelOfferShown,
    setUserAccountCancel,
  } = props
  const userPrimaryLanguage = getPrimary(userLanguage)
  const freeOfferEligible = shouldRenderCancelOffer(props)
  const inPauseOrScheduledPause = hasScheduledOrActivePause(userAccount)
  const userPlan = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'plan', 'productRatePlanId'])
  const userPlanType = getPlanSubscriptionType(userPlan)
  const tooExpensiveSeen = userAccount.getIn(['manageSubscription', 'data', 'offerShown'], false)
  const userAccountProcessing = userAccount.get('billingSubscriptionsProcessing')
  const dataReady = !userAccountProcessing && userAccount.getIn(['details', 'data', 'billing', 'subscriptions'], Map()).size > 0 &&
    userAccount.getIn(['details', 'data', 'billing', 'payments'], Map()).size > 0
  const subscriptionProcessing = subscription.get('processing')
  const subscriptionSuccess = subscription.get('success')
  const subscriptionError = subscription.get('errors')
  const [otherTextTooLong, setOtherTextTooLong] = useState(false)
  const nextButtonCancelMembershipText = staticText.get('cancelMembership')
  const nextButtonContinueText = staticText.get('continue')

  const nextDisabled = !cancelReason ||
    otherTextTooLong ||
    subscriptionProcessing ||
    subscriptionSuccess ||
    false

  // Internal state for the next button
  const initialNextButtonState = {
    url: URL_ACCOUNT_CANCEL_CONFIRM,
    text: nextButtonCancelMembershipText,
  }
  const [nextButton, setNextButton] = useState(initialNextButtonState)

  // Set the next button text and url
  useEffect(() => {
    if (freeOfferEligible && !tooExpensiveSeen) {
      // set the url and text to point to the free offer page
      return setNextButton({
        url: URL_ACCOUNT_CANCEL_OFFER,
        text: nextButtonContinueText,
      })
    }

    // if the user is eligible for the free offer,
    // and they are not on the monthly plan and they have
    // already seen the free offer, then reset the text and url to the defaults
    if (freeOfferEligible && userPlanType !== PLAN_SUBSCRIPTION_MONTHLY && tooExpensiveSeen) {
      return setNextButton(initialNextButtonState)
    }

    // keep the default button text and url
    return setNextButton(initialNextButtonState)
  }, [freeOfferEligible, tooExpensiveSeen, nextButtonContinueText, nextButtonCancelMembershipText])

  const cancelReasonDataLayerPush = (eventLabel) => {
    if (dataLayer) {
      dataLayer.push({
        event: 'customEvent',
        eventCategory: 'User Engagement',
        eventAction: 'cancel reason',
        eventLabel,
      })
    }
  }

  const onChange = (value) => {
    setUserAccountCancelReason(value)

    switch (value) {
      case TOO_EXPENSIVE:
        if (freeOfferEligible && userPlanType !== PLAN_SUBSCRIPTION_MONTHLY) {
          setUserAccountCancelOfferShown(true)
        }
        cancelReasonDataLayerPush(TOO_EXPENSIVE)
        break
      case UNSATISFIED_CONTENT:
        cancelReasonDataLayerPush(UNSATISFIED_CONTENT)
        break
      case TECHNICAL_ISSUES:
        cancelReasonDataLayerPush(TECHNICAL_ISSUES)
        break
      case OTHER:
        cancelReasonDataLayerPush(OTHER)
        break
      default:
        break
    }
  }

  // onChange for the select box
  const onChangeSelect = (value) => {
    onChange(value)
  }

  // onChange for the radio buttons
  const onChangeRadio = (name, value) => {
    onChange(value)
  }

  const onChangeTextarea = (value) => {
    if (value.length > 1000) {
      setOtherTextTooLong(true)
    } else if (otherTextTooLong && value.length <= 1000) {
      setOtherTextTooLong(false)
    }
  }

  const onValidSubmit = (model) => {
    const { history, setUserAccountCancelFormData } = props
    const billingAccountId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'billingAccountId'], '')
    const subscriptionId = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'subscriptionId'], '')
    const value = model[CANCEL_REASON_RADIOS] || model[CANCEL_REASON_SELECT]

    if (value) {
      const cancelData = _assign(_cloneDeep(SCHEMA_USER_ACCOUNT_CANCEL_V2), {
        billingAccountId,
        subscriptionId,
        reason: value,
        comment: value === OTHER ? model[TEXTBOX_CANCEL_REASON_OTHER_ANSWER] : '',
      })

      setUserAccountCancelFormData(cancelData)
    }

    historyRedirect({ history, url: nextButton.url, auth, language: userLanguage })

    if (window.scrollTo) {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    }
  }

  // render Too Expensive
  const renderTooExpensive = () => {
    if (freeOfferEligible && userPlanType !== PLAN_SUBSCRIPTION_MONTHLY) {
      return (
        <Card className="account-cancel__card account-cancel__card--expensive">
          <AccountCancelOffer />
        </Card>
      )
    } else if (userPlanType === PLAN_SUBSCRIPTION_MONTHLY && !inPauseOrScheduledPause) {
      return (
        <Card className="account-cancel__card">
          <AccountCancelPlans />
        </Card>
      )
    }

    return null
  }

  const renderTechnicalIssues = () => {
    if (userPrimaryLanguage !== FR) {
      return (
        <Card className="account-cancel__card">
          <H2 className="account-cancel__subtitle">{staticText.get('weAreHereToHelp')}</H2>
          <p className="account-cancel__text">
            {staticText.get('addressIssues')}
          </p>
          <ul className="account-cancel__list">
            <li className="account-cancel__list-item">
              <Link
                to={getTechnicalPlaybackIssuesUrl(userPrimaryLanguage)}
                directLink
                target={TARGET_BLANK}
                className="account-cancel__list-link"
              >
                {staticText.get('experiencingPlaybackIssues')}
              </Link>
            </li>
            <li className="account-cancel__list-item">
              <Link
                to={getTechnicalOfflineDownloadUrl(userPrimaryLanguage)}
                directLink
                target={TARGET_BLANK}
                className="account-cancel__list-link"
              >
                {staticText.get('howToDownload')}
              </Link>
            </li>
            <li className="account-cancel__list-item">
              <Link
                to={getTechnicalSetupUrl(userPrimaryLanguage)}
                directLink
                target={TARGET_BLANK}
                className="account-cancel__list-link"
              >
                {staticText.get('setUpTVApp')}
              </Link>
            </li>
            <li className="account-cancel__list-item">
              <Link
                to={getTechnicalTroubleFindingContentUrl(userPrimaryLanguage)}
                directLink
                target={TARGET_BLANK}
                className="account-cancel__list-link"
              >
                {staticText.get('troubleFindingContent')}
              </Link>
            </li>
          </ul>
          <p className="account-cancel__text account-cancel__text--tech-info">
            {`${staticText.get('technicalInfo1')} `}
            <Link
              to={getTechnicalHelpUrl(userPrimaryLanguage)}
              directLink
              target={TARGET_BLANK}
              className="account-cancel__text-link"
            >
              {staticText.get('here')}
            </Link>
            {` ${staticText.get('technicalInfo2')} `}
            <Link
              to={getEmailCustomerServiceUrl(userPrimaryLanguage)}
              directLink
              target={TARGET_BLANK}
              className="account-cancel__text-link"
            >
              {staticText.get('here')}
            </Link>
            {` ${staticText.get('technicalInfo3')}`}
          </p>
          <p className="account-cancel__text account-cancel__text--bold">
            {staticText.get('didYouKnow')}
          </p>
          <div className="account-cancel__app-logos">
            {renderAppLogos()}
          </div>
        </Card>
      )
    }

    return null
  }

  const renderAppLogos = () => {
    return (
      <React.Fragment>
        <div className="account-cancel__app-logo account-cancel__app-logo--roku" />
        {userPrimaryLanguage !== DE ?
          <div className="account-cancel__app-logo account-cancel__app-logo--firetv" />
          :
          null
        }
        <div className="account-cancel__app-logo account-cancel__app-logo--chromecast" />
        <div className="account-cancel__app-logo account-cancel__app-logo--appletv" />
        <div className="account-cancel__app-logo account-cancel__app-logo--androidtv" />
      </React.Fragment>
    )
  }

  const renderOther = () => {
    return (
      <Card className="account-cancel__card">
        <div className="account-cancel__other-title">
          {staticText.get('tellUsMore')}
        </div>
        <p className="account-cancel__other-text">
          {staticText.get('howToImprove')}
        </p>
        <Textarea
          label={''}
          value={''}
          className="account-cancel__textarea"
          autocomplete="off"
          name={TEXTBOX_CANCEL_REASON_OTHER_ANSWER}
          validations="maxLength:1000"
          showCharCount
          block
          onChange={onChangeTextarea}
        />
      </Card>
    )
  }

  const renderDissatisfied = () => {
    return (
      <AccountCancelDissatisfied />
    )
  }

  // render correct selected reason content
  const renderContent = () => {
    let content

    switch (cancelReason) {
      case TOO_EXPENSIVE:
        content = renderTooExpensive()
        break
      case UNSATISFIED_CONTENT:
        content = renderDissatisfied()
        break
      case TECHNICAL_ISSUES:
        content = renderTechnicalIssues()
        break
      case OTHER:
        content = renderOther()
        break
      default:
        break
    }

    return content
  }

  // return nothing if not logged in
  if (!getAuthIsLoggedIn(auth)) {
    return null
  }

  // show processing state
  if (!dataReady) {
    return (
      <div className="account-cancel">
        <div className="account-cancel__content">
          <Sherpa type={TYPE_SMALL_WHITE} />
        </div>
      </div>
    )
  }

  // render if the user accepted the cancel offer on this page
  if (userPlanType !== PLAN_SUBSCRIPTION_MONTHLY && subscriptionSuccess) {
    return (
      <div className="account-cancel">
        <div className="account-cancel__content">
          <AccountCancelOffer />
        </div>
      </div>
    )
  }

  return (
    <div className="account-cancel">
      <div className="account-cancel__content">
        <H1 as={HEADING_TYPES.H3} className="account-cancel__title">{staticText.get('title')}</H1>
        <p className="account-cancel__text">
          {`${staticText.get('question1')} `}
          <Link
            to={getHelpCenterUrl(userPrimaryLanguage)}
            directLink
            target={TARGET_BLANK}
            className="account-cancel__text-link"
          >
            {staticText.get('question2')}
          </Link>
          {` ${staticText.get('question3')} ${staticText.get('question4')}`}
        </p>
        <FormsyForm
          className="account-cancel__form"
          onValidSubmit={onValidSubmit}
        >
          <Select
            label={''}
            value={cancelReason}
            name={CANCEL_REASON_SELECT}
            onChange={onChangeSelect}
            className="account-cancel__select"
          >
            <option value={''} key={'chooseOne'}>
              {staticText.get('chooseOne')}
            </option>
            <option value={TOO_EXPENSIVE} key={TOO_EXPENSIVE}>
              {staticText.get('tooExpensive')}
            </option>
            <option value={UNSATISFIED_CONTENT} key={UNSATISFIED_CONTENT}>
              {staticText.get('unsatisfiedWithContent')}
            </option>
            <option value={TECHNICAL_ISSUES} key={TECHNICAL_ISSUES}>
              {staticText.get('technicalIssues')}
            </option>
            <option value={OTHER} key={OTHER}>
              {staticText.get('other')}
            </option>
          </Select>
          <RadioGroup
            name={CANCEL_REASON_RADIOS}
            value={cancelReason}
            onChange={onChangeRadio}
          >
            <Radio
              style={RADIO_STYLES.PRIMARY}
              label={staticText.get('tooExpensive')}
              value={TOO_EXPENSIVE}
              className="account-cancel__radio"
              checked={cancelReason === TOO_EXPENSIVE}
            />
            <Radio
              style={RADIO_STYLES.PRIMARY}
              label={staticText.get('unsatisfiedWithContent')}
              value={UNSATISFIED_CONTENT}
              className="account-cancel__radio"
              checked={cancelReason === UNSATISFIED_CONTENT}
            />
            <Radio
              style={RADIO_STYLES.PRIMARY}
              label={staticText.get('technicalIssues')}
              value={TECHNICAL_ISSUES}
              className="account-cancel__radio"
              checked={cancelReason === TECHNICAL_ISSUES}
            />
            <Radio
              style={RADIO_STYLES.PRIMARY}
              label={staticText.get('other')}
              value={OTHER}
              className="account-cancel__radio account-cancel__radio--last"
              checked={cancelReason === OTHER}
            />
          </RadioGroup>
          {renderContent()}
          {
            cancelReason ?
              <div className="account-cancel__sep" />
              : null
          }
          {
            subscriptionSuccess ||
            subscriptionError ||
            subscriptionProcessing ||
            userAccountProcessing ?
              null :
              <AccountCancelButtons
                previousUrl={URL_ACCOUNT}
                nextUrl={!cancelReason ? URL_JAVASCRIPT_VOID : nextButton.url}
                previousText={staticText.get('goBack')}
                nextText={nextButton.text}
                nextDisabled={nextDisabled}
                nextOnClick={
                  nextButton.url === URL_ACCOUNT_CANCEL_CONFIRM ? setUserAccountCancel : null
                }
                submit
              />
          }
        </FormsyForm>
      </div>
      <Support />
    </div>
  )
}

AccountCancelPage.propTypes = {
  history: PropTypes.object.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
  userLanguage: ImmutablePropTypes.list.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  subscription: ImmutablePropTypes.map.isRequired,
  cancelReason: PropTypes.string,
  setUserAccountCancelReason: PropTypes.func.isRequired,
  setUserAccountCancelOfferShown: PropTypes.func.isRequired,
  setUserAccountCancel: PropTypes.func.isRequired,
  setUserAccountCancelFormData: PropTypes.func.isRequired,
}

export default compose(
  connectPage({ seoType: PAGE_SEO_TYPE_LOCATION }),
  connectRedux(
    state => ({
      auth: state.auth,
      userAccount: state.userAccount,
      staticText: state.staticText.getIn(['data', 'accountCancelPage', 'data']),
      userLanguage: state.user.getIn(['data', 'language'], List()),
      cancelReason: state.userAccount.getIn(['manageSubscription', 'data', 'cancelReason'], ''),
      subscription: state.subscription,
    }),
    (dispatch) => {
      const actions = getBoundActions(dispatch)
      return {
        setUserAccountCancelReason: actions.userAccount.setUserAccountCancelReason,
        setUserAccountCancelOfferShown: actions.userAccount.setUserAccountCancelOfferShown,
        setUserAccountCancel: actions.userAccount.setUserAccountCancel,
        setUserAccountCancelFormData: actions.userAccount.setUserAccountCancelFormData,
      }
    },
  ),
)(AccountCancelPage)
