import PropTypes from 'prop-types'
import { List, Map } from 'immutable'
import FormsyForm from 'formsy-react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Checkbox, CHECKBOX_STYLES, TextInput, EmailInput } from 'components/FormInput.v2'
import { EVENT_CATEGORY_PROFILE_SELECTOR } from 'services/event-tracking'
import { Button as ButtonV2, TYPES, SIZES } from 'components/Button.v2'
import Link, { URL_JAVASCRIPT_VOID } from 'components/Link'
import Sherpa, { TYPE_LARGE } from 'components/Sherpa'
import { MAX_PROFILES } from 'services/user-profiles'
import { ICON_TYPES } from 'components/Icon.v2'
import UserAvatar from 'components/UserAvatar'
import { getBoundActions } from 'actions'
import { H2 } from 'components/Heading'

const CLASS_NAME_SHERPA = ['wiw__sherpa']

function getProfileName (profile) {
  const name = profile.get('first_name')
  const username = profile.get('username')
  return (!name || /^(gaia|friend of)$/i.test(name)) ? username : name
}

function renderProfiles (profiles, staticText, selectProfile, openModal) {
  //
  if (profiles.size < 1) {
    return <Sherpa className={CLASS_NAME_SHERPA} type={TYPE_LARGE} />
  }

  return (
    <ul className="wiw__users">
      {profiles.map((profile, index) => (
        <li className="wiw__user" key={profile.get('uuid')}>
          <Link to={URL_JAVASCRIPT_VOID} onClick={selectProfile} data-index={index} role="button">
            <div className="wiw__avatar" role="presentation">
              <UserAvatar path={profile.getIn(['profilePicture', 'hdtv_190x266'], '')} />
            </div>
            <p className="wiw__name">{getProfileName(profile)}</p>
          </Link>
        </li>
      ))}
      {profiles.size < MAX_PROFILES ? (
        <li className="wiw__user" key="add-profile">
          <div className="wiw__add-profile">
            <ButtonV2
              data-label={staticText.getIn(['data', 'addProfile'])}
              icon={ICON_TYPES.PLUS}
              type={TYPES.ICON_PRIMARY}
              onClick={openModal}
              size={SIZES.LARGE}
            >
              <span className="wiw__name">
                {staticText.getIn(['data', 'addProfile'])}
              </span>
            </ButtonV2>
          </div>
        </li>
      ) : null}
    </ul>
  )
}

