import { BOOTSTRAP_PHASE_INIT } from 'services/app'
import { SET_APP_BOOTSTRAP_PHASE } from 'services/app/actions'
import { getServerTimeData } from './actions'

// eslint-disable-next-line import/prefer-default-export
export function serverTimeBootStrapWatcher ({ after }) {
  return after(SET_APP_BOOTSTRAP_PHASE, ({ state, dispatch }) => {
    const { app } = state
    switch (app.get('bootstrapPhase')) {
      case BOOTSTRAP_PHASE_INIT: {
        dispatch(getServerTimeData())
        break
      }
      default:
        break
    }
  })
}
