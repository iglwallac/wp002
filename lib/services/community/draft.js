import { fromJS, List } from 'immutable'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'


export const TYPES = {
  COMMENT: 'COMMENT',
  POST: 'POST',
}

/**
 * creates an empty draft for activity (post or comment)
 */
export function createDraft (parent = '', type = undefined) {
  return fromJS({
    value: '',
    data: {},
    parent,
    type,
    attachments: {
      images: [],
      files: [],
      opengraph: [],
    },
  })
}

/**
 * sets draft value
 * @param {import('immutable').Map} draft - the draft
 * @param {String} value - the value
 */
export function setValue (draft, value) {
  return isString(value)
    ? draft.set('value', value)
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

/** TODO REMOVE
 * sets the draft object property based on current values (activity)
 * @param {import('immutable').Map} draft - the draft
 */
export function setObject (draft) {
  const text = draft.get('text')
  const image = draft.get('image')
  const graphs = draft.getIn(['attachments', 'opengraph'], List())
  const graph = graphs.find(g => g.get('valid') && g.get('render'))
  const photo = draft.getIn(['attachments', 'images', 0, 'src'])
  const file = draft.getIn(['attachments', 'files', 0, 'src'])
  return draft.set('object', (
    text || image || (graph && graph.get('url')) || photo || file
  ))
}

/**
 * sets the draft data property based on current values
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
export function mergeAttachments (draft, key, attachments) {
  //
  let data = attachments
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