function WhoIsWatching ({
  setFeatureTrackingDataPersistent,
  setDefaultGaEvent,
  dismissedChooser,
  createProfile,
  selectProfile,
  userProfiles,
  staticText,
  showPrompt,
  enableRoutes,
  auth,
}) {
  const profiles = userProfiles.get('data', List())
  const profileError = userProfiles.get('error')
  const renderPreference = profiles.size === 1
  const creating = userProfiles.get('creating', false)
  const created = userProfiles.get('created')

  const [modalVisible, setModalVisible] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [formFields, setFormFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  const validations = useMemo(() => ({
    isEmail: staticText.getIn(['data', 'emailValidError']),
  }), [staticText])

  const setValid = useCallback(() => {
    setFormIsValid(true)
  }, [])

  const setInvalid = useCallback(() => {
    setFormIsValid(false)
  }, [])

  const onChange = useCallback((model) => {
    setFormFields(model)
  }, [])

  const onSubmit = useCallback(() => {
    createProfile({
      user_account_id: auth.get('userAccountId'),
      first_name: formFields.firstName,
      last_name: formFields.lastName,
      email: formFields.email,
      auth,
    })
  }, [formFields])

  const resetForm = useCallback(() => {
    setFormFields({ firstName: '', lastName: '', email: '' })
  }, [])

  const setPreference = useCallback((name, checked) => {
    if (checked) {
      setDefaultGaEvent(Map({
        event: 'customEvent',
        eventName: 'profile selector do not ask again clicked',
        eventCategory: EVENT_CATEGORY_PROFILE_SELECTOR,
        eventAction: 'Click',
      }))
    }
    setFeatureTrackingDataPersistent({
      data: Map({ dismissedProfileChooser: checked }),
      auth,
    })
  }, [auth])

  const chooseProfile = useCallback((e) => {
    e.preventDefault()
    const { currentTarget } = e
    const index = currentTarget.getAttribute('data-index')
    selectProfile(index)
  }, [])

  const manageProfiles = useCallback(() => {
    showPrompt(false)
    enableRoutes(true)
  }, [])

  const openModal = useCallback(() => {
    setModalVisible(true)
  })

  const closeModal = useCallback(() => {
    setModalVisible(false)
  })

  useEffect(() => {
    if (!creating && modalVisible && !profileError) setModalVisible(false)
    if (creating === false && created !== false) resetForm()
    if (created === false) setInvalid()
  }, [creating])

  let className = 'wiw'

  if (modalVisible) {
    className += ' wiw--add-profile'
  }

  return (
    <div className={className}>
      <div className="wiw__logo">
        <span role="presentation" className="gaia-logo gaia-logo--white" />
      </div>
      <div className="wiw__animation-container">
        <div className="wiw__modal">
          <div className="wiw__modal-content">
            {modalVisible ? (
              <React.Fragment>
                <ButtonV2
                  className="wiw__close-modal"
                  icon={ICON_TYPES.CLOSE}
                  onClick={closeModal}
                  size={SIZES.LARGE}
                  data-label="close"
                  type={TYPES.ICON}
                />
                <H2>
                  {staticText.getIn(['data', 'addAProfile'])}
                </H2>
                <p className="wiw__profile-info">
                  {staticText.getIn(['data', 'allProfilesWill'])}
                  {profileError ? (
                    <span className="wiw__error">
                      {staticText.getIn(['data', 'genericError'])}
                    </span>
                  ) : null}
                </p>
                <div>
                  <FormsyForm
                    onValidSubmit={onSubmit}
                    onInvalid={setInvalid}
                    className="wiw__form"
                    onChange={onChange}
                    onValid={setValid}
                  >
                    <TextInput
                      label={staticText.getIn(['data', 'firstName'])}
                      value={formFields.firstName}
                      autocomplete="off"
                      name="firstName"
                      required
                    />
                    <TextInput
                      label={staticText.getIn(['data', 'lastName'])}
                      value={formFields.lastName}
                      autocomplete="off"
                      name="lastName"
                    />
                    <EmailInput
                      note={staticText.getIn(['data', 'forPersonalized'])}
                      label={staticText.getIn(['data', 'email'])}
                      validationErrors={validations}
                      value={formFields.email}
                      validations="isEmail"
                      name="email"
                      required
                    />
                    <div className="wiw__add-action">
                      <ButtonV2
                        disabled={!formIsValid}
                        type={TYPES.PRIMARY}
                        className=""
                        submit
                      >
                        {staticText.getIn(['data', 'addProfile'])}
                      </ButtonV2>
                    </div>
                  </FormsyForm>
                </div>
                {creating ? (
                  <Sherpa type={TYPE_LARGE} className={CLASS_NAME_SHERPA} />
                ) : null}
              </React.Fragment>
            ) : null}
            {!modalVisible ? (
              <React.Fragment>
                <div className="wiw__title">
                  <H2>
                    {staticText.getIn(['data', 'whoIsWatching'])}
                  </H2>
                </div>
                {renderPreference ? (
                  <div className="wiw__dismiss-profile-chooser">
                    <FormsyForm className="wiw__form-pref">
                      <Checkbox
                        note={staticText.getIn(['data', 'checkboxSubtext'])}
                        label={staticText.getIn(['data', 'checkboxText'])}
                        htmlValue="dismiss profile chooser"
                        style={CHECKBOX_STYLES.SECONDARY}
                        name="dismissedProfileChooser"
                        className="wiw__checkbox"
                        onChange={setPreference}
                        value={dismissedChooser}
                      />
                    </FormsyForm>
                  </div>
                ) : null}
                {renderProfiles(profiles, staticText, chooseProfile, openModal)}
                <ButtonV2
                  className="wiw__manage"
                  onClick={manageProfiles}
                  type={TYPES.SECONDARY}
                  url="/manage-profiles"
                >{staticText.getIn(['data', 'manageProfiles'])}
                </ButtonV2>
              </React.Fragment>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

WhoIsWatching.propTypes = {
  userProfiles: ImmutablePropTypes.map.isRequired,
  createProfile: PropTypes.func.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
}

export default connectRedux(
  state => ({
    dismissedChooser: state.featureTracking.getIn(['data', 'dismissedProfileChooser'], false),
    staticText: state.staticText.getIn(['data', 'whoIsWatchingPage'], Map()),
    userProfiles: state.userProfiles,
    auth: state.auth,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      setFeatureTrackingDataPersistent: actions.featureTracking.setFeatureTrackingDataPersistent,
      resetOnboarding: actions.onboarding.resetOnboarding,
      createProfile: actions.userProfiles.createProfile,
      changeAuthProfile: actions.auth.changeAuthProfile,
      selectProfile: actions.userProfiles.selectProfile,
      showPrompt: actions.userProfiles.showPrompt,
      enableRoutes: actions.app.enableRoutes,
      setDefaultGaEvent: actions.eventTracking.setDefaultGaEvent,
    }
  },
)(WhoIsWatching)
