/* eslint-disable import/prefer-default-export */
import { get as apiGet, del as apiDelete, post as apiPost, TYPE_BROOKLYN_JSON, TYPE_BROOKLYN } from 'api-client'
import _get from 'lodash/get'

const ERROR_STATUS = {
  success: false,
  error: true,
}

export const PP_DEFAULT = 10

export async function getUserHiddenContent (options) {
  const { auth, p, pp } = options
  try {
    const res = await apiGet(
      '/user/hidden-content-list',
      { p, pp },
      { auth },
      TYPE_BROOKLYN,
    )
    return _get(res, 'body', {})
  } catch (e) {
    return ERROR_STATUS
  }
}

export async function postHiddenContent (content, auth) {
  const { contentId, contentType } = content
  try {
    const res = await apiPost(
      '/user/hidden-content',
      { contentType, contentId },
      { auth },
      TYPE_BROOKLYN_JSON,
    )
    return {
      data: _get(res, 'body', {}),
      error: false,
    }
  } catch (e) {
    return {
      error: true,
      data: {},
    }
  }
}

export async function deleteHiddenContent (id, auth) {
  try {
    const res = await apiDelete(
      `/user/hidden-content/${id}`,
      null,
      { auth },
      TYPE_BROOKLYN,
    )
    return {
      success: _get(res, ['body', 'success'], ''),
      error: false,
    }
  } catch (e) {
    return ERROR_STATUS
  }
}
