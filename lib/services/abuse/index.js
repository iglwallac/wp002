import get from 'lodash/get'

import {
  REQUEST_ACCEPT_APPLICATION_JSON,
  TYPE_BROOKLYN,
  post as apiPost,
  // get as apiGet,
  // del as apiDel,
} from 'api-client'

const ERROR = { success: false }

export const TYPES = {
  COMMENT: 'COMMENT',
  PORTAL: 'PORTAL',
  CHAT: 'CHAT',
}

export const RESOLVER_ACTIONS = {
  ACCOUNT_TERMINDATED: 'ACCOUNT_TERMINDATED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  PORTAL_LOCKED: 'PORTAL_LOCKED',
  NONE: 'NONE',
}

export const ACCUSATION_CODES = {
  P001: 'P001',
  P002: 'P002',
  P003: 'P003',
  P004: 'P004',
  P005: 'P005',
}

export const ACCUSATION_REASONS = {
  P001: 'Inappropriate Avatar',
  P002: 'Impersonation',
  P003: 'Poor Conduct',
  P004: 'Bad Videos',
  P005: 'Spammy',
}


export async function createAbuseReport ({ report, auth }) {
  try {
    const params = { reqType: REQUEST_ACCEPT_APPLICATION_JSON, auth }
    const response = await apiPost(
      '/v1/user-abuse', report, params, TYPE_BROOKLYN)
    return get(response, 'body', {})
  } catch (e) {
    return ERROR
  }
}
