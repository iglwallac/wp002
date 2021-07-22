export const ABUSE_CREATE_REPORT = 'ABUSE_CREATE_REPORT'
export const ABUSE_SET_REPORT = 'ABUSE_SET_REPORT'

export function createAbuseReport (payload) {
  return { type: ABUSE_CREATE_REPORT, payload }
}
