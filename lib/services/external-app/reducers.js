import _get from 'lodash/get'
import _forEach from 'lodash/forEach'
import { Map, List } from 'immutable'
import { ASSET_TYPES } from 'services/external-app'
import {
  SET_EXTERNAL_APP_ASSET,
  SET_EXTERNAL_APP_ASSETS,
} from 'services/external-app/actions'

export const intialState = Map()

function updateAsset (state, payload) {
  const appKey = _get(payload, 'appKey')
  const type = _get(payload, 'type')
  const value = List([].concat(_get(payload, 'value')))

  return state.withMutations(mutateState =>
    mutateState.update(appKey, Map(), app => app.set(type, value)),
  )
}

function updateAssets (state, payload) {
  const appKey = _get(payload, 'appKey')
  const assets = _get(payload, 'assets')

  return state.withMutations(mutateState => mutateState.update(appKey, Map(), (app) => {
    let result = app

    _forEach(assets, (value, key) => {
      switch (key) {
        case ASSET_TYPES.MARKUP:
        case ASSET_TYPES.SCRIPT:
        case ASSET_TYPES.STYLE:
          result = result.set(key, List([].concat(value)))
          break
        default:
          break
      }
    })
    return result
  }))
}

export default function (state = intialState, action) {
  const type = _get(action, 'type', '')
  const payload = _get(action, 'payload', {})

  switch (type) {
    case SET_EXTERNAL_APP_ASSET:
      return updateAsset(state, payload)
    case SET_EXTERNAL_APP_ASSETS:
      return updateAssets(state, payload)
    default:
      return state
  }
}
