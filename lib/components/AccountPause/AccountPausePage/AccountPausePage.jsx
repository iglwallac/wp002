import { connect } from 'react-redux'
import { getBoundActions } from 'actions'
import { Map, List } from 'immutable'
import FormsyForm from 'formsy-react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import PropTypes from 'prop-types'
import React, { useState, useCallback, useEffect } from 'react'

import { Button, TYPES } from 'components/Button.v2'
import { H1, H4, H5, HEADING_TYPES } from 'components/Heading'
import { RadioGroup, Radio, Select, RADIO_STYLES } from 'components/FormInput.v2'
import BackButton from 'components/BackButton'
import Support from 'components/Support'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'

import { historyRedirect } from 'services/navigation'
import { getAuthIsLoggedIn } from 'services/auth'
import { getPrimary } from 'services/languages'
import { TYPE_PAUSE_ERROR } from 'services/dialog'
import {
  USER_ACCOUNT_PAUSED,
  USER_ACCOUNT_PAUSE_ONE_MONTH,
  USER_ACCOUNT_PAUSE_TWO_MONTHS,
  USER_ACCOUNT_PAUSE_THREE_MONTHS,
  shouldRenderPauseSection,
} from 'services/user-account'
import {
  URL_ACCOUNT,
} from 'services/url/constants'

const PAUSE_DURATION_RADIOS = 'pauseDurationRadios'
const PAUSE_DURATION_SELECT = 'pauseDurationSelect'

function getSherpaClassName (showSherpa) {
  const base = 'account-pause__processing-sherpa-wrapper'
  const classList = [base]

  if (showSherpa) {
    classList.push(`${base}--active`)
  }

  return classList.join(' ')
}


