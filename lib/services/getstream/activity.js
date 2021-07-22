import { fromJS } from 'immutable'
import isUndefined from 'lodash/isUndefined'
import isString from 'lodash/isString'
import filter from 'lodash/filter'
import omitBy from 'lodash/omitBy'
import map from 'lodash/map'

/**
 * Primary activity shape
 */
export const ACTIVITY = fromJS({
  object: undefined,
  image: undefined,
  verb: undefined,
  text: '',
  to: [],
  attachments: {
    images: [],
    files: [],
    og: [],
  },
})

/**
 * Possible activity types
 */
export const ACTIVITY_VERBS = {
  POST: 'POST',
}

/**
 * returns the proper activity shape for the Getstream api
 * @param {import('immutable').Map} activity - the activity
 */
export function toJS (activity) {
  const activityJS = activity.toJS()
  const out = omitBy(activityJS, (value, field) => (
    value === null || value === undefined ||
    field === 'targetFeeds' || field === 'processing'
  ))
  out.text = out.text || ''
  out.attachments = out.attachments || {}
  out.to = filter(activityJS.targetFeeds || [], feed => isString(feed))
  const images = map(out.attachments.images, img => img.src)
  const files = map(out.attachments.files, file => file.src)
  out.attachments.images = filter(images, img => !isUndefined(img))
  out.attachments.files = filter(files, file => !isUndefined(file))
  out.attachments.og = filter(out.attachments.og, og => og.valid)
  return out
}
