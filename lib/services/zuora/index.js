import _get from 'lodash/get'
import { post as apiPost, TYPE_BROOKLYN_JSON } from 'api-client'

export function handleSignatureTokenResponse (res, _dataError) {
  const data = _get(res, 'body', {})
  return {
    _dataError: _dataError || null,
    signature: _get(data, 'signature', null),
    token: _get(data, 'token', null),
    tenantId: _get(data, 'tenantId', null),
    key: _get(data, 'key', null),
    success: _get(data, 'success', false),
  }
}

/**
 * Brooklyn request to get the Zuora rsa signature and token in order to render the payment iframe.
 * @param {Object} [options={}] The options
 * @param {String} options.pageId The page id for the desired Zuora iframe
 * @param {String} options.uri The uri for the Zuora iframe
 */
export async function getZuoraIframeSignatureToken (options = {}) {
  const { pageId, uri } = options
  try {
    const res = await apiPost('v1/billing/iframe-init', { pageId, uri }, null, TYPE_BROOKLYN_JSON)
    return handleSignatureTokenResponse(res)
  } catch (e) {
    return handleSignatureTokenResponse({ success: false }, true)
  }
}
