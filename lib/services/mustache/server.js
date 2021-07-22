import { readFile } from 'fs'
import { resolve } from 'path'
import { parse as parseMu } from 'mustache'
import { reduce as reducePromise, promisify } from 'bluebird'
import _reduce from 'lodash/reduce'
import _isFunction from 'lodash/isFunction'
import _partial from 'lodash/partial'
import _set from 'lodash/set'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import _endsWith from 'lodash/endsWith'

const readFilePromisified = promisify(readFile)

/**
 * Get a mustache template
 * @param {Object} options The options
 * @param {String} options.root The root folder
 * @param {String} options.parse If true parse the mustache template
 * @returns {String} The mustache template
 */
export async function getTemplate (options = {}) {
  const { root, parse = true } = options
  let { template } = options
  if (!_endsWith(template, '.mu')) {
    template += '.mu'
  }
  try {
    const path = resolve(root, template)
    const file = await readFilePromisified(path, 'utf-8')
    const data = file.toString()
    if (parse) {
      parseMu(data)
    }
    return data
  } catch (e) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
      return `<div style='color: red;'>Could not load partial ${path}</div>`
    }
  }
  return ''
}

/**
 * Load mustache partials
 * @param {Object} options The options
 * @param {String} options.root The root folder
 * @param {String} options.parse If true parse the mustache template
 * @param {Object[]} options.partials A list of mustahce partials to load
 * @param {String} options.partials.name The template name
 * @param {String} options.partials.template The template file
 * @returns {Object} An object with a propetry that is the name of the template
 * and the value is the rendered mustahce template i.e. { main: '<div>My Content</div>' }
 */
export async function loadPartials (options = {}) {
  const { root, partials, parse } = options
  if (!_isArray(partials)) {
    throw new Error('The partials option is required to be an array.')
  }
  if (!_isString(root)) {
    throw new Error('The root option is required to be a string.')
  }
  return reducePromise(partials, async (acc, partial) => {
    const { name, template } = partial
    const data = await getTemplate({ root, template, parse })
    return { ...acc, [name]: data }
  }, {})
}
