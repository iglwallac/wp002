import PropTypes from 'prop-types'
import { List, Map } from 'immutable'
import FormsyForm from 'formsy-react'
import { connect as connectRedux } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Support from 'components/Support'
import { FORM_BUTTON_TYPE_SUBMIT } from 'components/FormButton/types'
import { TYPE_MULTIPLE_PROFILES_RM_USER } from 'services/dialog'
import { TextInput, EmailInput } from 'components/FormInput.v2'
import Sherpa, { TYPE_SMALL_BLUE } from 'components/Sherpa'
import { RENDER_TYPE_FORM_BUTTON_BUTTON } from 'render'
import { URL_ACCOUNT_PROFILE } from 'services/url/constants'
import { MAX_PROFILES } from 'services/user-profiles'
import UserAvatar from 'components/UserAvatar'
import FormButton from 'components/FormButton'
import { H2, H3 } from 'components/Heading'
import { getBoundActions } from 'actions'
import _parseInt from 'lodash/parseInt'
import { Card } from 'components/Card'
import Link from 'components/Link'


const formButtonActiveClass = [
  'form-button--primary',
  'manage-profile__form-button',
  'manage-profile__button--save',
]

const formButtonDisabledClass = [
  'form-button--disabled',
  'manage-profile__form-button',
  'manage-profile__button--save',
]

function getProfileName (profile) {
  const firstName = profile.get('first_name')
  const lastName = profile.get('last_name') ? profile.get('last_name') : ''
  return !firstName ? '' : `${firstName} ${lastName}`
}

function renderProfiles ({
  auth,
  profiles,
  staticText,
  bootstrapComplete,
  showModal,
}) {
  const accountOwner = profiles && profiles.size > 0 ? profiles.get('0') : null
  const isOwner = accountOwner ? _parseInt(accountOwner.get('uid')) === auth.get('uid') : false
  const remaining = MAX_PROFILES - profiles.size
  const client = process.env.BROWSER && bootstrapComplete
  return (
    <div className="profile-section">
      <p className="profile-section__note">
        {client ? `${staticText.getIn(['data', 'youAreAble']).replace('{count}', remaining)}` : null}
      </p>
      {
        profiles.map((profile, index) => {
          const name = getProfileName(profile, staticText)
          return (
            <Card key={profile.get('email')}>
              <div className="user-profile">
                <div className="user-profile__username">
                  <UserAvatar
                    path={profile.getIn(['profilePicture', 'hdtv_190x266'], '')}
                    className={['user-profile__avatar']}
                  />
                  {profile.get('username')}
                </div>
                { (!name) ?
                  <div className="user-profile__realname missing">
                    <Link to={URL_ACCOUNT_PROFILE}>
                      {staticText.getIn(['data', 'updateName'])}
                    </Link>
                  </div>
                  : <div className="user-profile__cell">
                    <div className="user-profile__name-label">
                      {staticText.getIn(['data', 'name'])}
                    </div>
                    <div className="user-profile__realname">
                      { name }
                    </div>
                  </div>
                }
                <div className="user-profile__cell">
                  <div className="user-profile__email-label">
                    {staticText.getIn(['data', 'email'])}
                  </div>
                  <div className="user-profile__email">
                    {profile.get('email')}
                  </div>
                </div>
                { isOwner ?
                  ownerAccess({ index, profile, staticText, showModal })
                  : userAccess(index, staticText)}
              </div>
            </Card>
          )
        })
      }
    </div>
  )
}

function ownerAccess ({
  index,
  profile,
  staticText,
  showModal,
}) {
  return (
    index === 0
      ? <div className="user-profile__cell">
        <div className="user-profile__main-account">
          {staticText.getIn(['data', 'mainAccount'])}
        </div>
      </div>
      : <div className="user-profile__cell">
        <a className="user-profile__actions" onClick={() => showModal(profile)}>
          {staticText.getIn(['data', 'remove'])}
        </a>
      </div>
  )
}

function userAccess (index, staticText) {
  return (
    index === 0
      ? <div className="user-profile__cell">
        <div className="main-account">
          {staticText.getIn(['data', 'mainAccount'])}
        </div>
      </div>
      : <div className="user-profile__cell user-profile__cell-empty" />
  )
}

