export const GET_MULTIPLE_PM_PLACEMENTS = 'GET_MULTIPLE_PM_PLACEMENTS'
export const GET_PM_PLACEMENT = 'GET_PM_PLACEMENT'
export const SET_PM_PLACEMENT = 'SET_PM_PLACEMENT'
export const SET_PM_PLACEMENT_ERROR = 'SET_PM_PLACEMENT_ERROR'

export function getMultiplePmPlacements (placementNames, language) {
  return {
    type: GET_MULTIPLE_PM_PLACEMENTS,
    payload: {
      placementNames,
      language,
    },
  }
}

export function getPmPlacement (placementName, language, sectionId) {
  return {
    type: GET_PM_PLACEMENT,
    payload: {
      placementName,
      language,
      sectionId,
    },
  }
}

export function setPmPlacement (placementName, language, data) {
  return {
    type: SET_PM_PLACEMENT,
    payload: {
      placementName,
      language,
      data,
    },
  }
}

export function setPmPlacementError (placementName, language, error) {
  return {
    type: SET_PM_PLACEMENT_ERROR,
    payload: {
      placementName,
      language,
      error,
    },
  }
}
