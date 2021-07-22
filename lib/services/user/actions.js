import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'
// import { get as getServerTime } from 'services/server-time'
import { get as getFeatureTracking } from 'services/feature-tracking'
import { setFeatureTrackingData } from 'services/feature-tracking/actions'
import { getProfiles as getUserProfilesAction } from 'services/user-profiles/actions'
import {
  get as getUser,
  getUsernameAvailability,
  getEmailAvailability,
  getUserContactDataEmarsys,
  setUserLocalDataLanguageAlertBarAccepted,
  getUserLocalDataLanguageAlertBarAccepted,
  getUserLocalDataLanguage,
  putUserProfileImages,
  removeUserProfileImages,
  updateUserInfo,
  getUserEmailPreferencesById,
} from './index'

export const SET_USER_DATA = 'SET_USER_DATA'
export const SET_USER_DATA_BILLING_SUBSCRIPTIONS =
  'SET_USER_DATA_BILLING_SUBSCRIPTIONS'
export const SET_USER_PROCESSING = 'SET_USER_PROCESSING'
export const SET_USER_BILLING_SUBSCRIPTIONS_PROCESSING =
  'SET_USER_BILLING_SUBSCRIPTIONS_PROCESSING'
export const SET_USER_DATA_ENTITLED = 'SET_USER_DATA_ENTITLED'
export const SET_USER_AVAILABILITY_PROCESSING =
  'SET_USER_AVAILABILITY_PROCESSING'
export const SET_USER_USERNAME_AVAILABILITY_PROCESSING =
  'SET_USER_USERNAME_AVAILABILITY_PROCESSING'
export const SET_USER_USERNAME_AVAILABILITY = 'SET_USER_USERNAME_AVAILABILITY'
export const RESET_USER_USERNAME_AVAILABILITY =
  'RESET_USER_USERNAME_AVAILABILITY'
export const SET_USER_EMAIL_AVAILABILITY_PROCESSING =
  'SET_USER_EMAIL_AVAILABILITY_PROCESSING'
export const SET_USER_CHILD_ACCOUNT = 'SET_USER_CHILD_ACCOUNT'
export const SET_USER_EMAIL_AVAILABILITY = 'SET_USER_EMAIL_AVAILABILITY'
export const RESET_USER_EMAIL_AVAILABILITY = 'RESET_USER_EMAIL_AVAILABILITY'
export const SET_USER_DATA_LANGUAGE = 'SET_USER_DATA_LANGUAGE'
export const CLEAR_USER_DATA_LANGUAGE_DIALOG = 'CLEAR_USER_DATA_LANGUAGE_DIALOG'
export const SET_USER_DATA_LANGUAGE_DIALOG = 'SET_USER_DATA_LANGUAGE_DIALOG'
export const RESET_USER_DATA_LANGUAGE = 'RESET_USER_DATA_LANGUAGE'
export const SET_USER_DATA_LANGUAGE_PRIMARY = 'SET_USER_DATA_LANGUAGE_PRIMARY'
export const SET_USER_DATA_LANGUAGE_ALERT_BAR_ACCEPTED =
  'SET_USER_DATA_LANGUAGE_ALERT_BAR_ACCEPTED'
export const SET_USER_PROFILE_IMAGES_PROCESSING = 'SET_USER_PROFILE_IMAGES_PROCESSING'
export const SET_USER_PROFILE_IMAGES = 'SET_USER_PROFILE_IMAGES'
export const SET_USER_PROFILE_IMAGES_DELETE = 'SET_USER_PROFILE_IMAGES_DELETE'
export const CLEAR_USER_PROFILE_DATA = 'CLEAR_USER_PROFILE_DATA'
export const SET_USER_UPDATE_DATA = 'SET_USER_UPDATE_DATA'
export const SET_UPDATE_USER_PROCESSING = 'SET_UPDATE_USER_PROCESSING'
export const SET_USER_CONTACT_DATA = 'SET_USER_CONTACT_DATA'
export const UPDATE_USER_CONTACT_DATA = 'UPDATE_USER_CONTACT_DATA'
export const SET_ANONYMOUS_USER_EMAIL_PREFERENCES_PROCESSING = 'SET_ANONYMOUS_USER_EMAIL_PREFERENCES_PROCESSING'
export const SET_ANONYMOUS_USER_EMAIL_PREFERENCES_DATA = 'SET_ANONYMOUS_USER_EMAIL_PREFERENCES_DATA'
export const RESET_ANONYMOUS_USER_EMAIL_PREFERENCES = 'RESET_ANONYMOUS_USER_EMAIL_PREFERENCES'
export const SET_USER_PORTAL_METADATA = 'SET_USER_PORTAL_METADATA'
export const MODAL_FREE_TRIAL_EXPIRED_DISMISSED = 'MODAL_FREE_TRIAL_EXPIRED_DISMISSED'
export const SET_USER_ANONYMOUS_UUID = 'SET_USER_ANONYMOUS_UUID'

