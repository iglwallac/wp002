import { Map, List } from 'immutable'
import * as actions from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  const { type, payload } = action
  switch (type) {
    case actions.TOASTY_ADD_MESSAGE: {
      const { message, id } = payload
      return state.update('messages', List(), (messages) => {
        const allMessages = messages.push(Map({ message, id }))
        const index = allMessages.size - 3
        if (index > 0) {
          return allMessages.slice(index)
        }
        return allMessages
      })
    }
    case actions.TOASTY_REMOVE_MESSAGE: {
      const { id } = payload
      return state.update('messages', List(), messages => (
        messages.filter(m => m.get('id') !== id)
      ))
    }
    default:
      return state
  }
}
