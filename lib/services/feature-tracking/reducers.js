/* eslint-disable no-case-declarations */
import { Map } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_FEATURE_TRACKING_COUNT:
      return state
        .update('data', Map(), data => data.mergeDeep(action.payload.data))
    case actions.SET_FEATURE_TRACKING_DATA:
      /**
       * Use update with merge to allow partial updates to the Map to mimic PATCH
       * behavior in service.
       */
      let updatedData = action.payload.data

      // Handle hidden rows
      const hidePmSectionIds = action.payload.data.get('hidePmSectionIds', null)
      const showPmSectionIds = action.payload.data.get('showPmSectionIds', null)

      if (hidePmSectionIds !== null) {
        let newList = state.getIn(['data', 'hiddenPmSectionIds'])
        hidePmSectionIds.forEach((id) => {
          newList = newList.push(id)
        })
        updatedData = updatedData.set('hiddenPmSectionIds', newList)
      } else if (showPmSectionIds !== null) {
        const newList = state.getIn(['data', 'hiddenPmSectionIds']).filter((hiddenId) => {
          return !showPmSectionIds.find(idToShow => idToShow === hiddenId)
        })
        updatedData = updatedData.set('hiddenPmSectionIds', newList)
      }
      return state
        .update('data', Map(), data => data.merge(updatedData))
        .set('processing', action.payload.processing)
    case actions.SET_FEATURE_TRACKING_PROCESSING:
      return state.set('processing', action.payload)
    case actions.RESET_FEATURE_TRACKING:
      return initialState
    default:
      return state
  }
}
