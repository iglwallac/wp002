import { get as getMenu } from 'services/menu'

export const SET_MENU_DATA_PROCESSING = 'SET_MENU_DATA_PROCESSING'
export const SET_MENU_DATA = 'SET_MENU_DATA'

export function setMenuDataProcessing (value) {
  return {
    type: SET_MENU_DATA_PROCESSING,
    payload: value,
  }
}

export function setMenuData (data, processing = false) {
  return {
    type: SET_MENU_DATA,
    payload: { data, processing },
  }
}

export function getMenuData (options) {
  const { language, uid } = options
  return async function getMenuDataThunk (dispatch) {
    dispatch(setMenuDataProcessing(true))
    const data = await getMenu({ language, uid })
    dispatch(setMenuData(data))
  }
}
