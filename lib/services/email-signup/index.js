import { post as apiPost, TYPE_BROOKLYN_JSON } from 'api-client'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _toLower from 'lodash/toLower'
import _includes from 'lodash/includes'

export const ERROR_EMAIL_INVALID = 'EMAIL_INVALID'
export const ERROR_EMAIL_REGISTRATION_ERROR = 'EMAIL_REGISTRATION_ERROR'
export const SITE_SEGMENT_SHORT_SEEKING_TRUTH = 'st'
export const SITE_SEGMENT_SHORT_TRANSFORMATION = 'tr'
export const SITE_SEGMENT_SHORT_YOGA = 'my'
export const SITE_SEGMENT_SHORT_BRAND = 'br'

// source props that map to form names
export const EMAIL_SIGNUP_GENERIC = 'WEBAPP_LEAD_CAPTURE'
export const EMAIL_SIGNUP_SHARE = 'SHARE_VIDEO_LEAD'
export const EMAIL_SIGNUP_SHARE_EXPIRED = 'SHARE_VIDEO_EXPIRED_LEAD'
export const EMAIL_SIGNUP_PORTAL_PAGE = 'PORTAL_PAGE'
export const EMAIL_SIGNUP_INVITE_FRIEND = 'INVITE_FRIEND'

export function getSiteSegmentShorthand (siteSegmentName) {
  let segmentAbbreviation = SITE_SEGMENT_SHORT_BRAND
  const formattedSiteSegmentName = _toLower(siteSegmentName)

  if (_includes(formattedSiteSegmentName, 'seeking')) {
    segmentAbbreviation = SITE_SEGMENT_SHORT_SEEKING_TRUTH
  } else if (_includes(formattedSiteSegmentName, 'spiritual')) {
    segmentAbbreviation = SITE_SEGMENT_SHORT_TRANSFORMATION
  } else if (_includes(formattedSiteSegmentName, 'transformation')) {
    segmentAbbreviation = SITE_SEGMENT_SHORT_TRANSFORMATION
  } else if (_includes(formattedSiteSegmentName, 'yoga')) {
    segmentAbbreviation = SITE_SEGMENT_SHORT_YOGA
  }

  return segmentAbbreviation
}

/**
 * Post captured email to CoreAPI, which in turn ends up in Responsys.
 * This call will be deprecated once ready to flip the
 * switch to Emarsys, which will post only to Brooklyn. For now, post
 * to both Brooklyn and CoreAPI.
 * @param options {object} Post body parameters
 * @param options.emailAddress {string} Email address to capture
 * @param options.formName {string} Name of form from which email is being captured
 * @param options.country {string} 2-3 character country string
 * @param options.siteSegment {string} ???
 * @param options.userLanguage {string} Two character language code
 * @returns {*}
 * @private
 */
export async function postCore (options) {
  const { emailAddress, formName, country, siteSegment, userLanguage, url, utm, optin } = options
  const siteSegmentAbbreviation = SITE_SEGMENT_SHORT_BRAND
  const postOptions = {
    emailAddress,
    formName,
    siteSegment: siteSegment.toJS(),
    country,
    userLanguage,
  }
  const form = formName || EMAIL_SIGNUP_GENERIC

  // posting to core has been deprecated (Responsys is no longer used)
  // only posting to brooklyn now (for Emarsys)
  // this function needs to be removed, and code refactored to only use
  // the postBrooklyn api call
  try {
    const res = await postBrooklyn({
      email: postOptions.emailAddress,
      source: '',
      optin,
      fields: {
        url,
        registration_language: postOptions.userLanguage,
        prospect_behavior_segment: siteSegmentAbbreviation,
        prospect_email_comm_br: true,
        form_name: form,
      },
      utm,
    })
    return res
  } catch (e) {
    return { success: false }
  }
}

/**
 * Post captured email to Broooklyn, which in turn ends up in Emarsys.
 * This call will replace the call to Core API once Emarsys integration is complete.
 * @param options {object} Post body parameters
 * @param options.email {string} Email address to capture
 * @param options.source {string} Capture location-specific text (ie. LiveAccess-0000-0000-0000)
 * @param options.fields {object} Mapping of field/values
 * @param options.utm {string} Utm string
 * @param options.optin {boolean} true to opt-in for email notifications, false otherwise
 * @returns {*}
 * @private
 */
export async function postBrooklyn (options) {
  const { email, source, fields = {}, utm, optin = true, updatePreferences = false } = options
  // eslint-disable-next-line camelcase
  const { shared_video_id, new_share_url } = fields
  const siteSegmentAbbreviation = SITE_SEGMENT_SHORT_BRAND

  if (!updatePreferences) {
    // set the prospect behavior segment and email comm on fields, even if it was not passed in
    // that way every request has a default values
    _set(fields, 'prospect_behavior_segment', siteSegmentAbbreviation)
    _set(fields, 'prospect_email_comm_br', true)
    _set(fields, 'form_name', _get(fields, 'form_name', EMAIL_SIGNUP_GENERIC))
    _set(fields, 'shared_video_id', shared_video_id)
    // eslint-disable-next-line camelcase
    if (new_share_url) _set(fields, 'new_share_url', new_share_url)
  }
  const postOptions = {
    email,
    source,
    fields,
    utm,
    optin,
  }
  const res = await apiPost('email-capture', postOptions, null, TYPE_BROOKLYN_JSON)
  const data = _get(res, 'body', {})
  const { success, errorCode } = data

  return {
    success,
    errorCode,
  }
}
