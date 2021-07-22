import _parseInt from 'lodash/parseInt'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import { fromJS, Map } from 'immutable'
import { Promise as BluebirdPromise } from 'bluebird'
import {
  getLocalPreferences,
  setLocalPreferences,
} from 'services/local-preferences'
import {
  get as apiGet,
  post as apiPost,
  put as apiPut,
  del as apiDelete,
  TYPE_AUTH_JSON,
  TYPE_BROOKLYN_JSON,
} from 'api-client'

const USER_SCHEMA = {
  uid: -1,
  name: '',
  mail: '',
  gcsi_user_uuid: '',
  firstName: '',
  lastName: '',
  birthday: '',
  profile: {
    picture: {
      small_28x28: '',
      hdtv_190x266: '',
    },
    bio: '',
    location: '',
    isPrivate: true,
  },
  avatar: {
    small: null,
  },
  userEntitlements: {
    start: '',
    end: '',
  },
  freeTrialNoBillingInfo: {
    ratePlanId: '',
    sku: '',
    entitlementDays: '',
  },
  billing_account_id: '',
  creation_source: '',
  account_owner_uid: '',
  email_registered_externally: '',
  created_at: '',
}

const NEW_USER_SCHEMA = {
  _dataError: null,
  resultCode: null,
  available: null,
  success: null,
  childProfile: null,
}

const USER_PROFILE_IMAGE_SCHEMA = {
  _dataError: null,
  statusCode: null,
  success: null,
}

const USER_UPDATE_SCHEMA = {
  _dataError: null,
  statusCode: null,
  success: null,
  uid: -1,
  name: '',
  username: '',
  mail: '',
  birthday: '',
  firstName: '',
  lastName: '',
  email: '',
  gcsi_user_uuid: '',
  profile: {
    picture: {
      small_28x28: '',
      hdtv_190x266: '',
    },
    bio: '',
    location: '',
    isPrivate: true,
  },
  avatar: {
    small: null,
  },
}

const LOCAL_STORAGE_KEY = 'user'
export const USERNAME_REGEX = /^[A-Za-z0-9@_.'-]{1,}$/

export async function get (options) {
  const { auth } = options

  const handleResponse = function handleResponse (res, _dataError) {
    const data = _get(res, 'body', {})
    return _assign(_cloneDeep(USER_SCHEMA), {
      _dataError,
      uid: _parseInt(_get(data, 'uid', -1)),
      name: _get(data, 'username', ''),
      mail: _get(data, 'email', ''),
      firstName: _get(data, 'first_name', ''),
      lastName: _get(data, 'last_name', ''),
      birthday: _get(data, 'birthday', ''),
      gcsi_user_uuid: _get(data, 'gcsi_user_uuid', ''),
      profile: {
        picture: {
          small_28x28: _get(data, ['profile', 'picture', 'small_28x28'], ''),
          hdtv_190x266: _get(data, ['profile', 'picture', 'hdtv_190x266'], ''),
        },
        bio: _get(data, ['profile', 'bio'], ''),
        location: _get(data, ['profile', 'location'], ''),
        isPrivate: _parseInt(_get(data, ['profile', 'isPrivate'], -1), 2),
      },
      avatar: {
        small: _get(data, ['profile', 'picture', 'small_28x28'], ''),
      },
      userEntitlements: {
        start: _get(data, ['user_entitlements', 0, 'start']),
        end: _get(data, ['user_entitlements', 0, 'end']),
      },
      freeTrialNoBillingInfo: {
        ratePlanId: _get(data, ['user_free_plan', 'rate_plan_id']),
        sku: _get(data, ['user_free_plan', 'sku']),
        entitlementDays: _get(data, ['user_free_plan', 'entitlement_days']),
      },
      billing_account_id: _get(data, 'billing_account_id'),
      creation_source: _get(data, 'creation_source'),
      account_owner_uid: _get(data, 'account_owner_uid'),
      email_registered_externally: _get(data, 'email_registered_externally'),
      created_at: _get(data, 'created_at'),
    })
  }

  if (!auth) {
    return handleResponse({}, true)
  }
  try {
    const res = await apiGet('user', { view: 'detail' }, { auth }, TYPE_AUTH_JSON)
    return handleResponse(res)
  } catch (e) {
    return handleResponse({}, true)
  }
}

export async function getEmailAvailability (options = {}) {
  const { email } = options
  try {
    const res = await apiPost('v1/checkout/account-check', { email }, null, TYPE_AUTH_JSON)
    return handleUserAvailabilityResponse(res)
  } catch (e) {
    return handleUserAvailabilityResponse({}, true)
  }
}

export async function getUsernameAvailability (options = {}) {
  const { username } = options
  try {
    const res = await apiPost('v1/checkout/account-check', { username }, null, TYPE_AUTH_JSON)
    return handleUserAvailabilityResponse(res)
  } catch (e) {
    return handleUserAvailabilityResponse({}, true)
  }
}

export function handleUserAvailabilityResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return _assign(_cloneDeep(NEW_USER_SCHEMA), {
    _dataError: _dataError || null,
    success: _get(data, 'success', null),
    available: _get(data, 'available', null),
    resultCode: _get(data, 'resultCode', null),
    childProfile: _get(data, 'childProfile', null),
  })
}

