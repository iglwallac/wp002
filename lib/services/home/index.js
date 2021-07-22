import { get as getConfig } from 'config'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import _find from 'lodash/find'
import _pick from 'lodash/pick'

const config = getConfig()

const SCHEMA = {
  _dataError: null,
  sections: [],
  quotes: [],
}

const SECTION_SCHEMA = {
  title: null,
  description: null,
  prompt: null,
  link: null,
  isExternalLink: null,
  video: null,
  className: null,
  nonEnglishLink: null,
}

const QUOTE_SCHEMA = {
  content: null,
  name: null,
  title: null,
  img: null,
}

export async function get (options = {}) {
  const { language } = options
  const userLanguge = getPrimaryLanguage(language)
  let data
  switch (userLanguge) {
    case 'es':
    case 'es-LA':
      data = await import('./lang_es-LA.json')
      break
    case 'de':
    case 'de-DE':
      data = await import('./lang_de-DE.json')
      break
    case 'fr':
    case 'fr-FR':
      data = await import('./lang_fr-FR.json')
      break
    case 'en':
    case 'en-US':
    default:
      data = await import('./lang_en.json')
      break
  }
  return handleGetDataResponse(data)
}

export function handleGetDataResponse (res, _dataError) {
  // const data = _get(res, 'body', {})
  const sections = _get(res, 'sections', [])
  const quotes = _get(res, 'quotes', [])

  return _assign(_cloneDeep(SCHEMA), {
    _dataError,
    sections: _map(sections, createSectionModel),
    quotes: _map(quotes, createQuoteModel),
  })
}

function createSectionModel (data) {
  const featured = _get(data, 'featured', null)
  const model = _find(featured || {}, (value, key) => _get(config, ['features', key], null))

  return _assign({}, _pick(data, _keys(SECTION_SCHEMA)), model || {})
}

function createQuoteModel (data) {
  return _assign(_cloneDeep(QUOTE_SCHEMA), {
    content: _get(data, 'content', null),
    name: _get(data, 'name', null),
    title: _get(data, 'title', null),
    img: _get(data, 'img', null),
  })
}
