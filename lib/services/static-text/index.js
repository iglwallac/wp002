/* eslint-disable import/prefer-default-export, global-require */
import * as languageConstants from 'services/languages/constants'

export async function get (options) {
  const { language } = options

  switch (language) {
    case languageConstants.ES:
    case languageConstants.ES_LA: {
      const module = await import('./language-es')
      const getLanguage = module.default || module
      const staticText = await getLanguage()

      return staticText
    }
    case languageConstants.DE:
    case languageConstants.DE_DE: {
      const module = await import('./language-de')
      const getLanguage = module.default || module
      const staticText = await getLanguage()

      return staticText
    }
    case languageConstants.FR:
    case languageConstants.FR_FR: {
      const module = await import('./language-fr')
      const getLanguage = module.default || module
      const staticText = await getLanguage()

      return staticText
    }
    case languageConstants.EN:
    case languageConstants.EN_US:
    default: {
      const module = await import('./language-en')
      const getLanguage = module.default || module
      const staticText = await getLanguage()

      return staticText
    }
  }
}
