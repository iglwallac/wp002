import { fromJS } from 'immutable'
import isUndefined from 'lodash/isUndefined'
import isString from 'lodash/isString'
// import toLower from 'lodash/toLower'
import filter from 'lodash/filter'
import omit from 'lodash/omit'
import map from 'lodash/map'

/**
 * Primary reaction shape
 */
export const REACTION = fromJS({
  activityId: undefined,
  targetFeeds: [],
  data: undefined,
  kind: undefined,
})

/**
 * Possible reaction types
 */
export const REACTION_KINDS = {
  COMMENT: 'COMMENT',
  REPLY: 'REPLY',
}

/**
 * returns the proper reaction shape for the Getstream api
 * @param {import('immutable').Map} reaction - the reaction
 */
export function toJS (reaction) {
  const reactionJS = reaction.toJS()
  const out = omit(reactionJS, field => (
    field === null || field === undefined
  ))

  out.data = out.data || {}
  out.attachments = out.attachments || {}
  out.to = filter(reactionJS.targetFeeds || [], feed => isString(feed))
  const images = map(out.attachments.images, img => img.src)
  const files = map(out.attachments.files, file => file.src)
  out.attachments.images = filter(images, img => !isUndefined(img))
  out.attachments.files = filter(files, file => !isUndefined(file))
  return out
}

