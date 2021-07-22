import { FR, DE, ES } from 'services/languages/constants'

export const EN_US = 'en_US'
export const FR_FR = 'fr_FR'
export const ES_LA = 'es_LA'
export const DE_DE = 'de_DE'

export function getLanguageLocale (language) {
  switch (language) {
    case FR:
      return FR_FR
    case DE:
      return DE_DE
    case ES:
      return ES_LA
    default:
      return EN_US
  }
}
