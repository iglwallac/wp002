import isBool from 'lodash/isBoolean'
import { Map, fromJS } from 'immutable'
import {
  USER_PROFILES_SET_PROMPT,
  USER_PROFILES_CREATED,
  USER_PROFILES_REMOVE,
  USER_PROFILES_CREATE,
  USER_PROFILES_SET,
  USER_PROFILES_GET,
} from './actions'

export const initialState = Map()

export default function (state = initialState, action) {
  switch (action.type) {
    //
    case USER_PROFILES_GET:
    case USER_PROFILES_REMOVE:
      return state.set('processing', true)

    case USER_PROFILES_CREATE:
      return state.set('creating', true)
        .remove('created')
        .remove('error')

    case USER_PROFILES_CREATED: {
      const { payload } = action
      const { error, message, data } = payload

      if (error) {
        return state.set('creating', false)
          .set('created', false)
          .set('error', message)
      }
      return state.set('creating', false)
        .set('data', fromJS(data))
        .remove('created')
        .remove('error')
    }

    case USER_PROFILES_SET_PROMPT:
      return state.set('promptProfileSelector', action.payload)

    case USER_PROFILES_SET: {
      const { payload } = action
      const { error, message, data, promptProfileSelector } = payload
      const prompt = isBool(promptProfileSelector)
        ? promptProfileSelector
        : state.get('promptProfileSelector')

      if (error) {
        return state.set('processing', false)
          .set('error', message)
      }
      return state.set('processing', false)
        .set('promptProfileSelector', prompt)
        .set('data', fromJS(data))
        .remove('error')
    }
    default:
      return state
  }
}
