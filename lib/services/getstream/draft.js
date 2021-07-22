import { fromJS, List } from 'immutable'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import toLower from 'lodash/toLower'

import { ACTIVITY, ACTIVITY_VERBS } from './activity'
import { REACTION, REACTION_KINDS } from './reaction'

export const FORM_TYPES = {
  ACTIVITY: 'ACTIVITY',
  REACTION: 'REACTION',
}

/**
 * returns activity or reaction based on type
 * @param {String} type - a response or activity type
 */
export function getDraftType (type) {
  switch (type) {
    case REACTION_KINDS.COMMENT:
    case REACTION_KINDS.REPLY:
      return FORM_TYPES.REACTION
    case ACTIVITY_VERBS.POST:
    default:
      return FORM_TYPES.ACTIVITY
  }
}

/**
 * creates an empty draft for activity or reaction
 * @param {String} type - a reaction or activity type
 */
export function createDraft (type) {
  switch (type) {
    case REACTION_KINDS.COMMENT:
    case REACTION_KINDS.REPLY:
      return REACTION
    case ACTIVITY_VERBS.POST:
    default:
      return ACTIVITY
  }
}

export function updateDraft ({ type, prev, attributes, images }) {
  const { activityId, text, kind, targetFeeds, verb } = attributes
  if (getDraftType(type) === FORM_TYPES.REACTION) {
    return (
      prev.withMutations((d) => {
        addAttachments(d, 'images', images)
        setProcessing(d, images.length > 0)
        setTargetFeeds(d, targetFeeds)
        setActivityId(d, activityId)
        setKind(d, kind)
        setText(d, text)
        setObject(d)
        setData(d)
      })
    )
  }
  return (
    prev.withMutations((d) => {
      addAttachments(d, 'images', images)
      setProcessing(d, images.length > 0)
      setTargetFeeds(d, targetFeeds)
      setVerb(d, verb)
      setText(d, text)
      setObject(d)
    })
  )
}

/**
 * sets an activityId for the parent activity (reaction)
 * @param {import('immutable').Map} draft - the draft
 * @param {String} activityId - the activityId
 */
export function setActivityId (draft, activityId) {
  return isString(activityId)
    ? draft.set('activityId', toLower(activityId))
    : draft
}

/**
 * sets a draft verb (activity)
 * @param {import('immutable').Map} draft - the draft
 * @param {String} verb - the verb
 */
export function setVerb (draft, verb) {
  return ACTIVITY_VERBS[verb]
    ? draft.set('verb', toLower(verb))
    : draft
}

/**
 * sets a draft kind (reaction)
 * @param {import('immutable').Map} draft - the draft
 * @param {String} kind - the kind
 */
export function setKind (draft, kind) {
  return REACTION_KINDS[kind]
    ? draft.set('kind', toLower(kind))
    : draft
}

/**
 * sets draft text (activity)
 * @param {import('immutable').Map} draft - the draft
 * @param {String} text - the text
 */
export function setText (draft, text) {
  return isString(text)
    ? draft.set('text', text)
    : draft
}

/**
 * sets a draft primary image
 * @param {import('immutable').Map} draft - the draft
 * @param {String} image - the image src
 */
export function setImage (draft, image) {
  return image && isString(image)
    && /http(s)?:\/\//.test(image)
    ? draft.set('image', image)
    : draft
}

/**
 * sets the draft object property based on current values (activity)
 * @param {import('immutable').Map} draft - the draft
 */
export function setObject (draft) {
  const text = draft.get('text')
  const image = draft.get('image')
  const graphs = draft.getIn(['attachments', 'og'], List())
  const graph = graphs.find(g => g.get('valid') && g.get('render'))
  const photo = draft.getIn(['attachments', 'images', 0, 'src'])
  const file = draft.getIn(['attachments', 'files', 0, 'src'])
  return draft.set('object', (
    text || image || (graph && graph.get('url')) || photo || file
  ))
}

/**
 * sets the draft data property based on current values (reaction)
 * @param {import('immutable').Map} draft - the draft
 */
export function setData (draft) {
  return draft.set('data', (
    { text: draft.get('text') }
  ))
}

/**
 * sets a drafts processing state
 * @param {import('immutable').Map} draft - the draft
 * @param {Boolean} bool - processing flag
 */
export function setProcessing (draft, bool) {
  return draft.set('processing', !!bool)
}

/**
 * sets processing state for photos
 * @param {import('immutable').Map} draft - the draft
 */
export function setPhotosProcessing (draft) {
  const images = draft.getIn(['attachments', 'images'], List())
  const complete = images.every(img => (
    img.get('src') || img.get('error')
  ))
  return draft.set(
    'processing', !complete)
}

/**
 * sets a drafts targetFeeds state
 * @param {import('immutable').Map} draft - the draft
 * @param {String[]} targetFeeds - array of strings
 */
export function setTargetFeeds (draft, feeds) {
  if (feeds) {
    draft.set('targetFeeds', isArray(feeds)
      ? fromJS(feeds)
      : feeds)
  }
  return draft
}

/**
 * deletes an attachment from draft
 * @param {import('immutable').Map} draft - the draft
 * @param {String} key - attachment key
 * @param {String} id - the attachment id
 */
export function deleteAttachment (draft, key, id) {
  if (id) {
    return draft.updateIn(
      ['attachments', key], List(), files => (
        files.filter(f => f.get('id') !== id)
      ))
  }
  return draft
}

/**
 * sets draft attachments
 * @param {import('immutable').Map} draft - the draft
 * @param {String} key - attachment key
 * @param {Object[]} attachments - the attachments
 */
export function setAttachments (draft, key, attachments) {
  //
  let list = attachments || []

  if (isArray(list)) {
    list = fromJS(list)
  }
  return draft.setIn(
    ['attachments', key], list)
}

/**
 * adds draft attachments
 * @param {import('immutable').Map} draft - the draft
 * @param {String} key - attachment key
 * @param {Object[]} attachments - the attachments
 */
export function addAttachments (draft, key, attachments) {
  //
  let list = attachments || []

  if (isArray(list)) {
    list = fromJS(list)
  }

  if (list.size) {
    return draft.updateIn(
      ['attachments', key], l => (
        l.concat(list)
      ))
  }
  return draft
}

/**
 * merges data onto existing draft attachments
 * @param {import('immutable').Map} draft - the draft
 * @param {String} key - attachment key
 * @param {Object[]} attachments - the attachments
 */
export function mergeAttachments (draft, key, attachements) {
  //
  let data = attachements

  if (isArray(data)) {
    data = fromJS(data)
  }

  return draft.updateIn(['attachments', key], (list) => {
    return list.map((item) => {
      const id = item.get('id')
      const attachment = data.find(d => d.get('id') === id)
      return attachment
        ? item.merge(attachment)
        : item
    })
  })
}
