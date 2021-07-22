import { Map, List } from 'immutable'
import { STORE_KEY_SHELF_FEATURED_EPISODE } from 'services/store-keys'
import { TYPE_FEATURED_EPISODE } from 'services/tiles'

export function updateFeaturedEpisode (props) {
  const { user = Map(), shelf = Map(), auth } = props

  const shelfId = shelf.getIn(['data', 'id'])
  const featuredEpisodeId = props.featuredEpisode.getIn(['data', 'id'], null)
  const featuredEpisodeTileDataSynced = shelfId === featuredEpisodeId
  const processing = props.featuredEpisode.get('processing', false)
  const language = user.getIn(['data', 'language'], List())

  // get the featured episode
  if (!featuredEpisodeTileDataSynced && !processing) {
    return props.getTilesData(
      STORE_KEY_SHELF_FEATURED_EPISODE,
      shelfId,
      Map({ type: TYPE_FEATURED_EPISODE, language }),
      0,
      1,
      null,
      props.location,
      null,
      auth,
    )
  }
  return null
}

export default {
  updateFeaturedEpisode,
}
