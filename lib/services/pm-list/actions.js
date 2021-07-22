export const GET_MULTIPLE_PM_LISTS = 'GET_MULTIPLE_PM_LISTS'
export const GET_PM_LIST = 'GET_PM_LIST'
export const SET_PM_LIST = 'SET_PM_LIST'
export const SET_PM_LIST_ERROR = 'SET_PM_LIST_ERROR'

export function getMultiplePmLists (listIds) {
  return {
    type: GET_MULTIPLE_PM_LISTS,
    payload: listIds,
  }
}

export function getPmList (listId) {
  return {
    type: GET_PM_LIST,
    payload: listId,
  }
}

export function setPmList (listId, data) {
  return {
    type: SET_PM_LIST,
    payload: {
      listId,
      data,
    },
  }
}

export function setPmListError (listId, error) {
  return {
    type: SET_PM_LIST_ERROR,
    payload: {
      listId,
      error,
    },
  }
}
