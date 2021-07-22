import { Remarkable } from 'remarkable'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isFunction from 'lodash/isFunction'
import _isString from 'lodash/isString'
import { get as getMdConfig } from './config'

export function parse (options) {
  const {
    assets,
    alterMarkdownRender,
    alterTokenRender,
    mdConfig = getMdConfig(),
    tokenPattern = /(\[\[[\w]+:[\s]?[\w]+\]\])/g,
  } = options
  let { template } = options
  if (!_isString(template)) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
      throw new Error('The template option is required to parse markdown.')
    } else {
      template = ''
    }
  }
  const mdParser = new Remarkable(mdConfig)

  const tmplArr = template.split(tokenPattern).filter(str => str !== '')

  return _map(
    tmplArr,
    mapTokens({
      assets,
      tokenPattern,
      mdParser,
      alterMarkdownRender,
      alterTokenRender,
    }),
  )
}

export function mapTokens (options) {
  const {
    assets,
    tokenPattern,
    mdParser,
    alterMarkdownRender,
    alterTokenRender,
  } = options
  return (elem, index) => {
    // for valid tokens, get asset data and render embedded content
    if (tokenPattern.test(elem)) {
      const tokenKey = elem.substring(2, elem.length - 2)
      const tokenData = _get(assets, tokenKey, null)
      if (_isFunction(alterTokenRender)) {
        return alterTokenRender({ index, tokenKey, tokenData })
      }
      if (!tokenData) {
        return null
      }
      return null
    } else if (/(\[\[[\s\S]*\]\])/g.test(elem)) {
      // for invalid tokens, avoid rendering token text to page
      return null
    }

    let html = mdParser.render(elem)
    if (_isFunction(alterMarkdownRender)) {
      html = alterMarkdownRender({ index, html })
    }
    return html
  }
}

export function anchorTextToHtml (str = '') {
  const anchorPattern = /&lt;a name=&quot;([\w-]+)&quot;&gt;&lt;\/a&gt;/g
  return str.replace(anchorPattern, '<a name="$1"></a>')
}

export function markdownToHtml (markdown) {
  if (!markdown) {
    return null
  }

  return parse({ template: markdown })
}
