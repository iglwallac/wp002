export const GET_MULTIPLE_PM_SECTIONS = 'GET_MULTIPLE_PM_SECTIONS'
export const GET_PM_SECTION = 'GET_PM_SECTION'
export const SET_PM_SECTION = 'SET_PM_SECTION'
export const SET_PM_SECTION_ERROR = 'SET_PM_SECTION_ERROR'
export const DELETE_PM_SECTION = 'DELETE_PM_SECTION'

export function getMultiplePmSections (sectionIds) {
  return {
    type: GET_MULTIPLE_PM_SECTIONS,
    payload: sectionIds,
  }
}

export function getPmSection (sectionId) {
  return {
    type: GET_PM_SECTION,
    payload: sectionId,
  }
}

export function setPmSection (sectionId, data) {
  return {
    type: SET_PM_SECTION,
    payload: {
      sectionId,
      data,
    },
  }
}

export function setPmSectionError (sectionId, error) {
  return {
    type: SET_PM_SECTION_ERROR,
    payload: {
      sectionId,
      error,
    },
  }
}

export function deletePMSection (sectionId) {
  return {
    type: DELETE_PM_SECTION,
    payload: {
      sectionId,
    },
  }
}
