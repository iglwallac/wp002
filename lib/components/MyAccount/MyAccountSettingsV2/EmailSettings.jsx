import React, { useState } from 'react'
import { connect as connectRedux } from 'react-redux'
import { Map } from 'immutable'
import ButtonToggle from 'components/ButtonToggle'
import { getBoundActions } from 'actions'
import {
  buildEmailOptInSettingsObject,
  EMAIL_OPT_IN_SETTINGS_ON,
  EMAIL_OPT_IN_SETTINGS_OFF,
} from 'services/event-tracking'

function EmailSettings ({
  staticText,
  isSubscribed,
  auth,
  unavailable,
  doEmailSignup,
  setDefaultGaEvent,
}) {
  const [subscribed, setSubscribed] = useState(isSubscribed)

  const onToggleEmailSubscription = () => {
    const optin = !subscribed
    setSubscribed(optin)
    const eventLabel = optin ? EMAIL_OPT_IN_SETTINGS_ON : EMAIL_OPT_IN_SETTINGS_OFF
    setDefaultGaEvent(buildEmailOptInSettingsObject(eventLabel))
    doEmailSignup(auth.get('email'), '', {}, '', optin, true)
  }

  return (
    <div className="my-account-settings-V2__notification-settings-controls">
      {unavailable ? (
        <div>
          {staticText.getIn(['data', 'emarsysUnavailable'])}
        </div>
      ) : (
        <React.Fragment>
          <div className="my-account-settings-V2__notification-settings-text-container">
            <div className="my-account-settings-V2__notification-settings-title">
              {staticText.getIn(['data', 'emailSubscription'])}
            </div>
            <div className="my-account-settings-V2__notification-settings-text">
              {staticText.getIn(['data', 'toggleThis'])}
            </div>
          </div>
          <div className="my-account-settings-V2__notification-settings-toggle">
            <ButtonToggle
              checked={subscribed}
              onChange={onToggleEmailSubscription}
              showLabel
              round
            />
          </div>
        </React.Fragment>
      )}
    </div>
  )
}

export default connectRedux(
  state => ({
    auth: state.auth,
    isSubscribed: state.user.getIn(['data', 'emarsys', 'globalSubscription', 'isSubscribed'], false),
    unavailable: state.user.getIn(['data', 'emarsys', 'unavailable'], false),
    staticText: state.staticText.getIn(['data', 'myAccountSettings'], Map()),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      doEmailSignup: actions.emailSignup.doEmailSignupBrooklyn,
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
    }
  },
)(EmailSettings)

