import _get from 'lodash/get'
import { post, REQUEST_TYPE_X_WWW_FORM_URLENCODED, TYPE_BROOKLYN } from 'api-client'
import { EN } from 'services/languages/constants'

/**
 * Send password reset email to the provide email address
 * @param {Object} options The options
 * @param {String} options.email The email address
 * @param {String} options.primaryLanguage The language for the email
 */
export async function sendEmail (options = {}) {
  const { email, primaryLanguage = EN } = options
  try {
    const res = await post(
      'v1/password/send-email',
      { email, primaryLanguage },
      { reqType: REQUEST_TYPE_X_WWW_FORM_URLENCODED },
      TYPE_BROOKLYN,
    )
    return handleResponse(res, 'The password email was not successfully sent')
  } catch (e) {
    return handleResponse({}, 'There was an error sending the update password email')
  }
}

/**
 * Update a password
 * @param {Object} options The options
 * @param {Number} options.uid The user id
 * @param {Number} options.expiry The expiration time
 * @param {String} options.token The reset token
 * @param {String} options.newPassword The new password for the user
 */
export async function updatePassword (options = {}) {
  const { uid, expiry, token, newPassword } = options
  try {
    const res = await post(
      'v1/password/reset',
      {
        expiry,
        newPassword,
        token,
        uid,
      },
      { reqType: REQUEST_TYPE_X_WWW_FORM_URLENCODED },
      TYPE_BROOKLYN,
    )
    return handleResponse(res, 'The password was not successfully updated')
  } catch (e) {
    return handleResponse({}, 'There was an error updating the password')
  }
}

function handleResponse (res, errorMsg) {
  const data = _get(res, 'body', {})
  if (_get(data, 'success')) {
    return data
  }
  throw new Error(errorMsg)
}
