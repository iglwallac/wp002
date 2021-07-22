import { Map, OrderedMap } from 'immutable'
import * as ACTIONS from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case ACTIONS.SET_HIDDEN_CONTENT: {
      const hiddenContent = action.payload.get('hiddenContent')
      const totalCount = action.payload.get('totalCount')
      return state.withMutations((mutableState) => {
        const reduxContent = state.get('content') || OrderedMap()
        const orderedContent = hiddenContent.toOrderedMap()
        // eslint-disable-next-line no-unused-vars
        const newContent = orderedContent.mapEntries(([key, val]) => {
          return [val.get('contentId'), val]
        })
        const merged = reduxContent.merge(newContent)
        mutableState.set('content', merged)
        mutableState.set('totalCount', totalCount)
      })
    }
    case ACTIONS.SET_HIDDEN_CONTENT_ADD: {
      const hiddenContent = action.payload.data
      return state.withMutations((mutableState) => {
        mutableState.setIn(['content', hiddenContent.get('contentId')], hiddenContent)
      })
    }
    case ACTIONS.SET_HIDDEN_CONTENT_REMOVE: {
      const { contentId } = action.payload
      return state.withMutations((mutableState) => {
        mutableState.deleteIn(['content', contentId])
      })
    }
    case ACTIONS.SET_HIDDEN_CONTENT_PROCESSING: {
      const { contentId, processing } = action.payload
      const content = state.getIn(['content', contentId])
      if (!content) return state
      return state.withMutations((mutableState) => {
        mutableState.setIn(['content', contentId, 'processing'], processing)
      })
    }
    default:
      return state
  }
}