export function handleUserAvailabilityError (res, _dataError) {
  const data = _get(res, 'body', {})
  return _assign(_cloneDeep(NEW_USER_SCHEMA), {
    _dataError,
    success: _get(data, 'success'),
    available: _get(data, 'available'),
    resultCode: _get(data, 'resultCode'),
    childProfile: _get(data, 'childProfile', null),
  })
}

export async function putUserProfileImages (options = {}) {
  const { profile, avatar, auth } = options
  try {
    const res = await apiPut('v1/user/image', { profile, avatar }, { auth }, TYPE_AUTH_JSON)
    return handlePutUserProfileImages(res)
  } catch (e) {
    return handlePutUserProfileImages({}, true)
  }
}

export function handlePutUserProfileImages (res, _dataError) {
  const statusCode = _get(res, 'statusCode')
  const success = statusCode >= 200 && statusCode <= 299
  return _assign(_cloneDeep(USER_PROFILE_IMAGE_SCHEMA), {
    _dataError: _dataError || null,
    statusCode,
    success,
  })
}

export async function removeUserProfileImages (options = {}) {
  const { auth } = options
  try {
    const res = await apiDelete('v1/user/image', null, { auth }, TYPE_AUTH_JSON)
    return handleRemoveUserProfileImages(res)
  } catch (e) {
    return handleRemoveUserProfileImages({}, true)
  }
}

export function handleRemoveUserProfileImages (res, _dataError) {
  const statusCode = _get(res, 'statusCode')
  const success = statusCode >= 200 && statusCode <= 299
  return _assign(_cloneDeep(USER_PROFILE_IMAGE_SCHEMA), {
    _dataError: _dataError || null,
    statusCode,
    success,
  })
}

export async function getUserContactDataEmarsys (uid, language) {
  try {
    const res = await apiGet(`email-contact-data/${uid}`, { language }, null, TYPE_BROOKLYN_JSON)
    return _get(res, 'body', [])
  } catch (e) {
    return []
  }
}

export async function getUserEmailPreferencesById (id, language) {
  try {
    const res = await apiGet(`email-contact/${id}`, { language }, null, TYPE_BROOKLYN_JSON)
    return handleUserEmailPreferencesById(res)
  } catch (err) {
    return handleUserEmailPreferencesById({}, true)
  }
}

export function handleUserEmailPreferencesById (res, _dataError) {
  /* eslint-disable no-unneeded-ternary */
  const data = _get(res, 'body', [])
  const success = _dataError ? false : true
  return {
    _dataError: _dataError || null,
    success,
    data,
  }
  /* eslint-enable no-unneeded-ternary */
}

export async function updateUserInfo (options = {}) {
  const {
    auth,
    email,
    username,
    bio,
    location,
    password,
    firstName,
    lastName,
    shippingAddress,
    billingAddress,
    birthday,
  } = options
  try {
    const res = await apiPut('v1/user', { email, bio, username, birthday, location, password, first_name: firstName, last_name: lastName, shipping_address: shippingAddress, billing_address: billingAddress }, { auth }, TYPE_AUTH_JSON)
    return handleUpdateUser(res)
  } catch (e) {
    return handleUpdateUser({}, true)
  }
}

