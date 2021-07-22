import { Map } from 'immutable'

export function getTilesState (props, key) {
  return props.tiles.get(key, Map())
}

export default {
  getTilesState,
}
