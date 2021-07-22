import { SET_RESOLVER_LOCATION } from 'services/resolver/actions'
import * as actions from './actions'

export default function closeModalOnPageChange ({ before }) {
  return before(SET_RESOLVER_LOCATION, async ({ state, dispatch }) => {
    const { dialog } = state
    if (dialog.size > 0) {
      dispatch(actions.removeModal())
    }
  })
}