function ManageProfilesPage ({
  bootstrapComplete,
  createProfile,
  removeProfile,
  userProfiles,
  staticText,
  auth,
  renderModal,
  removeModal,
}) {
  const profiles = userProfiles.get('data', List())
  const profileError = userProfiles.get('error')
  const created = userProfiles.get('created')
  const creating = userProfiles.get('creating', false)
  const remaining = MAX_PROFILES - profiles.size

  const [formIsValid, setFormIsValid] = useState(false)
  const [formFields, setFormFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

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

  const setValid = useCallback(() => {
    setFormIsValid(true)
  }, [])

  const setInvalid = useCallback(() => {
    setFormIsValid(false)
  }, [])

  const validations = useMemo(() => ({
    isEmail: staticText.getIn(['data', 'emailValidError']),
  }), [staticText])

  const showModal = useCallback((profile) => {
    renderModal(TYPE_MULTIPLE_PROFILES_RM_USER, {
      profileToRemove: profile,
      titleText: staticText.getIn(['data', 'areYouSure']),
      bodyText: staticText.getIn(['data', 'removeProfile']),
      buttonText: staticText.getIn(['data', 'deleteProfile']),
      auth,
      removeProfile,
      removeModal,
    })
  })

  useEffect(() => {
    if (creating === false && created !== false) resetForm()
    if (created === false) setInvalid()
  }, [creating])

  return (
    <div className="manage-profile-page">
      <div className="manage-profile">
        <H2>{staticText.getIn(['data', 'title'])}</H2>
        {renderProfiles({ auth, profiles, staticText, bootstrapComplete, showModal }) }
        <div className="manage-profile__add-form-container">
          {
            creating ?
              <div className="manage-profile__processing">
                <Sherpa className={['manage-profile__sherpa']} type={TYPE_SMALL_BLUE} />
                <div className="manage-profile__processing-text">
                  {`${staticText.getIn(['data', 'adding'])}...`}
                </div>
              </div>
              : null
          }
          {
            profileError ?
              <div className="manage-profile__error">
                { staticText.getIn(['data', 'genericError']) }
              </div> : null
          }
          {
            remaining > 0 ?
              <FormsyForm
                className="manage-profile__form form--inline"
                onValidSubmit={onSubmit}
                onValid={setValid}
                onInvalid={setInvalid}
                onChange={onChange}
              >
                <div className="manage-profile__add-form">
                  <div>
                    <div className="manage-profile__add-profile">
                      <UserAvatar
                        className={['user-profile__avatar']}
                      />
                      <div className="manage-profile__add-profile-title">
                        <H3 className="manage-profile__add-title">{staticText.getIn(['data', 'addProfile'])}</H3>
                      </div>
                    </div>
                    <TextInput
                      label={staticText.getIn(['data', 'firstName'])}
                      value={formFields.firstName}
                      autocomplete="off"
                      name="firstName"
                      required
                    />
                  </div>
                  <div>
                    <TextInput
                      label={staticText.getIn(['data', 'lastName'])}
                      value={formFields.lastName}
                      autocomplete="off"
                      name="lastName"
                    />
                  </div>
                  <div>
                    <EmailInput
                      note={staticText.getIn(['data', 'forPersonalized'])}
                      label={staticText.getIn(['data', 'emailAddress'])}
                      validationErrors={validations}
                      value={formFields.email}
                      validations="isEmail"
                      name="email"
                      required
                    />
                  </div>
                  <div className="manage-profile__add-profile-btn">
                    <FormButton
                      disabled={!formIsValid}
                      formButtonClass={formIsValid
                        ? formButtonActiveClass
                        : formButtonDisabledClass}
                      renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                      type={FORM_BUTTON_TYPE_SUBMIT}
                      text={staticText.getIn(['data', 'addProfile'])}
                    />
                  </div>
                  <div className="manage-profile__add-btn">
                    <FormButton
                      disabled={!formIsValid}
                      formButtonClass={formIsValid
                        ? formButtonActiveClass
                        : formButtonDisabledClass}
                      renderType={RENDER_TYPE_FORM_BUTTON_BUTTON}
                      type={FORM_BUTTON_TYPE_SUBMIT}
                      text={staticText.getIn(['data', 'add'])}
                    />
                  </div>
                </div>
              </FormsyForm> : null
          }
        </div>
      </div>
      <Support />
    </div>
  )
}

ManageProfilesPage.propTypes = {
  userProfiles: ImmutablePropTypes.map.isRequired,
  auth: ImmutablePropTypes.map.isRequired,
  createProfile: PropTypes.func.isRequired,
  removeProfile: PropTypes.func.isRequired,
  renderModal: PropTypes.func.isRequired,
  removeModal: PropTypes.func.isRequired,
  bootstrapComplete: PropTypes.bool,
}

export default connectRedux(
  state => ({
    staticText: state.staticText.getIn(['data', 'manageProfilesPage'], Map()),
    bootstrapComplete: state.app.get('bootstrapComplete'),
    userProfiles: state.userProfiles,
    auth: state.auth,
  }),
  (dispatch) => {
    const actions = getBoundActions(dispatch)
    return {
      renderModal: actions.dialog.renderModal,
      removeModal: actions.dialog.removeModal,
      createProfile: actions.userProfiles.createProfile,
      removeProfile: actions.userProfiles.removeProfile,
    }
  },
)(ManageProfilesPage)
