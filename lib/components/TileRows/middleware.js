import _isUndefined from 'lodash/isUndefined'
import {
  SET_TILE_ROWS_ACTIVE_ID,
  SET_TILE_ROWS_ROW_ACTIVE_ID,
  resetTileRowsActiveRow,
} from './actions'

export default function middleware (store) {
  return next => (action) => {
    if (process.env.BROWSER) {
      const { storeKey } = action.payload || {}
      switch (action.type) {
        case SET_TILE_ROWS_ACTIVE_ID:
        case SET_TILE_ROWS_ROW_ACTIVE_ID: {
          const state = store.getState()
          const { tileRows } = state
          // This makes it so only 1 row can be active at a time,
          // which will allow only 1 shelf to be visible at a time
          // by removing any active ids that are not part of the active row
          tileRows.forEach((row, rowKey) => {
            // do nothing if this is the active row
            if (storeKey === rowKey) {
              return
            }
            const activeId = row.get('activeId')
            const rowActiveId = row.get('rowActiveId')
            if (!_isUndefined(activeId) || !_isUndefined(rowActiveId)) {
              store.dispatch(resetTileRowsActiveRow(rowKey))
            }
          })
          break
        }
        default:
          // Do nothing.
          break
      }
    }
    next(action)
  }
}
