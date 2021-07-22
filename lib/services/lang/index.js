/* eslint-disable import/prefer-default-export */
export function getLabel (srcLang) {
  switch (srcLang) {
    case 'ar':
      return 'عربى'
    case 'cs':
      return 'čeština'
    case 'de':
      return 'Deutsch'
    case 'en':
      return 'English'
    case 'es':
      return 'Español'
    case 'fr':
      return 'Français'
    case 'it':
      return 'Italiano'
    case 'ja':
      return '日本語'
    case 'pt':
      return 'Português'
    case 'ru':
      return 'русский'
    case 'zh':
      return '中文'
    default:
      return srcLang
  }
}
