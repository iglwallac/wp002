/* eslint-disable import/prefer-default-export */
import { getPrimary as getPrimaryLanguage } from 'services/languages'

/* If changes made and translation needed
 values need to be excluded from translation in Smartling
*/

export function get (options = {}) {
  const { language } = options
  const userLanguge = getPrimaryLanguage(language)
  switch (userLanguge) {
    case 'es':
    case 'es-LA':
      return import('./lang_es-LA.json')
    case 'de':
    case 'de-DE':
      return import('./lang_de-DE.json')
    case 'fr':
    case 'fr-FR':
      return import('./lang_fr-FR.json')
    case 'en':
    case 'en-US':
    default:
      return import('./lang_en.json')
  }
}
