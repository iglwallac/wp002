import { Map, fromJS, List } from 'immutable'
import * as actions from './actions'


export const initialState = Map()

export default function (state = initialState, action) {
  const { payload, type } = action
  switch (type) {
    case actions.SET_PLACEMENT_CONTENT_DATA:
      return state
        .set('data', payload.get('data'))
        .set('processing', false)
    case actions.PLACEMENT_CONTENT_DATA_PROCESSING:
      return state.set('processing', payload)
    case actions.SET_PLACEMENT_CONTENT_USER_INFO_PROCESSING:
      return state.set('userInfoProcessing', payload)
    case actions.APPEND_PLACEMENT_CONTENT_USER_INFO_DATA:
      return state.withMutations(mutateState => mutateState
        .set('userInfoProcessing', action.payload.userInfoProcessing)
        .updateIn(
          ['data', 'titles'],
          List(),
          (titles) => {
            const userInfoData = fromJS(action.payload.userInfo)
            // Map the userInfo onto existing titles by id
            return titles.map((title) => {
              const userInfo = userInfoData.find(
                _userInfo => title.get('nid') === _userInfo.get('id'),
              )
              // If we found userInfo add it otherwise use the original userInfo or a new Map.
              return title.set(
                'userInfo',
                userInfo || title.get('userInfo', Map()),
              )
            })
          },
        ))
    default:
      return state
  }
}
