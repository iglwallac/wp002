export const SET_TILE_ROWS_ACTIVE_ID = 'SET_TILE_ROWS_ACTIVE_ID'
export const SET_TILE_ROWS_ROW_ACTIVE_ID = 'SET_TILE_ROWS_ROW_ACTIVE_ID'
export const RESET_TILE_ROWS_ACTIVE_ID = 'RESET_TILE_ROWS_ACTIVE_ID'
export const RESET_TILE_ROWS_ROW_ACTIVE_ID = 'RESET_TILE_ROWS_ROW_ACTIVE_ID'
export const RESET_TILE_ROWS_ACTIVE_ROW = 'RESET_TILE_ROWS_ACTIVE_ROW'

export function setTileRowsActiveId (storeKey, activeId) {
  return {
    type: SET_TILE_ROWS_ACTIVE_ID,
    payload: { activeId, storeKey },
  }
}

export function setTileRowsRowActiveId (storeKey, rowActiveId) {
  return {
    type: SET_TILE_ROWS_ROW_ACTIVE_ID,
    payload: { rowActiveId, storeKey },
  }
}

export function resetTileRowsActiveId (storeKey) {
  return {
    type: RESET_TILE_ROWS_ACTIVE_ID,
    payload: { storeKey },
  }
}

export function resetTileRowsRowActiveId (storeKey) {
  return {
    type: RESET_TILE_ROWS_ROW_ACTIVE_ID,
    payload: { storeKey },
  }
}

export function resetTileRowsActiveRow (storeKey) {
  return {
    type: RESET_TILE_ROWS_ACTIVE_ROW,
    payload: { storeKey },
  }
}
