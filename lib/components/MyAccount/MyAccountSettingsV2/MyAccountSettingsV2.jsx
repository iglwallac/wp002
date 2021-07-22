import PropTypes from 'prop-types'
import React from 'react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { Map, List } from 'immutable'
import { getBoundActions } from 'actions'
import { TestarossaSwitch, TestarossaCase } from 'components/Testarossa'
import { H2 } from 'components/Heading'
import NotificationSettings from './NotificationSettings'
import InterestSettings from './InterestSettings'
import DisplaySettings from './DisplaySettings'
import LanguageSettings from './LanguageSettings'
import HiddenContentSettings from './HiddenContentSettings'
import RemovedRowsSettings from './RemovedRowsSettings'
import FollowingSettings from './FollowingSettings'
import CommunicationSettings from './CommunicationSettions'

const MyAccountSettingsV2 = (props) => {
  const { staticText } = props
  return (
    <div className="my-account-settings-V2 content-preferences">
      <H2>
        {staticText.getIn(['data', 'settingsAndPreferences'])}
      </H2>
      <TestarossaSwitch>
        <TestarossaCase campaign="ME-3453" variation={[1]}>
          <InterestSettings />
        </TestarossaCase>
      </TestarossaSwitch>
      <NotificationSettings />
      <DisplaySettings />
      <LanguageSettings />
      <CommunicationSettings />
      <FollowingSettings />
      <HiddenContentSettings />
      <RemovedRowsSettings />
    </div>
  )
}

MyAccountSettingsV2.propTypes = {
  uid: PropTypes.number.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  emarsys: ImmutablePropTypes.map.isRequired,
  staticText: ImmutablePropTypes.map.isRequired,
  languages: ImmutablePropTypes.list.isRequired,
  setUserDataLanguage: PropTypes.func.isRequired,
  userLanguages: ImmutablePropTypes.list.isRequired,
  featureTrackingLanguages: ImmutablePropTypes.list.isRequired,
}

export default connectRedux(
  state => ({
    auth: state.auth,
    uid: state.user.getIn(['data', 'uid'], 0),
    languages: state.languages.get('data', List()),
    emarsys: state.user.getIn(['data', 'emarsys'], Map()),
    userLanguages: state.user.getIn(['data', 'language'], List()),
    staticText: state.staticText.getIn(['data', 'myAccountSettingsV2'], Map()),
    featureTrackingLanguages: state.featureTracking.getIn(['data', 'userLanguages'], List()),
    disableAutoPlayNext: state.featureTracking.getIn(['data', 'disableAutoPlayNext'], false),
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      getUserContactData: actions.user.getUserContactData,
      setUserDataLanguage: actions.user.setUserDataLanguage,
      doEmailSignup: actions.emailSignup.doEmailSignupBrooklyn,
      setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
    }
  },
)(MyAccountSettingsV2)
