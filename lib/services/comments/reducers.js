import { Map, List, fromJS } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.SET_COMMENTS:
      return state.withMutations(mutateState => mutateState
        .set('data', fromJS(action.payload.comments))
        .set('processing', action.payload.processing))
    case actions.SET_COMMENTS_VISIBLE:
      return state.set('visible', action.payload)
    case actions.CREATE_COMMENTS_COMMENT:
      return state.updateIn(
        ['data', 'comments'],
        List(),
        (comments) => {
          const comment = fromJS(action.payload.comment)
          const pid = comment.get('pid')
          // If we have a pid we are child.
          if (pid) {
            // Get the parents index.
            const parentIndex = comments.findIndex(v => v.get('cid') === pid)
            if (parentIndex > -1) {
              // Put it at the top of the children for now.
              return comments.updateIn(
                [parentIndex, 'children'],
                List(),
                children => children.unshift(comment),
              )
            }
            return comments
          }
          // Add comment to the top of the list.
          return comments.unshift(comment)
        },
      )
    case actions.UPDATE_COMMENTS_TMP_COMMENT:
      return state.updateIn(
        ['data', 'comments'],
        List(),
        (comments) => {
          const comment = fromJS(action.payload.comment)
          const tmpComment = fromJS(action.payload.tmpComment)
          const pid = comment.get('pid')
          // If we have a pid we are child.
          if (pid) {
            // Get the parents index.
            const parentIndex = comments.findIndex(v => v.get('cid') === pid)
            if (parentIndex > -1) {
              return comments.updateIn(
                [parentIndex, 'children'],
                List(),
                (children) => {
                  const index = children.indexOf(tmpComment)
                  // If we find the child update it
                  if (index > -1) {
                    return children.set(index, comment)
                  }
                  // Otherwise leave it alone.
                  return children
                },
              )
            }
            return comments
          }
          // Find the comment and update it.
          const index = comments.indexOf(tmpComment)
          if (index > -1) {
            return comments.set(index, comment)
          }
          return comments
        },
      )
    case actions.SET_COMMENTS_META_DATA:
      return state.withMutations(mutateState => mutateState
        .setIn(['data', 'comments'], fromJS(action.payload.comments))
        .set('processing', action.payload.processing)
        .set('visible', action.payload.visible)
        .set('metadata', fromJS(action.payload.metadata)))
    default:
      return state
  }
}
