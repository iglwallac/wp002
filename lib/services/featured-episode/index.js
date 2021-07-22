import _get from 'lodash/get'
import {
  createStandardModel as createStandardTileModel,
} from 'services/tile'
import { cloneDeep } from 'lodash'

// eslint-disable-next-line import/prefer-default-export
export function createModel (data) {
  const featuredEpisode = Object.assign(cloneDeep(data.featured_episode), {
    featuredTileType: _get(data, 'featured_type', null),
    featuredTileLabel: _get(data, ['merchandising', 'label'], null),
    featuredTileCampaignId: _get(data, ['merchandising', 'campaignId'], null),
  })
  return createStandardTileModel(featuredEpisode)
}
