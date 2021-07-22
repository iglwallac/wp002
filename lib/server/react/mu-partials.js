import { getLogger as getLoggerServer } from 'log/server'
import { loadPartials } from 'services/mustache/server'
import { PARTIALS } from 'components-tpl/partials'

/**
 * Initialize mustache partials
 * @param {Object} options The options
 * @param {String} options.muRoot The template files root folder
 * @param {Object[]} options.partialsList A list of mustahce partials to load
 * @param {String} options.partialsList.name The template name
 * @param {String} options.partialsList.template The template file
 * @returns {Object} An object with a propetry that is the name of the template
 * and the value is the rendered mustahce template i.e. { main: '<div>My Content</div>' }
 */
export async function init (options = {}) {
  const log = getLoggerServer()
  log.info('React Load Partials')
  const { muRoot, partialsList = PARTIALS } = options
  const muPartials = await loadPartials({
    root: muRoot,
    partials: partialsList,
  })
  log.info('React Load Partials Complete')
  return muPartials
}

export default { init }