export function setAnonymousUuid (uuid) {
  return {
    type: SET_USER_ANONYMOUS_UUID,
    payload: { uuid },
  }
}

export function getUserData ({ auth }) {
  return async function getUserDataThunk (dispatch) {
    try {
      dispatch(setUserProcessing(true))
      const data = await getUser({ auth })
      const tracking = await getFeatureTracking({ auth })
      dispatch(setFeatureTrackingData(tracking))
      dispatch(setUserData(data))
      return data
    } catch (e) {
      dispatch(setUserProcessing(false))
    }
    return {}
  }
}

export function getUserUsernameAvailability (username) {
  return async function getUserUsernameAvailabilityThunk (dispatch) {
    try {
      dispatch(setUserUsernameAvailabilityProcessing(true))
      const data = await getUsernameAvailability({ username })
      dispatch(setUserUsernameAvailability(data.success && data.available))
      return data
    } catch (e) {
      dispatch(setUserUsernameAvailability(false))
    }
    return {}
  }
}

export function getUserEmailAvailability (email) {
  return async function getUserEmailAvailabilityThunk (dispatch) {
    try {
      dispatch(setUserEmailAvailabilityProcessing(true))
      const data = await getEmailAvailability({ email })
      dispatch(setUserEmailAvailability(data.success && data.available))
      dispatch(setUserChildAccount(data.childProfile))
      return data
    } catch (e) {
      dispatch(setUserEmailAvailability(false))
    }
    return {}
  }
}

export function getUserContactData (uid) {
  return async function getUserContactDataThunk (dispatch, getState) {
    try {
      const { user } = getState()
      const language = user.getIn(['data', 'language'])
      const data = await getUserContactDataEmarsys(uid, language)
      dispatch(setUserContactData(data))
      return data
    } catch (e) {
      // Do nothing
    }
    return {}
  }
}

export function getAnonymousUserEmailPreferences (id) {
  return async function getAnonymousUserEmailPreferencesThunk (dispatch, getState) {
    try {
      const { user } = getState()
      const language = user.getIn(['data', 'language'])
      dispatch(setAnonymousUserEmailPreferencesProcessing(true))
      const data = await getUserEmailPreferencesById(id, language)
      dispatch(setAnonymousUserEmailPreferencesData(data))
      return data
    } catch (e) {
      dispatch(setAnonymousUserEmailPreferencesProcessing(false))
    }
    return {}
  }
}

export function updateUserProfileImages (options) {
  return async function updateUserProfileImagesThunk (dispatch) {
    try {
      const { profile, avatar, auth } = options
      dispatch(setUserProfileImagesProcessing(true))
      const data = await putUserProfileImages({ profile, avatar, auth })
      dispatch(setUserProfileImages(data))
      return data
    } catch (e) {
      dispatch(setUserProfileImagesProcessing(false))
    }
    return {}
  }
}

export function deleteUserProfileImages (options) {
  return async function deleteUserProfileImagesThunk (dispatch) {
    try {
      const { auth } = options
      dispatch(setUserProfileImagesProcessing(true))
      const data = await removeUserProfileImages({ auth })
      dispatch(setUserProfileImagesDelete(data))
      return data
    } catch (e) {
      dispatch(setUserProfileImagesProcessing(false))
    }
    return {}
  }
}

export function updateUser (options) {
  return async function updateUserThunk (dispatch) {
    try {
      const {
        auth,
        email,
        username,
        bio,
        location,
        password,
        firstName,
        lastName,
        birthday,
        shippingAddress,
        billingAddress,
      } = options
      dispatch(setUpdateUserProcessing(true))
      dispatch(setUserProcessing(true))
      const data = await updateUserInfo({
        auth,
        email,
        username,
        bio,
        location,
        password,
        firstName,
        lastName,
        birthday,
        shippingAddress,
        billingAddress,
      })
      dispatch(setUserUpdateData(data))
      if (_get(data, ['success'])) {
        dispatch(setUserData(data))
        dispatch(getUserProfilesAction())
      }
      return data
    } catch (e) {
      dispatch(setUpdateUserProcessing(false))
      dispatch(setUserProcessing(false))
    }
    return {}
  }
}

export function modalFreeTrialExpiredDismissed (value) {
  return {
    type: MODAL_FREE_TRIAL_EXPIRED_DISMISSED,
    payload: value,
  }
}

export function setUserData (data, processing = false) {
  return {
    type: SET_USER_DATA,
    payload: { data, processing },
  }
}

export function setUserProcessing (value) {
  return {
    type: SET_USER_PROCESSING,
    payload: value,
  }
}

export function setUserDataEntitled (value, processing = false) {
  return {
    type: SET_USER_DATA_ENTITLED,
    payload: { value, processing },
  }
}

export function setUserUsernameAvailabilityProcessing (value) {
  return {
    type: SET_USER_USERNAME_AVAILABILITY_PROCESSING,
    payload: value,
  }
}