export function handleUpdateUser (res, _dataError) {
  const data = _get(res, 'body', {})
  const statusCode = _get(res, 'statusCode')
  const success = statusCode >= 200 && statusCode <= 299
  return _assign(_cloneDeep(USER_UPDATE_SCHEMA), {
    _dataError: _dataError || null,
    statusCode,
    success,
    uid: _parseInt(_get(data, 'uid', -1)),
    name: _get(data, 'username', ''),
    mail: _get(data, 'mail', ''),
    username: _get(data, 'username', ''),
    birthday: _get(data, 'birthday'),
    firstName: _get(data, 'first_name', ''),
    lastName: _get(data, 'last_name', ''),
    email: _get(data, 'email', ''),
    gcsi_user_uuid: _get(data, 'gcsi_user_uuid', ''),
    profile: {
      picture: {
        small_28x28: _get(data, ['profile', 'picture', 'small_28x28'], ''),
        hdtv_190x266: _get(data, ['profile', 'picture', 'hdtv_190x266'], ''),
      },
      bio: _get(data, ['profile', 'bio'], ''),
      location: _get(data, ['profile', 'location'], ''),
      isPrivate: _parseInt(_get(data, ['profile', 'isPrivate'], -1), 2),
    },
    avatar: {
      small: _get(data, ['profile', 'picture', 'small_28x28'], ''),
    },
  })
}

export function setUserLanguage (data) {
  return _assign(_cloneDeep(USER_SCHEMA), {
    language: data,
  })
}

export async function getUserLocalData (options) {
  const { uid } = options
  return new BluebirdPromise(((resolve) => {
    const user = getLocalPreferences(uid, LOCAL_STORAGE_KEY) || {}
    resolve(fromJS(user))
  }))
}

export async function setUserLocalData (options = {}, auth) {
  const { uid, data } = options
  if (!data) {
    throw new Error('User localstorage set requires a data option.')
  }
  try {
    let user = await getUserLocalData({ uid })
    // eslint-disable-next-line no-param-reassign
    user = user.merge(data)
    setLocalPreferences(uid, LOCAL_STORAGE_KEY, user.toJS(), auth)
    return user
  } catch (e) {
    return Map()
  }
}

/**
 * Given a user object from state get the user's language
 * @param {import('immutable').Map} user A user object from state
 * @returns {String[]|undefined} An array of languages or undefined if it does not exist
 */
export function getUserLanguage (user) {
  if (Map.isMap(user)) {
    return user.getIn(['data', 'language'])
  }
  return undefined
}

export async function getUserLocalDataLanguage (auth) {
  const user = await getUserLocalData({ uid: auth.get('uid') })
  return getUserLanguage(user)
}

export async function getUserLocalDataLanguageAlertBarAccepted (auth) {
  const user = await getUserLocalData({ uid: auth.get('uid') })
  return user.getIn(['data', 'languageAlertBarAccepted'])
}

export async function setUserLocalDataLanguageAlertBarAccepted (auth, value) {
  const user = await setUserLocalData({ uid: auth.get('uid'), data: { data: { languageAlertBarAccepted: value } } }, auth)
  return user.getIn(['data', 'languageAlertBarAccepted'])
}

export async function getUserPublic (uuid) {
  try {
    const res = await apiGet(`/v1/user/lookup/${uuid}`, null, null, TYPE_BROOKLYN_JSON)
    const { body } = res
    return transform(body)
  } catch (err) {
    return err
  }
}

export function transform (user) {
  const image = _get(user, 'profilePicture')
    || _get(user, ['profile', 'picture', 'hdtv_190x266'], '')
  return {
    url: _get(user, 'url') ? `/portal/${_get(user, 'url')}` : null,
    subscribers: _get(user, 'subscriberCount', 0),
    tagline: _get(user, 'tagline', ''),
    title: _get(user, 'username', ''),
    tags: _get(user, 'tags', []),
    id: _get(user, 'uuid'),
    image,
  }
}