function onReturnFocus () {
  return null
}
function AccountPausePage (props) {
  const {
    auth,
    user,
    history,
    staticText,
    isProcessing,
    updateUserAccountPause,
    renderModal,
    userAccount,
  } = props

  const [pauseDuration, setPauseDuration] = useState(USER_ACCOUNT_PAUSE_ONE_MONTH)

  const status = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'status'])
  const pauseDate = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseDate'])
  const pauseMonths = userAccount.getIn(['details', 'data', 'billing', 'subscriptions', 'pauseMonths'])
  const hasScheduledPause = pauseDate && pauseMonths
  const userLanguage = getPrimary(user.getIn(['data', 'language']))
  const hasError = !userAccount.getIn(['manageSubscription', 'data', 'errors'], List()).isEmpty() && !userAccount.getIn(['manageSubscription', 'data', 'success'])
  const pauseWasSuccesful = userAccount.getIn(['manageSubscription', 'data', 'success'])
  const showProcessingSherpa = isProcessing || pauseWasSuccesful
  const userIsInPauseCycle = status === USER_ACCOUNT_PAUSED || hasScheduledPause
  const dataReady = status && userLanguage
  const shouldRender = shouldRenderPauseSection(props)

  const handleChange = value => setPauseDuration(parseInt(value, 10))
  const handleChangeSelect = value => handleChange(value)
  const handleDurationChange = (name, value) => handleChange(value)
  const handleSubmit = useCallback(() => {
    updateUserAccountPause(pauseDuration)
  }, [pauseDuration])

  useEffect(() => {
    /*
     !pauseWasSuccessful check lives here so we do not perform the redirect to the account
     page after they submit the pause form. Instead we redirect them to the confirm page.
     Only perform this redirect when user visiting this page is already in a pause
    */

    if (!dataReady) return undefined

    if (
      (userIsInPauseCycle && !pauseWasSuccesful)
      || !shouldRender
    ) {
      return historyRedirect({
        url: URL_ACCOUNT,
        language: userLanguage,
        history,
        auth,
      })
    }

    return undefined
  }, [userIsInPauseCycle, shouldRender, dataReady])


  useEffect(() => {
    if (hasError) {
      renderModal(TYPE_PAUSE_ERROR, {
        onReturnFocus,
        userLanguage,
        pauseAccount: handleSubmit,
        hideDismiss: isProcessing,
      })
    }
  })


  // Show sherpa before data loads, unauthenticated or pause unavailable
  if (
    !getAuthIsLoggedIn(auth)
    || !dataReady
    || userIsInPauseCycle
    || !shouldRender
  ) {
    return (
      <div className="account-pause__sherpa-loader">
        <Sherpa className={['account-pause__sherpa']} type={TYPE_LARGE} />
      </div>
    )
  }

  return (
    <div className="account-pause">
      <div className="account-pause__content">
        <div className={getSherpaClassName(showProcessingSherpa)}>
          <Sherpa type={TYPE_LARGE} />
          <div className="account-pause__sherpa-body">
            <H4>{staticText.get('processingHeader1')}</H4>
            <H5 as={HEADING_TYPES.H6}>{staticText.get('processingHeader2')}</H5>
          </div>
        </div>

        <BackButton className="account-pause__back-button" url={URL_ACCOUNT}>
          {staticText.get('back')}
        </BackButton>
        <H1 className="account-pause__title">{staticText.get('pauseMembership')}</H1>
        <p className="account-pause__text">
          {staticText.get('pauseMembershipDescription')}
        </p>

        <FormsyForm
          className="account-pause__form"
          onValidSubmit={handleSubmit}
        >
          <H5 as={HEADING_TYPES.H6} className="account-pause__subtitle">
            {staticText.get('selectDuration')}
          </H5>
          <Select
            className="account-pause__select"
            label=""
            name={PAUSE_DURATION_SELECT}
            onChange={handleChangeSelect}
            value={pauseDuration}
          >
            <option value={USER_ACCOUNT_PAUSE_ONE_MONTH} key={USER_ACCOUNT_PAUSE_ONE_MONTH}>
              {staticText.get('oneMonth')}
            </option>
            <option value={USER_ACCOUNT_PAUSE_TWO_MONTHS} key={USER_ACCOUNT_PAUSE_TWO_MONTHS}>
              {staticText.get('twoMonths')}
            </option>
            <option value={USER_ACCOUNT_PAUSE_THREE_MONTHS} key={USER_ACCOUNT_PAUSE_THREE_MONTHS}>
              {staticText.get('threeMonths')}
            </option>
          </Select>
          <RadioGroup
            name={PAUSE_DURATION_RADIOS}
            onChange={handleDurationChange}
            value={pauseDuration}
          >
            <Radio
              style={RADIO_STYLES.PRIMARY}
              className="account-pause__radio"
              label={staticText.get('oneMonth')}
              value={USER_ACCOUNT_PAUSE_ONE_MONTH}
              checked={pauseDuration === USER_ACCOUNT_PAUSE_ONE_MONTH}
            />
            <Radio
              style={RADIO_STYLES.PRIMARY}
              className="account-pause__radio"
              label={staticText.get('twoMonths')}
              value={USER_ACCOUNT_PAUSE_TWO_MONTHS}
              checked={pauseDuration === USER_ACCOUNT_PAUSE_TWO_MONTHS}
            />
            <Radio
              style={RADIO_STYLES.PRIMARY}
              className="account-pause__radio"
              label={staticText.get('threeMonths')}
              value={USER_ACCOUNT_PAUSE_THREE_MONTHS}
              checked={pauseDuration === USER_ACCOUNT_PAUSE_THREE_MONTHS}
            />
          </RadioGroup>
          <Button
            className="account-pause__submit-button"
            type={TYPES.PRIMARY}
            submit
            disabled={isProcessing}
          >
            {isProcessing ? staticText.get('pauseButtonProcessing') : staticText.get('pauseButton')}
          </Button>
        </FormsyForm>
      </div>
      <Support />
    </div>
  )
}

AccountPausePage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  renderModal: PropTypes.func.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  user: ImmutablePropTypes.map.isRequired,
  userAccount: ImmutablePropTypes.map.isRequired,
}

export default connect(state => ({
  auth: state.auth,
  user: state.user,
  userAccount: state.userAccount,
  isProcessing: state.userAccount.getIn(['manageSubscription', 'data', 'accountPauseProcessing'], false),
  staticText: state.staticText.getIn(['data', 'accountPausePage', 'data'], Map()),
}),
(dispatch) => {
  const actions = getBoundActions(dispatch)
  return {
    renderModal: actions.dialog.renderModal,
    updateUserAccountPause: actions.userAccount.updateUserAccountPause,
  }
})(AccountPausePage)
