import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  //
  const {
    type: actionType,
    payload,
  } = action

  switch (actionType) {
    //
    case actions.ABUSE_SET_REPORT: {
      const { success, code } = payload
      const data = Map({
        success,
        code,
      })
      return state.set('reportStatus', data)
    }

    default:
      return state
  }
}

