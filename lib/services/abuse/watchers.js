import { addToasty } from 'services/toasty/actions'
import * as actions from './actions'
import * as api from './'

export default function createAbuseReport ({ takeEvery }) {
  return takeEvery(
    actions.ABUSE_CREATE_REPORT,
    async ({ state, action }) => {
      const { auth } = state
      const { payload: report } = action
      const response = await api.createAbuseReport({ report, auth })
      const { errors } = response
      return {
        type: actions.ABUSE_SET_REPORT,
        payload: {
          success: !errors,
          code: errors ? errors[0].status : 200,
        },
      }
    })
}

// -----------------------------------
// Watcher for toasty when report is made
// -----------------------------------
export function reportCreateToasty ({ after }) {
  return after([
    actions.ABUSE_SET_REPORT,
  ], async ({ dispatch, state, action }) => {
    const { staticText } = state
    const { payload } = action
    const { success, code } = payload
    const successMsg = staticText.getIn(['data', 'portalV2', 'data', 'toastyReportSuccess'])
    const errorMsg = code === 409
      ? staticText.getIn(['data', 'portalV2', 'data', 'toastyReportErrorAlreadyReported'])
      : staticText.getIn(['data', 'portalV2', 'data', 'toastyReportError'])
    const msg = success ? successMsg : errorMsg
    dispatch(addToasty(msg))
  })
}