export function setUserUsernameAvailability (value) {
  return {
    type: SET_USER_USERNAME_AVAILABILITY,
    payload: value,
  }
}

export function resetUserUsernameAvailability () {
  return {
    type: RESET_USER_USERNAME_AVAILABILITY,
  }
}

export function setUserEmailAvailabilityProcessing (value) {
  return {
    type: SET_USER_EMAIL_AVAILABILITY_PROCESSING,
    payload: value,
  }
}

export function setUserContactData (value) {
  return {
    type: SET_USER_CONTACT_DATA,
    payload: value,
  }
}

export function updateUserContactData (fields, optin) {
  return {
    type: UPDATE_USER_CONTACT_DATA,
    payload: { fields, optin },
  }
}

export function setUserChildAccount (value) {
  return {
    type: SET_USER_CHILD_ACCOUNT,
    payload: value,
  }
}

export function setUserEmailAvailability (value) {
  return {
    type: SET_USER_EMAIL_AVAILABILITY,
    payload: value,
  }
}

export function resetUserEmailAvailability () {
  return {
    type: RESET_USER_EMAIL_AVAILABILITY,
  }
}

export function setUserProfileImagesProcessing (value) {
  return {
    type: SET_USER_PROFILE_IMAGES_PROCESSING,
    payload: value,
  }
}

export function setUserProfileImages (data, processing = false) {
  return {
    type: SET_USER_PROFILE_IMAGES,
    payload: { data, processing },
  }
}

export function setUserProfileImagesDelete (data, processing = false) {
  return {
    type: SET_USER_PROFILE_IMAGES_DELETE,
    payload: { data, processing },
  }
}

export function clearUserProfileData () {
  return {
    type: CLEAR_USER_PROFILE_DATA,
  }
}

export function setUpdateUserProcessing (value) {
  return {
    type: SET_UPDATE_USER_PROCESSING,
    payload: value,
  }
}

export function setUserUpdateData (data, processing = false) {
  return {
    type: SET_USER_UPDATE_DATA,
    payload: { data, processing },
  }
}

export function setUserDataLanguage (value, processing = false) {
  return {
    type: SET_USER_DATA_LANGUAGE,
    payload: { value, processing },
  }
}

export function clearUserDataLanguageDialog () {
  return {
    type: CLEAR_USER_DATA_LANGUAGE_DIALOG,
  }
}

export function setUserDataLanguageDialog (value) {
  return {
    type: SET_USER_DATA_LANGUAGE_DIALOG,
    payload: { value },
  }
}

export function resetUserDataLanguage (processing = false) {
  return {
    type: RESET_USER_DATA_LANGUAGE,
    payload: { processing },
  }
}

export function setUserDataLanguagePrimary (value, processing = false) {
  return {
    type: SET_USER_DATA_LANGUAGE_PRIMARY,
    payload: { value, processing },
  }
}

export function setAnonymousUserEmailPreferencesProcessing (value) {
  return {
    type: SET_ANONYMOUS_USER_EMAIL_PREFERENCES_PROCESSING,
    payload: value,
  }
}

export function setAnonymousUserEmailPreferencesData (data, processing = false) {
  return {
    type: SET_ANONYMOUS_USER_EMAIL_PREFERENCES_DATA,
    payload: { data, processing },
  }
}

export function resetAnonymousUserEmailPreferences () {
  return {
    type: RESET_ANONYMOUS_USER_EMAIL_PREFERENCES,
  }
}

export function getUserDataLanguage (auth) {
  return async function getUserDataLanguageThunk (dispatch) {
    try {
      const data = await getUserLocalDataLanguage(auth)
      if (!_isUndefined(data)) {
        dispatch(setUserDataLanguage(data))
      }
      return data
    } catch (e) {
      // Do nothing
    }
    return {}
  }
}

export function getUserDataLanguageAlertBarAccepted (auth) {
  return async function getUserDataLanguageAlertBarAcceptedThunk (dispatch) {
    try {
      const data = await getUserLocalDataLanguageAlertBarAccepted(auth)
      dispatch(setUserDataLanguageAlertBarAcceptedAction(data))
      return data
    } catch (e) {
      // Do nothing
    }
    return {}
  }
}

export function setUserDataLanguageAlertBarAccepted (auth, value) {
  return async function setUserDataLanguageAlertBarAcceptedThunk (dispatch) {
    try {
      const data = await setUserLocalDataLanguageAlertBarAccepted(auth, value)
      dispatch(setUserDataLanguageAlertBarAcceptedAction(data))
      return data
    } catch (e) {
      // Do nothing
    }
    return {}
  }
}

export function setUserDataLanguageAlertBarAcceptedAction (value) {
  return {
    type: SET_USER_DATA_LANGUAGE_ALERT_BAR_ACCEPTED,
    payload: { value },
  }
}

export function setUserPortalMetaData (data) {
  return {
    type: SET_USER_PORTAL_METADATA,
    payload: { data },
  }
}
