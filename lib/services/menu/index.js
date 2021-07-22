/* eslint-disable global-require import/prefer-default-export */
import { join as joinPromise } from 'bluebird'
import { fromJS } from 'immutable'
import { get as apiGet, TYPE_BROOKLYN } from 'api-client'
import { getPrimary as getPrimaryLanguage } from 'services/languages'
import { EN } from 'services/languages/constants'
import _get from 'lodash/get'
import _forEach from 'lodash/forEach'

/**
 * Get menu items for the header and footer
 * @param {String} language The user's language
 * @returns {{ navData: {Object}, footerData: {Object} }} The header menu as navData and
 * the footer menu as footerData
 */
async function getMenuItems (language) {
  const [header = {}, footer = {}] = await joinPromise(
    apiGet('v2/menu', { language, platform: 'web', type: 'header' }, { languageShouldBeString: true }, TYPE_BROOKLYN),
    apiGet('v2/menu', { language, platform: 'web', type: 'footer' }, { languageShouldBeString: true }, TYPE_BROOKLYN),
  )
  const { body: navData } = header
  const { body: footerData } = footer
  return {
    navData,
    footerData,
  }
}

/**
 * Format a menu object which that to be returned by get()
 * @param {Object} data The data
 * @param {Object} data.menu The nav menu
 * @param {Object} data.user The user menu
 * @param {String} primaryLanguage The user's primary language
 * @param {Number} [uid] The user id
 * @returns {import('immutable').Map} The menu as an immutable map
 */
function formatMenuObj (data = {}, primaryLanguage, uid) {
  const { user, menu } = data
  const navDataMenusContent = _get(menu, 'navData.menus[0].content') || []
  const nav = [...navDataMenusContent]
  let newsIndexes
  let newsObj
  let articlesIndexes
  let articlesObj

  // following code will swap news and articles in the menu for english logged in users
  const createNav = () => {
    _forEach(nav, (item, index) => {
      if (_get(item, 'url') === '/topic/gaia-news') {
        newsIndexes = { index }
        newsObj = item
      }
      if (_get(item, 'url') === '/articles/latest') {
        articlesIndexes = { index }
        articlesObj = item
      }
      if (_get(item, 'url') === null) {
        _forEach(_get(item, 'children') || [], (child, secondaryIndex) => {
          if (_get(child, 'url') === '/topic/gaia-news') {
            newsIndexes = { index, secondaryIndex }
            newsObj = child
          }
          if (_get(child, 'url') === '/articles/latest') {
            articlesIndexes = { index, secondaryIndex }
            articlesObj = child
          }
          return null
        })
      }
      return null
    })
  }

  if (uid && primaryLanguage === EN) {
    createNav(nav)
    if (newsIndexes && articlesIndexes) {
      const newsSecondary = _get(newsIndexes, 'secondaryIndex')
      if (newsSecondary !== undefined) {
        const initialIndex = _get(newsIndexes, 'index')
        _get(nav[initialIndex], 'children').splice(newsSecondary, 1, articlesObj)
      } else {
        nav.splice(_get(newsIndexes, 'index'), 1, articlesObj)
      }

      const articlesSecondary = _get(articlesIndexes, 'secondaryIndex')
      if (articlesSecondary !== undefined) {
        const initialIndex = _get(articlesIndexes, 'index')
        _get(nav[initialIndex], 'children').splice(articlesSecondary, 1, newsObj)
      } else {
        nav.splice(_get(articlesIndexes, 'index'), 1, newsObj)
      }
    }
  }
  const footerDataMenusContent = _get(menu, 'footerData.menus[0].content') || []
  return fromJS({
    nav,
    user,
    footer: [...footerDataMenusContent],
  })
}

/**
 * Get menu from local data and eventually from the API.
 * @param {Object} options The options
 * @param {import('immutable').List|String[]|String} options.language The user language
 * @param {Number} [options.uid] The user id
 * @returns {{ menu: {Object}, user: {Object} }} The nav menu as menu and user menu as user
 */
async function get (options = {}) {
  const { language, uid } = options

  const userLanguge = getPrimaryLanguage(language)

  /**
   * Join promise handler to deal with import
   * default state
   * @param {Object} menu The menu data
   * @see getMenuItems()
   * @param {Object} user The user json
   * @returns {{ menu: {Object}, user: {Object} }} The nav menu as menu and user menu as user
   */
  function handleJoinPromise (menu, user) {
    return {
      menu,
      user: user.default || user,
    }
  }

  switch (userLanguge) {
    case 'es':
    case 'es-LA': {
      const data = await joinPromise(
        getMenuItems('es'),
        import(/* webpackChunkName: 'menuEs' */ './user_es-LA.json'),
        handleJoinPromise,
      )
      return formatMenuObj(data, language)
    }
    case 'de':
    case 'de-DE': {
      const data = await joinPromise(
        getMenuItems('de'),
        import(/* webpackChunkName: 'menuDe' */ './user_de-DE.json'),
        handleJoinPromise,
      )
      return formatMenuObj(data, language)
    }
    case 'fr':
    case 'fr-FR': {
      const data = await joinPromise(
        getMenuItems('fr'),
        import(/* webpackChunkName: 'menuFr' */ './user_fr-FR.json'),
        handleJoinPromise,
      )
      return formatMenuObj(data, language)
    }
    case 'en':
    case 'en-US':
    default: {
      const data = await joinPromise(
        getMenuItems('en'),
        import(/* webpackChunkName: 'menuEn' */ './user.json'),
        handleJoinPromise,
      )
      return formatMenuObj(data, language, uid)
    }
  }
}

export default { get }
